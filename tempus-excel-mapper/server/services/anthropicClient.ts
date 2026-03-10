import Anthropic from '@anthropic-ai/sdk';
import type { SheetAnalysis, ColumnAnalysis } from '../types.js';
import type { MatchCandidate, TempusSummary } from './fuzzyMatcher.js';

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

const DISAMBIGUATION_TOOL = {
  name: 'resolve_ambiguous_matches' as const,
  description: 'Resolve ambiguous entity matches by choosing the best candidate or marking as new',
  input_schema: {
    type: 'object' as const,
    properties: {
      resolutions: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            idx: { type: 'number' as const },
            resolvedName: { type: 'string' as const },
            resolvedId: { type: 'number' as const },
            confidence: { type: 'number' as const },
            isNew: { type: 'boolean' as const },
            reasoning: { type: 'string' as const },
          },
          required: ['idx', 'confidence', 'isNew', 'reasoning'],
        },
      },
    },
    required: ['resolutions'],
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
    sheets: Array<{ sheetName: string; columns: ColumnAnalysis[]; sampleRows: Record<string, unknown>[] }>
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

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: TEMPUS_ANALYSIS_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Analysiere diese Excel-Struktur:\n${JSON.stringify(sheetsInfo, null, 2)}`,
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

  /**
   * Tier 3: AI-based field mapping using SUMMARY stats instead of raw data.
   * Scales to 20k+ resources because only counts + samples are sent.
   */
  async generateMappingSuggestions(
    sourceSheets: Array<{ sheetName: string; columns: ColumnAnalysis[]; sampleRows: Record<string, unknown>[] }>,
    tempusSchema: TempusMappingSchema,
    tempusSummary?: TempusSummary,
  ): Promise<MappingSuggestionsResult> {
    const summary = tempusSummary;
    const isLarge = summary?.hasLargeDataset ?? false;

    const tempusDataSection = isLarge
      ? this.buildLargeDatasetPrompt(tempusSchema, summary!)
      : this.buildSmallDatasetPrompt(tempusSchema);

    const prompt = `Analysiere diese Excel-Daten und erstelle ein vollständiges Mapping für den Tempus-Import.
targetField MUSS EXAKT einem Tempus-Template-Spaltennamen entsprechen (siehe System-Prompt).

═══ EXCEL-QUELLDATEN ═══
${JSON.stringify(sourceSheets.map(s => ({
  sheetName: s.sheetName,
  columns: s.columns.map(c => ({
    name: c.name,
    type: c.inferredType,
    samples: c.sampleValues.slice(0, 10),
    uniqueCount: c.uniqueCount,
    nullRatio: c.totalCount > 0 ? Math.round((c.nullCount / c.totalCount) * 100) + '%' : '0%',
  })),
  sampleRows: s.sampleRows.slice(0, 10),
})), null, 2)}

${tempusDataSection}

