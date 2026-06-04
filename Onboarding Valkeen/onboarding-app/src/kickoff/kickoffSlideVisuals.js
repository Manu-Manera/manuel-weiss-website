/** Welche Folie zeigt welches Schaubild (slide id aus kickoff-deck.json) */
const SLIDE_VISUALS = {
  agenda: 'agenda',
  'impl-phases': 'phases',
  partnership: 'partnership',
  'scope-theory': 'modules',
  'integrated-process': 'integratedProcess',
  'role-concept': 'roleConcept',
  'capacity-theory': 'capacity',
  'integrations-theory': 'integrationTiles',
};

export function visualIdForSlide(slideId) {
  return SLIDE_VISUALS[slideId] || null;
}
