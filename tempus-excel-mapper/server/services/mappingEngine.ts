import { v4 as uuid } from 'uuid';
import type {
  ParsedExcel, AnalysisResult, TempusData, MappingResult,
  FieldMapping, EntityMapping, MappingStatus, MatchType, ColumnAnalysis,
  CustomFieldMapping, TempusCustomField,
} from '../types.js';
import { AnthropicClient } from './anthropicClient.js';

// ── Tempus field schema for rule-based matching ──────────────────────

const TEMPUS_FIELD_MAP: Record<string, Array<{ field: string; aliases: string[] }>> = {
  // 1. Attributes (Custom Fields)
  customFields: [
    { field: 'entityType', aliases: ['entity type', 'entitätstyp', 'typ', 'object type', 'objekttyp'] },
    { field: 'name', aliases: ['custom field name', 'attribut', 'attributname', 'field name', 'feldname', 'attribute name'] },
    { field: 'dataType', aliases: ['type', 'datentyp', 'data type', 'field type', 'feldtyp'] },
    { field: 'selectionValues', aliases: ['selection values', 'auswahlwerte', 'werte', 'values', 'enum values', 'optionen', 'options'] },
    { field: 'isRequired', aliases: ['required', 'pflichtfeld', 'mandatory', 'pflicht'] },
    { field: 'isUnique', aliases: ['unique', 'eindeutig'] },
  ],
  // 2. Resources
  resources: [
    { field: 'name', aliases: ['resource name', 'ressource', 'ressourcenname', 'name', 'mitarbeiter', 'employee', 'person'] },
    { field: 'billingRate', aliases: ['billing rate', 'stundensatz', 'rate', 'kosten', 'cost rate', 'hourly rate'] },
    { field: 'capacityUnit', aliases: ['capacity unit', 'kapazitätseinheit', 'capacity', 'kapazität'] },
    { field: 'globalRole', aliases: ['global role', 'rolle', 'role', 'funktion', 'position'] },
    { field: 'externalId', aliases: ['external id', 'ext id', 'externe id', 'resource id'] },
    { field: 'email', aliases: ['email', 'e-mail', 'mail', 'email address'] },
    { field: 'department', aliases: ['department', 'abteilung', 'team', 'bereich'] },
    { field: 'isEnabled', aliases: ['enabled', 'active', 'aktiv', 'is active'] },
  ],
  // 3. Projects
  projects: [
    { field: 'name', aliases: ['project name', 'projektname', 'projekt', 'project'] },
    { field: 'startDate', aliases: ['start date', 'startdatum', 'von', 'start', 'begin', 'project start'] },
    { field: 'endDate', aliases: ['end date', 'enddatum', 'bis', 'ende', 'end', 'project end'] },
    { field: 'externalId', aliases: ['external id', 'api external id', 'externe id', 'ext id', 'project id'] },
    { field: 'priority', aliases: ['project priority', 'priority', 'priorität', 'prio'] },
    { field: 'phase', aliases: ['phase', 'projektphase', 'project phase'] },
    { field: 'benefit', aliases: ['benefit', 'nutzen', 'project benefit'] },
    { field: 'importBehavior', aliases: ['import behavior', 'importverhalten'] },
    { field: 'isLocked', aliases: ['locked', 'gesperrt', 'is locked'] },
    { field: 'status', aliases: ['project status', 'projektstatus'] },
    { field: 'manager', aliases: ['project manager', 'projektleiter', 'pm', 'manager', 'owner'] },
  ],
  // 4. Assignments
  assignments: [
    { field: 'projectName', aliases: ['project', 'projekt', 'project name', 'projektname'] },
    { field: 'resourceName', aliases: ['resource', 'ressource', 'resource name', 'ressourcenname', 'mitarbeiter'] },
    { field: 'taskName', aliases: ['task', 'vorgang', 'task name', 'aufgabe'] },
    { field: 'priority', aliases: ['priority', 'priorität', 'assignment priority'] },
    { field: 'planType', aliases: ['plan type', 'plantyp', 'planungstyp'] },
    { field: 'allocation', aliases: ['planned allocation', 'allocation', 'zuweisung', 'stunden', 'hours', 'auslastung'] },
    { field: 'month', aliases: ['month', 'monat', 'zeitraum', 'period'] },
    { field: 'startDate', aliases: ['start date', 'startdatum', 'von', 'start'] },
    { field: 'endDate', aliases: ['end date', 'enddatum', 'bis', 'ende'] },
  ],
  // 5. Admin Time
  adminTimes: [
    { field: 'name', aliases: ['admin time', 'admin time name', 'verwaltungszeit', 'abwesenheit', 'absence', 'time off', 'leave'] },
    { field: 'resourceName', aliases: ['resource', 'ressource', 'resource name', 'mitarbeiter', 'employee'] },
    { field: 'date', aliases: ['date', 'datum', 'day', 'tag'] },
    { field: 'month', aliases: ['month', 'monat', 'period', 'zeitraum'] },
    { field: 'hours', aliases: ['hours', 'stunden', 'duration', 'dauer', 'time', 'zeit'] },
    { field: 'type', aliases: ['type', 'typ', 'category', 'kategorie', 'admin type', 'absence type', 'abwesenheitstyp'] },
    { field: 'startDate', aliases: ['start date', 'startdatum', 'von', 'start'] },
    { field: 'endDate', aliases: ['end date', 'enddatum', 'bis', 'ende'] },
  ],
  // 6. Skills
  skills: [
    { field: 'name', aliases: ['skill', 'skill name', 'kompetenz', 'fähigkeit', 'qualification', 'qualifikation'] },
    { field: 'category', aliases: ['category', 'kategorie', 'skill category', 'gruppe', 'group'] },
    { field: 'level', aliases: ['level', 'stufe', 'proficiency', 'skill level', 'erfahrung'] },
    { field: 'resourceName', aliases: ['resource', 'ressource', 'resource name', 'mitarbeiter', 'employee'] },
  ],
  // 7. Tasks / Schedule (Sheet Data)
  tasks: [
    { field: 'name', aliases: ['task', 'task name', 'vorgang', 'aufgabe', 'tätigkeit', 'schedule task'] },
    { field: 'projectName', aliases: ['project', 'projekt', 'project name'] },
    { field: 'startDate', aliases: ['start date', 'start', 'startdatum'] },
    { field: 'duration', aliases: ['duration', 'dauer', 'tage', 'days'] },
    { field: 'planType', aliases: ['plan type', 'plantyp', 'allocation type'] },
    { field: 'status', aliases: ['status', 'task status', 'schedule task status'] },
    { field: 'milestone', aliases: ['milestone', 'meilenstein', 'is milestone'] },
  ],
  sheetData: [
    { field: 'projectName', aliases: ['project', 'projekt', 'project name'] },
    { field: 'taskName', aliases: ['task', 'task name', 'vorgang'] },
    { field: 'resourceName', aliases: ['resource', 'ressource', 'resource name'] },
    { field: 'month', aliases: ['month', 'monat', 'period', 'zeitraum'] },
    { field: 'value', aliases: ['value', 'wert', 'hours', 'stunden', 'amount', 'betrag'] },
    { field: 'planType', aliases: ['plan type', 'plantyp', 'type', 'typ'] },
  ],
  // 8. Advanced Rates
  advancedRates: [
    { field: 'resourceName', aliases: ['resource', 'ressource', 'resource name', 'mitarbeiter'] },
    { field: 'projectName', aliases: ['project', 'projekt', 'project name'] },
    { field: 'rate', aliases: ['rate', 'stundensatz', 'billing rate', 'cost rate', 'tarif'] },
    { field: 'currency', aliases: ['currency', 'währung', 'curr'] },
    { field: 'effectiveDate', aliases: ['effective date', 'gültig ab', 'start date', 'ab datum', 'valid from'] },
    { field: 'roleName', aliases: ['role', 'rolle', 'role name'] },
  ],
  // 9. Financials
  financials: [
    { field: 'projectName', aliases: ['project', 'projekt', 'project name'] },
    { field: 'month', aliases: ['month', 'monat', 'period', 'zeitraum'] },
    { field: 'budget', aliases: ['budget', 'plan', 'planned cost', 'plankosten'] },
    { field: 'actual', aliases: ['actual', 'ist', 'actual cost', 'istkosten', 'actuals'] },
    { field: 'forecast', aliases: ['forecast', 'prognose', 'estimated', 'schätzung'] },
    { field: 'revenue', aliases: ['revenue', 'umsatz', 'erlös', 'income', 'einnahmen'] },
    { field: 'type', aliases: ['type', 'typ', 'financial type', 'kostenart', 'cost type'] },
    { field: 'category', aliases: ['category', 'kategorie'] },
  ],
  // 10. Team Resource
  teamResources: [
    { field: 'teamName', aliases: ['team', 'team name', 'teamname', 'group', 'gruppe'] },
    { field: 'resourceName', aliases: ['resource', 'ressource', 'resource name', 'mitarbeiter', 'member', 'employee'] },
    { field: 'role', aliases: ['role', 'rolle', 'team role', 'teamrolle', 'function', 'funktion'] },
    { field: 'allocationPercentage', aliases: ['allocation', 'allocation %', 'prozent', 'percentage', 'anteil', 'auslastung'] },
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
  const customFieldMappings: CustomFieldMapping[] = [];
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

    // Step 2b: Custom-Field matching for unmapped columns
    const cfEntityType = inferCustomFieldEntityType(sheet.sheetName, targetEntity);
    const stillUnmapped = unmappedColumns
      .filter(u => u.startsWith(`${sheet.sheetName}.`))
      .map(u => u.slice(sheet.sheetName.length + 1));

    for (const colName of stillUnmapped) {
      const col = sheet.columns.find(c => c.name === colName);
      if (!col) continue;

      const cfMatch = matchCustomField(colName, cfEntityType, tempusData.customFields);
      if (cfMatch) {
        col.isCustomField = true;
        col.customFieldEntityType = cfEntityType;
        col.customFieldName = cfMatch.tempusField.name;

        fieldMappings.push({
          id: uuid(),
          sourceSheet: sheet.sheetName,
          sourceColumn: colName,
          targetEntity: entityTypeToTargetEntity(cfEntityType),
          targetField: `cf:${cfMatch.tempusField.name}`,
          matchType: cfMatch.matchType,
          confidence: cfMatch.confidence,
          reasoning: cfMatch.reasoning,
          status: cfMatch.confidence >= 0.9 ? 'suggested' : 'needs_review',
        });

        customFieldMappings.push({
          sourceColumn: colName,
          sourceSheet: sheet.sheetName,
          customFieldName: cfMatch.tempusField.name,
          entityType: cfEntityType,
          existsInTempus: true,
          tempusFieldId: cfMatch.tempusField.id,
          dataType: cfMatch.tempusField.dataType,
          action: 'exists',
        });

        const key = `${sheet.sheetName}.${colName}`;
        const idx = unmappedColumns.indexOf(key);
        if (idx >= 0) unmappedColumns.splice(idx, 1);
      } else {
        const inferredType = inferCustomFieldDataType(col);
        col.isCustomField = true;
        col.customFieldEntityType = cfEntityType;
        col.customFieldName = colName;

        fieldMappings.push({
          id: uuid(),
          sourceSheet: sheet.sheetName,
          sourceColumn: colName,
          targetEntity: entityTypeToTargetEntity(cfEntityType),
          targetField: `cf:${colName}`,
          matchType: 'new_entity',
          confidence: 0.6,
          reasoning: `Kein bestehendes Custom Field gefunden – wird als neues Attribut "${colName}" (${inferredType}) angelegt`,
          status: 'needs_review',
        });

        customFieldMappings.push({
          sourceColumn: colName,
          sourceSheet: sheet.sheetName,
          customFieldName: colName,
          entityType: cfEntityType,
          existsInTempus: false,
          dataType: inferredType,
          action: 'create',
        });

        const key = `${sheet.sheetName}.${colName}`;
        const idx = unmappedColumns.indexOf(key);
        if (idx >= 0) unmappedColumns.splice(idx, 1);
      }
    }
  }

  // Step 3: AI-enhanced mapping for ALL remaining unmapped columns
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
        skills: tempusData.skills.map(s => ({ id: s.id, name: s.name })),
        adminTimes: tempusData.adminTimes.map(a => ({ id: a.id, name: a.name })),
      });

      // Merge AI field mapping suggestions
      for (const aiMapping of aiResult.fieldMappings) {
        const existing = fieldMappings.find(
          fm => fm.sourceSheet === aiMapping.sourceSheet && fm.sourceColumn === aiMapping.sourceColumn
        );
        if (!existing) {
          const isCustomFieldSuggestion = aiMapping.isCustomField || aiMapping.targetField?.startsWith('cf:');

          fieldMappings.push({
            id: uuid(),
            sourceSheet: aiMapping.sourceSheet,
            sourceColumn: aiMapping.sourceColumn,
            targetEntity: aiMapping.targetEntity,
            targetField: isCustomFieldSuggestion
              ? `cf:${aiMapping.suggestedCustomFieldName || aiMapping.sourceColumn}`
              : aiMapping.targetField,
            matchType: 'ai_suggested',
            confidence: aiMapping.confidence,
            reasoning: aiMapping.reasoning,
            status: aiMapping.confidence >= 0.8 ? 'suggested' : 'needs_review',
            transformation: aiMapping.transformation,
          });

          if (isCustomFieldSuggestion) {
            const cfName = aiMapping.suggestedCustomFieldName || aiMapping.sourceColumn;
            const existingCF = tempusData.customFields.find(
              cf => cf.name.toLowerCase() === cfName.toLowerCase()
            );
            customFieldMappings.push({
              sourceColumn: aiMapping.sourceColumn,
              sourceSheet: aiMapping.sourceSheet,
              customFieldName: cfName,
              entityType: inferCustomFieldEntityType(aiMapping.sourceSheet, aiMapping.targetEntity),
              existsInTempus: !!existingCF,
              tempusFieldId: existingCF?.id,
              dataType: aiMapping.suggestedDataType || existingCF?.dataType || 'Text',
              action: existingCF ? 'exists' : 'create',
            });
          }

          const idx = unmappedColumns.indexOf(`${aiMapping.sourceSheet}.${aiMapping.sourceColumn}`);
          if (idx >= 0) unmappedColumns.splice(idx, 1);
        }
      }

      // Merge AI entity suggestions (matches + new entity proposals)
      for (const aiEntity of aiResult.entityMappings) {
        const existing = entityMappings.find(
          em => em.sourceValue === aiEntity.sourceValue && em.targetEntity === aiEntity.targetEntity
        );
        if (!existing && aiEntity.sourceSheet) {
          const action = aiEntity.suggestedAction || (aiEntity.isNew ? 'create_new' : 'needs_review');
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
            status: action === 'create_new' ? 'create_new'
              : action === 'match_existing' ? 'suggested'
              : 'needs_review',
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
    customFieldMappings,
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

  const candidates = getCandidatesForEntity(entityType, tempusData);
  if (candidates.length === 0) return null;

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

function getCandidatesForEntity(
  entityType: string,
  tempusData: TempusData,
): Array<{ id: number; name: string }> {
  switch (entityType) {
    case 'projects':
      return tempusData.projects;
    case 'resources':
      return tempusData.resources;
    case 'tasks':
      return tempusData.tasks.map(t => ({ id: t.id, name: t.name }));
    case 'assignments':
      return [
        ...tempusData.projects,
        ...tempusData.resources,
        ...tempusData.tasks.map(t => ({ id: t.id, name: t.name })),
      ];
    case 'customFields':
      return tempusData.customFields.map(cf => ({ id: cf.id, name: cf.name }));
    case 'skills':
      return tempusData.skills.map(s => ({ id: s.id, name: s.name }));
    case 'adminTimes':
      return tempusData.adminTimes.map(a => ({ id: a.id, name: a.name }));
    case 'advancedRates':
      return [
        ...tempusData.resources,
        ...tempusData.projects,
      ];
    case 'financials':
      return tempusData.projects;
    case 'sheetData':
      return [
        ...tempusData.projects,
        ...tempusData.resources,
        ...tempusData.tasks.map(t => ({ id: t.id, name: t.name })),
      ];
    case 'teamResources':
      return tempusData.resources;
    default:
      return [
        ...tempusData.projects,
        ...tempusData.resources,
      ];
  }
}

// ── Helpers ──────────────────────────────────────────────────────────

const NAME_FIELDS = new Set([
  'name', 'projectName', 'resourceName', 'taskName', 'teamName', 'roleName',
]);

function findNameColumns(
  sheet: { sheetName: string; columns: ColumnAnalysis[] },
  fieldMappings: FieldMapping[],
): Array<{ column: string; targetEntity: string; targetField: string }> {
  return fieldMappings
    .filter(fm =>
      fm.sourceSheet === sheet.sheetName &&
      NAME_FIELDS.has(fm.targetField)
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

// ── Custom-Field matching helpers ────────────────────────────────────

function inferCustomFieldEntityType(sheetName: string, suggestedEntity: string): string {
  const lower = sheetName.toLowerCase();
  if (/project|portfolio/.test(lower)) return 'Project';
  if (/resource|ressource|mitarbeiter|employee/.test(lower)) return 'Resource';
  if (/task|vorgang|schedule/.test(lower)) return 'Task';

  switch (suggestedEntity) {
    case 'projects':
    case 'financials':
    case 'advancedRates':
      return 'Project';
    case 'resources':
    case 'teamResources':
    case 'skills':
    case 'adminTimes':
      return 'Resource';
    case 'tasks':
    case 'sheetData':
      return 'Task';
    case 'assignments': return 'Project';
    default: return 'Project';
  }
}

function entityTypeToTargetEntity(cfEntityType: string): string {
  switch (cfEntityType) {
    case 'Project': return 'projects';
    case 'Resource': return 'resources';
    case 'Task': return 'tasks';
    default: return 'projects';
  }
}

function matchCustomField(
  columnName: string,
  entityType: string,
  customFields: TempusCustomField[],
): { tempusField: TempusCustomField; matchType: MatchType; confidence: number; reasoning: string } | null {
  const normalized = columnName.toLowerCase().trim().replace(/\s+/g, ' ');
  const relevantFields = customFields.filter(cf => cf.entityType === entityType);

  for (const cf of relevantFields) {
    if (cf.name.toLowerCase().trim() === normalized) {
      return {
        tempusField: cf,
        matchType: 'exact',
        confidence: 0.95,
        reasoning: `Exakter Custom-Field-Match: "${columnName}" → ${cf.name} (ID: ${cf.id})`,
      };
    }
  }

  let bestMatch: { cf: TempusCustomField; score: number } | null = null;
  for (const cf of relevantFields) {
    const score = stringSimilarity(normalized, cf.name.toLowerCase().trim());
    if (score > 0.7 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { cf, score };
    }
  }

  if (bestMatch) {
    return {
      tempusField: bestMatch.cf,
      matchType: 'fuzzy',
      confidence: bestMatch.score * 0.9,
      reasoning: `Fuzzy Custom-Field-Match (${Math.round(bestMatch.score * 100)}%): "${columnName}" ≈ ${bestMatch.cf.name} (ID: ${bestMatch.cf.id})`,
    };
  }

  // Try across all entity types as fallback with lower confidence
  const otherFields = customFields.filter(cf => cf.entityType !== entityType);
  for (const cf of otherFields) {
    if (cf.name.toLowerCase().trim() === normalized) {
      return {
        tempusField: cf,
        matchType: 'fuzzy',
        confidence: 0.7,
        reasoning: `Custom-Field-Match (anderer Entity-Typ ${cf.entityType}): "${columnName}" → ${cf.name} (ID: ${cf.id})`,
      };
    }
  }

  return null;
}

function inferCustomFieldDataType(col: ColumnAnalysis): string {
  switch (col.inferredType) {
    case 'number': return 'Number';
    case 'date': return 'Date';
    case 'boolean': return 'Boolean';
    case 'string': {
      if (col.uniqueCount > 0 && col.uniqueCount <= 20 && col.totalCount > col.uniqueCount * 2) {
        return 'Selection';
      }
      return 'Text';
    }
    default: return 'Text';
  }
}
