import ExcelJS from 'exceljs';
import type {
  ParsedExcel, MappingResult, TempusData, FieldMapping, EntityMapping,
  ValidationResult, ValidationIssue, TemporalInterpretationResult,
} from '../types.js';

// ── Tempus Template Definitions (exact match to Tempus import format) ─

export const TEMPUS_TEMPLATES = {
  attributes: {
    key: 'attributes',
    label: '1. Attributes (Custom Fields)',
    sheetName: 'Attributes',
    headers: ['Entity Type', 'Custom Field Name', 'Type', 'Import Behavior', 'Is Required', 'Is Unique', 'Default Value', 'Selection Values', 'Is Rich Text'],
    instructions: [
      'Entity Type: Project, Resource, Assignment, Milestone, FinancialRow, Task',
      'Type: String, Number, Date, Boolean, Selection, Multi-Selection, Currency, Precision Number, Url, Hierarchy, Workflow, Flags, Rich Text',
      'Import Behavior: Merge (update if exists, create if new), Insert (only create new), Delete',
      'Is Required / Is Unique / Is Rich Text: true or false',
      'Selection Values: Comma-separated list of values for Selection/Multi-Selection/Flags types',
      'Default Value: Optional default value for the field',
      'IMPORTANT: Import this file FIRST before any other templates',
    ],
  },
  resources: {
    key: 'resources',
    label: '2. Resources',
    sheetName: 'Resources',
    headers: ['Resource ID', 'API External Id', 'Resource Name', 'Billing Rate', 'Demand Planning', 'Capacity Aggregation', 'Capacity Unit', 'Import Behavior', 'Is Team Resource', 'Team Start Date', 'Team End Date', 'Is Enabled', 'Login', 'Enable SSO', 'E-Mail', 'Global Role', 'Security Group', 'Is Timesheet User', 'Is Timesheet Approver', 'Timesheet Approver', 'Is Resource Manager', 'Resource Managers', 'Department', 'Hired On'],
    instructions: [
      'Resource ID: Leave empty for new resources (auto-assigned by Tempus)',
      'API External Id: Optional external identifier for API integrations',
      'Resource Name: Required – Full name of the resource',
      'Import Behavior: Merge, Insert, or Delete',
      'Capacity Unit: Hours, FTE, or Days',
      'Is Team Resource / Is Enabled / Enable SSO / Is Timesheet User: true or false',
      'Global Role: Must match an existing role name in Tempus',
      'Security Group: Must match an existing security group name in Tempus',
      'Dates: Use YYYY-MM-DD format (e.g. 2026-01-15)',
      'Custom field columns can be added after the standard columns',
    ],
  },
  projects: {
    key: 'projects',
    label: '3. Projects',
    sheetName: 'Projects',
    headers: ['Project ID', 'API External Id', 'Project Name', 'Start Date', 'End Date', 'Import Behavior', 'Is Proposal', 'Dataset Preference', 'Security Group', 'Is Template', 'Project Priority', 'Phase', 'Benefit'],
    instructions: [
      'Project ID: Leave empty for new projects (auto-assigned by Tempus)',
      'API External Id: Optional external identifier',
      'Project Name: Required – Unique project name',
      'Start Date / End Date: YYYY-MM-DD format',
      'Import Behavior: Merge (update existing + create new), Insert, or Delete',
      'Is Proposal / Is Template: true or false',
      'Dataset Preference: Planned, Actual, or leave empty for default',
      'Project Priority: Integer value (lower = higher priority)',
      'Phase: Must match a Phase name configured in Tempus',
      'Benefit: Numeric value',
      'Custom field columns can be added after the standard columns',
    ],
  },
  assignments: {
    key: 'assignments',
    label: '4. Assignments',
    sheetName: 'Assignments',
    headers: ['Project', 'Project API External Id', 'Resource', 'Resource API External Id', 'Task', 'Data Input', 'Plan Type', 'Allocation Type', 'Time Period', 'Import Behavior', 'Id', 'Action', 'Project Allocation', 'Priority', 'Complete'],
    instructions: [
      'Project: Project name (must exist in Tempus)',
      'Resource: Resource name (must exist in Tempus)',
      'Task: Optional task name within the project',
      'Data Input: Allocation value (hours, FTE, etc.)',
      'Plan Type: Planned or Actual',
      'Allocation Type: Hours, FTE, Percentage, or Days',
      'Time Period: Month in format YYYY-MM (e.g. 2026-03) or specific date',
      'Import Behavior: Merge, Insert, or Delete',
      'Id: Leave empty for new assignments',
      'Action: Replace, Append, or leave empty for default',
      'Project Allocation: Total allocation for the project',
      'Priority: Integer priority value',
      'Complete: Percentage complete (0-100)',
      'Custom field columns can be added after the standard columns',
    ],
  },
  adminTimes: {
    key: 'adminTimes',
    label: '5. Admin Times',
    sheetName: 'Admin Times',
    headers: ['Resource Name', 'Aggregation Unit', 'Admin Time Type'],
    instructions: [
      'Resource Name: Must match an existing resource in Tempus',
      'Aggregation Unit: Hours, FTE, or Days',
      'Admin Time Type: Must match an existing admin time type in Tempus',
    ],
  },
  skills: {
    key: 'skills',
    label: '6. Skills',
    sheetName: 'Skills',
    headers: ['Skill Name', 'Type', 'Import Behavior', 'Category Names', 'Description', 'Track Expiration'],
    instructions: [
      'Skill Name: Required – Name of the skill',
      'Type: Skill value type (e.g. Proficiency, Yes/No)',
      'Import Behavior: Merge, Insert, or Delete',
      'Category Names: Comma-separated skill categories',
      'Track Expiration: true or false',
    ],
  },
  sheetData: {
    key: 'sheetData',
    label: '7. Sheet Data',
    sheetName: 'Sheet Data',
    headers: ['Entity Type', 'Project Name', 'Template Name'],
    instructions: [
      'Entity Type: Project, Resource, or Assignment',
      'Project Name: Name of the project to assign the sheet to',
      'Template Name: Name of the sheet data template in Tempus',
    ],
  },
  advancedRates: {
    key: 'advancedRates',
    label: '8. Advanced Rates',
    sheetName: 'Resource Rates',
    headers: ['Resource Name', 'Rate', 'Start Date', 'End Date'],
    instructions: [
      'Resource Name: Must match an existing resource in Tempus',
      'Rate: Numeric billing/cost rate value',
      'Start Date / End Date: YYYY-MM-DD format for rate effective period',
    ],
  },
  financials: {
    key: 'financials',
    label: '9. Financials',
    sheetName: 'Financials',
    headers: ['Project', 'Category', 'Type', 'Time Period', 'Import Behavior', 'Project Cost', 'Row Id', 'Priority'],
    instructions: [
      'Project: Project name (must exist in Tempus)',
      'Category: Financial category name',
      'Type: Financial type name',
      'Time Period: Month in YYYY-MM format',
      'Import Behavior: Merge, Insert, or Delete',
      'Project Cost: Numeric cost value',
      'Row Id: Leave empty for new entries',
      'Priority: Integer priority value',
      'Custom field columns can be added after the standard columns',
    ],
  },
  milestones: {
    key: 'milestones',
    label: '10. Milestones',
    sheetName: 'Milestones',
    headers: ['Project', 'Project API External Id', 'Milestone Name', 'Date', 'Description', 'Color', 'Shape', 'Import Behavior'],
    instructions: [
      'Project: Project name (must exist in Tempus)',
      'Milestone Name: Required – Unique name within the project',
      'Date: YYYY-MM-DD format',
      'Color: HotPink, PaleVioletRed, DarkCyan, DodgerBlue, MediumPurple, Gold, Orange, LimeGreen, or other CSS color names',
      'Shape: Diamond, Square, Circle, Triangle, Star',
      'Import Behavior: Merge, Insert, or Delete',
      'Custom field columns can be added after the standard columns',
    ],
  },
  teamResources: {
    key: 'teamResources',
    label: '11. Team Resources',
    sheetName: 'Team Resource Members',
    headers: ['Resource Name', 'Aggregation Unit', 'Team Member'],
    instructions: [
      'Resource Name: Team resource name (must be a Team Resource in Tempus)',
      'Aggregation Unit: Hours, FTE, or Days',
      'Team Member: Name of the individual resource to add as team member',
    ],
  },
} as const;

