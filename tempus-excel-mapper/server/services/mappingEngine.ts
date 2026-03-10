import { v4 as uuid } from 'uuid';
import type {
  ParsedExcel, AnalysisResult, TempusData, MappingResult,
  FieldMapping, EntityMapping, MappingStatus, MatchType, ColumnAnalysis,
  CustomFieldMapping, TempusCustomField, TemporalInterpretationResult,
} from '../types.js';
import { AnthropicClient } from './anthropicClient.js';
import { FuzzyMatcher } from './fuzzyMatcher.js';

// ── Tempus field schema for rule-based matching ──────────────────────

const TEMPUS_FIELD_MAP: Record<string, Array<{ field: string; aliases: string[] }>> = {
  customFields: [
    { field: 'entityType', aliases: ['entity type', 'entitätstyp', 'typ', 'object type', 'objekttyp'] },
    { field: 'name', aliases: ['custom field name', 'attribut', 'attributname', 'field name', 'feldname', 'attribute name'] },
    { field: 'dataType', aliases: ['type', 'datentyp', 'data type', 'field type', 'feldtyp'] },
    { field: 'selectionValues', aliases: ['selection values', 'auswahlwerte', 'werte', 'values', 'enum values', 'optionen', 'options'] },
    { field: 'isRequired', aliases: ['required', 'pflichtfeld', 'mandatory', 'pflicht'] },
    { field: 'isUnique', aliases: ['unique', 'eindeutig'] },
  ],
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
  skills: [
    { field: 'name', aliases: ['skill', 'skill name', 'kompetenz', 'fähigkeit', 'qualification', 'qualifikation'] },
    { field: 'category', aliases: ['category', 'kategorie', 'skill category', 'gruppe', 'group'] },
    { field: 'level', aliases: ['level', 'stufe', 'proficiency', 'skill level', 'erfahrung'] },
    { field: 'resourceName', aliases: ['resource', 'ressource', 'resource name', 'mitarbeiter', 'employee'] },
  ],
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
  advancedRates: [
    { field: 'resourceName', aliases: ['resource', 'ressource', 'resource name', 'mitarbeiter'] },
    { field: 'projectName', aliases: ['project', 'projekt', 'project name'] },
    { field: 'rate', aliases: ['rate', 'stundensatz', 'billing rate', 'cost rate', 'tarif'] },
    { field: 'currency', aliases: ['currency', 'währung', 'curr'] },
    { field: 'effectiveDate', aliases: ['effective date', 'gültig ab', 'start date', 'ab datum', 'valid from'] },
    { field: 'roleName', aliases: ['role', 'rolle', 'role name'] },
  ],
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
  teamResources: [
    { field: 'teamName', aliases: ['team', 'team name', 'teamname', 'group', 'gruppe'] },
    { field: 'resourceName', aliases: ['resource', 'ressource', 'resource name', 'mitarbeiter', 'member', 'employee'] },
    { field: 'role', aliases: ['role', 'rolle', 'team role', 'teamrolle', 'function', 'funktion'] },
    { field: 'allocationPercentage', aliases: ['allocation', 'allocation %', 'prozent', 'percentage', 'anteil', 'auslastung'] },
  ],
};

// Financial-sounding columns that are ACTUALLY project custom fields when in a project sheet
const FINANCIAL_COLUMN_NAMES = new Set([
  'budget', 'cost', 'revenue', 'forecast', 'actual', 'actuals', 'plan', 'plankosten',
  'istkosten', 'umsatz', 'erlös', 'prognose', 'planned cost', 'actual cost',
]);