═══ AUFGABE ═══
1. Ordne JEDE Excel-Spalte einem Tempus-Template-Feld zu (fieldMappings). targetField = exakter Tempus-Spaltenname oder "cf:<Name>"
2. Erkenne Custom Fields: Prüfe ob sie in der Custom Fields Liste existieren
3. entityMappings: NUR für Werte die der algorithmische Matcher NICHT bereits gelöst hat${isLarge ? '\n4. ACHTUNG: Grosser Datensatz — Entity-Matching wurde algorithmisch vorgelöst. Fokussiere auf Spalten- und Custom-Field-Zuordnung.' : `
4. Matche einzigartige Werte in Name-Spalten gegen die vorhandenen Tempus-Daten (entityMappings)
5. Was NICHT in Tempus existiert → isNew=true, suggestedAction='create_new'`}
`;

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

  /**
   * Tier 2: AI resolves ONLY ambiguous matches — gets top-K candidates per value.
   * Drastically reduces token usage: instead of 20k resources, only ~5 per case.
   */
  async resolveAmbiguousMatches(
    ambiguousCases: Array<{
      sourceValue: string;
      sourceSheet: string;
      sourceColumn: string;
      entityType: string;
      topCandidates: MatchCandidate[];
    }>,
  ): Promise<Array<{
    sourceValue: string;
    resolvedMatch: string | null;
    resolvedId: number | null;
    confidence: number;
    isNew: boolean;
    reasoning: string;
  }>> {
    if (ambiguousCases.length === 0) return [];

    const BATCH_SIZE = 40;
    const allResults: Array<{
      sourceValue: string;
      resolvedMatch: string | null;
      resolvedId: number | null;
      confidence: number;
      isNew: boolean;
      reasoning: string;
    }> = [];

    for (let i = 0; i < ambiguousCases.length; i += BATCH_SIZE) {
      const batch = ambiguousCases.slice(i, i + BATCH_SIZE);
      const batchResults = await this.resolveAmbiguousBatch(batch);
      allResults.push(...batchResults);
    }

    return allResults;
  }

  private async resolveAmbiguousBatch(
    cases: Array<{
      sourceValue: string;
      sourceSheet: string;
      sourceColumn: string;
      entityType: string;
      topCandidates: MatchCandidate[];
    }>,
  ): Promise<Array<{
    sourceValue: string;
    resolvedMatch: string | null;
    resolvedId: number | null;
    confidence: number;
    isNew: boolean;
    reasoning: string;
  }>> {
    const casesForPrompt = cases.map((c, idx) => ({
      idx,
      value: c.sourceValue,
      entity: c.entityType,
      sheet: c.sourceSheet,
      column: c.sourceColumn,
      candidates: c.topCandidates.map(tc => ({
        name: tc.name,
        id: tc.id,
        score: Math.round(tc.score * 100),
      })),
    }));

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: DISAMBIGUATION_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Löse diese ${cases.length} ambiguen Entity-Matches auf:\n${JSON.stringify(casesForPrompt, null, 2)}`,
      }],
      tools: [DISAMBIGUATION_TOOL],
      tool_choice: { type: 'tool' as const, name: 'resolve_ambiguous_matches' },
    });

    const toolBlock = response.content.find(b => b.type === 'tool_use');
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      return cases.map(c => ({
        sourceValue: c.sourceValue,
        resolvedMatch: c.topCandidates[0]?.name ?? null,
        resolvedId: c.topCandidates[0]?.id ?? null,
        confidence: c.topCandidates[0]?.score ?? 0,
        isNew: !c.topCandidates[0],
        reasoning: 'AI-Disambiguation fehlgeschlagen, bester algorithmischer Kandidat verwendet',
      }));
    }

    const result = toolBlock.input as { resolutions: Array<{
      idx: number; resolvedName: string | null; resolvedId: number | null;
      confidence: number; isNew: boolean; reasoning: string;
    }> };

    return cases.map((c, idx) => {
      const resolution = result.resolutions.find(r => r.idx === idx);
      if (!resolution) {
        return {
          sourceValue: c.sourceValue,
          resolvedMatch: c.topCandidates[0]?.name ?? null,
          resolvedId: c.topCandidates[0]?.id ?? null,
          confidence: c.topCandidates[0]?.score ?? 0,
          isNew: !c.topCandidates[0],
          reasoning: 'Keine AI-Auflösung erhalten',
        };
      }
      return {
        sourceValue: c.sourceValue,
        resolvedMatch: resolution.resolvedName,
        resolvedId: resolution.resolvedId,
        confidence: resolution.confidence,
        isNew: resolution.isNew,
        reasoning: resolution.reasoning,
      };
    });
  }

  private buildLargeDatasetPrompt(schema: TempusMappingSchema, summary: TempusSummary): string {
    return `═══ VORHANDENE TEMPUS-DATEN (ZUSAMMENFASSUNG — grosser Datensatz) ═══

ACHTUNG: Der Datensatz ist gross (${summary.resourceCount} Resources, ${summary.projectCount} Projects).
Entity-Werte-Matching wurde ALGORITHMISCH vorgelöst (Tier 1+2). Du fokussierst auf SPALTEN-ZUORDNUNG und CUSTOM FIELDS.

CUSTOM FIELDS / ATTRIBUTE (${schema.customFields.length} in Tempus vorhanden):
${JSON.stringify(schema.customFields.map(cf => ({
  id: cf.id, name: cf.name, entityType: cf.entityType, dataType: cf.dataType,
  selectionValues: cf.enumMembers?.map(e => e.name),
})), null, 2)}

STATISTIKEN:
- Projects: ${summary.projectCount} vorhanden (Beispiele: ${summary.projectNameSamples.slice(0, 30).map(n => `"${n}"`).join(', ')}${summary.projectCount > 30 ? ', ...' : ''})
- Resources: ${summary.resourceCount} vorhanden (Beispiele: ${summary.resourceNameSamples.slice(0, 30).map(n => `"${n}"`).join(', ')}${summary.resourceCount > 30 ? ', ...' : ''})
- Tasks: ${summary.taskCount}
- Assignments: ${summary.assignmentCount}
- Skills: ${summary.skillCount}
- Admin Times: ${summary.adminTimeCount}
- Roles: ${JSON.stringify(summary.roles)}`;
  }

  private buildSmallDatasetPrompt(schema: TempusMappingSchema): string {
    return `═══ VORHANDENE TEMPUS-DATEN (zum Vergleich) ═══

CUSTOM FIELDS / ATTRIBUTE (${schema.customFields.length} in Tempus vorhanden):
${JSON.stringify(schema.customFields.map(cf => ({
  id: cf.id, name: cf.name, entityType: cf.entityType, dataType: cf.dataType,
  selectionValues: cf.enumMembers?.map(e => e.name),
})), null, 2)}

PROJECTS (${schema.projects.length} in Tempus vorhanden):
${JSON.stringify(schema.projects.map(p => ({ id: p.id, name: p.name, startDate: p.startDate, endDate: p.endDate })), null, 2)}

RESOURCES (${schema.resources.length} in Tempus vorhanden):
${JSON.stringify(schema.resources.map(r => ({ id: r.id, name: r.name, isEnabled: r.isEnabled })), null, 2)}

ROLES (${schema.roles.length}): ${JSON.stringify(schema.roles.map(r => ({ id: r.id, name: r.name })))}

TASKS (${schema.tasks?.length ?? 0}):
${JSON.stringify(schema.tasks?.map(t => ({ id: t.id, name: t.name, projectId: t.projectId })) || [])}

SKILLS (${schema.skills?.length ?? 0}): ${JSON.stringify(schema.skills?.map(s => ({ id: s.id, name: s.name, category: s.category })) || [])}

ADMIN TIMES (${schema.adminTimes?.length ?? 0}): ${JSON.stringify(schema.adminTimes?.map(a => ({ id: a.id, name: a.name })) || [])}`;
  }
}

