import ExcelJS from 'exceljs';
import type {
  ParsedExcel, ParsedSheet, ColumnAnalysis, SheetAnalysis, AnalysisResult,
  TemporalPattern, TemporalPatternType,
} from '../types.js';

export async function parseExcel(buffer: Buffer, fileName: string): Promise<ParsedExcel> {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Shared Formula') || msg.includes('shared formula')) {
      console.warn('[excelParser] Shared-Formula-Fehler – Zellen mit Formeln werden als Werte gelesen');
      const wb2 = new ExcelJS.Workbook();
      await wb2.xlsx.load(buffer as unknown as ExcelJS.Buffer, {
        ignoreNodes: ['dataValidations'],
      } as any);
      return parseWorkbook(wb2, fileName);
    }
    throw err;
  }

  return parseWorkbook(workbook, fileName);
}

function parseWorkbook(workbook: ExcelJS.Workbook, fileName: string): ParsedExcel {
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

// ── Temporal Pattern Detection ───────────────────────────────────────

const TEMPORAL_HEADER_PATTERNS: Array<{ regex: RegExp; pattern: string; interpretation: string }> = [
  { regex: /^CY[-/\s]?Q[1-4]$/i, pattern: 'CY-Q{n}', interpretation: 'Current Year Quarter' },
  { regex: /^NY[-/\s]?Q[1-4]$/i, pattern: 'NY-Q{n}', interpretation: 'Next Year Quarter' },
  { regex: /^FY\d{2,4}[-/\s]?Q[1-4]$/i, pattern: 'FY{yy}-Q{n}', interpretation: 'Fiscal Year Quarter' },
  { regex: /^Q[1-4][-/\s]?\d{2,4}$/i, pattern: 'Q{n}-{yyyy}', interpretation: 'Quarter with Year' },
  { regex: /^\d{4}[-/\s]?Q[1-4]$/i, pattern: '{yyyy}-Q{n}', interpretation: 'Year-Quarter' },
  { regex: /^H[12][-/\s]?\d{2,4}$/i, pattern: 'H{n}-{yyyy}', interpretation: 'Half-Year' },
  { regex: /^CY[-/\s]?\d{4}$/i, pattern: 'CY-{yyyy}', interpretation: 'Current Year' },
  { regex: /^NY[-/\s]?\d{4}$/i, pattern: 'NY-{yyyy}', interpretation: 'Next Year' },
  { regex: /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Mär|Mai|Okt|Dez)[-/\s]?\d{2,4}$/i, pattern: '{Mon}-{yyyy}', interpretation: 'Month-Year' },
  { regex: /^\d{4}[-/\s]?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Mär|Mai|Okt|Dez)$/i, pattern: '{yyyy}-{Mon}', interpretation: 'Year-Month' },
  { regex: /^(January|February|March|April|May|June|July|August|September|October|November|December|Januar|Februar|März|Mai|Juni|Juli|Oktober|Dezember)[-/\s]?\d{2,4}$/i, pattern: '{Month}-{yyyy}', interpretation: 'Month (full)-Year' },
];

const TEMPORAL_VALUE_PATTERNS: Array<{ regex: RegExp; pattern: string }> = [
  { regex: /^CY[-/\s]?Q[1-4]$/i, pattern: 'CY-Q{n}' },
  { regex: /^NY[-/\s]?Q[1-4]$/i, pattern: 'NY-Q{n}' },
  { regex: /^FY\d{2,4}[-/\s]?Q[1-4]$/i, pattern: 'FY{yy}-Q{n}' },
  { regex: /^Q[1-4][-/\s]?\d{2,4}$/i, pattern: 'Q{n}-{yyyy}' },
  { regex: /^\d{4}[-/\s]?Q[1-4]$/i, pattern: '{yyyy}-Q{n}' },
  { regex: /^H[12][-/\s]?\d{2,4}$/i, pattern: 'H{n}-{yyyy}' },
  { regex: /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Mär|Mai|Okt|Dez)[-/\s]?\d{2,4}$/i, pattern: '{Mon}-{yyyy}' },
];

function detectTemporalPatternForHeader(header: string): TemporalPattern | undefined {
  const trimmed = header.trim();
  for (const { regex, pattern, interpretation } of TEMPORAL_HEADER_PATTERNS) {
    if (regex.test(trimmed)) {
      return {
        type: 'pivot_temporal',
        pattern,
        examples: [trimmed],
        interpretation,
        confidence: 0.9,
      };
    }
  }
  return undefined;
}

function detectTemporalPatternInValues(values: unknown[]): TemporalPattern | undefined {
  const stringVals = values
    .filter(v => v != null && v !== '')
    .map(v => String(v).trim())
    .filter(Boolean);
  if (stringVals.length === 0) return undefined;

  const sample = stringVals.slice(0, 50);
  for (const { regex, pattern } of TEMPORAL_VALUE_PATTERNS) {
    const matches = sample.filter(v => regex.test(v));
    if (matches.length >= Math.max(1, sample.length * 0.3)) {
      return {
        type: 'period_value',
        pattern,
        examples: [...new Set(matches)].slice(0, 8),
        confidence: matches.length / sample.length,
      };
    }
  }
  return undefined;
}

