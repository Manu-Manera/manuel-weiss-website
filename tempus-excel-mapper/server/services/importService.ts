import type { Session, ImportProgress } from '../types.js';
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

export async function importToTempus(
  session: Session,
  client: TempusClient,
  onProgress?: (progress: ImportProgress) => void,
): Promise<ImportResult> {
  const { mappingResult, parsedExcel, tempusData } = session;
  if (!mappingResult || !parsedExcel || !tempusData) {
    throw new Error('Session ist nicht vollständig – Mappings, Excel und Tempus-Daten erforderlich');
  }

  const confirmedNew = mappingResult.entityMappings.filter(
    em => em.isNew && (em.status === 'confirmed' || em.status === 'create_new')
  );

  const result: ImportResult = {
    success: true,
    steps: [],
    totalCreated: 0,
    totalFailed: 0,
  };

  for (let i = 0; i < IMPORT_STEPS.length; i++) {
    const step = IMPORT_STEPS[i];
    const stepResult = { entity: step.entity, label: step.label, created: 0, skipped: 0, failed: 0, errors: [] as string[] };

    const progress: ImportProgress = {
      currentStep: i + 1,
      totalSteps: IMPORT_STEPS.length,
      stepLabel: step.label,
      created: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    };
    onProgress?.(progress);

    const entitiesToCreate = confirmedNew.filter(em => em.targetEntity === step.entity);

    if (entitiesToCreate.length === 0) {
      stepResult.skipped = 0;
      result.steps.push(stepResult);
      continue;
    }

    try {
      const items = entitiesToCreate.map(em => ({ name: em.sourceValue }));

      if (step.entity === 'customFields') {
        const newCFs = mappingResult.customFieldMappings
          .filter(cf => cf.action === 'create')
          .map(cf => ({
            name: cf.customFieldName,
            entityType: cf.entityType,
            dataType: cf.dataType,
          }));
        if (newCFs.length > 0) {
          await client.createCustomFields(newCFs);
          stepResult.created = newCFs.length;
        }
      } else if (step.entity === 'resources' && items.length > 0) {
        await client.createResources(items);
        stepResult.created = items.length;
      } else if (step.entity === 'projects' && items.length > 0) {
        await client.createProjects(items);
        stepResult.created = items.length;
      } else if (step.entity === 'assignments' && items.length > 0) {
        await client.createAssignments(items);
        stepResult.created = items.length;
      } else if (step.entity === 'adminTimes' && items.length > 0) {
        await client.createAdminTimes(items);
        stepResult.created = items.length;
      } else if (step.entity === 'skills' && items.length > 0) {
        await client.createSkills(items);
        stepResult.created = items.length;
      } else if (step.entity === 'sheetData' && items.length > 0) {
        await client.createSheetData(items);
        stepResult.created = items.length;
      } else if (step.entity === 'advancedRates' && items.length > 0) {
        await client.createAdvancedRates(items);
        stepResult.created = items.length;
      } else if (step.entity === 'financials' && items.length > 0) {
        await client.createFinancials(items);
        stepResult.created = items.length;
      } else if (step.entity === 'teamResources' && items.length > 0) {
        await client.createTeamResources(items);
        stepResult.created = items.length;
      }

      logAudit('import_step_completed', session.id, {
        entity: step.entity,
        created: stepResult.created,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      stepResult.failed = entitiesToCreate.length;
      stepResult.errors.push(msg);
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