// ── Types for AI results ────────────────────────────────────────────

export interface TempusMappingSchema {
  projects: Array<{ id: number; name: string; startDate?: string; endDate?: string; externalId?: string }>;
  resources: Array<{ id: number; name: string; externalId?: string; isEnabled?: boolean }>;
  tasks?: Array<{ id: number; name: string; projectId?: number }>;
  customFields: Array<{
    id: number; name: string; entityType: string; dataType: string;
    enumMembers?: Array<{ name: string }>;
  }>;
  roles: Array<{ id: number; name: string }>;
  skills?: Array<{ id: number; name: string; category?: string }>;
  adminTimes?: Array<{ id: number; name: string }>;
  assignments?: Array<{ id: number; taskId: number; resourceId: number }>;
  sheetData?: Array<{ id: number; projectName?: string; taskName?: string; resourceName?: string }>;
  advancedRates?: Array<{ id: number; resourceName?: string; projectName?: string; rate?: number }>;
  financials?: Array<{ id: number; projectName?: string; category?: string; type?: string }>;
  teamResources?: Array<{ id: number; teamName?: string; resourceName?: string }>;
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

const TEMPUS_MAPPING_SYSTEM_PROMPT = `Du bist der weltweit beste Datenintegrations-Experte für Tempus Resource (ProSymmetry Supergrid).
Du analysierst Excel-Quelldaten und vergleichst sie mit vorhandenen Tempus-Daten, um perfekte Import-Mappings zu erstellen.

DEIN ZIEL: Erstelle für JEDE Spalte und JEDEN Wert einen intelligenten, kontextbewussten Mapping-Vorschlag.
Für fieldMappings: targetField MUSS EXAKT einem der unten aufgelisteten Template-Spaltennamen entsprechen.
Für entityMappings: Vergleiche JEDEN Wert mit vorhandenen Tempus-Daten. Was NICHT existiert → isNew=true, suggestedAction='create_new'.

═══ TEMPUS-IMPORT-TEMPLATES (EXAKTE SPALTEN) ═══
Die folgenden 10 Templates definieren die EXAKTE Struktur, die Tempus beim Import erwartet.
"targetField" in fieldMappings MUSS einem dieser Spaltennamen entsprechen (oder "cf:<CustomFieldName>" für Custom Fields).

TEMPLATE 1 — ATTRIBUTES (Custom Fields):
  Sheet: "Attributes"
  Spalten: Entity Type, Custom Field Name, Type, Import Behavior, Is Required, Is Unique, Default Value, Selection Values, Is Rich Text

TEMPLATE 2 — RESOURCES:
  Sheet: "Resources"
  Spalten: Resource ID, API External Id, Resource Name, Billing Rate, Demand Planning, Capacity Aggregation, Capacity Unit, Import Behavior, Is Team Resource, Team Start Date, Team End Date, Is Enabled, Login, Enable SSO, E-Mail, Global Role, Security Group, Is Timesheet User, Is Timesheet Approver, Timesheet Approver, Is Resource Manager, Resource Managers, Department, Hired On

TEMPLATE 3 — PROJECTS:
  Sheet: "Projects"
  Spalten: Project ID, API External Id, Project Name, Start Date, End Date, Import Behavior, Is Proposal, Dataset Preference, Security Group, Is Template, Project Priority, Phase, Benefit
  WICHTIG: Custom-Field-Werte werden als ZUSÄTZLICHE Spalten hinter "Benefit" angehängt (Spaltenname = Custom Field Name)

TEMPLATE 4 — ASSIGNMENTS:
  Sheet: "Assignments"
  Spalten: Project, Project API External Id, Resource, Resource API External Id, Task, Data Input, Plan Type, Allocation Type, Time Period, Import Behavior, Id, Action, Project Allocation, Priority, Complete

TEMPLATE 5 — ADMIN TIMES:
  Sheet: "Admin Times"
  Spalten: Resource Name, Aggregation Unit, Admin Time Type

TEMPLATE 6 — SKILLS:
  Sheet: "Skills"
  Spalten: Skill Name, Type, Import Behavior, Category Names, Description, Track Expiration

TEMPLATE 7 — SHEET DATA:
  Sheet: "Sheet Data"
  Spalten: Entity Type, Project Name, Template Name

TEMPLATE 8 — ADVANCED RATES (Resource Rates):
  Sheet: "Resource Rates"
  Spalten: Resource Name, Rate, Start Date, End Date

TEMPLATE 9 — FINANCIALS:
  Sheet: "Financials"
  Spalten: Project, Category, Type, Time Period, Import Behavior, Project Cost, Row Id, Priority

TEMPLATE 10 — TEAM RESOURCES:
  Sheet: "Team Resource Members"
  Spalten: Resource Name, Aggregation Unit, Team Member

═══ MAPPING-REGELN FÜR targetField ═══
- Wenn eine Quellspalte einem Standard-Template-Feld entspricht → targetField = exakter Spaltenname (z.B. "Project Name", "Resource Name", "Start Date")
- Wenn eine Quellspalte ein Custom Field ist → targetField = "cf:<NameDesCustomFields>" (z.B. "cf:Brand", "cf:Site Code")
- targetEntity = der Template-Typ: "customFields", "resources", "projects", "assignments", "adminTimes", "skills", "sheetData", "advancedRates", "financials", "teamResources"

═══ CUSTOM FIELDS / ATTRIBUTE — KRITISCH ═══
Spalten, die KEINEM der oben gelisteten Template-Spaltennamen entsprechen, sind fast immer Custom Fields (Attribute).

Erkennungsmuster:
- Sheet heisst "Project Portfolio ID" → alle Spalten darin sind Projekt-Attribute (Custom-Field-WERTE)
- Spaltenname enthält typische Attributnamen: "Site", "Brand", "UF", "Class", "Priority", "Status", "Category", etc.
- Spalte hat wenige wiederkehrende Werte → wahrscheinlich Selection/Enum Custom Field
- Spalte hat freie Texte → Text Custom Field
- Spalte hat Zahlen → Number Custom Field
- Spalte hat Datum → Date Custom Field
- Spalte hat nur ja/nein, true/false, active/inactive → Boolean Custom Field

Für jedes erkannte Custom Field MUSST du angeben:
- isCustomField: true
- suggestedCustomFieldName: Der Name, unter dem das CF in Tempus existiert oder angelegt werden soll
- suggestedDataType: "Text" | "Number" | "Date" | "Boolean" | "Selection"
- Bei Selection: Die einzigartigen Werte als mögliche enumMembers auflisten im reasoning

PRÜFE IMMER: Existiert das Custom Field bereits in den vorhandenen Tempus-Daten (CUSTOM FIELDS Liste)?
- JA → isNew=false, suggestedAction='match_existing', verwende den exakten Tempus-Namen
- NEIN → isNew=true, suggestedAction='create_new', schlage Name + DataType vor

═══ ENTITY-MATCHING (entityMappings) — KRITISCH ═══
Für JEDEN einzigartigen Wert in Name-/Referenz-Spalten:
1. Vergleiche mit ALLEN vorhandenen Tempus-Daten (Projects, Resources, Tasks, Skills, AdminTimes, Assignments, etc.)
2. Existiert der Wert in Tempus? → isNew=false, suggestedAction='match_existing', suggestedMatch=<Tempus-Name>
3. Existiert NICHT in Tempus? → isNew=true, suggestedAction='create_new'
4. Unsicher? → suggestedAction='needs_review'

═══ MATCHING-STRATEGIE (INTELLIGENZ-EBENEN) ═══

EBENE 1 — EXAKTER MATCH (Confidence 0.95-1.0):
  Name/Wert ist identisch mit Tempus-Entität.

EBENE 2 — NORMALISIERTER MATCH (Confidence 0.85-0.95):
  Gleich nach Bereinigung: Gross/Klein, Leerzeichen, Umlaute, Bindestriche.
  "project name" = "Project Name" = "ProjectName"

EBENE 3 — SEMANTISCHER MATCH (Confidence 0.7-0.85):
  Inhaltlich gleich, andere Benennung:
  - "HR" = "Human Resources"
  - "PM" = "Project Manager" oder "Product Management"
  - "QC" = "Quality Control"
  - "UF" = "Unit Function"
  - "SAB" = Standort/Site-Abkürzung
  - "SQP" = Qualitätsprogramm-Abkürzung
  Berücksichtige: Branchen-Jargon, Firmen-interne Abkürzungen, Akronyme

EBENE 4 — FUZZY MATCH (Confidence 0.5-0.7):
  Ähnlich aber nicht sicher: Tippfehler, Teilübereinstimmung, Abkürzungen.
  "Proj Alpha" ≈ "Project Alpha"
  "J.Smith" ≈ "John Smith"

EBENE 5 — KONTEXT-INFERENZ (Confidence 0.4-0.6):
  Aus dem Kontext des Sheets ableitbar:
  - Sheet hat "Project" im Namen → "Name"-Spalte ist projectName → targetField="Project Name"
  - Sheet hat Resource-ähnliche Daten → "Name" ist targetField="Resource Name"
  - Spalte neben "Project Name" mit Datumsformat → wahrscheinlich targetField="Start Date" oder "End Date"

EBENE 6 — NEUANLAGE (isNew=true):
  Kein Match gefunden → suggestedAction: 'create_new'
  Confidence basierend auf Datenqualität der Quelle.

═══ KRITISCH: PROJEKT-ATTRIBUTE vs. FINANCIALS ═══
HÄUFIGER FEHLER: Spalten wie "Budget", "Cost", "Revenue", "Forecast" in einem Projekt-Sheet sind KEINE Financials-Entitäten!
Sie sind PROJEKT-CUSTOM-FIELDS (Attribute), die als zusätzliche Spalten im Projects-Template erscheinen.

REGEL: Wenn ein Sheet eine "Project Name"/"Projekt"-Spalte hat UND finanzielle Spalten enthält:
→ Das Sheet ist ein PROJECTS-Sheet
→ Die finanziellen Spalten sind targetEntity="projects", targetField="cf:<Spaltenname>"
→ Das Custom Field muss als Attribut angelegt werden (entityType="Project")
→ Es ist KEIN Financials-Template-Import!

Financials-Template wird NUR verwendet wenn:
- Das Sheet KEINE Projekt-Definitions-Spalten hat (kein Start/End Date etc.)
- Stattdessen: Project-Referenz + Category + Type + Time Period + Project Cost
- Es sich um ZEITREIHEN-Finanzdaten handelt (monatliche Ist/Plan-Kosten)

═══ SHEET-ÜBERGREIFENDE INTELLIGENZ ═══
- Wenn Sheet 1 Projekte definiert und Sheet 2 die gleichen Projektnamen referenziert → Beziehung erkennen
- "Functions and Roles" Sheet → Daten für Resources oder Skills
- "Scoring" / "Financial Summary" Sheet → Wahrscheinlich Projekt-Custom-Fields, NICHT Financials
- Gleiche Werte in verschiedenen Sheets = Referenz-Beziehung

═══ REGELN (UNBEDINGT BEFOLGEN) ═══
1. JEDE Spalte MUSS zugeordnet werden — lieber unsicher (niedrige Confidence) als gar nicht
2. targetField MUSS ein exakter Template-Spaltenname sein ODER "cf:<Name>" für Custom Fields
3. Kontext des GESAMTEN Sheets beachten (Sheet-Name, andere Spalten, Zeilenzahl)
4. Custom Fields sind KEIN Fehler — sie sind ein zentraler Bestandteil von Tempus
5. Bei Enum/Auswahl-Spalten: Werte mit vorhandenen Custom-Field enumMembers vergleichen
6. Transformationen vorschlagen: Datumsformate, Einheiten, Status-Mapping, Enum-Zuordnung
7. Begründung (reasoning) für JEDE Zuordnung — kurz aber nachvollziehbar
8. Spalten mit >90% null/leer: Trotzdem zuordnen, aber niedrige Relevanz
9. "[object Object]" als Wert = Parsing-Fehler, ignorieren
10. entityMappings: JEDER einzigartige Wert in Name-Spalten MUSS gegen Tempus-Daten geprüft werden`;

const DISAMBIGUATION_SYSTEM_PROMPT = `Du löst ambigue Entity-Matches auf.
Für jeden Fall bekommst du einen Quellwert und die Top-Kandidaten mit Ähnlichkeits-Score.

Deine Aufgabe:
1. Entscheide welcher Kandidat der richtige Match ist, ODER
2. Markiere als isNew=true wenn keiner passt (neues Element anlegen)

Berücksichtige:
- Abkürzungen (J. Smith = John Smith, Proj = Project)
- Umlaute und Tippfehler
- Kontext (Sheet-Name, Spalten-Name, Entity-Typ)
- Branchenübliche Abkürzungen

Antworte für JEDEN Fall mit idx, resolvedName, resolvedId, confidence, isNew und reasoning.`;
