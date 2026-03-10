import type { Session, ImportProgress, FieldMapping, EntityMapping, MappingResult, ParsedExcel, TempusData, TemporalInterpretationResult } from '../types.js';
import { TempusClient } from './tempusClient.js';
import { logAudit } from './auditLog.js';

const IMPORT_STEPS = [
  { entity: 'customFields', label: '1. Attributes (Custom Fields)' },
  { entity: 'resources', label: '2. Resources' },
  { entity: 'projects', label: '3. Projects' },
  { entity: 'assignments', label: '4. Assignments' },
  { entity: 'adminTimes', label: '5. Admin Times' },
  { entity: 'skills', label: '6. Skills' },
  { entity: 'sheetData', label: '7. Sheet Data' },
  { entity: 'advancedRates', label: '8. Resource Rates' },
  { entity: 'financials', label: '9. Financials' },
  { entity: 'teamResources', label: '10. Team Resource Members' },
];

export interface ImportResult {
  success: boolean;
  steps: Array<{
    entity: string;
    label: string;
    created: number;
    skipped: number;
    failed: number;
    errors: string[];
  }>;
  totalCreated: number;
  totalFailed: number;
}

const CF_DATATYPE_MAP: Record<string, string> = {
  Text: 'string', String: 'string', string: 'string',
  Number: 'int', number: 'int', Integer: 'int',
  'Precision Number': 'double', Double: 'double', Float: 'double', double: 'double',
  Date: 'date', date: 'date',
  Boolean: 'bool', bool: 'bool', boolean: 'bool',
  Currency: 'currency', currency: 'currency',
  Selection: 'enum', 'Multi-Selection': 'flags',
  enum: 'enum', flags: 'flags',
};

export async function importToTempus(
  session: Session,
  client: TempusClient,
  onProgress?: (progress: ImportProgress) => void,
): Promise<ImportResult> {
  const { mappingResult, parsedExcel, tempusData } = session;
  if (!mappingResult || !parsedExcel || !tempusData) {
    throw new Error('Session ist nicht vollständig – Mappings, Excel und Tempus-Daten erforderlich');
  }

  const result: ImportResult = {
    success: true,
    steps: [],
    totalCreated: 0,
    totalFailed: 0,
  };

  for (let i = 0; i < IMPORT_STEPS.length; i++) {
    const step = IMPORT_STEPS[i];
    const stepResult = { entity: step.entity, label: step.label, created: 0, skipped: 0, failed: 0, errors: [] as string[] };

    onProgress?.({
      currentStep: i + 1,
      totalSteps: IMPORT_STEPS.length,
      stepLabel: step.label,
      created: 0, skipped: 0, failed: 0, errors: [],
    });

    try {
      const count = await importStep(step.entity, client, mappingResult, parsedExcel, tempusData, session.temporalInterpretation);
      stepResult.created = count;
      logAudit('import_step_completed', session.id, { entity: step.entity, created: count });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      stepResult.failed = 1;
      stepResult.errors.push(msg);
      console.error(`[importService] Step ${step.label} FAILED:`, msg);
      logAudit('import_step_failed', session.id, { entity: step.entity }, 'error', msg);
    }

    result.steps.push(stepResult);
    result.totalCreated += stepResult.created;
    result.totalFailed += stepResult.failed;
  }

  result.success = result.totalFailed === 0;
  logAudit('import_completed', session.id, {
    success: result.success,
    totalCreated: result.totalCreated,
    totalFailed: result.totalFailed,
  });

  return result;
}

function applyTemporalTransform(value: string, field: string, temporal?: TemporalInterpretationResult): string {
  if (!temporal || !value) return value;

  if (field === 'phase' || field === 'Phase') {
    const phaseMatch = temporal.phaseInterpretations.find(
      pi => pi.rawCode.toLowerCase() === value.toLowerCase()
    );
    if (phaseMatch) return phaseMatch.tempusValue;
  }

  if (field === 'planType' || field === 'Plan Type' || field === 'month' || field === 'Time Period') {
    const periodMatch = temporal.periodInterpretations.find(
      pi => pi.rawPattern.toLowerCase() === value.toLowerCase()
    );
    if (periodMatch) return periodMatch.tempusTimePeriod;
  }

  return value;
}

