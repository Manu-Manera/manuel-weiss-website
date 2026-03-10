// ── Tempus Entity Types ──────────────────────────────────────────────

export interface TempusProject {
  id: number;
  name: string;
  startDate?: string;
  endDate?: string;
  externalId?: string;
  isLocked?: boolean;
  customFieldValues?: Record<string, unknown>;
}

export interface TempusResource {
  id: number;
  name: string;
  globalRoleId?: number;
  defaultRate?: number;
  isEnabled?: boolean;
  externalId?: string;
  customFieldValues?: Record<string, unknown>;
}

export interface TempusTask {
  id: number;
  projectId: number;
  name: string;
  startDate?: string;
  duration?: number;
  planType?: string;
}

export interface TempusCustomField {
  id: number;
  name: string;
  entityType: string;
  dataType: string;
  enumMembers?: Array<{ enumMemberId: number; name: string }>;
  isRequired?: boolean;
  isUnique?: boolean;
  isReadOnly?: boolean;
}

export interface TempusAssignment {
  id: number;
  taskId: number;
  resourceId: number;
  plannedAllocations?: Array<{ month: string; value: number }>;
}

export interface TempusRole {
  id: number;
  name: string;
}

export interface TempusSkill {
  id: number;
  name: string;
  category?: string;
}

export interface TempusAdminTime {
  id: number;
  name: string;
  resourceId?: number;
  resourceName?: string;
}

export interface TempusSheetData {
  id: number;
  projectName?: string;
  taskName?: string;
  resourceName?: string;
  month?: string;
  value?: number;
  planType?: string;
}

export interface TempusAdvancedRate {
  id: number;
  resourceName?: string;
  projectName?: string;
  rate?: number;
  currency?: string;
  effectiveDate?: string;
}

export interface TempusFinancial {
  id: number;
  projectName?: string;
  month?: string;
  budget?: number;
  actual?: number;
  forecast?: number;
  type?: string;
}

export interface TempusTeamResource {
  id: number;
  teamName?: string;
  resourceName?: string;
  role?: string;
  allocationPercentage?: number;
}

export interface TempusData {
  projects: TempusProject[];
  resources: TempusResource[];
  tasks: TempusTask[];
  customFields: TempusCustomField[];
  assignments: TempusAssignment[];
  roles: TempusRole[];
  skills: TempusSkill[];
  adminTimes: TempusAdminTime[];
  sheetData: TempusSheetData[];
  advancedRates: TempusAdvancedRate[];
  financials: TempusFinancial[];
  teamResources: TempusTeamResource[];
  calendars: Array<{ id: number; name: string }>;
  fetchedAt: number;
}

// ── Parsed Excel Types ───────────────────────────────────────────────

export interface ParsedSheet {
  name: string;
  headerRow: number;
  headers: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
}

export interface ParsedExcel {
  fileName: string;
  sheets: ParsedSheet[];
}

// ── Analysis Types ───────────────────────────────────────────────────

export interface ColumnAnalysis {
  name: string;
  index: number;
  inferredType: 'string' | 'number' | 'date' | 'boolean' | 'mixed' | 'empty';
  sampleValues: unknown[];
  nullCount: number;
  totalCount: number;
  uniqueCount: number;
  classification?: string;
  suggestedTempusField?: string;
  confidence?: number;
  relevance?: 'high' | 'medium' | 'low';
  reasoning?: string;
  isCustomField?: boolean;
  customFieldEntityType?: string;
  customFieldName?: string;
}

export interface SheetAnalysis {
  sheetName: string;
  rowCount: number;
  columns: ColumnAnalysis[];
  suggestedEntity?: string;
  relationships?: Array<{
    sourceColumn: string;
    targetSheet?: string;
    targetColumn?: string;
    type: string;
  }>;
}

export interface AnalysisResult {
  fileName: string;
  sheets: SheetAnalysis[];
  aiInsights?: string;
}

// ── Mapping Types ────────────────────────────────────────────────────

export type MappingStatus = 'suggested' | 'confirmed' | 'rejected' | 'needs_review' | 'create_new';
export type MatchType = 'exact' | 'fuzzy' | 'ai_suggested' | 'user_confirmed' | 'new_entity';

export interface FieldMapping {
  id: string;
  sourceSheet: string;
  sourceColumn: string;
  targetEntity: string;
  targetField: string;
  matchType: MatchType;
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
  matchType: MatchType;
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

// ── Validation Types ─────────────────────────────────────────────────

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

// ── Session ──────────────────────────────────────────────────────────

export interface AppConfig {
  tempusBaseUrl: string;
  tempusApiKey: string;
  anthropicApiKey: string;
}

export interface ImportProgress {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
  created: number;
  skipped: number;
  failed: number;
  errors: string[];
}

export interface Session {
  id: string;
  createdAt: number;
  parsedExcel?: ParsedExcel;
  analysis?: AnalysisResult;
  tempusData?: TempusData;
  mappingResult?: MappingResult;
  validation?: ValidationResult;
  exportBuffer?: Buffer;
  importProgress?: ImportProgress;
}
