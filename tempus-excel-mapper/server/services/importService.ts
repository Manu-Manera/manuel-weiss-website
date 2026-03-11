import type {
  Session, ImportProgress, MappingResult, ParsedExcel, TempusData,
  TemporalInterpretationResult, BulkCustomFieldValue,
} from '../types.js';
import { TempusClient } from './tempusClient.js';
import { logAudit } from './auditLog.js';
import { normalizeEntityKey } from './exportService.js';

const IMPORT_STEPS = [
  { entity: 'customFields',        label: '1. Attributes (Custom Fields)' },
  { entity: 'resyncCFs',           label: '   → Custom Fields synchronisieren' },
  { entity: 'resources',           label: '2. Resources' },
  { entity: 'resyncResources',     label: '   → Resources synchronisieren' },
  { entity: 'projects',            label: '3. Projects' },
  { entity: 'resyncProjects',      label: '   → Projects synchronisieren' },
  { entity: 'updateProjectFields', label: '4. Projektdaten aktualisieren (Datum, Phase…)' },
  { entity: 'projectCFValues',     label: '5. Project Custom Field Werte' },
  { entity: 'resourceCFValues',    label: '6. Resource Custom Field Werte' },
  { entity: 'milestones',          label: '7. Milestones' },
  { entity: 'resyncMilestones',    label: '   → Milestones synchronisieren' },
  { entity: 'milestoneCFValues',   label: '8. Milestone Custom Field Werte' },
  { entity: 'assignments',         label: '9. Assignments' },
  { entity: 'assignmentCFValues',  label: '10. Assignment Custom Field Werte' },
  { entity: 'adminTimes',          label: '11. Admin Times' },
  { entity: 'skills',              label: '12. Skills' },
  { entity: 'sheetData',           label: '13. Sheet Data' },
  { entity: 'advancedRates',       label: '14. Resource Rates' },
  { entity: 'financials',          label: '15. Financials' },
  { entity: 'financialCFValues',   label: '16. Financial Custom Field Werte' },
  { entity: 'teamResources',       label: '17. Team Resource Members' },
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

function parseFlexDate(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (typeof value === 'number' && value > 1000) {
    // Excel serial number
    const d = new Date((value - 25569) * 86400 * 1000);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  const str = String(value).trim();
  // ISO format: 2026-01-15 or 2026-01-15T00:00:00
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  // German format: 15.01.2026
  const de = str.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (de) {
    const d = new Date(`${de[3]}-${de[2].padStart(2, '0')}-${de[1].padStart(2, '0')}T00:00:00Z`);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  // US format: 01/15/2026
  const us = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (us) {
    const d = new Date(`${us[3]}-${us[1].padStart(2, '0')}-${us[2].padStart(2, '0')}T00:00:00Z`);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  // Fallback: try Date constructor
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d.toISOString();
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
  const entities: Array<{ id: number; name: string }> =
    targetEntityKey === 'projects' ? tempusData.projects :
    targetEntityKey === 'resources' ? tempusData.resources : [];

  const payloads: BulkCustomFieldValue[] = [];

  // Source 1: fieldMappings with cf: prefix (normalize entity key)
  const cfFieldMappings = mappingResult.fieldMappings.filter(
    fm => fm.targetField.startsWith('cf:') && normalizeEntityKey(fm.targetEntity) === targetEntityKey && fm.status !== 'rejected'
  );

  // Source 2: customFieldMappings matching this entity type (primary source for CF values)
  const cfEntityMappings = mappingResult.customFieldMappings.filter(
    cm => cm.entityType.toLowerCase() === cfEntityType.toLowerCase()
      || cm.entityType.toLowerCase() === targetEntityKey.toLowerCase()
  );

  // Collect all CF source columns to process (deduplicated)
  const processedCols = new Set<string>();

  // Helper: process a source column against a Tempus CF definition
  const processCFColumn = (sourceSheet: string, sourceColumn: string, cfDef: { id: number; name: string }) => {
    const colKey = `${sourceSheet}:${sourceColumn}`;
    if (processedCols.has(colKey)) return;
    processedCols.add(colKey);

    const nameMapping = mappingResult.fieldMappings.find(
      fm => fm.sourceSheet === sourceSheet
        && normalizeEntityKey(fm.targetEntity) === targetEntityKey
        && (fm.targetField === 'name' || fm.targetField === 'projectName' || fm.targetField === 'resourceName'
          || fm.targetField === 'project' || fm.targetField === 'resource')
    );
    if (!nameMapping) return;

    const sheet = parsedExcel.sheets.find(s => s.name === sourceSheet);
    if (!sheet) return;

    const valueToIds = new Map<string, Set<number>>();

    for (const row of sheet.rows) {
      const rawName = String(row[nameMapping.sourceColumn] ?? '').trim();
      if (!rawName) continue;

      const resolvedName = resolveEntityName(rawName, mappingResult);
      const entity = entities.find(e => e.name.toLowerCase() === resolvedName.toLowerCase());
      if (!entity) continue;

      const cfValue = row[sourceColumn];
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
  };

  // Process fieldMappings (cf: prefix)
  for (const cfm of cfFieldMappings) {
    const cfName = cfm.targetField.slice(3);
    let cfDef = tempusData.customFields.find(
      cf => cf.name.toLowerCase() === cfName.toLowerCase()
        && cf.entityType.toLowerCase() === cfEntityType.toLowerCase()
    );
    if (!cfDef) {
      const cfMapping = mappingResult.customFieldMappings.find(
        cm => cm.sourceColumn === cfm.sourceColumn && cm.sourceSheet === cfm.sourceSheet
      );
      if (cfMapping) {
        cfDef = tempusData.customFields.find(
          cf => cf.name.toLowerCase() === cfMapping.customFieldName.toLowerCase()
        );
      }
    }
    if (!cfDef) {
      cfDef = tempusData.customFields.find(cf => cf.name.toLowerCase() === cfName.toLowerCase());
    }
    if (!cfDef) {
      console.log(`[importService] CF "${cfName}" (${cfEntityType}) not found – skipping`);
      continue;
    }
    processCFColumn(cfm.sourceSheet, cfm.sourceColumn, cfDef);
  }

  // Process customFieldMappings (may contain CFs not in fieldMappings)
  for (const cm of cfEntityMappings) {
    const cfDef = tempusData.customFields.find(
      cf => cf.name.toLowerCase() === cm.customFieldName.toLowerCase()
        && cf.entityType.toLowerCase() === cfEntityType.toLowerCase()
    );
    if (!cfDef) {
      console.log(`[importService] CF "${cm.customFieldName}" (${cfEntityType}) from customFieldMappings not found – skipping`);
      continue;
    }
    processCFColumn(cm.sourceSheet, cm.sourceColumn, cfDef);
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
  const confirmedFieldMappings = mappingResult.fieldMappings.filter(
    fm => fm.status === 'confirmed' || fm.status === 'suggested'
  );

  // Normalize entity keys for all lookups
  const fieldsByEntity = (entityKey: string) =>
    confirmedFieldMappings.filter(fm => normalizeEntityKey(fm.targetEntity) === entityKey);
  const entitiesByType = (entityKey: string) =>
    confirmedNew.filter(em => normalizeEntityKey(em.targetEntity) === entityKey);

  switch (entity) {
    // ── 1. Custom Fields ──────────────────────────────────────────────
    case 'customFields': {
      // Double-check against current Tempus CFs to avoid duplicates
      const existingCFNames = new Set(
        tempusData.customFields.map(cf => `${cf.entityType.toLowerCase()}:${cf.name.toLowerCase()}`)
      );

      const newCFs = mappingResult.customFieldMappings
        .filter(cf => {
          if (cf.action !== 'create') return false;
          const key = `${cf.entityType.toLowerCase()}:${cf.customFieldName.toLowerCase()}`;
          if (existingCFNames.has(key)) {
            console.log(`[importService] CF "${cf.customFieldName}" (${cf.entityType}) already exists in Tempus – skipping creation`);
            return false;
          }
          return true;
        })
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
      const items = entitiesByType('resources')
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
      const newProjectEntities = entitiesByType('projects');
      if (newProjectEntities.length === 0) return 0;

      // Try to enrich new projects with dates/phase from source data
      const projFieldMappings = fieldsByEntity('projects');
      const startDateFM = projFieldMappings.find(fm => fm.targetField === 'startDate');
      const endDateFM = projFieldMappings.find(fm => fm.targetField === 'endDate');
      const phaseFM = projFieldMappings.find(fm => fm.targetField === 'phase');
      const nameFM = projFieldMappings.find(fm => fm.targetField === 'name' || fm.targetField === 'projectName');

      const sourceSheet = nameFM
        ? parsedExcel.sheets.find(s => s.name === nameFM.sourceSheet)
        : undefined;

      const items = newProjectEntities.map(em => {
        const name = em.sourceValue || em.matchedName;
        const item: Record<string, unknown> = {
          name,
          updateSecurityGroup: false,
          updateProjectDates: false,
          updateFinancialDates: false,
          updateWorkflow: false,
          updateAssignmentWorkflow: false,
          updateProjectWorkflow: false,
          updateLock: false,
        };

        if (sourceSheet && nameFM) {
          const row = sourceSheet.rows.find(r =>
            String(r[nameFM.sourceColumn] ?? '').trim().toLowerCase() === String(name).trim().toLowerCase()
          );
          if (row) {
            if (startDateFM) {
              const rawDate = row[startDateFM.sourceColumn];
              if (rawDate) {
                const d = parseFlexDate(rawDate);
                if (d) { item.startDate = d; item.updateProjectDates = true; }
              }
            }
            if (endDateFM) {
              const rawDate = row[endDateFM.sourceColumn];
              if (rawDate) {
                const d = parseFlexDate(rawDate);
                if (d) { item.endDate = d; item.updateProjectDates = true; }
              }
            }
            if (phaseFM) {
              const rawPhase = String(row[phaseFM.sourceColumn] ?? '').trim();
              if (rawPhase) {
                item.phase = applyTemporalTransform(rawPhase, 'phase', temporal);
              }
            }
          }
        }
        return item;
      });

      console.log(`[importService] Projects: creating ${items.length}`, JSON.stringify(items[0]));
      await client.createProjects(items);
      return items.length;
    }

    // ── 4. Update existing project fields (dates, phase, etc.) ────────
    case 'updateProjectFields': {
      const projectFieldMappings = fieldsByEntity('projects');
      console.log(`[importService] updateProjectFields: found ${projectFieldMappings.length} field mappings for projects`);
      if (projectFieldMappings.length === 0) return 0;

      const startDateFM = projectFieldMappings.find(fm => fm.targetField === 'startDate');
      const endDateFM = projectFieldMappings.find(fm => fm.targetField === 'endDate');
      const phaseFM = projectFieldMappings.find(fm => fm.targetField === 'phase');
      const benefitFM = projectFieldMappings.find(fm => fm.targetField === 'benefit');
      const priorityFM = projectFieldMappings.find(fm => fm.targetField === 'priority');

      console.log(`[importService] updateProjectFields: startDate=${startDateFM?.sourceColumn || 'none'}, endDate=${endDateFM?.sourceColumn || 'none'}, phase=${phaseFM?.sourceColumn || 'none'}, benefit=${benefitFM?.sourceColumn || 'none'}, priority=${priorityFM?.sourceColumn || 'none'}`);

      if (!startDateFM && !endDateFM && !phaseFM && !benefitFM && !priorityFM) return 0;

      const sheet = parsedExcel.sheets.find(s => s.name === (startDateFM || endDateFM || phaseFM || benefitFM || priorityFM)!.sourceSheet);
      if (!sheet) return 0;

      const nameFM = projectFieldMappings.find(fm => fm.targetField === 'name' || fm.targetField === 'projectName');
      if (!nameFM) {
        console.log(`[importService] updateProjectFields: no name mapping found – cannot match projects`);
        return 0;
      }

      console.log(`[importService] updateProjectFields: name column="${nameFM.sourceColumn}", sheet="${sheet.name}", ${sheet.rows.length} rows, ${tempusData.projects.length} Tempus projects`);

      const updates: Array<Record<string, unknown>> = [];

      for (const row of sheet.rows) {
        const rawName = String(row[nameFM.sourceColumn] ?? '').trim();
        if (!rawName) continue;

        const resolvedName = resolveEntityName(rawName, mappingResult);
        const project = tempusData.projects.find(p => p.name.toLowerCase() === resolvedName.toLowerCase());
        if (!project) {
          console.log(`[importService] updateProjectFields: project "${resolvedName}" not found in Tempus`);
          continue;
        }

        const update: Record<string, unknown> = {
          id: project.id,
          name: project.name,
          updateSecurityGroup: false,
          updateProjectDates: false,
          updateFinancialDates: false,
          updateWorkflow: false,
          updateAssignmentWorkflow: false,
          updateProjectWorkflow: false,
          updateLock: false,
        };

        let hasChanges = false;

        if (startDateFM) {
          const rawDate = row[startDateFM.sourceColumn];
          if (rawDate) {
            const d = parseFlexDate(rawDate);
            if (d) {
              update.startDate = d;
              update.updateProjectDates = true;
              hasChanges = true;
            }
          }
        }

        if (endDateFM) {
          const rawDate = row[endDateFM.sourceColumn];
          if (rawDate) {
            const d = parseFlexDate(rawDate);
            if (d) {
              update.endDate = d;
              update.updateProjectDates = true;
              hasChanges = true;
            }
          }
        }

        if (phaseFM) {
          const rawPhase = String(row[phaseFM.sourceColumn] ?? '').trim();
          if (rawPhase) {
            const transformed = applyTemporalTransform(rawPhase, 'phase', temporal);
            update.phase = transformed;
            hasChanges = true;
          }
        }

        if (benefitFM) {
          const val = row[benefitFM.sourceColumn];
          if (val != null && val !== '') {
            update.benefit = typeof val === 'number' ? val : parseFloat(String(val)) || 0;
            hasChanges = true;
          }
        }

        if (priorityFM) {
          const val = row[priorityFM.sourceColumn];
          if (val != null && val !== '') {
            update.priority = typeof val === 'number' ? val : parseInt(String(val)) || 0;
            hasChanges = true;
          }
        }

        if (hasChanges) updates.push(update);
      }

      if (updates.length === 0) {
        console.log(`[importService] updateProjectFields: no projects to update`);
        return 0;
      }
      console.log(`[importService] Updating ${updates.length} projects with dates/fields`, JSON.stringify(updates[0]));
      await client.updateProjects(updates);
      return updates.length;
    }

    // ── 5. Project CF Values ──────────────────────────────────────────
    case 'projectCFValues': {
      const payloads = buildCFValuePayloads('Project', 'projects', mappingResult, parsedExcel, tempusData);
      if (payloads.length === 0) { console.log(`[importService] Project CF Values: no payloads`); return 0; }
      console.log(`[importService] Project CF Values: ${payloads.length} value-groups`);
      await client.updateProjectCFValues(payloads);
      return payloads.length;
    }

    // ── 5. Resource CF Values ─────────────────────────────────────────
    case 'resourceCFValues': {
      const payloads = buildCFValuePayloads('Resource', 'resources', mappingResult, parsedExcel, tempusData);
      if (payloads.length === 0) { console.log(`[importService] Resource CF Values: no payloads`); return 0; }
      console.log(`[importService] Resource CF Values: ${payloads.length} value-groups`);
      await client.updateResourceCFValues(payloads);
      return payloads.length;
    }

    // ── 6. Milestones ───────────────────────────────────────────────
    case 'milestones': {
      const milestoneFieldMappings = fieldsByEntity('milestones');
      if (milestoneFieldMappings.length === 0) return 0;

      const nameMapping = milestoneFieldMappings.find(
        fm => fm.targetField === 'name'
      );
      const projMapping = milestoneFieldMappings.find(
        fm => fm.targetField === 'projectName' || fm.targetField === 'project'
      );
      const dateMapping = milestoneFieldMappings.find(
        fm => fm.targetField === 'date'
      );
      const descMapping = milestoneFieldMappings.find(
        fm => fm.targetField === 'description'
      );
      const colorMapping = milestoneFieldMappings.find(
        fm => fm.targetField === 'color'
      );
      const shapeMapping = milestoneFieldMappings.find(
        fm => fm.targetField === 'shape'
      );

      if (!nameMapping) return 0;

      const sheet = parsedExcel.sheets.find(s => s.name === nameMapping.sourceSheet);
      if (!sheet) return 0;

      const items: Array<Record<string, unknown>> = [];
      const seen = new Set<string>();

      for (const row of sheet.rows) {
        const msName = String(row[nameMapping.sourceColumn] ?? '').trim();
        if (!msName) continue;

        let projectId: number | undefined;
        if (projMapping) {
          const projName = resolveEntityName(String(row[projMapping.sourceColumn] ?? '').trim(), mappingResult);
          const project = tempusData.projects.find(p => p.name.toLowerCase() === projName.toLowerCase());
          projectId = project?.id;
        }
        if (!projectId && tempusData.projects.length > 0) {
          projectId = tempusData.projects[0].id;
        }
        if (!projectId) continue;

        const key = `${projectId}:${msName}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const existing = tempusData.milestones.find(
          m => m.projectId === projectId && m.name.toLowerCase() === msName.toLowerCase()
        );
        if (existing) continue;

        const item: Record<string, unknown> = {
          projectId,
          name: msName,
          description: descMapping ? String(row[descMapping.sourceColumn] ?? '') || null : null,
        };

        if (dateMapping) {
          const rawDate = row[dateMapping.sourceColumn];
          if (rawDate) {
            const d = new Date(rawDate as string | number);
            if (!isNaN(d.getTime())) item.date = d.toISOString();
          }
        }
        if (colorMapping) {
          const color = String(row[colorMapping.sourceColumn] ?? '').trim();
          if (color) item.color = color;
        }
        if (shapeMapping) {
          const shape = String(row[shapeMapping.sourceColumn] ?? '').trim();
          if (shape) item.shape = shape;
        }

        items.push(item);
      }

      if (items.length === 0) return 0;
      console.log(`[importService] Milestones: creating ${items.length}`, JSON.stringify(items[0]));
      await client.createMilestones(items);
      return items.length;
    }

    case 'resyncMilestones': {
      const ms = await client.getMilestones();
      tempusData.milestones = ms;
      console.log(`[importService] Re-synced Milestones: ${ms.length}`);
      return 0;
    }

    // ── 7. Milestone CF Values ─────────────────────────────────────────
    case 'milestoneCFValues': {
      const cfFieldMappings = mappingResult.fieldMappings.filter(
        fm => fm.targetField.startsWith('cf:') && normalizeEntityKey(fm.targetEntity) === 'milestones' && fm.status !== 'rejected'
      );
      if (cfFieldMappings.length === 0 || tempusData.milestones.length === 0) return 0;

      const payloads: BulkCustomFieldValue[] = [];
      for (const cfm of cfFieldMappings) {
        const cfName = cfm.targetField.slice(3);
        const cfDef = tempusData.customFields.find(
          cf => cf.name.toLowerCase() === cfName.toLowerCase()
            && cf.entityType.toLowerCase() === 'milestone'
        );
        if (!cfDef) continue;

        const sheet = parsedExcel.sheets.find(s => s.name === cfm.sourceSheet);
        if (!sheet) continue;

        const msNameMapping = mappingResult.fieldMappings.find(
          fm => fm.sourceSheet === cfm.sourceSheet && normalizeEntityKey(fm.targetEntity) === 'milestones'
            && (fm.targetField === 'name')
        );
        if (!msNameMapping) continue;

        const valueToIds = new Map<string, Set<number>>();

        for (const row of sheet.rows) {
          const msName = String(row[msNameMapping.sourceColumn] ?? '').trim();
          if (!msName) continue;

          const milestone = tempusData.milestones.find(m => m.name.toLowerCase() === msName.toLowerCase());
          if (!milestone) continue;

          const cfValue = row[cfm.sourceColumn];
          if (cfValue == null || cfValue === '') continue;

          const valueStr = String(cfValue).trim();
          if (!valueToIds.has(valueStr)) valueToIds.set(valueStr, new Set());
          valueToIds.get(valueStr)!.add(milestone.id);
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

      if (payloads.length === 0) return 0;
      console.log(`[importService] Milestone CF Values: ${payloads.length} value-groups`);
      await client.updateMilestoneCFValues(payloads);
      return payloads.length;
    }

    // ── 8. Assignments ────────────────────────────────────────────────
    case 'assignments': {
      const assignmentFieldMappings = fieldsByEntity('assignments');
      if (assignmentFieldMappings.length === 0) return 0;

      const projectMapping = assignmentFieldMappings.find(
        fm => fm.targetField === 'project' || fm.targetField === 'projectName'
      );
      const resourceMapping = assignmentFieldMappings.find(
        fm => fm.targetField === 'resource' || fm.targetField === 'resourceName'
      );
      if (!projectMapping || !resourceMapping) return 0;

      const sheet = parsedExcel.sheets.find(s => s.name === projectMapping.sourceSheet);
      if (!sheet) return 0;

      const seen = new Set<string>();
      const items: Array<Record<string, unknown>> = [];

      for (const row of sheet.rows) {
        const projName = resolveEntityName(String(row[projectMapping.sourceColumn] ?? '').trim(), mappingResult);
        const resName = resolveEntityName(String(row[resourceMapping.sourceColumn] ?? '').trim(), mappingResult);
        if (!projName || !resName) continue;

        const project = tempusData.projects.find(p => p.name.toLowerCase() === projName.toLowerCase());
        const resource = tempusData.resources.find(r => r.name.toLowerCase() === resName.toLowerCase());
        if (!project || !resource) continue;

        const key = `${project.id}:${resource.id}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const existingAssignment = tempusData.assignments.find(
          a => a.projectId === project.id && a.resourceId === resource.id
        );
        if (existingAssignment) continue;

        items.push({
          projectId: project.id,
          resourceId: resource.id,
          importBehavior: 'Merge',
        });
      }

      if (items.length === 0) return 0;
      console.log(`[importService] Assignments: creating ${items.length}`, JSON.stringify(items[0]));
      await client.createAssignments(items);

      const updatedAssignments = await client.getAssignments();
      tempusData.assignments = updatedAssignments;
      console.log(`[importService] Re-synced Assignments after creation: ${updatedAssignments.length}`);

      return items.length;
    }

    // ── 7. Assignment CF Values ───────────────────────────────────────
    case 'assignmentCFValues': {
      const cfFieldMappings = mappingResult.fieldMappings.filter(
        fm => fm.targetField.startsWith('cf:') && normalizeEntityKey(fm.targetEntity) === 'assignments' && fm.status !== 'rejected'
      );
      if (cfFieldMappings.length === 0 || tempusData.assignments.length === 0) return 0;

      const payloads: BulkCustomFieldValue[] = [];
      for (const cfm of cfFieldMappings) {
        const cfName = cfm.targetField.slice(3);
        const cfDef = tempusData.customFields.find(
          cf => cf.name.toLowerCase() === cfName.toLowerCase()
            && cf.entityType.toLowerCase() === 'assignment'
        );
        if (!cfDef) continue;

        const sheet = parsedExcel.sheets.find(s => s.name === cfm.sourceSheet);
        if (!sheet) continue;

        const projectMapping = mappingResult.fieldMappings.find(
          fm => fm.sourceSheet === cfm.sourceSheet && normalizeEntityKey(fm.targetEntity) === 'assignments'
            && (fm.targetField === 'project' || fm.targetField === 'projectName')
        );
        const resourceMapping = mappingResult.fieldMappings.find(
          fm => fm.sourceSheet === cfm.sourceSheet && normalizeEntityKey(fm.targetEntity) === 'assignments'
            && (fm.targetField === 'resource' || fm.targetField === 'resourceName')
        );
        if (!projectMapping || !resourceMapping) continue;

        const valueToAssignmentIds = new Map<string, Array<{ assignmentId: number }>>();

        for (const row of sheet.rows) {
          const projName = resolveEntityName(String(row[projectMapping.sourceColumn] ?? '').trim(), mappingResult);
          const resName = resolveEntityName(String(row[resourceMapping.sourceColumn] ?? '').trim(), mappingResult);
          const cfValue = row[cfm.sourceColumn];
          if (!projName || !resName || cfValue == null || cfValue === '') continue;

          const project = tempusData.projects.find(p => p.name.toLowerCase() === projName.toLowerCase());
          const resource = tempusData.resources.find(r => r.name.toLowerCase() === resName.toLowerCase());
          if (!project || !resource) continue;

          const assignment = tempusData.assignments.find(
            a => a.projectId === project.id && a.resourceId === resource.id
          );
          if (!assignment) continue;

          const valueStr = String(cfValue).trim();
          if (!valueToAssignmentIds.has(valueStr)) valueToAssignmentIds.set(valueStr, []);
          const existing = valueToAssignmentIds.get(valueStr)!;
          if (!existing.some(a => a.assignmentId === assignment.id)) {
            existing.push({ assignmentId: assignment.id });
          }
        }

        for (const [value, aids] of valueToAssignmentIds) {
          payloads.push({
            value,
            customFieldId: cfDef.id,
            entityIds: null,
            assignmentIds: aids,
          });
        }
      }

      if (payloads.length === 0) return 0;
      console.log(`[importService] Assignment CF Values: ${payloads.length} value-groups`);
      await client.updateAssignmentCFValues(payloads);
      return payloads.length;
    }

    // ── 8. Admin Times ────────────────────────────────────────────────
    case 'adminTimes': {
      const items = entitiesByType('adminTimes')
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
      const items = entitiesByType('skills')
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
      const cfFieldMappings = mappingResult.fieldMappings.filter(
        fm => fm.targetField.startsWith('cf:') && normalizeEntityKey(fm.targetEntity) === 'financials' && fm.status !== 'rejected'
      );
      if (cfFieldMappings.length === 0) return 0;

      const payloads: BulkCustomFieldValue[] = [];
      for (const cfm of cfFieldMappings) {
        const cfName = cfm.targetField.slice(3);
        const cfDef = tempusData.customFields.find(
          cf => cf.name.toLowerCase() === cfName.toLowerCase()
            && cf.entityType.toLowerCase() === 'financialrow'
        );
        if (!cfDef) continue;

        const sheet = parsedExcel.sheets.find(s => s.name === cfm.sourceSheet);
        if (!sheet) continue;

        const projMapping = mappingResult.fieldMappings.find(
          fm => fm.sourceSheet === cfm.sourceSheet && normalizeEntityKey(fm.targetEntity) === 'financials'
            && (fm.targetField === 'project' || fm.targetField === 'projectName')
        );

        const valueToEntityIds = new Map<string, number[]>();

        for (const row of sheet.rows) {
          const cfValue = row[cfm.sourceColumn];
          if (cfValue == null || cfValue === '') continue;
          const valueStr = String(cfValue).trim();

          let entityId: number | undefined;
          if (projMapping) {
            const projName = resolveEntityName(String(row[projMapping.sourceColumn] ?? '').trim(), mappingResult);
            const project = projName ? tempusData.projects.find(p => p.name.toLowerCase() === projName.toLowerCase()) : undefined;
            entityId = project?.id;
          }

          if (!entityId) continue;

          if (!valueToEntityIds.has(valueStr)) valueToEntityIds.set(valueStr, []);
          const existing = valueToEntityIds.get(valueStr)!;
          if (!existing.includes(entityId)) existing.push(entityId);
        }

        for (const [value, ids] of valueToEntityIds) {
          payloads.push({
            value,
            customFieldId: cfDef.id,
            entityIds: ids,
            assignmentIds: null,
          });
        }
      }

      if (payloads.length === 0) return 0;
      console.log(`[importService] Financial CF Values: ${payloads.length} value-groups`);
      await client.updateFinancialCFValues(payloads);
      return payloads.length;
    }

    default:
      return 0;
  }
}