// ── Validation ───────────────────────────────────────────────────────

export function validateMappings(
  parsed: ParsedExcel,
  mappingResult: MappingResult,
  tempusData: TempusData,
): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Check unconfirmed critical mappings
  const unconfirmedCritical = mappingResult.fieldMappings.filter(
    fm => fm.status === 'needs_review' && fm.confidence < 0.5
  );
  for (const fm of unconfirmedCritical) {
    issues.push({
      severity: 'error',
      category: 'Unbestätigtes Mapping',
      message: `Kritisches Mapping nicht bestätigt: ${fm.sourceSheet}.${fm.sourceColumn} → ${fm.targetEntity}.${fm.targetField}`,
      sheet: fm.sourceSheet,
      column: fm.sourceColumn,
      suggestion: 'Bitte manuell bestätigen oder ablehnen',
    });
  }

  // Check rejected but required mappings
  const rejected = mappingResult.fieldMappings.filter(fm => fm.status === 'rejected');
  for (const fm of rejected) {
    if (['name', 'projectName', 'resourceName'].includes(fm.targetField)) {
      issues.push({
        severity: 'warning',
        category: 'Abgelehntes Pflichtfeld',
        message: `Pflichtfeld-Mapping abgelehnt: ${fm.sourceColumn} → ${fm.targetField}`,
        sheet: fm.sourceSheet,
        column: fm.sourceColumn,
      });
    }
  }

  // Check new entities without confirmation
  const unconfirmedNew = mappingResult.entityMappings.filter(
    em => em.isNew && em.status !== 'confirmed' && em.status !== 'create_new'
  );
  for (const em of unconfirmedNew) {
    issues.push({
      severity: 'warning',
      category: 'Neue Entität',
      message: `Neue ${em.targetEntity}: "${em.sourceValue}" – noch nicht bestätigt`,
      sheet: em.sourceSheet,
      column: em.sourceColumn,
    });
  }

  // Check for duplicate entity mappings
  const entityKeys = new Map<string, EntityMapping[]>();
  for (const em of mappingResult.entityMappings) {
    const key = `${em.targetEntity}:${em.sourceValue.toLowerCase()}`;
    if (!entityKeys.has(key)) entityKeys.set(key, []);
    entityKeys.get(key)!.push(em);
  }
  for (const [key, mappings] of entityKeys) {
    if (mappings.length > 1) {
      issues.push({
        severity: 'warning',
        category: 'Duplikat',
        message: `Doppelter Wert: "${mappings[0].sourceValue}" in ${mappings[0].targetEntity}`,
        sheet: mappings[0].sourceSheet,
      });
    }
  }

  // Check data quality per sheet
  for (const sheet of parsed.sheets) {
    const sheetMappings = mappingResult.fieldMappings.filter(
      fm => fm.sourceSheet === sheet.name && (fm.status === 'confirmed' || fm.status === 'suggested')
    );

    for (const mapping of sheetMappings) {
      const values = sheet.rows.map(r => r[mapping.sourceColumn]);
      const nullCount = values.filter(v => v == null || v === '').length;
      const nullRatio = values.length > 0 ? nullCount / values.length : 0;

      if (mapping.targetField === 'name' && nullCount > 0) {
        issues.push({
          severity: 'error',
          category: 'Fehlende Pflichtdaten',
          message: `${nullCount} leere Werte in Pflichtfeld "${mapping.sourceColumn}"`,
          sheet: sheet.name,
          column: mapping.sourceColumn,
        });
      } else if (nullRatio > 0.5) {
        issues.push({
          severity: 'info',
          category: 'Datenqualität',
          message: `${Math.round(nullRatio * 100)}% leere Werte in "${mapping.sourceColumn}"`,
          sheet: sheet.name,
          column: mapping.sourceColumn,
        });
      }
    }
  }

  // Check for unmapped columns
  if (mappingResult.unmappedColumns.length > 0) {
    issues.push({
      severity: 'info',
      category: 'Nicht zugeordnet',
      message: `${mappingResult.unmappedColumns.length} Spalten nicht zugeordnet: ${mappingResult.unmappedColumns.join(', ')}`,
    });
  }

  const errors = issues.filter(i => i.severity === 'error').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;
  const infos = issues.filter(i => i.severity === 'info').length;
  const blockingIssues = issues.filter(i => i.severity === 'error').map(i => i.message);

  return {
    isValid: errors === 0,
    issues,
    summary: { errors, warnings, infos },
    canExport: true, // Allow export even with warnings
    blockingIssues,
  };
}

