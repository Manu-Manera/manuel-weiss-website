import type {
  Session, ImportProgress, MappingResult, ParsedExcel, TempusData,
  TemporalInterpretationResult, BulkCustomFieldValue,
} from '../types.js';
import { TempusClient } from './tempusClient.js';
import { logAudit } from './auditLog.js';

const IMPORT_STEPS = [
  { entity: 'customFields',      label: '1. Attributes (Custom Fields)' },
  { entity: 'resyncCFs',         label: '   → Custom Fields synchronisieren' },
  { entity: 'resources',         label: '2. Resources' },
  { entity: 'resyncResources',   label: '   → Resources synchronisieren' },
  { entity: 'projects',          label: '3. Projects' },
  { entity: 'resyncProjects',    label: '   → Projects synchronisieren' },
  { entity: 'projectCFValues',   label: '4. Project Custom Field Werte' },
  { entity: 'resourceCFValues',  label: '5. Resource Custom Field Werte' },
  { entity: 'assignments',       label: '6. Assignments' },
  { entity: 'assignmentCFValues', label: '7. Assignment Custom Field Werte' },
  { entity: 'adminTimes',        label: '8. Admin Times' },
  { entity: 'skills',            label: '9. Skills' },
  { entity: 'sheetData',         label: '10. Sheet Data' },
  { entity: 'advancedRates',     label: '11. Resource Rates' },
  { entity: 'financials',        label: '12. Financials' },
  { entity: 'financialCFValues', label: '13. Financial Custom Field Werte' },
  { entity: 'teamResources',     label: '14. Team Resource Members' },
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
  layoutHint?: string;
}

const CF_DATATYPE_MAP: Record<string, string> = {
  Text: 'string', String: 'string', string: 'string',
  Number: 'int', number: 'int', Integer: 'int',
  'Precision Number': 'double', Double: 'double', Float: 'double', double: 'double',
  Date: 'date', date: 'date',
  Boolean: 'bool', bool: 'bool', boolean: 'bool',
  Currency: 'currency', currency: 'currency',
  Selection: 'Enum', 'Multi-Selection': 'Flags',
  enum: 'Enum', flags: 'Flags', Enum: 'Enum', Flags: 'Flags',
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
  result.layoutHint = 'Die Custom Fields wurden angelegt und Werte gesetzt. Das Attribute Layout (Sichtbarkeit im Formular) muss manuell in Tempus unter "Attribute Management → Attribute Layout" konfiguriert werden.';
  logAudit('import_completed', session.id, {
    success: result.success,
    totalCreated: result.totalCreated,
    totalFailed: result.totalFailed,
  });

  return result;
}

// ── Helpers ──────────────────────────────────────────────────────────

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

function resolveEntityName(rawName: string, mappingResult: MappingResult): string {
  const em = mappingResult.entityMappings.find(
    e => e.sourceValue.toLowerCase() === rawName.toLowerCase()
      && e.matchedName
      && (e.status === 'confirmed' || e.status === 'create_new')
  );
  return em?.matchedName || rawName;
}

function capitalizeEntityType(et: string): string {
  const map: Record<string, string> = {
    project: 'Project', resource: 'Resource', assignment: 'Assignment',
    milestone: 'Milestone', financialrow: 'FinancialRow', task: 'Task',
  };
  return map[et.toLowerCase()] || et;
}

// ── CF Value Payload Builder ─────────────────────────────────────────

function buildCFValuePayloads(
  cfEntityType: string,
  targetEntityKey: string,
  mappingResult: MappingResult,
  parsedExcel: ParsedExcel,
  tempusData: TempusData,
): BulkCustomFieldValue[] {
  const cfFieldMappings = mappingResult.fieldMappings.filter(
    fm => fm.targetField.startsWith('cf:') && fm.targetEntity === targetEntityKey && fm.status !== 'rejected'
  );
  if (cfFieldMappings.length === 0) return [];

  const entities: Array<{ id: number; name: string }> =
    targetEntityKey === 'projects' ? tempusData.projects :
    targetEntityKey === 'resources' ? tempusData.resources : [];

  const payloads: BulkCustomFieldValue[] = [];

  for (const cfm of cfFieldMappings) {
    const cfName = cfm.targetField.slice(3);
    const cfDef = tempusData.customFields.find(
      cf => cf.name.toLowerCase() === cfName.toLowerCase()
        && cf.entityType.toLowerCase() === cfEntityType.toLowerCase()
    );
    if (!cfDef) {
      console.log(`[importService] CF "${cfName}" (${cfEntityType}) not found in Tempus – skipping values`);
      continue;
    }

    const nameMapping = mappingResult.fieldMappings.find(
      fm => fm.sourceSheet === cfm.sourceSheet
        && fm.targetEntity === targetEntityKey
        && (fm.targetField === 'name' || fm.targetField === 'projectName' || fm.targetField === 'resourceName')
    );
    if (!nameMapping) continue;

    const sheet = parsedExcel.sheets.find(s => s.name === cfm.sourceSheet);
    if (!sheet) continue;

    const valueToIds = new Map<string, Set<number>>();

    for (const row of sheet.rows) {
      const rawName = String(row[nameMapping.sourceColumn] ?? '').trim();
      if (!rawName) continue;

      const resolvedName = resolveEntityName(rawName, mappingResult);
      const entity = entities.find(e => e.name.toLowerCase() === resolvedName.toLowerCase());
      if (!entity) continue;

      const cfValue = row[cfm.sourceColumn];
      if (cfValue == null || cfValue === '') continue;

      const valueStr = String(cfValue).trim();
      if (!valueToIds.has(valueStr)) valueToIds.set(valueStr, new Set());
      valueToIds.get(valueStr)!.add(entity.id);
    }

    for (const [value, idSet] of valueToIds) {
      payloads.push({
        value,
        customFieldId: cfDef.id,
        entityIds: [...idSet],
        assignmentIds: null,
      });
    }
  }

  return payloads;
}