function detectPhaseValues(values: unknown[]): Array<{ raw: string; count: number }> | undefined {
  const stringVals = values
    .filter(v => v != null && v !== '')
    .map(v => String(v).trim());
  if (stringVals.length === 0) return undefined;

  const freq: Record<string, number> = {};
  for (const v of stringVals) freq[v] = (freq[v] || 0) + 1;

  const uniqueVals = Object.keys(freq);
  if (uniqueVals.length < 2 || uniqueVals.length > 15) return undefined;

  const allShortUpperOrCamel = uniqueVals.every(v =>
    /^[A-Z]{2,6}$/i.test(v) || /^[A-Z][a-z]+$/.test(v)
  );
  if (!allShortUpperOrCamel) return undefined;

  const phaseIndicators = /^(PLN|EXE|IMP|CLO|INI|PLAN|EXEC|IMPL|CLOSE|INIT|RUN|GO|HOLD|DEV|TEST|UAT|PROD|LIVE|DRAFT|ACTIVE|INACTIVE|OPEN|CLOSED|DONE|TODO|WIP|PENDING|APPROVED|CANCELLED|ARCHIVE|NEW)/i;
  const phaseMatches = uniqueVals.filter(v => phaseIndicators.test(v));
  if (phaseMatches.length >= 1) {
    return uniqueVals.map(raw => ({ raw, count: freq[raw] }))
      .sort((a, b) => b.count - a.count);
  }

  const avgLen = uniqueVals.reduce((s, v) => s + v.length, 0) / uniqueVals.length;
  if (avgLen <= 5 && uniqueVals.length <= 8 && uniqueVals.every(v => /^[A-Z]{2,5}$/i.test(v))) {
    return uniqueVals.map(raw => ({ raw, count: freq[raw] }))
      .sort((a, b) => b.count - a.count);
  }

  return undefined;
}

// ── Structure Analysis ───────────────────────────────────────────────

export function analyzeStructure(parsed: ParsedExcel): AnalysisResult {
  const sheets: SheetAnalysis[] = parsed.sheets.map(sheet => {
    const columns = analyzeColumns(sheet);
    const suggestedEntity = guessEntity(sheet.headers, columns);

    const pivotCols = columns.filter(c => c.isTemporalPivotColumn);
    const temporalLayout: 'standard' | 'pivot_temporal' =
      pivotCols.length >= 2 ? 'pivot_temporal' : 'standard';

    const allPhaseValues = new Map<string, number>();
    for (const col of columns) {
      if (col.temporalPattern?.type === 'phase_value') {
        const vals = sheet.rows.map(r => r[col.name]);
        const phases = detectPhaseValues(vals);
        if (phases) {
          for (const p of phases) {
            allPhaseValues.set(p.raw, (allPhaseValues.get(p.raw) || 0) + p.count);
          }
        }
      }
    }

    const detectedPhaseValues = allPhaseValues.size > 0
      ? [...allPhaseValues.entries()].map(([raw, count]) => ({ raw, count }))
      : undefined;

    const detectedPeriodFormat = pivotCols.length > 0
      ? pivotCols[0].temporalPattern?.pattern
      : columns.find(c => c.temporalPattern?.type === 'period_value')?.temporalPattern?.pattern;

    return {
      sheetName: sheet.name,
      rowCount: sheet.totalRows,
      columns,
      suggestedEntity,
      temporalLayout,
      detectedPhaseValues,
      detectedPeriodFormat,
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

    const headerTemporal = detectTemporalPatternForHeader(header);
    let temporalPattern: TemporalPattern | undefined = headerTemporal;
    let isTemporalPivotColumn = !!headerTemporal;

    if (!temporalPattern) {
      const valueTemporal = detectTemporalPatternInValues(nonNull);
      if (valueTemporal) {
        temporalPattern = valueTemporal;
      }
    }

    if (!temporalPattern && !isTemporalPivotColumn) {
      const phases = detectPhaseValues(nonNull);
      if (phases) {
        temporalPattern = {
          type: 'phase_value',
          pattern: 'phase_codes',
          examples: phases.slice(0, 6).map(p => p.raw),
          confidence: 0.7,
        };
      }
    }

    return {
      name: header,
      index,
      inferredType: types.length > 0 && new Set(types).size > 1 ? 'mixed' : inferredType,
      sampleValues: nonNull.slice(0, 5),
      nullCount: values.length - nonNull.length,
      totalCount: values.length,
      uniqueCount: unique.size,
      temporalPattern,
      isTemporalPivotColumn,
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
