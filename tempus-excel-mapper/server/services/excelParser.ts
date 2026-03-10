import ExcelJS from 'exceljs';
import type { ParsedExcel, ParsedSheet, ColumnAnalysis, SheetAnalysis, AnalysisResult } from '../types.js';

export async function parseExcel(buffer: Buffer, fileName: string): Promise<ParsedExcel> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  const sheets: ParsedSheet[] = [];

  for (const worksheet of workbook.worksheets) {
    if (!worksheet || worksheet.rowCount < 1) continue;

    const headerRow = detectHeaderRow(worksheet);
    if (headerRow < 1) continue;

    const headers = extractHeaders(worksheet, headerRow);
    if (headers.length === 0) continue;

    const rows = extractRows(worksheet, headerRow, headers);

    sheets.push({
      name: worksheet.name,
      headerRow,
      headers,
      rows,
      totalRows: rows.length,
    });
  }

  return { fileName, sheets };
}

function detectHeaderRow(worksheet: ExcelJS.Worksheet): number {
  const maxScan = Math.min(worksheet.rowCount, 10);

  let bestRow = 1;
  let bestScore = 0;

  for (let r = 1; r <= maxScan; r++) {
    const row = worksheet.getRow(r);
    const values = rowValues(row);
    if (values.length === 0) continue;

    let score = 0;
    const stringCount = values.filter(v => typeof v === 'string' && v.trim().length > 0).length;
    score += stringCount * 2;

    const uniqueRatio = new Set(values.map(v => String(v).toLowerCase().trim())).size / Math.max(values.length, 1);
    score += uniqueRatio * 3;

    const hasNumbers = values.some(v => typeof v === 'number');
    if (!hasNumbers) score += 2;

    if (score > bestScore) {
      bestScore = score;
      bestRow = r;
    }
  }

  return bestRow;
}

function extractHeaders(worksheet: ExcelJS.Worksheet, headerRow: number): string[] {
  const row = worksheet.getRow(headerRow);
  const values = rowValues(row);
  return values
    .map(v => String(v ?? '').trim())
    .filter(Boolean);
}

function extractRows(worksheet: ExcelJS.Worksheet, headerRow: number, headers: string[]): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRow) return;

    const values = rowValues(row);
    const rowObj: Record<string, unknown> = {};
    let hasValue = false;

    headers.forEach((header, i) => {
      let val = values[i];
      if (val !== undefined && val !== null && val !== '') {
        val = normalizeCell(val);
        rowObj[header] = val;
        hasValue = true;
      } else {
        rowObj[header] = null;
      }
    });

    if (hasValue) rows.push(rowObj);
  });

  return rows;
}

function rowValues(row: ExcelJS.Row): unknown[] {
  const vals = row.values;
  if (!vals) return [];
  return Array.from(vals as unknown[]).slice(1); // ExcelJS is 1-indexed
}

function normalizeCell(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    if ('result' in obj) return obj.result;
    if ('text' in obj) return obj.text;
    if ('richText' in obj) {
      const rt = obj.richText as Array<{ text: string }>;
      return rt.map(r => r.text).join('');
    }
  }
  return value;
}

// ── Structure Analysis ───────────────────────────────────────────────

export function analyzeStructure(parsed: ParsedExcel): AnalysisResult {
  const sheets: SheetAnalysis[] = parsed.sheets.map(sheet => {
    const columns = analyzeColumns(sheet);
    const suggestedEntity = guessEntity(sheet.headers, columns);

    return {
      sheetName: sheet.name,
      rowCount: sheet.totalRows,
      columns,
      suggestedEntity,
    };
  });

  return { fileName: parsed.fileName, sheets };
}

function analyzeColumns(sheet: ParsedSheet): ColumnAnalysis[] {
  return sheet.headers.map((header, index) => {
    const values = sheet.rows.map(r => r[header]);
    const nonNull = values.filter(v => v != null && v !== '');
    const types = nonNull.map(inferType);

    const typeCounts: Record<string, number> = {};
    types.forEach(t => { typeCounts[t] = (typeCounts[t] || 0) + 1; });

    const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
    const inferredType = dominantType
      ? (dominantType[0] as ColumnAnalysis['inferredType'])
      : 'empty';

    const unique = new Set(nonNull.map(v => String(v).toLowerCase().trim()));

    return {
      name: header,
      index,
      inferredType: types.length > 0 && new Set(types).size > 1 ? 'mixed' : inferredType,
      sampleValues: nonNull.slice(0, 5),
      nullCount: values.length - nonNull.length,
      totalCount: values.length,
      uniqueCount: unique.size,
    };
  });
}

function inferType(value: unknown): string {
  if (value === null || value === undefined) return 'empty';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (value instanceof Date) return 'date';
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return 'date';
  if (/^\d{1,2}\.\d{1,2}\.\d{4}/.test(str)) return 'date';
  if (/^-?\d+(\.\d+)?$/.test(str) && str.length < 15) return 'number';
  if (/^(true|false|ja|nein|yes|no)$/i.test(str)) return 'boolean';
  return 'string';
}

function guessEntity(headers: string[], columns: ColumnAnalysis[]): string {
  const h = headers.map(h => h.toLowerCase());

  const hasProject = h.some(c => /project|projekt/i.test(c));
  const hasResource = h.some(c => /resource|ressource|mitarbeiter|employee/i.test(c));
  const hasTask = h.some(c => /task|vorgang|aufgabe|schedule\s*task/i.test(c));
  const hasCustomField = h.some(c => /custom\s*field|attribut|entity\s*type/i.test(c));
  const hasSkill = h.some(c => /skill|kompetenz|qualifikation/i.test(c));
  const hasAllocation = h.some(c => /allocation|zuweisung|plan\s*type/i.test(c));
  const hasAdminTime = h.some(c => /admin\s*time|abwesenheit|absence|leave|time\s*off/i.test(c));
  const hasRate = h.some(c => /\brate\b|stundensatz|billing|tarif/i.test(c));
  const hasBudget = h.some(c => /budget|actual|forecast|financial|finanzen|kosten/i.test(c));
  const hasTeam = h.some(c => /\bteam\b|team\s*name/i.test(c));
  const hasMonth = h.some(c => /month|monat|period/i.test(c));

  if (hasCustomField) return 'customFields';
  if (hasAdminTime) return 'adminTimes';
  if (hasSkill && !hasProject) return 'skills';
  if (hasTeam && hasResource) return 'teamResources';
  if (hasRate && hasResource && hasProject) return 'advancedRates';
  if (hasBudget && hasProject) return 'financials';
  if (hasTask && hasResource && hasProject) return 'assignments';
  if (hasAllocation && hasResource) return 'assignments';
  if (hasTask && hasMonth && hasResource) return 'sheetData';
  if (hasProject && h.some(c => /start|end|date|datum/i.test(c))) return 'projects';
  if (hasResource && !hasProject) return 'resources';
  if (hasTask) return 'tasks';
  if (hasSkill) return 'skills';
  return 'unknown';
}

export function normalizeHeader(header: string): string {
  return String(header || '').toLowerCase().trim().replace(/\s+/g, ' ');
}