// ── Core Mapping Engine (3-Tier) ─────────────────────────────────────

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

  // ═══ Build FuzzyMatcher Index ═══
  const matcher = new FuzzyMatcher();
  matcher.buildIndex(tempusData);
  const summary = matcher.getSummaryForAI();
  console.log(`[mappingEngine] FuzzyMatcher index: ${summary.resourceCount} resources, ${summary.projectCount} projects, large=${summary.hasLargeDataset}`);

  for (const sheet of analysis.sheets) {
    const parsedSheet = parsed.sheets.find(s => s.name === sheet.sheetName);
    if (!parsedSheet) continue;

    const targetEntity = detectSheetEntity(sheet, parsedSheet);

    // ═══ TIER 1a: Rule-based FIELD matching ═══
    for (const col of sheet.columns) {
      const ruleMatch = matchFieldByRules(col.name, targetEntity, sheet);
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

    // ═══ TIER 1b: Fuzzy ENTITY VALUE matching (replaces old O(n²) Levenshtein) ═══
    const nameColumns = findNameColumns(sheet, fieldMappings);
    for (const { column, targetEntity: entity } of nameColumns) {
      const uniqueValues = getUniqueValues(parsedSheet.rows, column);
      const entityTypeForMatcher = getMatcherEntityType(entity);

      const batchResults = matcher.matchBatch(
        uniqueValues.map(v => String(v)),
        entityTypeForMatcher,
      );

      for (const [valStr, result] of batchResults) {
        if (result.bestMatch && !result.isAmbiguous && result.bestMatch.score >= 0.85) {
          entityMappings.push({
            id: uuid(),
            sourceSheet: sheet.sheetName,
            sourceColumn: column,
            sourceValue: valStr,
            targetEntity: entity,
            matchedName: result.bestMatch.name,
            matchedId: result.bestMatch.id,
            matchType: result.bestMatch.matchLevel === 'exact' ? 'exact' : 'fuzzy',
            confidence: result.bestMatch.score,
            reasoning: `Algorithmischer Match (${result.bestMatch.matchLevel}, ${Math.round(result.bestMatch.score * 100)}%): "${valStr}" → "${result.bestMatch.name}"`,
            status: result.bestMatch.score >= 0.9 ? 'suggested' : 'needs_review',
            isNew: false,
          });
        } else if (result.isNew) {
          entityMappings.push({
            id: uuid(),
            sourceSheet: sheet.sheetName,
            sourceColumn: column,
            sourceValue: valStr,
            targetEntity: entity,
            matchType: 'new_entity',
            confidence: 0,
            reasoning: `Kein Match in Tempus gefunden für "${valStr}"`,
            status: 'create_new',
            isNew: true,
          });
        }
        // Ambiguous cases (0.65 <= score < 0.85 with close 2nd candidate) are collected for Tier 2
      }
    }

    // ═══ TIER 1c: Custom-Field matching for unmapped columns ═══
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

        const cfColValues = parsedSheet.rows.map(r => r[colName]).filter(v => v != null && v !== '');
        const cfUniqueVals = [...new Set(cfColValues.map(v => String(v).trim()))];
        customFieldMappings.push({
          sourceColumn: colName,
          sourceSheet: sheet.sheetName,
          customFieldName: cfMatch.tempusField.name,
          entityType: cfEntityType,
          existsInTempus: true,
          tempusFieldId: cfMatch.tempusField.id,
          dataType: cfMatch.tempusField.dataType,
          action: 'exists',
          uniqueValues: cfUniqueVals.slice(0, 100),
          sampleValues: cfColValues.slice(0, 5),
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

        const newCfColValues = parsedSheet.rows.map(r => r[colName]).filter(v => v != null && v !== '');
        const newCfUniqueVals = [...new Set(newCfColValues.map(v => String(v).trim()))];
        customFieldMappings.push({
          sourceColumn: colName,
          sourceSheet: sheet.sheetName,
          customFieldName: colName,
          entityType: cfEntityType,
          existsInTempus: false,
          dataType: inferredType,
          action: 'create',
          uniqueValues: newCfUniqueVals.slice(0, 100),
          sampleValues: newCfColValues.slice(0, 5),
        });

        const key = `${sheet.sheetName}.${colName}`;
        const idx = unmappedColumns.indexOf(key);
        if (idx >= 0) unmappedColumns.splice(idx, 1);
      }
    }
  }

  // ═══ TIER 2: AI Disambiguation (only ambiguous entity matches) ═══
  if (anthropicClient) {
    const ambiguousCases: Array<{
      sourceValue: string; sourceSheet: string; sourceColumn: string;
      entityType: string; topCandidates: import('./fuzzyMatcher.js').MatchCandidate[];
    }> = [];

    for (const sheet of analysis.sheets) {
      const parsedSheet = parsed.sheets.find(s => s.name === sheet.sheetName);
      if (!parsedSheet) continue;

      const targetEntity = detectSheetEntity(sheet, parsedSheet);
      const nameColumns = findNameColumns(sheet, fieldMappings);

      for (const { column, targetEntity: entity } of nameColumns) {
        const uniqueValues = getUniqueValues(parsedSheet.rows, column);
        const entityTypeForMatcher = getMatcherEntityType(entity);
        const batchResults = matcher.matchBatch(uniqueValues.map(v => String(v)), entityTypeForMatcher);

        for (const [valStr, result] of batchResults) {
          const alreadyMapped = entityMappings.find(
            em => em.sourceValue === valStr && em.targetEntity === entity
          );
          if (alreadyMapped) continue;

          if (result.isAmbiguous && result.topCandidates.length >= 2) {
            ambiguousCases.push({
              sourceValue: valStr,
              sourceSheet: sheet.sheetName,
              sourceColumn: column,
              entityType: entity,
              topCandidates: result.topCandidates,
            });
          }
        }
      }
    }

    if (ambiguousCases.length > 0) {
      console.log(`[mappingEngine] Tier 2: ${ambiguousCases.length} ambiguous cases for AI disambiguation`);
      try {
        const resolved = await anthropicClient.resolveAmbiguousMatches(ambiguousCases);
        for (let i = 0; i < resolved.length; i++) {
          const r = resolved[i];
          const c = ambiguousCases[i];
          entityMappings.push({
            id: uuid(),
            sourceSheet: c.sourceSheet,
            sourceColumn: c.sourceColumn,
            sourceValue: r.sourceValue,
            targetEntity: c.entityType,
            matchedName: r.resolvedMatch ?? undefined,
            matchedId: r.resolvedId ?? undefined,
            matchType: 'ai_suggested',
            confidence: r.confidence,
            reasoning: r.reasoning,
            status: r.isNew ? 'create_new' : (r.confidence >= 0.8 ? 'suggested' : 'needs_review'),
            isNew: r.isNew,
          });
        }
      } catch (err) {
        console.error('[mappingEngine] Tier 2 AI disambiguation FAILED:', err instanceof Error ? err.message : err);
        for (const c of ambiguousCases) {
          const best = c.topCandidates[0];
          entityMappings.push({
            id: uuid(),
            sourceSheet: c.sourceSheet,
            sourceColumn: c.sourceColumn,
            sourceValue: c.sourceValue,
            targetEntity: c.entityType,
            matchedName: best?.name,
            matchedId: best?.id,
            matchType: 'fuzzy',
            confidence: best?.score ?? 0,
            reasoning: `AI-Disambiguation fehlgeschlagen, bester algorithmischer Kandidat: "${best?.name}" (${Math.round((best?.score ?? 0) * 100)}%)`,
            status: 'needs_review',
            isNew: !best,
          });
        }
      }
    }
  }

  // ═══ TIER 3: AI Field Mapping + Custom Field Recognition ═══
  if (anthropicClient) {
    try {
      const sheetsForAI = analysis.sheets.map(s => {
        const parsedSheet = parsed.sheets.find(ps => ps.name === s.sheetName);
        return {
          sheetName: s.sheetName,
          columns: s.columns,
          sampleRows: (parsedSheet?.rows || []).slice(0, 10),
        };
      });

      const tempusSchema = {
        projects: tempusData.projects.map(p => ({ id: p.id, name: p.name, startDate: p.startDate, endDate: p.endDate, externalId: p.externalId })),
        resources: tempusData.resources.map(r => ({ id: r.id, name: r.name, externalId: r.externalId, isEnabled: r.isEnabled })),
        tasks: tempusData.tasks.map(t => ({ id: t.id, name: t.name, projectId: t.projectId })),
        customFields: tempusData.customFields.map(cf => ({
          id: cf.id, name: cf.name, entityType: cf.entityType,
          dataType: cf.dataType, enumMembers: cf.enumMembers?.map(e => ({ name: e.name })),
        })),
        roles: tempusData.roles.map(r => ({ id: r.id, name: r.name })),
        skills: tempusData.skills.map(s => ({ id: s.id, name: s.name, category: (s as any).category })),
        adminTimes: tempusData.adminTimes.map(a => ({ id: a.id, name: a.name })),
      };

      const aiResult = await anthropicClient.generateMappingSuggestions(
        sheetsForAI, tempusSchema, summary,
      );

      // AI can OVERRIDE rule-based field mappings if confidence is higher
      for (const aiMapping of aiResult.fieldMappings) {
        const existing = fieldMappings.find(
          fm => fm.sourceSheet === aiMapping.sourceSheet && fm.sourceColumn === aiMapping.sourceColumn
        );

        const isCustomFieldSuggestion = aiMapping.isCustomField || aiMapping.targetField?.startsWith('cf:');
        const aiField: FieldMapping = {
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
        };

        if (existing) {
          if (aiMapping.confidence > existing.confidence) {
            Object.assign(existing, aiField, { id: existing.id });
          }
        } else {
          fieldMappings.push(aiField);

          const idx = unmappedColumns.indexOf(`${aiMapping.sourceSheet}.${aiMapping.sourceColumn}`);
          if (idx >= 0) unmappedColumns.splice(idx, 1);
        }

        if (isCustomFieldSuggestion) {
          const cfName = aiMapping.suggestedCustomFieldName || aiMapping.sourceColumn;
          const alreadyTracked = customFieldMappings.find(
            cm => cm.sourceSheet === aiMapping.sourceSheet && cm.sourceColumn === aiMapping.sourceColumn
          );
          if (!alreadyTracked) {
            const existingCF = tempusData.customFields.find(
              cf => cf.name.toLowerCase() === cfName.toLowerCase()
            );
            const aiParsedSheet = parsed.sheets.find(s => s.name === aiMapping.sourceSheet);
            const aiCfColValues = aiParsedSheet?.rows.map(r => r[aiMapping.sourceColumn]).filter(v => v != null && v !== '') || [];
            const aiCfUniqueVals = [...new Set(aiCfColValues.map(v => String(v).trim()))];
            customFieldMappings.push({
              sourceColumn: aiMapping.sourceColumn,
              sourceSheet: aiMapping.sourceSheet,
              customFieldName: cfName,
              entityType: inferCustomFieldEntityType(aiMapping.sourceSheet, aiMapping.targetEntity),
              existsInTempus: !!existingCF,
              tempusFieldId: existingCF?.id,
              dataType: aiMapping.suggestedDataType || existingCF?.dataType || 'Text',
              action: existingCF ? 'exists' : 'create',
              uniqueValues: aiCfUniqueVals.slice(0, 100),
              sampleValues: aiCfColValues.slice(0, 5),
            });
          }
        }
      }

      // Merge AI entity suggestions (only for values not already matched)
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

      console.log(`[mappingEngine] Tier 3 AI completed: ${aiResult.fieldMappings.length} field suggestions, ${aiResult.entityMappings.length} entity suggestions`);
    } catch (err) {
      console.error('[mappingEngine] Tier 3 AI mapping FAILED:', err instanceof Error ? err.message : err);
      console.error('[mappingEngine] Using Tier 1 results only');
    }
  }

  // ═══ TIER 1.5: Temporal pivot columns → field mappings with transformation ═══
  for (const sheet of analysis.sheets) {
    if (sheet.temporalLayout !== 'pivot_temporal') continue;
    const pivotCols = sheet.columns.filter(c => c.isTemporalPivotColumn);
    if (pivotCols.length < 2) continue;

    const targetEntity = detectSheetEntity(sheet, parsed.sheets.find(s => s.name === sheet.sheetName)!);
    for (const col of pivotCols) {
      const alreadyMapped = fieldMappings.find(
        fm => fm.sourceSheet === sheet.sheetName && fm.sourceColumn === col.name
      );
      if (alreadyMapped) continue;

      fieldMappings.push({
        id: uuid(),
        sourceSheet: sheet.sheetName,
        sourceColumn: col.name,
        targetEntity: targetEntity === 'projects' ? 'assignments' : targetEntity,
        targetField: 'Time Period',
        matchType: 'ai_suggested',
        confidence: 0.85,
        reasoning: `Pivot-Spalte "${col.name}" (${col.temporalPattern?.interpretation || col.temporalPattern?.pattern || 'temporal'}) → wird beim Export als Zeitperiode entpivotiert`,
        status: 'suggested',
        transformation: 'unpivot',
      });

      const key = `${sheet.sheetName}.${col.name}`;
      const idx = unmappedColumns.indexOf(key);
      if (idx >= 0) unmappedColumns.splice(idx, 1);
    }

    console.log(`[mappingEngine] Pivot-Sheet "${sheet.sheetName}": ${pivotCols.length} temporal columns detected`);
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

// ── Temporal Context Analysis (called separately, results stored on session) ──

export async function analyzeTemporalContext(
  parsed: ParsedExcel,
  analysis: AnalysisResult,
  anthropicClient?: AnthropicClient,
): Promise<TemporalInterpretationResult | undefined> {
  const sheetsWithPatterns = analysis.sheets
    .map(sheet => {
      const parsedSheet = parsed.sheets.find(s => s.name === sheet.sheetName);
      if (!parsedSheet) return null;

      const pivotColumns = sheet.columns
        .filter(c => c.isTemporalPivotColumn)
        .map(c => c.name);

      const periodPatterns = sheet.columns
        .filter(c => c.temporalPattern && (c.temporalPattern.type === 'period_value' || c.temporalPattern.type === 'pivot_temporal'))
        .map(c => ({
          column: c.name,
          pattern: c.temporalPattern!.pattern,
          examples: c.temporalPattern!.examples,
        }));

      const phaseValues = sheet.columns
        .filter(c => c.temporalPattern?.type === 'phase_value')
        .map(c => {
          const vals = parsedSheet.rows.map(r => r[c.name]).filter(v => v != null && v !== '');
          const freq: Record<string, number> = {};
          for (const v of vals) freq[String(v)] = (freq[String(v)] || 0) + 1;
          return {
            column: c.name,
            values: Object.entries(freq).map(([raw, count]) => ({ raw, count })).sort((a, b) => b.count - a.count),
          };
        });

      if (pivotColumns.length === 0 && periodPatterns.length === 0 && phaseValues.length === 0) {
        return null;
      }

      return {
        sheetName: sheet.sheetName,
        temporalLayout: sheet.temporalLayout || 'standard',
        headers: parsedSheet.headers,
        pivotColumns,
        periodPatterns,
        phaseValues,
        sampleRows: parsedSheet.rows.slice(0, 5),
        rowCount: parsedSheet.totalRows,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  if (sheetsWithPatterns.length === 0) {
    console.log('[mappingEngine] No temporal patterns detected');
    return undefined;
  }

  console.log(`[mappingEngine] Temporal patterns found in ${sheetsWithPatterns.length} sheet(s)`);

  if (!anthropicClient) {
    return buildFallbackTemporalResult(sheetsWithPatterns);
  }

  try {
    const currentYear = new Date().getFullYear();
    const result = await anthropicClient.interpretTemporalData(sheetsWithPatterns, currentYear);
    console.log(`[mappingEngine] AI temporal interpretation: ${result.periodInterpretations.length} periods, ${result.phaseInterpretations.length} phases`);
    return result;
  } catch (err) {
    console.error('[mappingEngine] AI temporal interpretation FAILED:', err instanceof Error ? err.message : err);
    return buildFallbackTemporalResult(sheetsWithPatterns);
  }
}

function buildFallbackTemporalResult(
  sheetsWithPatterns: Array<{ pivotColumns: string[]; periodPatterns: Array<{ pattern: string; examples: string[] }>; phaseValues: Array<{ values: Array<{ raw: string }> }> }>,
): TemporalInterpretationResult {
  const currentYear = new Date().getFullYear();
  const periodInterpretations = sheetsWithPatterns.flatMap(s =>
    s.periodPatterns.flatMap(p =>
      p.examples.map(ex => {
        const qMatch = ex.match(/Q([1-4])/i);
        const quarter = qMatch ? parseInt(qMatch[1]) : undefined;
        const isCY = /^CY/i.test(ex);
        const isNY = /^NY/i.test(ex);
        const year = isNY ? currentYear + 1 : currentYear;
        return {
          rawPattern: ex,
          meaning: `${isCY ? 'Current Year' : isNY ? 'Next Year' : ''} ${quarter ? `Quarter ${quarter}` : ''}`.trim() || ex,
          tempusTimePeriod: quarter ? `Q${quarter} ${year}` : `${year}`,
          dateRange: quarter ? {
            start: `${year}-${String((quarter - 1) * 3 + 1).padStart(2, '0')}-01`,
            end: `${year}-${String(quarter * 3).padStart(2, '0')}-${quarter === 1 || quarter === 4 ? '31' : '30'}`,
          } : undefined,
          confidence: 0.6,
          reasoning: 'Regelbasierte Fallback-Interpretation (ohne AI)',
        };
      })
    )
  );

  const phaseInterpretations = sheetsWithPatterns.flatMap(s =>
    s.phaseValues.flatMap(pv =>
      pv.values.map(v => ({
        rawCode: v.raw,
        meaning: v.raw,
        tempusField: 'Phase',
        tempusValue: v.raw,
        confidence: 0.4,
        reasoning: 'Fallback: Code erkannt aber nicht AI-interpretiert',
      }))
    )
  );

  return { periodInterpretations, phaseInterpretations, projectTimelineInsights: [] };
}

// ── Sheet entity detection (fixes project-vs-financials) ─────────────

function detectSheetEntity(
  sheet: { sheetName: string; suggestedEntity: string; columns: ColumnAnalysis[] },
  parsedSheet: { rows: Record<string, unknown>[] },
): string {
  const suggested = sheet.suggestedEntity || 'unknown';

  // If AI suggested "financials" but the sheet has project-defining columns, it's actually a projects sheet
  if (suggested === 'financials' || suggested === 'unknown') {
    const colNames = new Set(sheet.columns.map(c => c.name.toLowerCase().trim()));
    const hasProjectName = colNames.has('project name') || colNames.has('projektname') || colNames.has('project') || colNames.has('projekt');
    const hasStartDate = [...colNames].some(c => c.includes('start'));
    const hasEndDate = [...colNames].some(c => c.includes('end') || c.includes('ende'));

    if (hasProjectName && (hasStartDate || hasEndDate)) {
      console.log(`[mappingEngine] Sheet "${sheet.sheetName}" reclassified: ${suggested} → projects (has project-defining columns + dates)`);
      return 'projects';
    }

    // Also check for portfolio-style sheets
    const sheetLower = sheet.sheetName.toLowerCase();
    if (sheetLower.includes('project') || sheetLower.includes('portfolio') || sheetLower.includes('projekt')) {
      console.log(`[mappingEngine] Sheet "${sheet.sheetName}" reclassified: ${suggested} → projects (sheet name indicates projects)`);
      return 'projects';
    }
  }

  return suggested;
}

// ── Rule-based field matching (with financials-in-project guard) ──────

function matchFieldByRules(
  columnName: string,
  suggestedEntity: string,
  sheet: { sheetName: string; columns: ColumnAnalysis[] },
): { entity: string; field: string; matchType: MatchType; confidence: number; reasoning: string } | null {
  const normalized = columnName.toLowerCase().trim().replace(/\s+/g, ' ');

  // Guard: If this is a projects sheet, don't match financial-sounding columns to financials entity
  if (suggestedEntity === 'projects' && FINANCIAL_COLUMN_NAMES.has(normalized)) {
    return null; // Let custom field matching handle it
  }

  const entityOrder = [suggestedEntity, ...Object.keys(TEMPUS_FIELD_MAP).filter(e => e !== suggestedEntity)];

  for (const entity of entityOrder) {
    // Don't match to financials if sheet is classified as projects
    if (entity === 'financials' && suggestedEntity === 'projects') continue;

    const fields = TEMPUS_FIELD_MAP[entity];
    if (!fields) continue;

    for (const { field, aliases } of fields) {
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

      const fuzzyScore = simpleFuzzyMatch(normalized, aliases);
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

function simpleFuzzyMatch(input: string, targets: string[]): number {
  let best = 0;
  for (const target of targets) {
    if (input.includes(target) || target.includes(input)) {
      const ratio = Math.min(input.length, target.length) / Math.max(input.length, target.length);
      best = Math.max(best, ratio * 0.9);
    }
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

// ── Entity type mapping for FuzzyMatcher ─────────────────────────────

function getMatcherEntityType(entity: string): string | undefined {
  switch (entity) {
    case 'projects': return 'projects';
    case 'resources': return 'resources';
    case 'tasks': return 'tasks';
    case 'customFields': return 'customFields';
    case 'skills': return 'skills';
    case 'adminTimes': return 'adminTimes';
    case 'assignments': return undefined; // Search all (projects + resources + tasks)
    case 'advancedRates': return undefined;
    case 'financials': return 'projects';
    case 'sheetData': return undefined;
    case 'teamResources': return 'resources';
    default: return undefined;
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