async function importStep(
  entity: string,
  client: TempusClient,
  mappingResult: MappingResult,
  parsedExcel: ParsedExcel,
  tempusData: TempusData,
  temporal?: TemporalInterpretationResult,
): Promise<number> {
  const confirmedNew = mappingResult.entityMappings.filter(
    em => em.isNew && (em.status === 'confirmed' || em.status === 'create_new')
  );

  switch (entity) {
    case 'customFields': {
      const newCFs = mappingResult.customFieldMappings
        .filter(cf => cf.action === 'create')
        .map(cf => ({
          id: null,
          name: cf.customFieldName,
          entityType: cf.entityType.toLowerCase(),
          dataType: CF_DATATYPE_MAP[cf.dataType] || 'string',
          isRequired: false,
          isReadOnly: false,
          isUnique: false,
          isRichText: false,
        }));
      if (newCFs.length === 0) return 0;
      console.log(`[importService] CustomFields: creating ${newCFs.length}`, JSON.stringify(newCFs[0]));
      await client.createCustomFields(newCFs);
      return newCFs.length;
    }

    case 'resources': {
      const items = confirmedNew
        .filter(em => em.targetEntity === 'resources')
        .map(em => ({
          name: em.sourceValue || em.matchedName,
          updateGlobalRole: false,
          updateDefaultRate: false,
          updateAdvancedRate: false,
          updateSecurityGroup: false,
          isEnabled: true,
          isTeamResource: false,
          updateAutoCalculateRate: false,
        }));
      if (items.length === 0) return 0;
      console.log(`[importService] Resources: creating ${items.length}`, JSON.stringify(items[0]));
      await client.createResources(items);
      return items.length;
    }

    case 'projects': {
      const items = confirmedNew
        .filter(em => em.targetEntity === 'projects')
        .map(em => ({
          name: em.sourceValue || em.matchedName,
          updateSecurityGroup: false,
          updateProjectDates: false,
          updateFinancialDates: false,
          updateWorkflow: false,
          updateAssignmentWorkflow: false,
          updateProjectWorkflow: false,
          updateLock: false,
        }));
      if (items.length === 0) return 0;
      console.log(`[importService] Projects: creating ${items.length}`, JSON.stringify(items[0]));
      await client.createProjects(items);
      return items.length;
    }

    case 'assignments': {
      // Assignments require taskId + resourceId (integers) — can only create if IDs are resolved
      return 0;
    }

    case 'adminTimes': {
      const items = confirmedNew
        .filter(em => em.targetEntity === 'adminTimes')
        .map(em => ({
          id: 0,
          name: em.sourceValue || em.matchedName,
        }));
      if (items.length === 0) return 0;
      console.log(`[importService] AdminTimes: creating ${items.length}`, JSON.stringify(items[0]));
      await client.createAdminTimes(items);
      return items.length;
    }

    case 'skills': {
      // Skills require a valid skillValueTypeId — fetch existing to determine
      const existingSkills = tempusData.skills;
      const defaultValueTypeId = (existingSkills as any)[0]?.skillValueTypeId ?? 1;
      const items = confirmedNew
        .filter(em => em.targetEntity === 'skills')
        .map(em => ({
          name: em.sourceValue || em.matchedName,
          skillValueTypeId: defaultValueTypeId,
          description: '',
          trackExpiration: false,
        }));
      if (items.length === 0) return 0;
      console.log(`[importService] Skills: creating ${items.length}, valueTypeId=${defaultValueTypeId}`, JSON.stringify(items[0]));
      await client.createSkills(items);
      return items.length;
    }

    default:
      return 0;
  }
}
