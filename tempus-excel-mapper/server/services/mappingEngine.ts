import { v4 as uuid } from 'uuid';
import type {
  ParsedExcel, AnalysisResult, TempusData, MappingResult,
  FieldMapping, EntityMapping, MappingStatus, MatchType, ColumnAnalysis,
} from '../types.js';
import { AnthropicClient } from './anthropicClient.js';

// ── Tempus field schema for rule-based matching ──────────────────────

const TEMPUS_FIELD_MAP: Record<string, Array<{ field: string; aliases: string[] }>> = {
  projects: [
    { field: 'name', aliases: ['project name', 'projektname', 'projekt', 'project'] },
    { field: 'startDate', aliases: ['start date', 'startdatum', 'von', 'start', 'begin'] },
    { field: 'endDate', aliases: ['end date', 'enddatum', 'bis', 'ende', 'end'] },
    { field: 'externalId', aliases: ['external id', 'api external id', 'externe id', 'ext id'] },
    { field: 'priority', aliases: ['project priority', 'priority', 'priorität', 'prio'] },
    { field: 'phase', aliases: ['phase', 'projektphase'] },
    { field: 'benefit', aliases: ['benefit', 'nutzen'] },
    { field: 'importBehavior', aliases: ['import behavior', 'importverhalten'] },
  ],
  resources: [
    { field: 'name', aliases: ['resource name', 'ressource', 'ressourcenname', 'name', 'mitarbeiter'] },
    { field: 'billingRate', aliases: ['billing rate', 'stundensatz', 'rate', 'kosten'] },
    { field: 'capacityUnit', aliases: ['capacity unit', 'kapazitätseinheit', 'capacity'] },
    { field: 'globalRole', aliases: ['global role', 'rolle', 'role'] },
    { field: 'externalId', aliases: ['external id', 'ext id', 'externe id'] },
    { field: 'email', aliases: ['email', 'e-mail', 'mail'] },
  ],
  tasks: [
    { field: 'name', aliases: ['task', 'task name', 'vorgang', 'aufgabe', 'tätigkeit'] },
    { field: 'projectName', aliases: ['project', 'projekt', 'project name'] },
    { field: 'startDate', aliases: ['start date', 'start', 'startdatum'] },
    { field: 'duration', aliases: ['duration', 'dauer', 'tage'] },
    { field: 'planType', aliases: ['plan type', 'plantyp', 'allocation'] },
    { field: 'status', aliases: ['status', 'task status', 'schedule task status'] },
  ],
  assignments: [
    { field: 'projectName', aliases: ['project', 'projekt', 'project name'] },
    { field: 'resourceName', aliases: ['resource', 'ressource', 'resource name'] },
    { field: 'taskName', aliases: ['task', 'vorgang', 'task name'] },
    { field: 'priority', aliases: ['priority', 'priorität'] },
    { field: 'planType', aliases: ['plan type', 'plantyp'] },
    { field: 'allocation', aliases: ['planned allocation', 'allocation', 'zuweisung', 'stunden', 'hours'] },
    { field: 'month', aliases: ['month', 'monat', 'zeitraum'] },
  ],
  customFields: [
    { field: 'entityType', aliases: ['entity type', 'entitätstyp', 'typ'] },
    { field: 'name', aliases: ['custom field name', 'attribut', 'attributname', 'name'] },
    { field: 'dataType', aliases: ['type', 'datentyp', 'data type'] },
    { field: 'selectionValues', aliases: ['selection values', 'auswahlwerte', 'werte', 'values'] },
  ],
};

// ── Core Mapping Engine ──────────────────────────────────────────────

