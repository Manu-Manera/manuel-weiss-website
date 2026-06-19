/**
 * Drag & Drop per Viewport-Koordinaten (clientX/clientY) auf der aktuellen Seite.
 */

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function clampCoord(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

function dispatchPointer(type, target, x, y, buttons, button = 0) {
  try {
    target.dispatchEvent(
      new PointerEvent(type, {
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
      })
    );
  } catch {
    /* ignore */
  }
}

function dispatchMouse(type, target, x, y, buttons, button = 0) {
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

function elementLabel(el) {
  if (!el) return undefined;
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : '';
  const cls = el.classList?.length
    ? `.${Array.from(el.classList).slice(0, 2).join('.')}`
    : '';
  return `${tag}${id}${cls}`;
}

/** Drag innerhalb eines Containers (relative Koordinaten). */
export async function simulateDragInElement(container, fromX, fromY, toX, toY, opts = {}) {
  const rect = container.getBoundingClientRect();
  return simulateDragAtViewport(
    rect.left + fromX,
    rect.top + fromY,
    rect.left + toX,
    rect.top + toY,
    opts
  );
}

/** Drag auf der aktuellen Seite an Viewport-Koordinaten. */
export async function simulateDragAtViewport(fromX, fromY, toX, toY, opts = {}) {
  const fx = clampCoord(fromX);
  const fy = clampCoord(fromY);
  const tx = clampCoord(toX);
  const ty = clampCoord(toY);
  const steps = Math.max(4, Math.min(80, opts.steps ?? 24));
  const stepDelayMs = Math.max(4, opts.stepDelayMs ?? 18);

  if (opts.pauseBeforeMs) await sleep(opts.pauseBeforeMs);

  const startEl = document.elementFromPoint(fx, fy);
  if (!startEl) {
    return { ok: false, error: `Kein Element bei (${fx}, ${fy})` };
  }

  dispatchPointer('pointerover', startEl, fx, fy, 0);
  dispatchMouse('mouseover', startEl, fx, fy, 0);
  dispatchPointer('pointerdown', startEl, fx, fy, 1);
  dispatchMouse('mousedown', startEl, fx, fy, 1);

  let lastEl = startEl;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = fx + (tx - fx) * t;
    const y = fy + (ty - fy) * t;
    const moveEl = document.elementFromPoint(x, y) ?? lastEl;
    lastEl = moveEl;
    dispatchPointer('pointermove', moveEl, x, y, 1);
    dispatchMouse('mousemove', moveEl, x, y, 1);
    await sleep(stepDelayMs);
  }

  const endEl = document.elementFromPoint(tx, ty) ?? lastEl;
  dispatchPointer('pointermove', endEl, tx, ty, 1);
  dispatchMouse('mousemove', endEl, tx, ty, 1);
  dispatchPointer('pointerup', endEl, tx, ty, 0);
  dispatchMouse('mouseup', endEl, tx, ty, 0);

  if (opts.pauseAfterMs) await sleep(opts.pauseAfterMs);

  return { ok: true, stepsRun: steps, lastElement: elementLabel(endEl) };
}

export async function runDragSequence(drags, opts = {}) {
  let totalSteps = 0;
  let lastElement;

  for (let i = 0; i < drags.length; i++) {
    const d = drags[i];
    const res = await simulateDragAtViewport(d.fromX, d.fromY, d.toX, d.toY, {
      steps: opts.steps,
      stepDelayMs: opts.stepDelayMs,
      pauseBeforeMs: i === 0 ? opts.pauseBeforeMs : opts.pauseBetweenMs ?? 120,
      pauseAfterMs: i < drags.length - 1 ? opts.pauseBetweenMs ?? 200 : opts.pauseAfterMs
    });
    if (!res.ok) return res;
    totalSteps += res.stepsRun ?? 0;
    lastElement = res.lastElement;
  }

  return { ok: true, stepsRun: totalSteps, lastElement };
}
