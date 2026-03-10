import { create } from 'zustand';

export interface ColumnAnalysis {
  name: string;
  index: number;
  inferredType: string;
  sampleValues: unknown[];
  nullCount: number;
  totalCount: number;
  uniqueCount: number;
  classification?: string;
  suggestedTempusField?: string;
  confidence?: number;
  relevance?: string;
  reasoning?: string;
}

export interface SheetAnalysis {
  sheetName: string;
  rowCount: number;
  columns: ColumnAnalysis[];
  suggestedEntity?: string;
  relationships?: Array<{ sourceColumn: string; targetSheet?: string; targetColumn?: string; type: string }>;
}

export interface AnalysisResult {
  fileName: string;
  sheets: SheetAnalysis[];
  aiInsights?: string;
}

export type MappingStatus = 'suggested' | 'confirmed' | 'rejected' | 'needs_review' | 'create_new';

export interface FieldMapping {
  id: string;
  sourceSheet: string;
  sourceColumn: string;
  targetEntity: string;
  targetField: string;
  matchType: string;
  confidence: number;
  reasoning: string;
  status: MappingStatus;
  transformation?: string;
}

export interface EntityMapping {
  id: string;
  sourceSheet: string;
  sourceColumn: string;
  sourceValue: string;
  targetEntity: string;
  matchedName?: string;
  matchedId?: number;
  matchType: string;
  confidence: number;
  reasoning: string;
  status: MappingStatus;
  isNew: boolean;
}

export interface CustomFieldMapping {
  sourceColumn: string;
  sourceSheet: string;
  customFieldName: string;
  entityType: string;
  existsInTempus: boolean;
  tempusFieldId?: number;
  dataType: string;
  action: 'exists' | 'create';
}

export interface MappingResult {
  fieldMappings: FieldMapping[];
  entityMappings: EntityMapping[];
  customFieldMappings: CustomFieldMapping[];
  unmappedColumns: string[];
  summary: {
    totalFields: number;
    mappedFields: number;
    totalEntities: number;
    matchedEntities: number;
    newEntities: number;
    conflicts: number;
  };
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  sheet?: string;
  row?: number;
  column?: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  summary: { errors: number; warnings: number; infos: number };
  canExport: boolean;
  blockingIssues: string[];
}

export interface PeriodInterpretation {
  rawPattern: string;
  meaning: string;
  tempusTimePeriod: string;
  dateRange?: { start: string; end: string };
  confidence: number;
  reasoning: string;
}

export interface PhaseInterpretation {
  rawCode: string;
  meaning: string;
  tempusField: string;
  tempusValue: string;
  confidence: number;
  reasoning: string;
}

export interface PivotRecommendation {
  unpivotRequired: boolean;
  pivotColumns: string[];
  valueDescription: string;
  targetEntity: string;
}

export interface TemporalInterpretationResult {
  periodInterpretations: PeriodInterpretation[];
  phaseInterpretations: PhaseInterpretation[];
  pivotRecommendation?: PivotRecommendation;
  projectTimelineInsights: Array<{
    projectIdentifier: string;
    phases: Array<{ phase: string; period: string }>;
    overallStart?: string;
    overallEnd?: string;
  }>;
}

export interface TempusSyncSummary {
  projects: number;
  resources: number;
  tasks: number;
  customFields: number;
  assignments: number;
  roles: number;
  skills: number;
  adminTimes: number;
  sheetData: number;
  advancedRates: number;
  financials: number;
  teamResources: number;
  milestones: number;
  calendars: number;
}

interface AppState {
  // Config
  tempusBaseUrl: string;
  tempusApiKey: string;
  anthropicApiKey: string;
  configSaved: boolean;

  // Workflow
  currentStep: number;
  sessionId: string | null;

  // Data
  analysis: AnalysisResult | null;
  tempusSyncSummary: TempusSyncSummary | null;
  mappingResult: MappingResult | null;
  temporalInterpretation: TemporalInterpretationResult | null;
  aiStatus: string | null;
  validation: ValidationResult | null;
  exportReady: boolean;

  // Loading / Error
  loading: boolean;
  error: string | null;

