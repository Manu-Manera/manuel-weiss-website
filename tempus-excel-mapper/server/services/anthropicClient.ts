import Anthropic from '@anthropic-ai/sdk';
import type { SheetAnalysis, ColumnAnalysis } from '../types.js';

const ALL_TEMPUS_ENTITIES = [
  'customFields', 'resources', 'projects', 'assignments',
  'adminTimes', 'skills', 'sheetData', 'advancedRates',
  'financials', 'teamResources', 'tasks', 'mixed', 'unknown',
] as const;

const ANALYSIS_TOOL = {
  name: 'analyze_excel_structure' as const,
  description: 'Analyze Excel structure and classify columns for Tempus import mapping across all 10 Tempus entity types',
  input_schema: {
    type: 'object' as const,
    properties: {
      sheets: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            sheetName: { type: 'string' as const },
            suggestedEntity: {
              type: 'string' as const,
              enum: [...ALL_TEMPUS_ENTITIES],
            },
            entityConfidence: { type: 'number' as const },
            columns: {
              type: 'array' as const,
              items: {
                type: 'object' as const,
                properties: {
                  name: { type: 'string' as const },
                  classification: { type: 'string' as const },
                  suggestedTempusField: { type: 'string' as const },
                  relevance: { type: 'string' as const, enum: ['high', 'medium', 'low'] },
                  confidence: { type: 'number' as const },
                  reasoning: { type: 'string' as const },
                  isCustomField: { type: 'boolean' as const },
                  suggestedCustomFieldName: { type: 'string' as const },
                },
                required: ['name', 'classification', 'relevance', 'confidence', 'reasoning'],
              },
            },
          },
          required: ['sheetName', 'suggestedEntity', 'columns'],
        },
      },
      insights: { type: 'string' as const },
      detectedRelationships: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            fromSheet: { type: 'string' as const },
            fromColumn: { type: 'string' as const },
            toSheet: { type: 'string' as const },
            toColumn: { type: 'string' as const },
            relationship: { type: 'string' as const },
          },
        },
      },
    },
    required: ['sheets', 'insights'],
  },
};

const MAPPING_TOOL = {
  name: 'generate_mapping_suggestions' as const,
  description: 'Generate smart mapping suggestions from source Excel columns to all 10 Tempus entity types, including new entity creation proposals',
  input_schema: {
    type: 'object' as const,
    properties: {
      fieldMappings: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            sourceSheet: { type: 'string' as const },
            sourceColumn: { type: 'string' as const },
            targetEntity: {
              type: 'string' as const,
              enum: [...ALL_TEMPUS_ENTITIES],
            },
            targetField: { type: 'string' as const },
            confidence: { type: 'number' as const },
            reasoning: { type: 'string' as const },
            transformation: { type: 'string' as const },
            isCustomField: { type: 'boolean' as const },
            suggestedCustomFieldName: { type: 'string' as const },
            suggestedDataType: { type: 'string' as const },
          },
          required: ['sourceSheet', 'sourceColumn', 'targetEntity', 'targetField', 'confidence', 'reasoning'],
        },
      },
      entityMappings: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            sourceValue: { type: 'string' as const },
            sourceSheet: { type: 'string' as const },
            sourceColumn: { type: 'string' as const },
            targetEntity: { type: 'string' as const },
            suggestedMatch: { type: 'string' as const },
            confidence: { type: 'number' as const },
            isNew: { type: 'boolean' as const },
            reasoning: { type: 'string' as const },
            suggestedAction: {
              type: 'string' as const,
              enum: ['match_existing', 'create_new', 'skip', 'needs_review'],
            },
          },
          required: ['sourceValue', 'targetEntity', 'confidence', 'isNew', 'reasoning'],
        },
      },
      summary: { type: 'string' as const },
    },
    required: ['fieldMappings', 'entityMappings', 'summary'],
  },
};

