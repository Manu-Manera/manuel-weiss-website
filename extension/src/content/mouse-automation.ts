/**
 * Synthetische Maus-Aktionen per Viewport-Koordinaten (clientX/clientY).
 * Läuft im Content-Script auf Tempus-Tabs – Events sind nicht "trusted",
 * funktionieren aber bei vielen DnD-UIs (Pivot-Feldliste, Grid-Fill, …).
 */

export type DragStep = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
};

export type DragOptions = {
  steps?: number;
  stepDelayMs?: number;
  pauseBeforeMs?: number;
  pauseAfterMs?: number;
};

export type DragSequenceResult = {
  ok: boolean;
  error?: string;
  stepsRun: number;
  lastElement?: string;
};

const TEMPUS_HOST_RE = /\.(prosymmetry|tempus-resource)\.com$/i;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function clampCoord(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

function dispatchPointer(
  type: string,
  target: Element,
  x: number,
  y: number,
  buttons: number,
  button = 0
): void {
  const opts: PointerEventInit = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y,
    screenX: window.screenX + x,
    screenY: window.screenY + y,
    button,
    buttons,
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
    pressure: buttons ? 0.5 : 0
  };
  try {
    target.dispatchEvent(new PointerEvent(type, opts));
  } catch {
    /* ältere Builds */
  }
}

function dispatchMouse(
  type: string,
  target: Element,
  x: number,
  y: number,
  buttons: number,
  button = 0
): void {
  target.dispatchEvent(
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: x,
      clientY: y,
      screenX: window.screenX + x,
      screenY: window.screenY + y,
      button,
      buttons
    })
  );
}

function elementLabel(el: Element | null): string | undefined {
  if (!el) return undefined;
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : '';
  const cls =
    el.classList.length > 0
      ? `.${Array.from(el.classList).slice(0, 2).join('.')}`
      : '';
  return `${tag}${id}${cls}`;
}

export async function dragOnce(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  opts: DragOptions = {}
): Promise<DragSequenceResult> {
  const fx = clampCoord(fromX);
  const fy = clampCoord(fromY);
  const tx = clampCoord(toX);
  const ty = clampCoord(toY);
  const steps = Math.max(4, Math.min(80, opts.steps ?? 24));
  const stepDelayMs = Math.max(4, opts.stepDelayMs ?? 18);

  if (opts.pauseBeforeMs) await sleep(opts.pauseBeforeMs);

  const startEl = document.elementFromPoint(fx, fy);
  if (!startEl) {
    return { ok: false, error: `Kein Element bei (${fx}, ${fy})`, stepsRun: 0 };
  }

  dispatchPointer('pointerover', startEl, fx, fy, 0);
  dispatchPointer('pointerenter', startEl, fx, fy, 0);
  dispatchMouse('mouseover', startEl, fx, fy, 0);
  dispatchMouse('mouseenter', startEl, fx, fy, 0);

  dispatchPointer('pointerdown', startEl, fx, fy, 1, 0);
  dispatchMouse('mousedown', startEl, fx, fy, 1, 0);

  let lastEl = startEl;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = fx + (tx - fx) * t;
    const y = fy + (ty - fy) * t;
    const moveEl = document.elementFromPoint(x, y) ?? lastEl;
    lastEl = moveEl;
    dispatchPointer('pointermove', moveEl, x, y, 1, 0);
    dispatchMouse('mousemove', moveEl, x, y, 1, 0);
    if (stepDelayMs > 0) await sleep(stepDelayMs);
  }

  const endEl = document.elementFromPoint(tx, ty) ?? lastEl;
  dispatchPointer('pointermove', endEl, tx, ty, 1, 0);
  dispatchMouse('mousemove', endEl, tx, ty, 1, 0);
  dispatchPointer('pointerup', endEl, tx, ty, 0, 0);
  dispatchMouse('mouseup', endEl, tx, ty, 0, 0);
  dispatchPointer('pointerout', endEl, tx, ty, 0);
  dispatchMouse('mouseout', endEl, tx, ty, 0);

  if (opts.pauseAfterMs) await sleep(opts.pauseAfterMs);

  return {
    ok: true,
    stepsRun: steps,
    lastElement: elementLabel(endEl)
  };
}

export async function runDragSequence(
  drags: DragStep[],
  opts: DragOptions = {}
): Promise<DragSequenceResult> {
  if (!drags.length) {
    return { ok: false, error: 'Keine Züge definiert', stepsRun: 0 };
  }

  let totalSteps = 0;
  let lastElement: string | undefined;

  for (let i = 0; i < drags.length; i++) {
    const d = drags[i];
    const res = await dragOnce(d.fromX, d.fromY, d.toX, d.toY, {
      ...opts,
      pauseBeforeMs: i === 0 ? opts.pauseBeforeMs : opts.pauseAfterMs ?? 120,
      pauseAfterMs: i < drags.length - 1 ? opts.pauseAfterMs ?? 200 : opts.pauseAfterMs
    });
    if (!res.ok) return res;
    totalSteps += res.stepsRun;
    lastElement = res.lastElement;
  }

  return { ok: true, stepsRun: totalSteps, lastElement };
}

let pickMode = false;
let pickHandler: ((x: number, y: number) => void) | null = null;

export function setCoordinatePickMode(on: boolean, onPick?: (x: number, y: number) => void): void {
  pickMode = on;
  pickHandler = onPick ?? null;
  document.body.style.cursor = on ? 'crosshair' : '';
}

export function isCoordinatePickMode(): boolean {
  return pickMode;
}

export function installCoordinatePicker(): void {
  document.addEventListener(
    'click',
    (ev) => {
      if (!pickMode || !pickHandler) return;
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      pickHandler(ev.clientX, ev.clientY);
      setCoordinatePickMode(false);
    },
    true
  );
}

export function isTempusHost(): boolean {
  return TEMPUS_HOST_RE.test(location.hostname);
}