  // Actions
  setConfig: (config: Partial<{ tempusBaseUrl: string; tempusApiKey: string; anthropicApiKey: string }>) => void;
  setConfigSaved: (saved: boolean) => void;
  setStep: (step: number) => void;
  setSessionId: (id: string) => void;
  setAnalysis: (a: AnalysisResult) => void;
  setTempusSyncSummary: (s: TempusSyncSummary) => void;
  setMappingResult: (m: MappingResult) => void;
  setTemporalInterpretation: (t: TemporalInterpretationResult | null) => void;
  updatePeriodInterpretation: (idx: number, updated: Partial<PeriodInterpretation>) => void;
  updatePhaseInterpretation: (idx: number, updated: Partial<PhaseInterpretation>) => void;
  setAiStatus: (s: string | null) => void;
  updateFieldMapping: (id: string, status: MappingStatus) => void;
  updateEntityMapping: (id: string, status: MappingStatus) => void;
  updateEntityMappingEntity: (id: string, targetEntity: string) => void;
  setValidation: (v: ValidationResult) => void;
  setExportReady: (ready: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  tempusBaseUrl: '',
  tempusApiKey: '',
  anthropicApiKey: '',
  configSaved: false,
  currentStep: 0,
  sessionId: null as string | null,
  analysis: null as AnalysisResult | null,
  tempusSyncSummary: null as TempusSyncSummary | null,
  mappingResult: null as MappingResult | null,
  temporalInterpretation: null as TemporalInterpretationResult | null,
  aiStatus: null as string | null,
  validation: null as ValidationResult | null,
  exportReady: false,
  loading: false,
  error: null as string | null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setConfig: (c) => set((s) => ({ ...s, ...c })),
  setConfigSaved: (saved) => set({ configSaved: saved }),
  setStep: (step) => set({ currentStep: step, error: null }),
  setSessionId: (id) => set({ sessionId: id }),
  setAnalysis: (a) => set({ analysis: a }),
  setTempusSyncSummary: (s) => set({ tempusSyncSummary: s }),
  setMappingResult: (m) => set({ mappingResult: m }),
  setTemporalInterpretation: (t) => set({ temporalInterpretation: t }),

  updatePeriodInterpretation: (idx, updated) => set((s) => {
    if (!s.temporalInterpretation) return s;
    const periodInterpretations = s.temporalInterpretation.periodInterpretations.map((p, i) =>
      i === idx ? { ...p, ...updated } : p
    );
    return { temporalInterpretation: { ...s.temporalInterpretation, periodInterpretations } };
  }),

  updatePhaseInterpretation: (idx, updated) => set((s) => {
    if (!s.temporalInterpretation) return s;
    const phaseInterpretations = s.temporalInterpretation.phaseInterpretations.map((p, i) =>
      i === idx ? { ...p, ...updated } : p
    );
    return { temporalInterpretation: { ...s.temporalInterpretation, phaseInterpretations } };
  }),

  setAiStatus: (s) => set({ aiStatus: s }),

  updateFieldMapping: (id, status) => set((s) => {
    if (!s.mappingResult) return s;
    const fieldMappings = s.mappingResult.fieldMappings.map(fm =>
      fm.id === id ? { ...fm, status, matchType: status === 'confirmed' ? 'user_confirmed' : fm.matchType } : fm
    );
    return { mappingResult: { ...s.mappingResult, fieldMappings } };
  }),

  updateEntityMapping: (id, status) => set((s) => {
    if (!s.mappingResult) return s;
    const entityMappings = s.mappingResult.entityMappings.map(em =>
      em.id === id ? { ...em, status, matchType: status === 'confirmed' ? 'user_confirmed' : em.matchType } : em
    );
    return { mappingResult: { ...s.mappingResult, entityMappings } };
  }),

  updateEntityMappingEntity: (id, targetEntity) => set((s) => {
    if (!s.mappingResult) return s;
    const entityMappings = s.mappingResult.entityMappings.map(em =>
      em.id === id ? { ...em, targetEntity } : em
    );
    return { mappingResult: { ...s.mappingResult, entityMappings } };
  }),

  setValidation: (v) => set({ validation: v }),
  setExportReady: (ready) => set({ exportReady: ready }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ ...initialState }),
}));
