/**
 * Typsichere Nachrichten-Definitionen zwischen Service Worker, Content-Script,
 * Side Panel, Modal und externen Web-Pages (Onboarding-App).
 */

import type { Tour, Slide, Branding, RecorderStep, AuthState } from './types';

export type RuntimeMessage =
  /* === Onboarding-App → Extension (externally_connectable) === */
  | { type: 'EXT_PING' }
  | { type: 'EXT_AUTH'; token: string; customerId: string; userId: string; role: 'trainee' | 'trainer' | 'admin'; expiresAt: number }
  | { type: 'EXT_START_TOUR'; tourId: string; customerId: string }
  | { type: 'EXT_STOP_TOUR' }
  | { type: 'EXT_OPEN_RECORDER' }
  | { type: 'EXT_GET_RECORDING' }
  | {
      type: 'EXT_MOUSE_DRAG';
      drags: Array<{ fromX: number; fromY: number; toX: number; toY: number }>;
      steps?: number;
      stepDelayMs?: number;
      pauseBeforeMs?: number;
      pauseAfterMs?: number;
      tabId?: number;
    }
  | { type: 'EXT_MOUSE_PICK_COORD'; tabId?: number }
  /* === Service Worker → Content-Script (Maus) === */
  | {
      type: 'MOUSE_DRAG';
      drags: Array<{ fromX: number; fromY: number; toX: number; toY: number }>;
      steps?: number;
      stepDelayMs?: number;
      pauseBeforeMs?: number;
      pauseAfterMs?: number;
    }
  | { type: 'MOUSE_PICK_COORD' }
  | { type: 'MOUSE_PICK_RESULT'; x: number; y: number }
  | { type: 'MOUSE_DRAG_RESULT'; result: { ok: boolean; error?: string; stepsRun: number; lastElement?: string } }
  /* === Popup/Side-Panel → Service Worker === */
  | { type: 'GET_AUTH' }
  | { type: 'CLEAR_AUTH' }
  | { type: 'GET_ACTIVE_TOUR' }
  | { type: 'START_TOUR_LOCAL'; tourId: string; customerId: string }
  | { type: 'STOP_TOUR_LOCAL' }
  | { type: 'GET_TOUR_DATA'; tourId: string; customerId: string }
  | { type: 'GET_SLIDE'; slideId: string; customerId: string }
  | { type: 'GET_BRANDING'; customerId: string }
  | { type: 'CAPTURE_SCREENSHOT' }
  | { type: 'TOGGLE_RECORDER'; on: boolean }
  | { type: 'RECORDER_PUSH_STEP'; step: RecorderStep }
  | { type: 'RECORDER_GET_STEPS' }
  | { type: 'RECORDER_CLEAR_STEPS' }
  | { type: 'PROGRESS_EVENT'; tourId: string; stepId: string; status: 'started' | 'completed' | 'skipped' | 'failed' | 'help' }
  /* === Service Worker → Content-Script === */
  | { type: 'TOUR_STATE'; tour: Tour | null; currentStepId: string | null; branding: Branding | null }
  | { type: 'SHOW_SLIDE'; slide: Slide; placement: 'modal' | 'sidepanel'; stepId: string }
  | { type: 'NEXT_STEP' }
  | { type: 'GO_TO_STEP'; stepId: string }
  | { type: 'RECORDER_MODE_CHANGED'; on: boolean }
  /* === Content-Script → Service Worker === */
  | { type: 'CS_READY'; url: string; subdomain: string }
  | { type: 'CS_STEP_RESULT'; stepId: string; result: 'completed' | 'failed' | 'skipped'; meta?: Record<string, unknown> }
  | { type: 'CS_USER_REQUEST_HELP'; stepId: string }
  | { type: 'CS_USER_NEXT'; stepId: string };

export type RuntimeResponse<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export const MSG_PORT_NAME = 'tempus-trainer';
