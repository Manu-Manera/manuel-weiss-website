/**
 * Spiegel der Schema-Definitionen aus
 * Onboarding Valkeen/onboarding-app/src/data/trainingSchema.js – nur als TypeScript-Typen.
 */

export const SCHEMA_VERSION = 1;

export type StepKind =
  | 'theory'
  | 'highlight'
  | 'click'
  | 'input'
  | 'wait'
  | 'quiz'
  | 'checklist';

export type ValidationType =
  | 'manual-next'
  | 'url-contains'
  | 'url-equals'
  | 'element-exists'
  | 'element-removed'
  | 'input-equals'
  | 'click-target';

export type TipPosition =
  | 'top' | 'right' | 'bottom' | 'left'
  | 'top-start' | 'top-end'
  | 'right-start' | 'right-end'
  | 'bottom-start' | 'bottom-end'
  | 'left-start' | 'left-end';

export interface TargetSelector {
  selectors: string[];
  screenshot?: string;
  boundingHint?: { x: number; y: number; w: number; h: number };
  iframeSelector?: string;
  textHint?: string;
}

export interface TipDefinition {
  title: string;
  body: string;
  placement?: { position: TipPosition; offset?: number };
  media?: { type: 'image' | 'video'; src: string; caption?: string };
}

export interface StepValidation {
  type: ValidationType;
  value?: string;
  selector?: string;
  timeoutMs?: number;
}

export interface TourStep {
  id: string;
  kind: StepKind;
  slideId?: string;
  placement?: 'modal' | 'sidepanel';
  target?: TargetSelector;
  tip?: TipDefinition;
  validation?: StepValidation;
  next?: string;
  onFail?: string;
  tags?: string[];
}

export interface Tour {
  id: string;
  customerId: string;
  title: string;
  description?: string;
  domainHint?: string;
  audience?: string[];
  status: 'draft' | 'published';
  schemaVersion: number;
  coverImage?: string;
  estimatedDurationMin?: string;
  steps: TourStep[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface SlideBlock {
  id: string;
  type: 'heading' | 'text' | 'image' | 'video' | 'callout' | 'code' | 'quiz';
  text?: string;
  markdown?: string;
  src?: string;
  caption?: string;
  alt?: string;
  variant?: 'info' | 'warn' | 'success' | 'tip';
  language?: string;
  questions?: Array<{
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
  }>;
}

export interface Slide {
  id: string;
  customerId: string;
  title: string;
  subtitle?: string;
  blocks: SlideBlock[];
  estimatedReadSeconds?: number;
  voiceover?: { audioUrl: string; transcript: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Branding {
  customerId: string;
  customerName: string;
  logoUrl: string | null;
  accentColor: string;
  welcomeText: string;
  domainHint: string;
}

export interface CustomerIndexEntry {
  customerId: string;
  customerName: string;
  domainHint: string;
  active: boolean;
}

export interface CustomerIndex {
  schemaVersion: number;
  updatedAt: string;
  customers: CustomerIndexEntry[];
}

export interface ProgressEvent {
  timestamp: string;
  stepId: string;
  status: 'started' | 'completed' | 'skipped' | 'failed' | 'help';
  durationMs?: number;
  meta?: Record<string, unknown>;
}

export interface RecorderStep {
  id: string;
  selectors: string[];
  url: string;
  action: 'click' | 'input' | 'navigate';
  inputValue?: string;
  screenshotDataUrl?: string;
  timestamp: string;
  textHint?: string;
}

export interface AuthState {
  token: string | null;
  customerId: string | null;
  userId: string | null;
  role: 'trainee' | 'trainer' | 'admin' | null;
  expiresAt: number | null;
}
