import ExcelJS from 'exceljs';
import type {
  ParsedExcel, MappingResult, TempusData, FieldMapping, EntityMapping,
  ValidationResult, ValidationIssue,
} from '../types.js';

// ── Tempus Template Definitions ─────────────────────────────────────

export const TEMPUS_TEMPLATES = {
  attributes: {
    key: 'attributes',
    label: '1. Attributes (Custom Fields)',
    sheetName: 'Attributes',
    headers: ['Entity Type', 'Custom Field Name', 'Type', 'Import Behavior', 'Is Required', 'Is Unique', 'Default Value', 'Selection Values', 'Is Rich Text'],
  },
  resources: {
    key: 'resources',
    label: '2. Resources',
    sheetName: 'Resources',
    headers: ['Resource ID', 'API External Id', 'Resource Name', 'Billing Rate', 'Demand Planning', 'Capacity Aggregation', 'Capacity Unit', 'Import Behavior', 'Is Team Resource', 'Team Start Date', 'Team End Date', 'Is Enabled', 'Login', 'Enable SSO', 'E-Mail', 'Global Role', 'Security Group', 'Is Timesheet User', 'Is Timesheet Approver', 'Timesheet Approver', 'Is Resource Manager', 'Resource Managers', 'Department', 'Hired On'],
  },
  projects: {
    key: 'projects',
    label: '3. Projects',
    sheetName: 'Projects',
    headers: ['Project ID', 'API External Id', 'Project Name', 'Start Date', 'End Date', 'Import Behavior', 'Is Proposal', 'Dataset Preference', 'Security Group', 'Is Template', 'Project Priority', 'Phase', 'Benefit'],
  },
  assignments: {
    key: 'assignments',
    label: '4. Assignments',
    sheetName: 'Assignments',
    headers: ['Project', 'Project API External Id', 'Resource', 'Resource API External Id', 'Task', 'Data Input', 'Plan Type', 'Allocation Type', 'Time Period', 'Import Behavior', 'Id', 'Action', 'Project Allocation', 'Priority', 'Complete'],
  },
  adminTimes: {
    key: 'adminTimes',
    label: '5. Admin Times',
    sheetName: 'Admin Times',
    headers: ['Resource Name', 'Aggregation Unit', 'Admin Time Type'],
  },
  skills: {
    key: 'skills',
    label: '6. Skills',
    sheetName: 'Skills',
    headers: ['Skill Name', 'Type', 'Import Behavior', 'Category Names', 'Description', 'Track Expiration'],
  },
  sheetData: {
    key: 'sheetData',
    label: '7. Sheet Data',
    sheetName: 'Sheet Data',
    headers: ['Entity Type', 'Project Name', 'Template Name'],
  },
  advancedRates: {
    key: 'advancedRates',
    label: '8. Advanced Rates',
    sheetName: 'Resource Rates',
    headers: ['Resource Name', 'Rate', 'Start Date', 'End Date'],
  },
  financials: {
    key: 'financials',
    label: '9. Financials',
    sheetName: 'Financials',
    headers: ['Project', 'Category', 'Type', 'Time Period', 'Import Behavior', 'Project Cost', 'Row Id', 'Priority'],
  },
  teamResources: {
    key: 'teamResources',
    label: '10. Team Resources',
    sheetName: 'Team Resource Members',
    headers: ['Resource Name', 'Aggregation Unit', 'Team Member'],
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
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Tempus Excel Mapper';
  workbook.created = new Date();

  const selectedTemplates = templates && templates.length > 0
    ? templates
    : Object.keys(TEMPUS_TEMPLATES);

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

  for (const templateKey of selectedTemplates) {
    const template = TEMPUS_TEMPLATES[templateKey as keyof typeof TEMPUS_TEMPLATES];
    if (!template) continue;

    const entityMappings = byEntity.get(templateKey) || [];
    if (entityMappings.length === 0 && templateKey !== 'attributes') continue;

    const ws = workbook.addWorksheet(template.sheetName);

    const headers = [...template.headers];
    const customFieldCols: string[] = [];
    if (templateKey === 'projects' || templateKey === 'resources') {
      for (const fm of entityMappings) {
        if (fm.targetField.startsWith('cf:')) {
          const cfName = fm.targetField.slice(3);
          if (!headers.includes(cfName)) {
            headers.push(cfName);
            customFieldCols.push(cfName);
          }
        }
      }
    }

    const headerRow = ws.addRow(headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

    if (templateKey === 'attributes') {
      const cfMappings = mappingResult.customFieldMappings.filter(cf => cf.action === 'create');
      for (const cf of cfMappings) {
        ws.addRow([
          cf.entityType,
          cf.customFieldName,
          mapToTempusDataType(cf.dataType),
          'Merge',
          'false',
          'false',
          '',
          '',
          '',
        ]);
      }
      const existingCFs = mappingResult.customFieldMappings.filter(cf => cf.action === 'exists');
      for (const cf of existingCFs) {
        ws.addRow([
          cf.entityType,
          cf.customFieldName,
          mapToTempusDataType(cf.dataType),
          'Merge',
          'false',
          'false',
          '',
          '',
          '',
        ]);
      }
    } else {
      const sourceSheets = [...new Set(entityMappings.map(m => m.sourceSheet))];
      for (const sheetName of sourceSheets) {
        const sheet = parsed.sheets.find(s => s.name === sheetName);
        if (!sheet) continue;

        const sheetMappings = entityMappings.filter(m => m.sourceSheet === sheetName);

        for (const row of sheet.rows) {
          const exportRow: unknown[] = [];
          for (const header of headers) {
            const mapping = sheetMappings.find(m => {
              if (m.targetField.startsWith('cf:')) {
                return m.targetField.slice(3) === header;
              }
              return tempusFieldToHeader(m.targetField, templateKey) === header;
            });

            if (!mapping) {
              // Required Tempus defaults — marked with [DEFAULT] comment in report
              if (header === 'Import Behavior') { exportRow.push('Merge'); continue; }
              // All other unmapped columns: preserve as empty
              exportRow.push('');
              continue;
            }

            let value = row[mapping.sourceColumn];

            if (value && typeof value === 'string') {
              const entityMatch = confirmedEntityMappings.find(
                em => em.sourceValue.toLowerCase() === String(value).toLowerCase() && em.matchedName
              );
              if (entityMatch && entityMatch.matchedName) {
                value = entityMatch.matchedName;
              }
            }

            if (['Start Date', 'End Date', 'Team Start Date', 'Team End Date', 'Hired On'].includes(header) && value) {
              value = formatDate(value);
            }

            exportRow.push(value ?? '');
          }
          ws.addRow(exportRow);
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

  // Summary
  ws.addRow(['Zusammenfassung']);
  const summaryHeader = ws.addRow(['Metrik', 'Wert']);
  summaryHeader.font = { bold: true };
  ws.addRow(['Zugeordnete Felder', mappingResult.summary.mappedFields]);
  ws.addRow(['Nicht zugeordnete Felder', mappingResult.unmappedColumns.length]);
  ws.addRow(['Erkannte Entitäten', mappingResult.summary.totalEntities]);
  ws.addRow(['Gematchte Entitäten', mappingResult.summary.matchedEntities]);
  ws.addRow(['Neue Entitäten', mappingResult.summary.newEntities]);
  ws.addRow([]);

  // Field mappings
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

  // New entities
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

export async function generateReport(
  mappingResult: MappingResult,
  validation: ValidationResult,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  const ws = workbook.addWorksheet('Validierungsreport');
  ws.addRow(['Tempus Import – Validierungsreport']);
  ws.addRow([`Erstellt: ${new Date().toISOString()}`]);
  ws.addRow([]);

  const header = ws.addRow(['Schweregrad', 'Kategorie', 'Nachricht', 'Sheet', 'Spalte', 'Vorschlag']);
  header.font = { bold: true };

  for (const issue of validation.issues) {
    const row = ws.addRow([
      issue.severity, issue.category, issue.message,
      issue.sheet || '', issue.column || '', issue.suggestion || '',
    ]);
    if (issue.severity === 'error') row.font = { color: { argb: 'FFFF0000' } };
    if (issue.severity === 'warning') row.font = { color: { argb: 'FFFF8C00' } };
  }

  ws.columns.forEach(col => { col.width = 30; });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
