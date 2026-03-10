import type { Session, ImportProgress, FieldMapping, EntityMapping } from '../types.js';
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

  const confirmedFields = mappingResult.fieldMappings.filter(
    fm => fm.status === 'confirmed' || fm.status === 'suggested'
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
      } else {
        const items = buildImportPayload(step.entity, confirmedNew, confirmedFields, parsedExcel, mappingResult);
        if (items.length > 0) {
          console.log(`[importService] Step ${step.label}: ${items.length} items, sample:`, JSON.stringify(items[0]).slice(0, 200));
          await callCreateMethod(client, step.entity, items);
          stepResult.created = items.length;
        }
      }

      logAudit('import_step_completed', session.id, {
        entity: step.entity,
        created: stepResult.created,
      });
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

/**
 * Build proper API payload from Excel data + confirmed field mappings.
 * Instead of just { name }, constructs full entity objects with all mapped fields.
 */
function buildImportPayload(
  entityType: string,
  confirmedNew: EntityMapping[],
  confirmedFields: FieldMapping[],
  parsedExcel: { sheets: Array<{ name: string; rows: Record<string, unknown>[] }> },
  mappingResult: { entityMappings: EntityMapping[] },
): unknown[] {
  const entityFields = confirmedFields.filter(fm => fm.targetEntity === entityType);
  if (entityFields.length === 0) {
    return confirmedNew
      .filter(em => em.targetEntity === entityType)
      .map(em => ({ name: em.sourceValue || em.matchedName }));
  }

  const sourceSheets = [...new Set(entityFields.map(fm => fm.sourceSheet))];
  const items: Record<string, unknown>[] = [];

  for (const sheetName of sourceSheets) {
    const sheet = parsedExcel.sheets.find(s => s.name === sheetName);
    if (!sheet) continue;

    const sheetFields = entityFields.filter(fm => fm.sourceSheet === sheetName);

    for (const row of sheet.rows) {
      const item: Record<string, unknown> = {};
      let hasData = false;

      for (const fm of sheetFields) {
        let value = row[fm.sourceColumn];
        if (value == null || value === '') continue;

        // Resolve entity name matches (e.g. fuzzy-matched project names → actual Tempus names)
        if (typeof value === 'string') {
          const entityMatch = mappingResult.entityMappings.find(
            em => em.sourceValue.toLowerCase() === String(value).toLowerCase() && em.matchedName
          );
          if (entityMatch?.matchedName) value = entityMatch.matchedName;
        }

        const apiField = tempusFieldFromMapping(fm.targetField, entityType);
        if (apiField) {
          item[apiField] = value;
          hasData = true;
        }
      }

      if (hasData) items.push(item);
    }
  }

  return items;
}

function tempusFieldFromMapping(targetField: string, entityType: string): string | null {
  if (targetField.startsWith('cf:')) return null; // Custom field values handled separately

  const fieldMap: Record<string, Record<string, string>> = {
    resources: {
      'Resource Name': 'name', 'name': 'name',
      'Billing Rate': 'billingRate', 'billingRate': 'billingRate',
      'E-Mail': 'email', 'email': 'email',
      'Global Role': 'globalRoleName', 'globalRole': 'globalRoleName',
      'Department': 'department', 'department': 'department',
      'API External Id': 'externalId', 'externalId': 'externalId',
      'Capacity Unit': 'capacityUnit', 'capacityUnit': 'capacityUnit',
      'Is Enabled': 'isEnabled', 'isEnabled': 'isEnabled',
    },
    projects: {
      'Project Name': 'name', 'name': 'name',
      'Start Date': 'startDate', 'startDate': 'startDate',
      'End Date': 'endDate', 'endDate': 'endDate',
      'API External Id': 'externalId', 'externalId': 'externalId',
      'Project Priority': 'priority', 'priority': 'priority',
      'Phase': 'phase', 'phase': 'phase',
      'Benefit': 'benefit', 'benefit': 'benefit',
    },
    assignments: {
      'Project': 'projectName', 'projectName': 'projectName',
      'Resource': 'resourceName', 'resourceName': 'resourceName',
      'Task': 'taskName', 'taskName': 'taskName',
      'Plan Type': 'planType', 'planType': 'planType',
      'Project Allocation': 'allocation', 'allocation': 'allocation',
      'Priority': 'priority', 'priority': 'priority',
    },
    skills: {
      'Skill Name': 'name', 'name': 'name',
      'Category Names': 'categoryName', 'category': 'categoryName',
    },
    adminTimes: {
      'Admin Time Type': 'name', 'name': 'name',
      'Resource Name': 'resourceName', 'resourceName': 'resourceName',
    },
    sheetData: {
      'Project Name': 'projectName', 'projectName': 'projectName',
      'Template Name': 'templateName', 'taskName': 'templateName',
    },
    advancedRates: {
      'Resource Name': 'resourceName', 'resourceName': 'resourceName',
      'Rate': 'rate', 'rate': 'rate',
      'Start Date': 'startDate', 'effectiveDate': 'startDate',
    },
    financials: {
      'Project': 'projectName', 'projectName': 'projectName',
      'Category': 'category', 'category': 'category',
      'Type': 'type', 'type': 'type',
      'Project Cost': 'amount', 'budget': 'amount',
    },
    teamResources: {
      'Resource Name': 'resourceName', 'teamName': 'resourceName',
      'Team Member': 'teamMemberName', 'resourceName': 'teamMemberName',
    },
  };

  return fieldMap[entityType]?.[targetField] ?? null;
}

async function callCreateMethod(client: TempusClient, entity: string, items: unknown[]): Promise<void> {
  switch (entity) {
    case 'resources': await client.createResources(items); break;
    case 'projects': await client.createProjects(items); break;
    case 'assignments': await client.createAssignments(items); break;
    case 'adminTimes': await client.createAdminTimes(items); break;
    case 'skills': await client.createSkills(items); break;
    case 'sheetData': await client.createSheetData(items); break;
    case 'advancedRates': await client.createAdvancedRates(items); break;
    case 'financials': await client.createFinancials(items); break;
    case 'teamResources': await client.createTeamResources(items); break;
    default: console.warn(`[importService] Unbekannter Entity-Typ: ${entity}`);
  }
}
