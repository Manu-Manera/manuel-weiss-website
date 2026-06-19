import { getPresentationSlides } from './kickoffStudioCatalog';

/** Master-Folien + Session-Anpassungen → effektives Deck für Anzeige & Export */
export function buildEffectiveDeck(masterSlides, session) {
  const hidden = new Set(session?.hiddenSlideIds || []);
  const overrides = session?.slideOverrides || {};
  const custom = session?.customSlides || [];
  const includeIntegrations = !!session?.includeIntegrations;

  const base = getPresentationSlides(masterSlides, includeIntegrations).map((s) => ({
    ...s,
    ...(overrides[s.id] || {}),
    _source: 'master',
  }));

  const customByInsert = new Map();
  const customEnd = [];
  for (const c of custom) {
    const slide = { ...c, _source: 'custom' };
    if (c.insertAfterId) {
      const list = customByInsert.get(c.insertAfterId) || [];
      list.push(slide);
      customByInsert.set(c.insertAfterId, list);
    } else {
      customEnd.push(slide);
    }
  }

  const merged = [];
  for (const s of base) {
    merged.push(s);
    const extras = customByInsert.get(s.id);
    if (extras) merged.push(...extras);
  }

  const parkingIdx = merged.findIndex((s) => s.id === 'parking-lot');
  if (parkingIdx >= 0) {
    merged.splice(parkingIdx, 0, ...customEnd);
  } else {
    merged.push(...customEnd);
  }

  return merged;
}

/** Folien für Präsentation (ohne ausgeblendete) */
export function getPresentationSlideList(masterSlides, session) {
  const hidden = new Set(session?.hiddenSlideIds || []);
  return buildEffectiveDeck(masterSlides, session).filter((s) => !hidden.has(s.id));
}

/** Alle Folien inkl. ausgeblendeter (Facilitator-Leiste) */
export function getRailSlideList(masterSlides, session) {
  return buildEffectiveDeck(masterSlides, session);
}

export function isSlideHidden(session, slideId) {
  return (session?.hiddenSlideIds || []).includes(slideId);
}

export function toggleSlideHidden(session, slideId) {
  const set = new Set(session?.hiddenSlideIds || []);
  if (set.has(slideId)) set.delete(slideId);
  else set.add(slideId);
  return [...set];
}

export function newCustomSlideId() {
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function defaultCustomSlide(insertAfterId = null) {
  return {
    id: newCustomSlideId(),
    kind: 'theory',
    section: 'core',
    layout: 'content',
    headline: 'Neue Folie',
    subline: '',
    bullets: ['Punkt 1', 'Punkt 2'],
    designStyle: 'cards',
    insertAfterId,
  };
}