export async function generateMappings(
  parsed: ParsedExcel,
  analysis: AnalysisResult,
  tempusData: TempusData,
  anthropicClient?: AnthropicClient,
): Promise<MappingResult> {
  const fieldMappings: FieldMapping[] = [];
  const entityMappings: EntityMapping[] = [];
  const unmappedColumns: string[] = [];

  for (const sheet of analysis.sheets) {
    const parsedSheet = parsed.sheets.find(s => s.name === sheet.sheetName);
    if (!parsedSheet) continue;

    const targetEntity = sheet.suggestedEntity || 'unknown';

    // Step 1: Rule-based field matching
    for (const col of sheet.columns) {
      const ruleMatch = matchFieldByRules(col.name, targetEntity);
      if (ruleMatch) {
        fieldMappings.push({
          id: uuid(),
          sourceSheet: sheet.sheetName,
          sourceColumn: col.name,
          targetEntity: ruleMatch.entity,
          targetField: ruleMatch.field,
          matchType: ruleMatch.matchType,
          confidence: ruleMatch.confidence,
          reasoning: ruleMatch.reasoning,
          status: ruleMatch.confidence >= 0.9 ? 'suggested' : 'needs_review',
        });
      } else {
        unmappedColumns.push(`${sheet.sheetName}.${col.name}`);
      }
    }

    // Step 2: Entity value matching (names → IDs)
    const nameColumns = findNameColumns(sheet, fieldMappings);
    for (const { column, targetEntity: entity, targetField } of nameColumns) {
      const uniqueValues = getUniqueValues(parsedSheet.rows, column);
      for (const value of uniqueValues) {
        const match = matchEntityValue(String(value), entity, tempusData);
        entityMappings.push({
          id: uuid(),
          sourceSheet: sheet.sheetName,
          sourceColumn: column,
          sourceValue: String(value),
          targetEntity: entity,
          matchedName: match?.name,
          matchedId: match?.id,
          matchType: match?.matchType ?? 'new_entity',
          confidence: match?.confidence ?? 0,
          reasoning: match?.reasoning ?? `Kein Match in Tempus gefunden für "${value}"`,
          status: match ? (match.confidence >= 0.9 ? 'suggested' : 'needs_review') : 'create_new',
          isNew: !match,
        });
      }
    }
  }

  // Step 3: AI-enhanced mapping (if Anthropic client available)
  if (anthropicClient && unmappedColumns.length > 0) {
    try {
      const sheetsForAI = analysis.sheets.map(s => {
        const parsedSheet = parsed.sheets.find(ps => ps.name === s.sheetName);
        return {
          sheetName: s.sheetName,
          columns: s.columns,
          sampleRows: (parsedSheet?.rows || []).slice(0, 5),
        };
      });

      const aiResult = await anthropicClient.generateMappingSuggestions(sheetsForAI, {
        projects: tempusData.projects.map(p => ({ id: p.id, name: p.name })),
        resources: tempusData.resources.map(r => ({ id: r.id, name: r.name })),
        tasks: tempusData.tasks.map(t => ({ id: t.id, name: t.name, projectId: t.projectId })),
        customFields: tempusData.customFields.map(cf => ({
          id: cf.id, name: cf.name, entityType: cf.entityType,
          dataType: cf.dataType, enumMembers: cf.enumMembers?.map(e => ({ name: e.name })),
        })),
        roles: tempusData.roles.map(r => ({ id: r.id, name: r.name })),
      });

      // Merge AI suggestions for unmapped columns
      for (const aiMapping of aiResult.fieldMappings) {
        const existing = fieldMappings.find(
          fm => fm.sourceSheet === aiMapping.sourceSheet && fm.sourceColumn === aiMapping.sourceColumn
        );
        if (!existing) {
          fieldMappings.push({
            id: uuid(),
            sourceSheet: aiMapping.sourceSheet,
            sourceColumn: aiMapping.sourceColumn,
            targetEntity: aiMapping.targetEntity,
            targetField: aiMapping.targetField,
            matchType: 'ai_suggested',
            confidence: aiMapping.confidence,
            reasoning: aiMapping.reasoning,
            status: aiMapping.confidence >= 0.8 ? 'suggested' : 'needs_review',
            transformation: aiMapping.transformation,
          });
          const idx = unmappedColumns.indexOf(`${aiMapping.sourceSheet}.${aiMapping.sourceColumn}`);
          if (idx >= 0) unmappedColumns.splice(idx, 1);
        }
      }

      // Merge AI entity suggestions
      for (const aiEntity of aiResult.entityMappings) {
        const existing = entityMappings.find(
          em => em.sourceValue === aiEntity.sourceValue && em.targetEntity === aiEntity.targetEntity
        );
        if (!existing && aiEntity.sourceSheet) {
          entityMappings.push({
            id: uuid(),
            sourceSheet: aiEntity.sourceSheet,
            sourceColumn: aiEntity.sourceColumn || '',
            sourceValue: aiEntity.sourceValue,
            targetEntity: aiEntity.targetEntity,
            matchedName: aiEntity.suggestedMatch,
            matchType: 'ai_suggested',
            confidence: aiEntity.confidence,
            reasoning: aiEntity.reasoning,
            status: aiEntity.isNew ? 'create_new' : 'needs_review',
            isNew: aiEntity.isNew,
          });
        }
      }
    } catch (err) {
      console.error('AI mapping failed, continuing with rule-based results:', err);
    }
  }

  const matchedEntities = entityMappings.filter(e => !e.isNew).length;
  const newEntities = entityMappings.filter(e => e.isNew).length;
  const conflicts = entityMappings.filter(e => e.status === 'needs_review').length +
    fieldMappings.filter(f => f.status === 'needs_review').length;

  return {
    fieldMappings,
    entityMappings,
    unmappedColumns,
    summary: {
      totalFields: fieldMappings.length + unmappedColumns.length,
      mappedFields: fieldMappings.length,
      totalEntities: entityMappings.length,
      matchedEntities,
      newEntities,
      conflicts,
    },
  };
}

