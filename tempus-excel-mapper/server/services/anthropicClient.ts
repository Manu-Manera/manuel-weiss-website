import Anthropic from '@anthropic-ai/sdk';
import type { SheetAnalysis, ColumnAnalysis } from '../types.js';

const ANALYSIS_TOOL = {
  name: 'analyze_excel_structure' as const,
  description: 'Analyze Excel structure and classify columns for Tempus import mapping',
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
              enum: ['projects', 'resources', 'tasks', 'assignments', 'customFields', 'skills', 'adminTimes', 'mixed', 'unknown'],
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
  description: 'Generate mapping suggestions from source Excel columns to Tempus target fields',
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
            targetEntity: { type: 'string' as const },
            targetField: { type: 'string' as const },
            confidence: { type: 'number' as const },
            reasoning: { type: 'string' as const },
            transformation: { type: 'string' as const },
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
      system: `Du bist ein Experte für Datenanalyse im Kontext von Projektmanagement- und Ressourcenplanungs-Systemen.
Deine Aufgabe: Analysiere Excel-Datenstrukturen und klassifiziere Spalten für den Import in Tempus (ProSymmetry).

Tempus-Entitäten: Projects (name, startDate, endDate, priority, phase), Resources (name, role, rate, capacity),
Tasks (projectId, name, startDate, duration, planType), Assignments (taskId, resourceId, allocations),
CustomFields (entityType, name, dataType, enumMembers), Skills, AdminTimes, Milestones.

Klassifiziere jede Spalte nach ihrer Bedeutung und schlage das passende Tempus-Feld vor.
Erkenne Beziehungen zwischen Sheets (z.B. Projekt-Referenzen in Task-Sheets).`,
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

  async generateMappingSuggestions(
    sourceSheets: Array<{ sheetName: string; columns: ColumnAnalysis[]; sampleRows: Record<string, unknown>[] }>,
    tempusSchema: {
      projects: Array<{ id: number; name: string }>;
      resources: Array<{ id: number; name: string }>;
      tasks: Array<{ id: number; name: string; projectId: number }>;
      customFields: Array<{ id: number; name: string; entityType: string; dataType: string; enumMembers?: Array<{ name: string }> }>;
      roles: Array<{ id: number; name: string }>;
    }
  ): Promise<{
    fieldMappings: Array<{
      sourceSheet: string;
      sourceColumn: string;
      targetEntity: string;
      targetField: string;
      confidence: number;
      reasoning: string;
      transformation?: string;
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
    }>;
    summary: string;
  }> {
    const prompt = `Erstelle Mapping-Vorschläge für den Import dieser Excel-Daten in Tempus.

QUELLE (Excel-Sheets):
${JSON.stringify(sourceSheets.map(s => ({
  name: s.sheetName,
  columns: s.columns.map(c => ({ name: c.name, type: c.inferredType, samples: c.sampleValues.slice(0, 3) })),
  rows: s.sampleRows.slice(0, 5),
})), null, 2)}

ZIEL (vorhandene Tempus-Daten):
- Projekte: ${JSON.stringify(tempusSchema.projects.slice(0, 50).map(p => ({ id: p.id, name: p.name })))}
- Ressourcen: ${JSON.stringify(tempusSchema.resources.slice(0, 50).map(r => ({ id: r.id, name: r.name })))}
- CustomFields: ${JSON.stringify(tempusSchema.customFields.map(cf => ({ id: cf.id, name: cf.name, entity: cf.entityType, type: cf.dataType, values: cf.enumMembers?.map(e => e.name) })))}
- Rollen: ${JSON.stringify(tempusSchema.roles.map(r => ({ id: r.id, name: r.name })))}

Regeln:
1. Mappe Quellspalten auf Tempus-Zielfelder (fieldMappings)
2. Mappe Werte auf existierende Tempus-Entitäten – priorisiere exakte und ähnliche Matches (entityMappings)
3. Markiere Werte, die keine Entsprechung haben, als isNew=true
4. Gib für jeden Vorschlag eine Confidence (0-1) und Begründung an
5. Schlage Transformationen vor wenn nötig (z.B. Datumsformat, Status-Mapping)`;

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: `Du bist ein Mapping-Experte für Datenimport in Tempus (ProSymmetry Supergrid).
Erstelle präzise, begründete Mapping-Vorschläge. Priorisiere exakte Matches über Fuzzy-Matches.
Für Werte ohne Entsprechung: schlage Neuanlage vor (isNew=true).`,
      messages: [{ role: 'user', content: prompt }],
      tools: [MAPPING_TOOL],
      tool_choice: { type: 'tool' as const, name: 'generate_mapping_suggestions' },
    });

    const toolBlock = response.content.find(b => b.type === 'tool_use');
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      throw new Error('Unerwartete AI-Antwort: kein Tool-Output');
    }

    return toolBlock.input as ReturnType<AnthropicClient['generateMappingSuggestions']> extends Promise<infer T> ? T : never;
  }
}
