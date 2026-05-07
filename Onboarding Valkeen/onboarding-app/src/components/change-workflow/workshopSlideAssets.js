/** Importierte Foliengrafiken aus src/assets/workshop-slide/ — Dateiname ohne Endung = Diagramm-ID (z. B. kotter-8.webp). */
const MODULES = import.meta.glob('../../assets/workshop-slide/*.{webp,png,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

function diagramIdFromPath(key) {
  const seg = key.split('/').pop() || '';
  return seg.replace(/\.(webp|png|svg)$/i, '');
}

/** @type {Record<string, string>} */
export const WORKSHOP_SLIDE_URL_BY_ID = Object.fromEntries(
  Object.entries(MODULES)
    .map(([path, url]) => {
      const id = diagramIdFromPath(path);
      if (!id || id === 'ASSET_INFO') return null;
      return typeof url === 'string' ? [id, url] : null;
    })
    .filter(Boolean)
);

export function getWorkshopSlideUrl(diagramId) {
  return WORKSHOP_SLIDE_URL_BY_ID[diagramId] || null;
}