// ── Export ────────────────────────────────────────────────────────────

export async function generateTempusExcel(
  parsed: ParsedExcel,
  mappingResult: MappingResult,
  tempusData: TempusData,
  templates?: string[],
  temporalInterpretation?: TemporalInterpretationResult,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Tempus Excel Mapper';
  workbook.created = new Date();

  let selectedTemplates = templates && templates.length > 0
    ? templates
    : Object.keys(TEMPUS_TEMPLATES);

  if (!selectedTemplates.includes('attributes') && mappingResult.customFieldMappings.length > 0) {
    selectedTemplates = ['attributes', ...selectedTemplates];
  }

  const confirmedFieldMappings = mappingResult.fieldMappings.filter(
    fm => fm.status === 'confirmed' || fm.status === 'suggested'
  );
  const confirmedEntityMappings = mappingResult.entityMappings.filter(
    em => em.status === 'confirmed' || em.status === 'suggested' || em.status === 'create_new'
  );

  const byEntity = new Map<string, FieldMapping[]>();
  for (const fm of confirmedFieldMappings) {
    if (!byEntity.has(fm.targetEntity)) byEntity.set(fm.targetEntity, []);
    byEntity.get(fm.targetEntity)!.push(fm);
  }

  // ── Add Instructions sheet ──────────────────────────────────────────
  const wsInstr = workbook.addWorksheet('Instructions');
  const instrTitle = wsInstr.addRow(['Tempus Import – Instructions']);
  instrTitle.font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
  wsInstr.mergeCells(1, 1, 1, 3);
  wsInstr.addRow([]);
  wsInstr.addRow(['This workbook was generated by Tempus Excel Mapper.']);
  wsInstr.addRow(['Import the sheets into Tempus in the correct order (Attributes first, then Resources, Projects, etc.).']);
  wsInstr.addRow([]);

  const instrHeaderRow = wsInstr.addRow(['Sheet', 'Import Order', 'Notes']);
  instrHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  instrHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

  for (const tKey of selectedTemplates) {
    const t = TEMPUS_TEMPLATES[tKey as keyof typeof TEMPUS_TEMPLATES];
    if (!t) continue;
    wsInstr.addRow([(t as any).sheetName, (t as any).label, ((t as any).instructions || [])[0] || '']);
  }
  wsInstr.addRow([]);

  const generalNotes = wsInstr.addRow(['General Notes:']);
  generalNotes.font = { bold: true };
  wsInstr.addRow(['- Import Behavior: "Merge" updates existing and creates new entries. "Insert" only creates. "Delete" removes.']);
  wsInstr.addRow(['- Dates must be in YYYY-MM-DD format (e.g. 2026-03-15).']);
  wsInstr.addRow(['- Boolean fields: Use "true" or "false" (lowercase).']);
  wsInstr.addRow(['- Custom field columns appear after the standard columns. Their names must exactly match the custom field names in Tempus.']);
  wsInstr.addRow(['- Leave ID columns empty for new entries – Tempus assigns IDs automatically.']);
  wsInstr.addRow(['- Each sheet can be imported separately in Tempus under Settings > Excel Import.']);

  wsInstr.columns = [{ width: 30 }, { width: 40 }, { width: 80 }];

  // ── Generate data sheets ──────────────────────────────────────────
  for (const templateKey of selectedTemplates) {
    const template = TEMPUS_TEMPLATES[templateKey as keyof typeof TEMPUS_TEMPLATES];
    if (!template) continue;

    const entityMappings = byEntity.get(templateKey) || [];
    if (entityMappings.length === 0 && templateKey !== 'attributes') continue;

    const ws = workbook.addWorksheet(template.sheetName);

    // Build headers: standard columns + custom field columns
    const headers = [...template.headers];
    const customFieldCols: string[] = [];

    // Add CF columns from field mappings
    if (['projects', 'resources', 'assignments', 'financials', 'milestones'].includes(templateKey)) {
      for (const fm of entityMappings) {
        if (fm.targetField.startsWith('cf:')) {
          const cfName = fm.targetField.slice(3);
          if (!headers.includes(cfName)) {
            headers.push(cfName);
            customFieldCols.push(cfName);
          }
        }
      }
      // Also add CFs from customFieldMappings for this entity type
      const entityTypeLower = templateKey.toLowerCase();
      for (const cm of mappingResult.customFieldMappings) {
        const cmEntity = cm.entityType.toLowerCase();
        if (cmEntity === entityTypeLower || cmEntity === entityTypeLower.replace(/s$/, '')) {
          if (!headers.includes(cm.customFieldName)) {
            headers.push(cm.customFieldName);
            customFieldCols.push(cm.customFieldName);
          }
        }
      }
    }

    // Write header row
    const headerRow = ws.addRow(headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    headerRow.alignment = { wrapText: true };

    if (templateKey === 'attributes') {
      const allCFMappings = [
        ...mappingResult.customFieldMappings.filter(cf => cf.action === 'create'),
        ...mappingResult.customFieldMappings.filter(cf => cf.action === 'exists'),
      ];
      for (const cf of allCFMappings) {
        const tempusType = mapToTempusDataType(cf.dataType);
        const isSelection = /selection|enum|flags/i.test(cf.dataType) || /Selection|Enum|Flags/.test(tempusType);
        const selectionValues = isSelection && cf.uniqueValues
          ? cf.uniqueValues.join(', ')
          : '';
        ws.addRow([
          capitalizeEntityTypeForExport(cf.entityType),
          cf.customFieldName,
          tempusType,
          'Merge',
          cf.existsInTempus ? '' : 'false',
          cf.existsInTempus ? '' : 'false',
          '',
          selectionValues,
          'false',
        ]);
      }
    } else {
      const sourceSheets = [...new Set(entityMappings.map(m => m.sourceSheet))];
      for (const sheetName of sourceSheets) {
        const sheet = parsed.sheets.find(s => s.name === sheetName);
        if (!sheet) continue;

        const sheetMappings = entityMappings.filter(m => m.sourceSheet === sheetName);
        const pivotFMs = sheetMappings.filter(m => m.transformation === 'unpivot');
        const isPivotUnpivot = pivotFMs.length > 0
          && temporalInterpretation?.pivotRecommendation?.unpivotRequired
          && templateKey === 'assignments';

        if (isPivotUnpivot) {
          const nonPivotMappings = sheetMappings.filter(m => m.transformation !== 'unpivot');
          for (const row of sheet.rows) {
            for (const pivotFM of pivotFMs) {
              const allocValue = row[pivotFM.sourceColumn];
              if (allocValue == null || allocValue === '' || allocValue === 0) continue;

              const exportRow: unknown[] = [];
              for (const header of headers) {
                if (header === 'Time Period') {
                  const periodMatch = temporalInterpretation!.periodInterpretations.find(
                    pi => pi.rawPattern.toLowerCase() === pivotFM.sourceColumn.toLowerCase()
                  );
                  exportRow.push(periodMatch?.tempusTimePeriod || pivotFM.sourceColumn);
                } else if (header === 'Data Input' || header === 'Project Allocation') {
                  exportRow.push(allocValue);
                } else if (header === 'Import Behavior') {
                  exportRow.push('Merge');
                } else {
                  const mapping = nonPivotMappings.find(m => {
                    if (m.targetField.startsWith('cf:')) return m.targetField.slice(3) === header;
                    return tempusFieldToHeader(m.targetField, templateKey) === header;
                  });
                  if (mapping) {
                    let val = row[mapping.sourceColumn];
                    if (val && typeof val === 'string') {
                      const eMatch = confirmedEntityMappings.find(
                        em => em.sourceValue.toLowerCase() === String(val).toLowerCase() && em.matchedName
                      );
                      if (eMatch?.matchedName) val = eMatch.matchedName;
                    }
                    exportRow.push(val ?? '');
                  } else {
                    exportRow.push('');
                  }
                }
              }
              ws.addRow(exportRow);
            }
          }
        } else {
          for (const row of sheet.rows) {
            const exportRow: unknown[] = [];
            for (const header of headers) {
              // Find mapping: first by cf: prefix, then by header name, also check customFieldMappings
              let mapping = sheetMappings.find(m => {
                if (m.targetField.startsWith('cf:')) return m.targetField.slice(3) === header;
                return tempusFieldToHeader(m.targetField, templateKey) === header;
              });

              // If no direct mapping, check if a customFieldMapping matches this header
              if (!mapping && customFieldCols.includes(header)) {
                const cfm = mappingResult.customFieldMappings.find(
                  cm => cm.customFieldName === header && cm.sourceSheet === sheetName
                );
                if (cfm) {
                  const val = row[cfm.sourceColumn];
                  exportRow.push(val ?? '');
                  continue;
                }
              }

              if (!mapping) {
                // Defaults for standard columns
                if (header === 'Import Behavior') { exportRow.push('Merge'); continue; }
                if (header === 'Is Enabled') { exportRow.push('true'); continue; }
                if (header === 'Is Proposal' || header === 'Is Template' || header === 'Is Team Resource'
                  || header === 'Enable SSO' || header === 'Is Timesheet User'
                  || header === 'Is Timesheet Approver' || header === 'Is Resource Manager') {
                  exportRow.push('false'); continue;
                }
                exportRow.push('');
                continue;
              }

              let value = row[mapping.sourceColumn];

              // Entity name resolution
              if (value && typeof value === 'string') {
                const entityMatch = confirmedEntityMappings.find(
                  em => em.sourceValue.toLowerCase() === String(value).toLowerCase() && em.matchedName
                );
                if (entityMatch && entityMatch.matchedName) {
                  value = entityMatch.matchedName;
                }
              }

              // Temporal transformations
              if (temporalInterpretation && value && typeof value === 'string') {
                if (header === 'Phase' || mapping.targetField === 'phase') {
                  const phaseMatch = temporalInterpretation.phaseInterpretations.find(
                    pi => pi.rawCode.toLowerCase() === String(value).toLowerCase()
                  );
                  if (phaseMatch) value = phaseMatch.tempusValue;
                }
                if (header === 'Time Period' || mapping.targetField === 'month' || mapping.targetField === 'planType') {
                  const periodMatch = temporalInterpretation.periodInterpretations.find(
                    pi => pi.rawPattern.toLowerCase() === String(value).toLowerCase()
                  );
                  if (periodMatch) value = periodMatch.tempusTimePeriod;
                }
              }

              // Date formatting (YYYY-MM-DD)
              if (['Start Date', 'End Date', 'Team Start Date', 'Team End Date', 'Hired On', 'Date'].includes(header) && value) {
                value = formatDate(value);
              }

              exportRow.push(value ?? '');
            }
            ws.addRow(exportRow);
          }
        }
      }
    }

    ws.columns.forEach(col => {
      let maxLen = 10;
      col.eachCell?.({ includeEmpty: false }, cell => {
        const len = String(cell.value ?? '').length;
        if (len > maxLen) maxLen = len;
      });
      col.width = Math.min(maxLen + 4, 40);
    });
  }

  addReportSheet(workbook, mappingResult);

  // Sanitize: ExcelJS crashes on shared formula references when writing new workbooks.
  // We rebuild each cell value as a plain value to strip any formula metadata.
  workbook.eachSheet(sheet => {
    sheet.eachRow({ includeEmpty: false }, row => {
      row.eachCell({ includeEmpty: false }, cell => {
        const model = (cell as any).model;
        if (model && (model.sharedFormula !== undefined || model.formula !== undefined)) {
          // Extract the computed result if it's a formula cell
          let plainValue = cell.value;
          if (typeof plainValue === 'object' && plainValue !== null) {
            if ('result' in (plainValue as any)) plainValue = (plainValue as any).result;
            else if ('sharedFormula' in (plainValue as any)) plainValue = (plainValue as any).result ?? '';
          }
          // Overwrite with plain value — this clears formula metadata
          cell.value = plainValue ?? '';
        }
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function tempusFieldToHeader(field: string, entity: string): string {
  const fieldMap: Record<string, Record<string, string>> = {
    projects: {
      name: 'Project Name',
      startDate: 'Start Date',
      endDate: 'End Date',
      externalId: 'API External Id',
      priority: 'Project Priority',
      phase: 'Phase',
      benefit: 'Benefit',
      importBehavior: 'Import Behavior',
      isLocked: 'Is Template',
      status: 'Project Priority',
      manager: 'Security Group',
    },
    resources: {
      name: 'Resource Name',
      billingRate: 'Billing Rate',
      capacityUnit: 'Capacity Unit',
      globalRole: 'Global Role',
      externalId: 'API External Id',
      email: 'E-Mail',
      department: 'Department',
      isEnabled: 'Is Enabled',
      importBehavior: 'Import Behavior',
    },
    assignments: {
      projectName: 'Project',
      resourceName: 'Resource',
      taskName: 'Task',
      planType: 'Plan Type',
      allocation: 'Project Allocation',
      month: 'Time Period',
      priority: 'Priority',
      startDate: 'Start Date',
      endDate: 'End Date',
      importBehavior: 'Import Behavior',
    },
    adminTimes: {
      name: 'Admin Time Type',
      resourceName: 'Resource Name',
      type: 'Admin Time Type',
      hours: 'Aggregation Unit',
    },
    skills: {
      name: 'Skill Name',
      category: 'Category Names',
      level: 'Type',
      resourceName: 'Resource Name',
      importBehavior: 'Import Behavior',
    },
    sheetData: {
      projectName: 'Project Name',
      taskName: 'Template Name',
      resourceName: 'Resource Name',
    },
    advancedRates: {
      resourceName: 'Resource Name',
      projectName: 'Project Name',
      rate: 'Rate',
      effectiveDate: 'Start Date',
    },
    financials: {
      projectName: 'Project',
      month: 'Time Period',
      budget: 'Project Cost',
      type: 'Type',
      category: 'Category',
      importBehavior: 'Import Behavior',
    },
    milestones: {
      name: 'Milestone Name',
      projectName: 'Project',
      date: 'Date',
      description: 'Description',
      color: 'Color',
      shape: 'Shape',
      importBehavior: 'Import Behavior',
    },
    teamResources: {
      teamName: 'Resource Name',
      resourceName: 'Team Member',
      role: 'Aggregation Unit',
    },
    customFields: {
      entityType: 'Entity Type',
      name: 'Custom Field Name',
      dataType: 'Type',
    },
  };
  return fieldMap[entity]?.[field] || formatFieldName(field);
}

function capitalizeEntityTypeForExport(et: string): string {
  const map: Record<string, string> = {
    project: 'Project', resource: 'Resource', assignment: 'Assignment',
    milestone: 'Milestone', financialrow: 'FinancialRow', task: 'Task',
    Project: 'Project', Resource: 'Resource', Assignment: 'Assignment',
    Milestone: 'Milestone', FinancialRow: 'FinancialRow', Task: 'Task',
  };
  return map[et] || et;
}

function mapToTempusDataType(dt: string): string {
  const map: Record<string, string> = {
    Text: 'String',
    String: 'String',
    Number: 'Number',
    Date: 'Date',
    Boolean: 'Boolean',
    Selection: 'Selection',
    'Multi-Selection': 'Multi-Selection',
    Currency: 'Currency',
    'Precision Number': 'Precision Number',
  };
  return map[dt] || dt;
}

function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

function formatDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().split('T')[0];
  if (typeof value === 'number' && value > 1000) {
    const d = new Date((value - 25569) * 86400 * 1000);
    return isNaN(d.getTime()) ? String(value) : d.toISOString().split('T')[0];
  }
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.split('T')[0];
  const de = str.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (de) return `${de[3]}-${de[2].padStart(2, '0')}-${de[1].padStart(2, '0')}`;
  return str;
}

function addReportSheet(workbook: ExcelJS.Workbook, mappingResult: MappingResult): void {
  const ws = workbook.addWorksheet('Mapping Report');

  ws.addRow(['Tempus Excel Mapper – Mapping Report']);
  ws.addRow([`Erstellt: ${new Date().toISOString()}`]);
  ws.addRow([]);

  ws.addRow(['Zusammenfassung']);
  const summaryHeader = ws.addRow(['Metrik', 'Wert']);
  summaryHeader.font = { bold: true };
  ws.addRow(['Zugeordnete Felder', mappingResult.summary.mappedFields]);
  ws.addRow(['Nicht zugeordnete Felder', mappingResult.unmappedColumns.length]);
  ws.addRow(['Erkannte Entitäten', mappingResult.summary.totalEntities]);
  ws.addRow(['Gematchte Entitäten', mappingResult.summary.matchedEntities]);
  ws.addRow(['Neue Entitäten', mappingResult.summary.newEntities]);
  ws.addRow([]);

  ws.addRow(['Feld-Zuordnungen']);
  const fmHeader = ws.addRow(['Quelle (Sheet.Spalte)', 'Ziel', 'Match-Typ', 'Confidence', 'Status', 'Begründung']);
  fmHeader.font = { bold: true };
  for (const fm of mappingResult.fieldMappings) {
    ws.addRow([
      `${fm.sourceSheet}.${fm.sourceColumn}`,
      `${fm.targetEntity}.${fm.targetField}`,
      fm.matchType,
      `${Math.round(fm.confidence * 100)}%`,
      fm.status,
      fm.reasoning,
    ]);
  }
  ws.addRow([]);

  const newEntities = mappingResult.entityMappings.filter(em => em.isNew);
  if (newEntities.length > 0) {
    ws.addRow(['Neue Entitäten (anzulegen)']);
    const neHeader = ws.addRow(['Wert', 'Typ', 'Status', 'Begründung']);
    neHeader.font = { bold: true };
    for (const em of newEntities) {
      ws.addRow([em.sourceValue, em.targetEntity, em.status, em.reasoning]);
    }
  }

  ws.columns.forEach(col => { col.width = 25; });
}

// ── Styling helpers for the comprehensive report ────────────────────

const COLORS = {
  headerBg: 'FF1E3A5F',
  headerFont: 'FFFFFFFF',
  sectionBg: 'FFE8EEF5',
  errorBg: 'FFFDE8E8',
  errorFont: 'FFDC2626',
  warningBg: 'FFFFFBEB',
  warningFont: 'FFD97706',
  infoBg: 'FFEFF6FF',
  infoFont: 'FF2563EB',
  confirmedBg: 'FFF0FDF4',
  rejectedBg: 'FFFEF2F2',
  createNewBg: 'FFFFFBEB',
  needsReviewBg: 'FFFFF7ED',
  borderColor: 'FFD1D5DB',
};

function styleHeaderRow(row: ExcelJS.Row, colCount: number): void {
  row.font = { bold: true, color: { argb: COLORS.headerFont }, size: 11 };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
  row.alignment = { vertical: 'middle', wrapText: true };
  for (let i = 1; i <= colCount; i++) {
    row.getCell(i).border = {
      bottom: { style: 'thin', color: { argb: COLORS.borderColor } },
    };
  }
}

function styleSectionTitle(ws: ExcelJS.Worksheet, title: string, colSpan: number): void {
  const row = ws.addRow([title]);
  row.font = { bold: true, size: 13, color: { argb: COLORS.headerBg } };
  ws.mergeCells(row.number, 1, row.number, colSpan);
  ws.addRow([]);
}

function statusLabel(status: string): string {
  switch (status) {
    case 'confirmed': return '✅ Bestätigt';
    case 'rejected': return '❌ Abgelehnt';
    case 'create_new': return '🆕 Neu anlegen';
    case 'needs_review': return '⚠️ Prüfen';
    case 'suggested': return '💡 Vorschlag';
    default: return status;
  }
}

function matchTypeLabel(matchType: string): string {
  switch (matchType) {
    case 'exact': return 'Exakt';
    case 'fuzzy': return 'Fuzzy';
    case 'ai_suggested': return 'KI-Vorschlag';
    case 'user_confirmed': return 'Manuell bestätigt';
    case 'new_entity': return 'Neue Entität';
    default: return matchType;
  }
}

function severityLabel(severity: string): string {
  switch (severity) {
    case 'error': return '🔴 Fehler';
    case 'warning': return '🟡 Warnung';
    case 'info': return '🔵 Hinweis';
    default: return severity;
  }
}

function statusRowFill(status: string): ExcelJS.Fill | undefined {
  switch (status) {
    case 'confirmed': return { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.confirmedBg } };
    case 'rejected': return { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.rejectedBg } };
    case 'create_new': return { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.createNewBg } };
    case 'needs_review': return { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.needsReviewBg } };
    default: return undefined;
  }
}

export interface ReportContext {
  mappingResult: MappingResult;
  validation: ValidationResult;
  parsedExcel?: ParsedExcel;
  tempusData?: TempusData;
}

export async function generateReport(
  mappingResult: MappingResult,
  validation: ValidationResult,
  parsedExcel?: ParsedExcel,
  tempusData?: TempusData,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Tempus Excel Mapper';
  workbook.created = new Date();

  const now = new Date();
  const dateStr = now.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // ── Sheet 1: Übersicht ──────────────────────────────────────────────

  const wsOverview = workbook.addWorksheet('Übersicht');

  const titleRow = wsOverview.addRow(['Tempus Import – Mapping Report']);
  titleRow.font = { bold: true, size: 16, color: { argb: COLORS.headerBg } };
  wsOverview.mergeCells(1, 1, 1, 4);
  wsOverview.addRow([`Erstellt: ${dateStr}`]).font = { italic: true, color: { argb: 'FF6B7280' } };
  if (parsedExcel) {
    wsOverview.addRow([`Quelldatei: ${parsedExcel.fileName}`]).font = { italic: true, color: { argb: 'FF6B7280' } };
  }
  wsOverview.addRow([]);

  styleSectionTitle(wsOverview, 'Mapping-Zusammenfassung', 4);
  const mHeader = wsOverview.addRow(['Metrik', 'Wert', 'Details', '']);
  styleHeaderRow(mHeader, 4);

  const s = mappingResult.summary;
  wsOverview.addRow(['Felder gesamt', s.totalFields, `${s.mappedFields} zugeordnet, ${s.totalFields - s.mappedFields} offen`, '']);
  wsOverview.addRow(['Felder zugeordnet', s.mappedFields, `${Math.round(s.mappedFields / Math.max(s.totalFields, 1) * 100)}%`, '']);
  wsOverview.addRow(['Nicht zugeordnete Spalten', mappingResult.unmappedColumns.length, mappingResult.unmappedColumns.slice(0, 5).join(', ') + (mappingResult.unmappedColumns.length > 5 ? ' ...' : ''), '']);
  wsOverview.addRow(['Entitäten gesamt', s.totalEntities, `${s.matchedEntities} gematchte + ${s.newEntities} neue`, '']);
  wsOverview.addRow(['Gematchte Entitäten', s.matchedEntities, '', '']);
  wsOverview.addRow(['Neue Entitäten (anlegen)', s.newEntities, '', '']);
  wsOverview.addRow(['Konflikte', s.conflicts, s.conflicts > 0 ? 'Siehe Feld-Zuordnungen' : '', '']);
  wsOverview.addRow(['Custom Fields', mappingResult.customFieldMappings.length,
    `${mappingResult.customFieldMappings.filter(c => c.action === 'create').length} neu, ${mappingResult.customFieldMappings.filter(c => c.action === 'exists').length} vorhanden`, '']);
  wsOverview.addRow([]);

  styleSectionTitle(wsOverview, 'Validierung', 4);
  const vHeader = wsOverview.addRow(['Ergebnis', 'Fehler', 'Warnungen', 'Hinweise']);
  styleHeaderRow(vHeader, 4);
  const vRow = wsOverview.addRow([
    validation.isValid ? '✅ Bestanden' : '❌ Fehler vorhanden',
    validation.summary.errors,
    validation.summary.warnings,
    validation.summary.infos,
  ]);
  if (!validation.isValid) vRow.getCell(1).font = { bold: true, color: { argb: COLORS.errorFont } };
  else vRow.getCell(1).font = { bold: true, color: { argb: 'FF16A34A' } };
  wsOverview.addRow([]);

  if (parsedExcel) {
    styleSectionTitle(wsOverview, 'Excel-Quelldatei', 4);
    const shHeader = wsOverview.addRow(['Sheet', 'Zeilen', 'Spalten', 'Erkannter Entitätstyp']);
    styleHeaderRow(shHeader, 4);
    for (const sheet of parsedExcel.sheets) {
      wsOverview.addRow([sheet.name, sheet.totalRows, sheet.headers.length, '–']);
    }
    wsOverview.addRow([]);
  }

  if (tempusData) {
    styleSectionTitle(wsOverview, 'Tempus-Bestand (zum Zeitpunkt der Analyse)', 4);
    const tHeader = wsOverview.addRow(['Entitätstyp', 'Anzahl', '', '']);
    styleHeaderRow(tHeader, 4);
    wsOverview.addRow(['Projekte', tempusData.projects.length, '', '']);
    wsOverview.addRow(['Ressourcen', tempusData.resources.length, '', '']);
    wsOverview.addRow(['Aufgaben (Tasks)', tempusData.tasks.length, '', '']);
    wsOverview.addRow(['Custom Fields', tempusData.customFields.length, '', '']);
    wsOverview.addRow(['Zuweisungen (Assignments)', tempusData.assignments.length, '', '']);
    wsOverview.addRow(['Rollen', tempusData.roles.length, '', '']);
    wsOverview.addRow(['Skills', tempusData.skills.length, '', '']);
    wsOverview.addRow(['Admin Times', tempusData.adminTimes.length, '', '']);
    wsOverview.addRow(['Financials', tempusData.financials.length, '', '']);
    wsOverview.addRow(['Team Resources', tempusData.teamResources.length, '', '']);
    wsOverview.addRow([]);
  }

  if (validation.blockingIssues.length > 0) {
    styleSectionTitle(wsOverview, 'Blockierende Probleme', 4);
    for (const issue of validation.blockingIssues) {
      const r = wsOverview.addRow([`⛔ ${issue}`, '', '', '']);
      r.font = { bold: true, color: { argb: COLORS.errorFont } };
    }
  }

  wsOverview.columns = [{ width: 32 }, { width: 14 }, { width: 45 }, { width: 20 }];

  // ── Sheet 2: Feld-Zuordnungen ─────────────────────────────────────

  const wsFields = workbook.addWorksheet('Feld-Zuordnungen');
  const fmHeaders = ['#', 'Quell-Sheet', 'Quell-Spalte', 'Ziel-Entität', 'Ziel-Feld', 'Match-Typ', 'Confidence', 'Status', 'Transformation', 'Begründung'];
  const fmH = wsFields.addRow(fmHeaders);
  styleHeaderRow(fmH, fmHeaders.length);

  const sortedFields = [...mappingResult.fieldMappings].sort((a, b) => {
    const statusOrder = { needs_review: 0, suggested: 1, rejected: 2, create_new: 3, confirmed: 4 };
    return (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5);
  });

  sortedFields.forEach((fm, idx) => {
    const row = wsFields.addRow([
      idx + 1,
      fm.sourceSheet,
      fm.sourceColumn,
      fm.targetEntity,
      fm.targetField,
      matchTypeLabel(fm.matchType),
      Math.round(fm.confidence * 100),
      statusLabel(fm.status),
      fm.transformation || '–',
      fm.reasoning,
    ]);
    const fill = statusRowFill(fm.status);
    if (fill) row.fill = fill;
    row.getCell(7).numFmt = '0"%"';
    row.alignment = { wrapText: true, vertical: 'top' };
  });

  wsFields.columns = [
    { width: 5 }, { width: 18 }, { width: 22 }, { width: 18 }, { width: 22 },
    { width: 16 }, { width: 12 }, { width: 18 }, { width: 18 }, { width: 50 },
  ];

  wsFields.autoFilter = { from: { row: 1, column: 1 }, to: { row: sortedFields.length + 1, column: fmHeaders.length } };

  // ── Sheet 3: Entitäts-Zuordnungen ─────────────────────────────────

  const wsEntities = workbook.addWorksheet('Entitäts-Zuordnungen');
  const emHeaders = ['#', 'Quell-Sheet', 'Quell-Spalte', 'Quell-Wert', 'Ziel-Entität', 'Gematchter Name', 'Tempus ID', 'Neu?', 'Match-Typ', 'Confidence', 'Status', 'Begründung'];
  const emH = wsEntities.addRow(emHeaders);
  styleHeaderRow(emH, emHeaders.length);

  const sortedEntities = [...mappingResult.entityMappings].sort((a, b) => {
    const statusOrder = { needs_review: 0, create_new: 1, suggested: 2, rejected: 3, confirmed: 4 };
    return (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5);
  });

  sortedEntities.forEach((em, idx) => {
    const row = wsEntities.addRow([
      idx + 1,
      em.sourceSheet,
      em.sourceColumn,
      em.sourceValue,
      em.targetEntity,
      em.matchedName || '–',
      em.matchedId ?? '–',
      em.isNew ? 'Ja' : 'Nein',
      matchTypeLabel(em.matchType),
      Math.round(em.confidence * 100),
      statusLabel(em.status),
      em.reasoning,
    ]);
    const fill = statusRowFill(em.status);
    if (fill) row.fill = fill;
    row.getCell(10).numFmt = '0"%"';
    row.alignment = { wrapText: true, vertical: 'top' };
  });

  wsEntities.columns = [
    { width: 5 }, { width: 16 }, { width: 18 }, { width: 28 }, { width: 16 }, { width: 28 },
    { width: 10 }, { width: 7 }, { width: 16 }, { width: 12 }, { width: 18 }, { width: 50 },
  ];

  wsEntities.autoFilter = { from: { row: 1, column: 1 }, to: { row: sortedEntities.length + 1, column: emHeaders.length } };

  // ── Sheet 4: Custom Fields ────────────────────────────────────────

  if (mappingResult.customFieldMappings.length > 0) {
    const wsCf = workbook.addWorksheet('Custom Fields');
    const cfHeaders = ['#', 'Quell-Sheet', 'Quell-Spalte', 'Custom Field Name', 'Entitätstyp', 'Datentyp', 'In Tempus vorhanden?', 'Tempus-ID', 'Aktion'];
    const cfH = wsCf.addRow(cfHeaders);
    styleHeaderRow(cfH, cfHeaders.length);

    mappingResult.customFieldMappings.forEach((cf, idx) => {
      const row = wsCf.addRow([
        idx + 1,
        cf.sourceSheet,
        cf.sourceColumn,
        cf.customFieldName,
        cf.entityType,
        cf.dataType,
        cf.existsInTempus ? 'Ja' : 'Nein',
        cf.tempusFieldId ?? '–',
        cf.action === 'create' ? '🆕 Neu anlegen' : '✅ Vorhanden',
      ]);
      if (cf.action === 'create') {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.createNewBg } };
      }
    });

    wsCf.columns = [
      { width: 5 }, { width: 16 }, { width: 22 }, { width: 28 }, { width: 16 },
      { width: 14 }, { width: 18 }, { width: 12 }, { width: 18 },
    ];

    wsCf.autoFilter = { from: { row: 1, column: 1 }, to: { row: mappingResult.customFieldMappings.length + 1, column: cfHeaders.length } };
  }

  // ── Sheet 5: Nicht zugeordnete Spalten ────────────────────────────

  if (mappingResult.unmappedColumns.length > 0) {
    const wsUnmapped = workbook.addWorksheet('Nicht zugeordnet');
    const uHeaders = ['#', 'Spaltenbezeichnung', 'Hinweis'];
    const uH = wsUnmapped.addRow(uHeaders);
    styleHeaderRow(uH, uHeaders.length);

    mappingResult.unmappedColumns.forEach((col, idx) => {
      wsUnmapped.addRow([
        idx + 1,
        col,
        'Keine automatische Zuordnung gefunden – ggf. manuell zuweisen oder ignorieren',
      ]);
    });

    wsUnmapped.columns = [{ width: 5 }, { width: 35 }, { width: 60 }];
  }

  // ── Sheet 6: Validierung ──────────────────────────────────────────

  const wsVal = workbook.addWorksheet('Validierung');
  const valHeaders = ['#', 'Schweregrad', 'Kategorie', 'Nachricht', 'Sheet', 'Spalte', 'Vorschlag'];
  const valH = wsVal.addRow(valHeaders);
  styleHeaderRow(valH, valHeaders.length);

  const severityOrder = { error: 0, warning: 1, info: 2 };
  const sortedIssues = [...validation.issues].sort(
    (a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3)
  );

  sortedIssues.forEach((issue, idx) => {
    const row = wsVal.addRow([
      idx + 1,
      severityLabel(issue.severity),
      issue.category,
      issue.message,
      issue.sheet || '–',
      issue.column || '–',
      issue.suggestion || '–',
    ]);
    row.alignment = { wrapText: true, vertical: 'top' };
    switch (issue.severity) {
      case 'error':
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.errorBg } };
        row.getCell(2).font = { bold: true, color: { argb: COLORS.errorFont } };
        break;
      case 'warning':
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.warningBg } };
        row.getCell(2).font = { bold: true, color: { argb: COLORS.warningFont } };
        break;
      case 'info':
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.infoBg } };
        row.getCell(2).font = { color: { argb: COLORS.infoFont } };
        break;
    }
  });

  wsVal.columns = [
    { width: 5 }, { width: 16 }, { width: 24 }, { width: 55 },
    { width: 18 }, { width: 18 }, { width: 40 },
  ];

  wsVal.autoFilter = { from: { row: 1, column: 1 }, to: { row: sortedIssues.length + 1, column: valHeaders.length } };

  // ── Sheet 7: Status-Legende ───────────────────────────────────────

  const wsLegend = workbook.addWorksheet('Legende');
  const legTitleRow = wsLegend.addRow(['Legende']);
  legTitleRow.font = { bold: true, size: 14, color: { argb: COLORS.headerBg } };
  wsLegend.addRow([]);

  wsLegend.addRow(['Mapping-Status']).font = { bold: true, size: 12 };
  wsLegend.addRow(['✅ Bestätigt', 'Die Zuordnung wurde manuell oder automatisch bestätigt.']);
  wsLegend.addRow(['💡 Vorschlag', 'Automatisch vorgeschlagene Zuordnung, noch nicht geprüft.']);
  wsLegend.addRow(['⚠️ Prüfen', 'Geringe Konfidenz – manuelle Prüfung empfohlen.']);
  wsLegend.addRow(['❌ Abgelehnt', 'Zuordnung wurde abgelehnt und wird ignoriert.']);
  wsLegend.addRow(['🆕 Neu anlegen', 'Wird als neue Entität in Tempus angelegt.']);
  wsLegend.addRow([]);

  wsLegend.addRow(['Match-Typen']).font = { bold: true, size: 12 };
  wsLegend.addRow(['Exakt', 'Exakte Namensübereinstimmung.']);
  wsLegend.addRow(['Fuzzy', 'Ähnlichkeitsbasierter Match (Levenshtein/Token-Ratio).']);
  wsLegend.addRow(['KI-Vorschlag', 'Semantisch durch KI zugeordnet.']);
  wsLegend.addRow(['Manuell bestätigt', 'Vom Benutzer manuell zugewiesen.']);
  wsLegend.addRow(['Neue Entität', 'Kein Match – wird neu angelegt.']);
  wsLegend.addRow([]);

  wsLegend.addRow(['Validierungs-Schweregrade']).font = { bold: true, size: 12 };
  wsLegend.addRow(['🔴 Fehler', 'Blockierendes Problem – muss vor Export/Import behoben werden.']);
  wsLegend.addRow(['🟡 Warnung', 'Potenzielles Problem – empfohlene Prüfung.']);
  wsLegend.addRow(['🔵 Hinweis', 'Informativ – keine Aktion erforderlich.']);
  wsLegend.addRow([]);

  wsLegend.addRow(['Confidence (Konfidenz)']).font = { bold: true, size: 12 };
  wsLegend.addRow(['90–100%', 'Sehr hohe Übereinstimmung.']);
  wsLegend.addRow(['70–89%', 'Gute Übereinstimmung, evtl. Prüfung.']);
  wsLegend.addRow(['50–69%', 'Moderate Übereinstimmung – Prüfung empfohlen.']);
  wsLegend.addRow(['< 50%', 'Geringe Übereinstimmung – manuelle Zuordnung empfohlen.']);

  wsLegend.columns = [{ width: 22 }, { width: 65 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