// ── Import Step ──────────────────────────────────────────────────────

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
    // ── 1. Custom Fields ──────────────────────────────────────────────
    case 'customFields': {
      const newCFs = mappingResult.customFieldMappings
        .filter(cf => cf.action === 'create')
        .map(cf => {
          const apiDataType = CF_DATATYPE_MAP[cf.dataType] || 'string';
          const isEnumType = apiDataType === 'Enum' || apiDataType === 'Flags';

          let enumMembers: Array<{ enumMemberId: number; name: string }> | undefined;
          if (isEnumType) {
            const vals = cf.uniqueValues;
            if (vals && vals.length > 0) {
              enumMembers = vals.map((name, i) => ({ enumMemberId: -(i + 1), name }));
            } else {
              const sheet = parsedExcel.sheets.find(s => s.name === cf.sourceSheet);
              if (sheet) {
                const uniqueVals = new Set<string>();
                for (const row of sheet.rows) {
                  const val = row[cf.sourceColumn];
                  if (val != null && val !== '') uniqueVals.add(String(val).trim());
                }
                enumMembers = [...uniqueVals].filter(Boolean).slice(0, 100).map((name, i) => ({ enumMemberId: -(i + 1), name }));
              }
            }
            if (!enumMembers || enumMembers.length === 0) {
              enumMembers = [{ enumMemberId: -1, name: cf.customFieldName }];
            }
          }

          return {
            id: null,
            name: cf.customFieldName,
            entityType: capitalizeEntityType(cf.entityType),
            dataType: apiDataType,
            isRequired: false,
            isReadOnly: false,
            isUnique: false,
            isRichText: false,
            ...(isEnumType && enumMembers ? { enumMembers } : {}),
          };
        });
      if (newCFs.length === 0) return 0;
      console.log(`[importService] CustomFields: creating ${newCFs.length}`, JSON.stringify(newCFs.slice(0, 2)));
      await client.createCustomFields(newCFs);
      return newCFs.length;
    }

    // ── Re-Sync Steps ─────────────────────────────────────────────────
    case 'resyncCFs': {
      const cfs = await client.getCustomFields();
      tempusData.customFields = cfs;
      console.log(`[importService] Re-synced CustomFields: ${cfs.length}`);
      return 0;
    }

    case 'resyncResources': {
      const res = await client.getResources();
      tempusData.resources = res;
      console.log(`[importService] Re-synced Resources: ${res.length}`);
      return 0;
    }

    case 'resyncProjects': {
      const proj = await client.getProjects();
      tempusData.projects = proj;
      console.log(`[importService] Re-synced Projects: ${proj.length}`);
      return 0;
    }

    // ── 2. Resources ──────────────────────────────────────────────────
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

    // ── 3. Projects ───────────────────────────────────────────────────
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

    // ── 4. Project CF Values ──────────────────────────────────────────
    case 'projectCFValues': {
      const payloads = buildCFValuePayloads('Project', 'projects', mappingResult, parsedExcel, tempusData);
      if (payloads.length === 0) return 0;
      console.log(`[importService] Project CF Values: ${payloads.length} value-groups`);
      await client.updateProjectCFValues(payloads);
      return payloads.length;
    }

    // ── 5. Resource CF Values ─────────────────────────────────────────
    case 'resourceCFValues': {
      const payloads = buildCFValuePayloads('Resource', 'resources', mappingResult, parsedExcel, tempusData);
      if (payloads.length === 0) return 0;
      console.log(`[importService] Resource CF Values: ${payloads.length} value-groups`);
      await client.updateResourceCFValues(payloads);
      return payloads.length;
    }

    // ── 6. Assignments ────────────────────────────────────────────────
    case 'assignments': {
      return 0;
    }

    // ── 7. Assignment CF Values ───────────────────────────────────────
    case 'assignmentCFValues': {
      return 0;
    }

    // ── 8. Admin Times ────────────────────────────────────────────────
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

    // ── 9. Skills ─────────────────────────────────────────────────────
    case 'skills': {
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
      console.log(`[importService] Skills: creating ${items.length}`, JSON.stringify(items[0]));
      await client.createSkills(items);
      return items.length;
    }

    // ── 13. Financial CF Values ───────────────────────────────────────
    case 'financialCFValues': {
      return 0;
    }

    default:
      return 0;
  }
}
