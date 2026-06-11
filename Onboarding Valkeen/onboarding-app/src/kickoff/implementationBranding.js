/**
 * Pro-Kunde-Branding (White-Label) für den Implementation Workspace.
 * Wird als session.branding gespeichert und als CSS-Variablen angewendet.
 */

export const BG_PRESETS = {
  'valkeen-dark': {
    label: 'Valkeen Dunkel',
    css: 'radial-gradient(1200px 800px at 15% -10%, #0d2a24 0%, transparent 55%), radial-gradient(1000px 700px at 110% 10%, #112033 0%, transparent 50%), #070b10',
  },
  midnight: {
    label: 'Mitternacht',
    css: 'radial-gradient(1200px 800px at 20% -10%, #1a1346 0%, transparent 55%), #06070d',
  },
  slate: {
    label: 'Schiefer',
    css: 'linear-gradient(160deg, #0f172a 0%, #111827 100%)',
  },
  graphite: {
    label: 'Graphit',
    css: 'linear-gradient(160deg, #0b0f14 0%, #161b22 100%)',
  },
  light: {
    label: 'Hell',
    css: 'linear-gradient(160deg, #eef2f7 0%, #e5ebf3 100%)',
  },
};

export const FONT_PRESETS = {
  inter: { label: 'Inter (Standard)', stack: "'Inter', system-ui, -apple-system, sans-serif" },
  system: { label: 'System', stack: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' },
  geist: { label: 'Geist / Modern', stack: "'Geist', 'Inter', system-ui, sans-serif" },
  serif: { label: 'Serif (seriös)', stack: "'Georgia', 'Times New Roman', serif" },
};

export const DEFAULT_BRANDING = {
  primaryColor: '#00a878',
  accentColor: '#7dffd4',
  textColor: '#eaf2ef',
  glassAlpha: 7, // 0–20 (%)
  radius: 22, // px
  font: 'inter',
  bgPreset: 'valkeen-dark',
  logoUrl: '', // Valkeen / Partner-Logo (oben links)
  customerLogoUrl: '', // Kundenlogo (oben rechts)
  footerText: 'Valkeen · Tempus Implementierung',
};

export function normalizeBranding(b) {
  const d = DEFAULT_BRANDING;
  const s = b || {};
  const clampNum = (v, min, max, def) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
  };
  return {
    primaryColor: s.primaryColor || d.primaryColor,
    accentColor: s.accentColor || d.accentColor,
    textColor: s.textColor || d.textColor,
    glassAlpha: clampNum(s.glassAlpha, 0, 20, d.glassAlpha),
    radius: clampNum(s.radius, 0, 36, d.radius),
    font: FONT_PRESETS[s.font] ? s.font : d.font,
    bgPreset: BG_PRESETS[s.bgPreset] ? s.bgPreset : d.bgPreset,
    logoUrl: s.logoUrl || '',
    customerLogoUrl: s.customerLogoUrl || '',
    footerText: s.footerText ?? d.footerText,
  };
}

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  if (!m) return { r: 0, g: 168, b: 120 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

/** CSS-Variablen für einen Container aus dem Branding ableiten. */
export function brandingCssVars(branding) {
  const b = normalizeBranding(branding);
  const p = hexToRgb(b.primaryColor);
  const a = hexToRgb(b.accentColor);
  const isLight = b.bgPreset === 'light';
  return {
    '--impl-primary': b.primaryColor,
    '--impl-primary-rgb': `${p.r} ${p.g} ${p.b}`,
    '--impl-accent': b.accentColor,
    '--impl-accent-rgb': `${a.r} ${a.g} ${a.b}`,
    '--impl-text': isLight ? '#1a2230' : b.textColor,
    '--impl-text-soft': isLight ? 'rgba(26,34,48,0.66)' : 'rgba(234,242,239,0.66)',
    '--impl-glass': `rgba(${isLight ? '255 255 255' : '255 255 255'} / ${b.glassAlpha / 100})`,
    '--impl-glass-strong': `rgba(${isLight ? '255 255 255' : '255 255 255'} / ${Math.min(
      0.9,
      (b.glassAlpha + 6) / 100
    )})`,
    '--impl-border': `rgba(${isLight ? '15 23 42' : '255 255 255'} / ${isLight ? 0.1 : 0.12})`,
    '--impl-radius': `${b.radius}px`,
    '--impl-font': FONT_PRESETS[b.font].stack,
    '--impl-bg': BG_PRESETS[b.bgPreset].css,
  };
}
