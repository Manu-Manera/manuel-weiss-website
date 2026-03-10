import type { Session, ImportProgress } from '../types.js';
import { TempusClient } from './tempusClient.js';
import { logAudit } from './auditLog.js';

const IMPORT_STEPS = [
  { entity: 'customFields', label: 'Attributes (Custom Fields)' },
  { entity: 'resources', label: 'Resources' },
  { entity: 'projects', label: 'Projects' },
  { entity: 'assignments', label: 'Assignments' },
  { entity: 'adminTimes', label: 'Admin Time' },
  { entity: 'skills', label: 'Skills' },
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
      } else if (step.entity === 'resources') {
        const newResources = entitiesToCreate.map(em => ({ name: em.sourceValue }));
        if (newResources.length > 0) {
          await client.createResources(newResources);
          stepResult.created = newResources.length;
        }
      } else if (step.entity === 'projects') {
        const newProjects = entitiesToCreate.map(em => ({ name: em.sourceValue }));
        if (newProjects.length > 0) {
          await client.createProjects(newProjects);
          stepResult.created = newProjects.length;
        }
      } else if (step.entity === 'assignments') {
        const newAssignments = entitiesToCreate.map(em => ({ name: em.sourceValue }));
        if (newAssignments.length > 0) {
          await client.createAssignments(newAssignments);
          stepResult.created = newAssignments.length;
        }
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