export class AnthropicClient {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Reply with "ok"' }],
      });
      const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
      return { ok: true, message: `Verbindung erfolgreich (${text.trim()})` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, message: msg };
    }
  }

  async analyzeStructure(
    sheets: Array<{ sheetName: string; columns: ColumnAnalysis[]; sampleRows: Record<string, unknown>[] }>,
    tempusData?: {
      customFields: Array<{ name: string; entityType: string; dataType: string; enumMembers?: Array<{ name: string }> }>;
      projects: Array<{ id: number; name: string }>;
      resources: Array<{ id: number; name: string }>;
    },
  ): Promise<{
    sheets: Array<{
      sheetName: string;
      suggestedEntity: string;
      entityConfidence?: number;
      columns: Array<{
        name: string;
        classification: string;
        suggestedTempusField?: string;
        relevance: string;
        confidence: number;
        reasoning: string;
      }>;
    }>;
    insights: string;
    detectedRelationships?: Array<{
      fromSheet: string;
      fromColumn: string;
      toSheet: string;
      toColumn: string;
      relationship: string;
    }>;
  }> {
    const sheetsInfo = sheets.map(s => ({
      name: s.sheetName,
      columns: s.columns.map(c => ({
        name: c.name,
        type: c.inferredType,
        samples: c.sampleValues.slice(0, 3),
        nullRatio: c.totalCount > 0 ? Math.round((c.nullCount / c.totalCount) * 100) : 0,
        uniqueCount: c.uniqueCount,
      })),
      sampleRows: s.sampleRows.slice(0, 3),
    }));

    const tempusContext = tempusData
      ? `\n\nVORHANDENE TEMPUS-DATEN (zum Abgleich nutzen):\nCustom Fields: ${JSON.stringify(tempusData.customFields.map(cf => ({ name: cf.name, entity: cf.entityType, type: cf.dataType, values: cf.enumMembers?.map(e => e.name) })))}\nProjekte (Auszug): ${tempusData.projects.slice(0, 20).map(p => p.name).join(', ')}\nRessourcen (Auszug): ${tempusData.resources.slice(0, 20).map(r => r.name).join(', ')}`
      : '';

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: TEMPUS_ANALYSIS_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Analysiere diese Excel-Struktur:\n${JSON.stringify(sheetsInfo, null, 2)}${tempusContext}`,
      }],
      tools: [ANALYSIS_TOOL],
      tool_choice: { type: 'tool' as const, name: 'analyze_excel_structure' },
    });

    const toolBlock = response.content.find(b => b.type === 'tool_use');
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      throw new Error('Unerwartete AI-Antwort: kein Tool-Output');
    }

    return toolBlock.input as ReturnType<AnthropicClient['analyzeStructure']> extends Promise<infer T> ? T : never;
  }

  async generateMappingSuggestions(
    sourceSheets: Array<{ sheetName: string; columns: ColumnAnalysis[]; sampleRows: Record<string, unknown>[] }>,
    tempusSchema: TempusMappingSchema,
  ): Promise<MappingSuggestionsResult> {
    const prompt = `Erstelle intelligente Mapping-Vorschläge für den Import dieser Excel-Daten in Tempus.
Analysiere JEDE Spalte und JEDEN relevanten Wert – auch wenn die Zuordnung nicht offensichtlich ist.

QUELLE (Excel-Sheets mit Beispieldaten):
${JSON.stringify(sourceSheets.map(s => ({
  name: s.sheetName,
  columns: s.columns.map(c => ({
    name: c.name,
    type: c.inferredType,
    samples: c.sampleValues.slice(0, 5),
    uniqueCount: c.uniqueCount,
    nullRatio: c.totalCount > 0 ? Math.round((c.nullCount / c.totalCount) * 100) + '%' : '0%',
  })),
  rows: s.sampleRows.slice(0, 5),
})), null, 2)}

ZIEL (vorhandene Tempus-Daten — hier sind ALLE 10 Import-Entitätstypen):

1. ATTRIBUTES (Custom Fields): ${JSON.stringify(tempusSchema.customFields.map(cf => ({
  id: cf.id, name: cf.name, entity: cf.entityType, type: cf.dataType,
  values: cf.enumMembers?.map(e => e.name),
})))}

2. RESOURCES: ${JSON.stringify(tempusSchema.resources.slice(0, 50).map(r => ({ id: r.id, name: r.name })))}

3. PROJECTS: ${JSON.stringify(tempusSchema.projects.slice(0, 50).map(p => ({ id: p.id, name: p.name })))}

4. ASSIGNMENTS: (Zuweisungen aus Projekt/Resource/Task-Kombinationen)

5. ADMIN TIME: ${JSON.stringify(tempusSchema.adminTimes?.slice(0, 30).map(a => ({ id: a.id, name: a.name })) || [])}

6. SKILLS: ${JSON.stringify(tempusSchema.skills?.slice(0, 30).map(s => ({ id: s.id, name: s.name })) || [])}

7. SHEET DATA: (Projekt/Task/Resource/Monat/Wert-Kombinationen)

8. ADVANCED RATES: (Resource/Projekt/Rolle/Stundensatz-Kombinationen)

9. FINANCIALS: (Projekt/Monat/Budget/Ist/Forecast)

10. TEAM RESOURCE: (Team/Resource/Rolle/Anteil-Kombinationen)

Rollen: ${JSON.stringify(tempusSchema.roles.map(r => ({ id: r.id, name: r.name })))}
Tasks: ${JSON.stringify(tempusSchema.tasks?.slice(0, 30).map(t => ({ id: t.id, name: t.name })) || [])}

REGELN (WICHTIG):
1. Mappe JEDE Spalte auf ein Tempus-Feld (fieldMappings). Nutze alle 10 Entitätstypen.
2. Spalten, die keinem Standardfeld entsprechen, aber Werte enthalten, die zu einem Custom Field passen könnten: setze isCustomField=true und schlage einen Custom-Field-Namen + Datentyp vor.
3. Mappe alle erkennbaren Werte auf bestehende Tempus-Entitäten (entityMappings):
   - Berücksichtige Abkürzungen, Umbenennungen, Tippfehler (z.B. "Proj Alpha" ≈ "Project Alpha")
   - Auch partielle Matches sind wertvoll – gib dann niedrigere Confidence
4. Werte OHNE Entsprechung in Tempus: isNew=true, suggestedAction='create_new'
5. Confidence 0-1: 1.0=exakt gleich, 0.8-0.99=sehr ähnlich, 0.5-0.79=möglich, <0.5=unsicher
6. Transformationen vorschlagen wenn nötig (Datumsformat, Einheiten, Status-Mapping, Enum-Zuordnung)
7. Auch Sheet-übergreifende Zusammenhänge erkennen (z.B. Projekte in Sheet 1, Zuweisungen in Sheet 2)
8. Bei Auswahl-/Enum-Spalten: Werte mit vorhandenen Custom-Field enumMembers abgleichen`;

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16384,
      system: TEMPUS_MAPPING_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
      tools: [MAPPING_TOOL],
      tool_choice: { type: 'tool' as const, name: 'generate_mapping_suggestions' },
    });

    const toolBlock = response.content.find(b => b.type === 'tool_use');
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      throw new Error('Unerwartete AI-Antwort: kein Tool-Output');
    }

    return toolBlock.input as MappingSuggestionsResult;
  }
}

// ── Types for AI results ────────────────────────────────────────────

export interface TempusMappingSchema {
  projects: Array<{ id: number; name: string }>;
  resources: Array<{ id: number; name: string }>;
  tasks?: Array<{ id: number; name: string; projectId?: number }>;
  customFields: Array<{
    id: number; name: string; entityType: string; dataType: string;
    enumMembers?: Array<{ name: string }>;
  }>;
  roles: Array<{ id: number; name: string }>;
  skills?: Array<{ id: number; name: string }>;
  adminTimes?: Array<{ id: number; name: string }>;
}

export interface MappingSuggestionsResult {
  fieldMappings: Array<{
    sourceSheet: string;
    sourceColumn: string;
    targetEntity: string;
    targetField: string;
    confidence: number;
    reasoning: string;
    transformation?: string;
    isCustomField?: boolean;
    suggestedCustomFieldName?: string;
    suggestedDataType?: string;
  }>;
  entityMappings: Array<{
    sourceValue: string;
    sourceSheet?: string;
    sourceColumn?: string;
    targetEntity: string;
    suggestedMatch?: string;
    confidence: number;
    isNew: boolean;
    reasoning: string;
    suggestedAction?: 'match_existing' | 'create_new' | 'skip' | 'needs_review';
  }>;
  summary: string;
}

// ── System Prompts ──────────────────────────────────────────────────

const TEMPUS_ANALYSIS_SYSTEM_PROMPT = `Du bist ein Experte für Datenanalyse im Kontext von Projektmanagement- und Ressourcenplanungs-Systemen.
Deine Aufgabe: Analysiere Excel-Datenstrukturen und klassifiziere Spalten für den Import in Tempus (ProSymmetry Supergrid).

Tempus kennt 10 Import-Entitätstypen in dieser Reihenfolge:
1. ATTRIBUTES (customFields): Custom-Field-Definitionen — entityType, name, dataType, selectionValues, isRequired
2. RESOURCES: Mitarbeiter/Ressourcen — name, email, globalRole, billingRate, capacityUnit, department, externalId
3. PROJECTS: Projekte — name, startDate, endDate, externalId, priority, phase, benefit, manager, status
4. ASSIGNMENTS: Zuweisungen — projectName, resourceName, taskName, planType, allocation, month, priority
5. ADMIN TIME: Abwesenheiten/Verwaltungszeit — name, resourceName, date, hours, type, startDate, endDate
6. SKILLS: Kompetenzen — name, category, level, resourceName
7. SHEET DATA: Planungsdaten — projectName, taskName, resourceName, month, value, planType
8. ADVANCED RATES: Erweiterte Stundensätze — resourceName, projectName, rate, currency, effectiveDate, roleName
9. FINANCIALS: Finanzdaten — projectName, month, budget, actual, forecast, revenue, type, category
10. TEAM RESOURCE: Teamzuordnungen — teamName, resourceName, role, allocationPercentage

Spalten die keinem Standardfeld entsprechen, aber Daten zu einer Entität tragen, sind wahrscheinlich Custom Fields (Attribute).
Erkenne Beziehungen zwischen Sheets (z.B. Projekt-Referenzen in Assignments, Resource-Referenzen in Skills).
Klassifiziere JEDE Spalte – auch ungewöhnliche oder domänenspezifische Spalten sollen einem der 10 Typen zugeordnet werden.`;

const TEMPUS_MAPPING_SYSTEM_PROMPT = `Du bist ein hochspezialisierter Mapping-Experte für den Datenimport in Tempus (ProSymmetry Supergrid).

Dein Ziel: Erstelle für JEDE Spalte und JEDEN relevanten Wert einen intelligenten Mapping-Vorschlag.
Du kennst alle 10 Tempus-Import-Entitätstypen: Attributes, Resources, Projects, Assignments, Admin Time, Skills, Sheet Data, Advanced Rates, Financials, Team Resource.

Matching-Strategie (von höchster zu niedrigster Priorität):
1. EXAKTER MATCH: Name/Wert ist identisch mit einer Tempus-Entität → Confidence 0.95-1.0
2. NORMALISIERTER MATCH: Gleich nach Bereinigung (Gross/Klein, Leerzeichen, Umlaute) → Confidence 0.85-0.95
3. SEMANTISCHER MATCH: Inhaltlich gleich trotz anderer Benennung (z.B. "HR" = "Human Resources", "PM" = "Project Manager") → Confidence 0.7-0.85
4. FUZZY MATCH: Ähnlich aber nicht sicher (Abkürzungen, Tippfehler, Teilübereinstimmung) → Confidence 0.5-0.7
5. NEUANLAGE: Kein passender Match gefunden → isNew=true, Confidence basierend auf Datenqualität

Besondere Intelligenz:
- Erkenne domänenspezifische Abkürzungen und Fachjargon
- Berücksichtige den Kontext des gesamten Sheets (wenn andere Spalten auf "Projects" hindeuten, ist "Name" wahrscheinlich projectName)
- Bei Enum-/Auswahl-Spalten: Vergleiche Werte mit Custom-Field enumMembers
- Schlage für Custom-Field-Kandidaten einen sinnvollen Datentyp vor (Text, Number, Date, Boolean, Selection)
- Erkenne Datumstransformationen, Einheitenumrechnungen und Status-Mappings

WICHTIG: Gib für JEDE unmapped Spalte einen Vorschlag ab – auch wenn nur mit niedriger Confidence.
Lieber ein unsicherer Vorschlag mit guter Begründung als gar kein Vorschlag.`;
