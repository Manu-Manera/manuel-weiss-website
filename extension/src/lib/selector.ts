/**
 * Selector-Heuristik:
 *
 * Reihenfolge nach Robustheit:
 *   1. data-testid / data-test / data-cy
 *   2. role + accessible name
 *   3. id (wenn nicht offensichtlich generiert)
 *   4. aria-label
 *   5. tag + textContent (kurz)
 *   6. CSS-Pfad (DOM-Position als letzter Ausweg)
 *
 * Liefert immer ein Array – das erste Match wird beim Replay verwendet,
 * weitere Matches dienen als Fallbacks falls der Tempus-DOM sich ändert.
 */

const TEST_ATTRS = ['data-testid', 'data-test', 'data-cy', 'data-qa'];
const NOISY_ID_PATTERN = /^(ember|mat|cdk|ng|react|sf|emotion|css|MuiBox|x-)/i;
const RANDOM_LIKE = /[a-z0-9]{6,}/i;

function escapeAttr(value: string): string {
  return value.replace(/"/g, '\\"');
}

function trimText(s: string): string {
  return s.trim().replace(/\s+/g, ' ').slice(0, 60);
}

function isUseableId(id: string): boolean {
  if (!id) return false;
  if (NOISY_ID_PATTERN.test(id)) return false;
  if (RANDOM_LIKE.test(id) && id.length > 12) return false;
  return true;
}

function getAccessibleName(el: Element): string | null {
  const aria = el.getAttribute('aria-label');
  if (aria) return trimText(aria);
  const labelledby = el.getAttribute('aria-labelledby');
  if (labelledby) {
    const ref = document.getElementById(labelledby);
    if (ref) return trimText(ref.textContent ?? '');
  }
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
    const id = el.id;
    if (id) {
      const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (label) return trimText(label.textContent ?? '');
    }
  }
  const text = trimText(el.textContent ?? '');
  if (text && text.length <= 40) return text;
  return null;
}

function getRole(el: Element): string {
  const role = el.getAttribute('role');
  if (role) return role;
  const tag = el.tagName.toLowerCase();
  if (tag === 'a') return 'link';
  if (tag === 'button') return 'button';
  if (tag === 'input') {
    const type = (el as HTMLInputElement).type || 'text';
    if (type === 'checkbox' || type === 'radio' || type === 'button' || type === 'submit') return type;
    return 'textbox';
  }
  if (tag === 'textarea') return 'textbox';
  if (tag === 'select') return 'combobox';
  return tag;
}

function buildCssPath(el: Element): string {
  const stack: string[] = [];
  let cur: Element | null = el;
  while (cur && cur.nodeType === Node.ELEMENT_NODE) {
    let part = cur.tagName.toLowerCase();
    const parent = cur.parentElement;
    if (parent) {
      const same = Array.from(parent.children).filter((c) => c.tagName === cur!.tagName);
      if (same.length > 1) {
        const idx = same.indexOf(cur) + 1;
        part += `:nth-of-type(${idx})`;
      }
    }
    stack.unshift(part);
    if (cur.id && isUseableId(cur.id)) {
      stack[0] = `#${CSS.escape(cur.id)} ${stack.slice(1).join(' > ')}`.trim();
      break;
    }
    cur = cur.parentElement;
    if (stack.length > 6) break;
  }
  return stack.join(' > ');
}

function uniqueOnPage(selector: string): boolean {
  try {
    return document.querySelectorAll(selector).length === 1;
  } catch {
    return false;
  }
}

export function buildSelectors(el: Element): string[] {
  const result: string[] = [];

  for (const attr of TEST_ATTRS) {
    const value = el.getAttribute(attr);
    if (value) {
      const sel = `[${attr}="${escapeAttr(value)}"]`;
      if (uniqueOnPage(sel)) result.push(sel);
    }
  }

  if (isUseableId(el.id)) {
    const sel = `#${CSS.escape(el.id)}`;
    if (uniqueOnPage(sel)) result.push(sel);
  }

  const aria = el.getAttribute('aria-label');
  if (aria) {
    const sel = `${el.tagName.toLowerCase()}[aria-label="${escapeAttr(aria)}"]`;
    if (uniqueOnPage(sel)) result.push(sel);
  }

  const role = getRole(el);
  const name = getAccessibleName(el);
  if (name && name.length <= 40) {
    const tag = el.tagName.toLowerCase();
    const sel = `${tag}:has-text("${escapeAttr(name)}")`;
    result.push(sel);
    if (role && role !== tag) {
      result.push(`[role="${role}"]:has-text("${escapeAttr(name)}")`);
    }
  }

  const cssPath = buildCssPath(el);
  if (cssPath) result.push(cssPath);

  return Array.from(new Set(result));
}

/**
 * Sucht einen Treffer für eine Selector-Liste. Unterstützt :has-text() Pseudo-Selector
 * (wie Playwright), das nicht nativ in querySelector verfügbar ist.
 */
export function findElement(selectors: string[], textHint?: string): HTMLElement | null {
  for (const sel of selectors) {
    const el = resolveSelector(sel, textHint);
    if (el) return el;
  }
  if (textHint) {
    const el = findByText(textHint);
    if (el) return el;
  }
  return null;
}

function resolveSelector(selector: string, textHint?: string): HTMLElement | null {
  const hasTextMatch = /:has-text\("(.+?)"\)/.exec(selector);
  if (hasTextMatch) {
    const base = selector.replace(/:has-text\(".+?"\)/, '').trim() || '*';
    const text = hasTextMatch[1];
    try {
      const candidates = document.querySelectorAll<HTMLElement>(base);
      for (const c of candidates) {
        if (c.textContent && c.textContent.trim().toLowerCase().includes(text.toLowerCase())) {
          return c;
        }
      }
    } catch {
      return null;
    }
    return null;
  }
  try {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) return el;
  } catch {
    return null;
  }
  if (textHint) {
    return findByText(textHint);
  }
  return null;
}

function findByText(text: string): HTMLElement | null {
  const lower = text.trim().toLowerCase();
  if (!lower) return null;
  const interactive = document.querySelectorAll<HTMLElement>('a, button, [role="button"], [role="link"], [role="tab"], [role="menuitem"]');
  for (const el of interactive) {
    if (el.textContent && el.textContent.trim().toLowerCase().includes(lower)) {
      return el;
    }
  }
  return null;
}

export function isElementVisible(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  const style = window.getComputedStyle(el);
  if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') return false;
  return true;
}