// ── Rule-based field matching ────────────────────────────────────────

function matchFieldByRules(
  columnName: string,
  suggestedEntity: string,
): { entity: string; field: string; matchType: MatchType; confidence: number; reasoning: string } | null {
  const normalized = columnName.toLowerCase().trim().replace(/\s+/g, ' ');

  // Try suggested entity first, then all entities
  const entityOrder = [suggestedEntity, ...Object.keys(TEMPUS_FIELD_MAP).filter(e => e !== suggestedEntity)];

  for (const entity of entityOrder) {
    const fields = TEMPUS_FIELD_MAP[entity];
    if (!fields) continue;

    for (const { field, aliases } of fields) {
      // Exact match
      if (aliases.includes(normalized)) {
        const isSameEntity = entity === suggestedEntity;
        return {
          entity,
          field,
          matchType: 'exact',
          confidence: isSameEntity ? 0.95 : 0.8,
          reasoning: `Exakter Match: "${columnName}" → ${entity}.${field}`,
        };
      }

      // Fuzzy match (contains or partial)
      const fuzzyScore = fuzzyMatch(normalized, aliases);
      if (fuzzyScore > 0.7) {
        return {
          entity,
          field,
          matchType: 'fuzzy',
          confidence: fuzzyScore * (entity === suggestedEntity ? 0.85 : 0.7),
          reasoning: `Fuzzy-Match (${Math.round(fuzzyScore * 100)}%): "${columnName}" ≈ ${entity}.${field}`,
        };
      }
    }
  }

  return null;
}

function fuzzyMatch(input: string, targets: string[]): number {
  let best = 0;
  for (const target of targets) {
    // Simple containment check
    if (input.includes(target) || target.includes(input)) {
      const ratio = Math.min(input.length, target.length) / Math.max(input.length, target.length);
      best = Math.max(best, ratio * 0.9);
    }

    // Levenshtein-based similarity
    const sim = stringSimilarity(input, target);
    best = Math.max(best, sim);
  }
  return best;
}

function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  const distance = levenshtein(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[b.length][a.length];
}

// ── Entity value matching ────────────────────────────────────────────

function matchEntityValue(
  value: string,
  entityType: string,
  tempusData: TempusData,
): { name: string; id: number; matchType: MatchType; confidence: number; reasoning: string } | null {
  const normalized = value.toLowerCase().trim();
  if (!normalized) return null;

  let candidates: Array<{ id: number; name: string }> = [];
  if (entityType === 'projects' || entityType === 'assignments') {
    candidates = tempusData.projects;
  } else if (entityType === 'resources' || entityType === 'assignments') {
    candidates = [...candidates, ...tempusData.resources];
  } else if (entityType === 'tasks') {
    candidates = tempusData.tasks.map(t => ({ id: t.id, name: t.name }));
  }

  // Exact match
  const exact = candidates.find(c => c.name.toLowerCase().trim() === normalized);
  if (exact) {
    return {
      name: exact.name,
      id: exact.id,
      matchType: 'exact',
      confidence: 1.0,
      reasoning: `Exakter Match: "${value}" = "${exact.name}" (ID: ${exact.id})`,
    };
  }

  // Fuzzy match
  let bestMatch: { name: string; id: number; score: number } | null = null;
  for (const candidate of candidates) {
    const score = stringSimilarity(normalized, candidate.name.toLowerCase().trim());
    if (score > 0.75 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { ...candidate, score };
    }
  }

  if (bestMatch) {
    return {
      name: bestMatch.name,
      id: bestMatch.id,
      matchType: 'fuzzy',
      confidence: bestMatch.score,
      reasoning: `Fuzzy-Match (${Math.round(bestMatch.score * 100)}%): "${value}" ≈ "${bestMatch.name}"`,
    };
  }

  return null;
}

// ── Helpers ──────────────────────────────────────────────────────────

function findNameColumns(
  sheet: { sheetName: string; columns: ColumnAnalysis[] },
  fieldMappings: FieldMapping[],
): Array<{ column: string; targetEntity: string; targetField: string }> {
  return fieldMappings
    .filter(fm =>
      fm.sourceSheet === sheet.sheetName &&
      ['name', 'projectName', 'resourceName', 'taskName'].includes(fm.targetField)
    )
    .map(fm => ({
      column: fm.sourceColumn,
      targetEntity: fm.targetEntity,
      targetField: fm.targetField,
    }));
}

function getUniqueValues(rows: Record<string, unknown>[], column: string): unknown[] {
  const seen = new Set<string>();
  const unique: unknown[] = [];
  for (const row of rows) {
    const val = row[column];
    if (val == null || val === '') continue;
    const key = String(val).toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(val);
    }
  }
  return unique;
}
