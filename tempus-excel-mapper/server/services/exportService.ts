import ExcelJS from 'exceljs';
import type {
  ParsedExcel, MappingResult, TempusData, FieldMapping, EntityMapping,
  ValidationResult, ValidationIssue,
} from '../types.js';

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
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Tempus Excel Mapper';
  workbook.created = new Date();

  const confirmedFieldMappings = mappingResult.fieldMappings.filter(
    fm => fm.status === 'confirmed' || fm.status === 'suggested'
  );
  const confirmedEntityMappings = mappingResult.entityMappings.filter(
    em => em.status === 'confirmed' || em.status === 'suggested' || em.status === 'create_new'
  );

  // Group field mappings by target entity
  const byEntity = new Map<string, FieldMapping[]>();
  for (const fm of confirmedFieldMappings) {
    if (!byEntity.has(fm.targetEntity)) byEntity.set(fm.targetEntity, []);
    byEntity.get(fm.targetEntity)!.push(fm);
  }

  // Fixed Tempus import order
  const ENTITY_ORDER = [
    'customFields', 'resources', 'projects', 'assignments',
    'adminTimes', 'skills', 'tasks', 'sheetData',
    'advancedRates', 'financials', 'teamResources',
  ];

  const orderedEntities = [
    ...ENTITY_ORDER.filter(e => byEntity.has(e)),
    ...[...byEntity.keys()].filter(e => !ENTITY_ORDER.includes(e)),
  ];

  for (const entity of orderedEntities) {
    const mappings = byEntity.get(entity);
    if (!mappings) continue;
    const ws = workbook.addWorksheet(entityToSheetName(entity));
    const targetColumns = mappings.map(m => m.targetField);

    // Header row
    const headerRow = ws.addRow(targetColumns.map(formatFieldName));
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Data rows – collect from all source sheets
    const sourceSheets = [...new Set(mappings.map(m => m.sourceSheet))];
    for (const sheetName of sourceSheets) {
      const sheet = parsed.sheets.find(s => s.name === sheetName);
      if (!sheet) continue;

      const sheetMappings = mappings.filter(m => m.sourceSheet === sheetName);

      for (const row of sheet.rows) {
        const exportRow: unknown[] = [];
        for (const targetCol of targetColumns) {
          const mapping = sheetMappings.find(m => m.targetField === targetCol);
          if (!mapping) {
            exportRow.push('');
            continue;
          }

          let value = row[mapping.sourceColumn];

          // Apply entity ID resolution
          if (['projectName', 'resourceName', 'taskName', 'name'].includes(targetCol) && value) {
            const entityMatch = confirmedEntityMappings.find(
              em => em.sourceValue.toLowerCase() === String(value).toLowerCase() &&
                em.matchedId != null
            );
            if (entityMatch && targetCol !== 'name') {
              value = entityMatch.matchedId;
            }
          }

          // Apply date transformation
          if (['startDate', 'endDate'].includes(targetCol) && value) {
            value = formatDate(value);
          }

          exportRow.push(value ?? '');
        }
        ws.addRow(exportRow);
      }
    }

    // Auto-width columns
    ws.columns.forEach(col => {
      let maxLen = 10;
      col.eachCell?.({ includeEmpty: false }, cell => {
        const len = String(cell.value ?? '').length;
        if (len > maxLen) maxLen = len;
      });
      col.width = Math.min(maxLen + 4, 40);
    });
  }

  // Add mapping report sheet
  addReportSheet(workbook, mappingResult);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function entityToSheetName(entity: string): string {
  const map: Record<string, string> = {
    customFields: '1. Attributes',
    resources: '2. Resources',
    projects: '3. Projects',
    assignments: '4. Assignments',
    adminTimes: '5. Admin Time',
    skills: '6. Skills',
    tasks: '7. Tasks',
    sheetData: '7. Sheet Data',
    advancedRates: '8. Advanced Rates',
    financials: '9. Financials',
    teamResources: '10. Team Resource',
  };
  return map[entity] || entity;
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
