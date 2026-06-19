/** Valkeen-Mark aus Valkeen_2026_Master.pptx (image1.png) */
export default function KickoffBrandLogo({ compact = false }) {
  const base = import.meta.env.BASE_URL || '/onboarding/';
  const markSrc = `${base}kickoff/valkeen-mark.png`;

  return (
    <div className="kickoff-brand-logo" aria-label="Valkeen">
      <img src={markSrc} alt="" width={120} height={32} decoding="async" />
      {!compact && (
        <>
          <span className="kickoff-brand-logo-divider" aria-hidden />
          <span className="kickoff-brand-logo-product">Tempus Resource</span>
        </>
      )}
    </div>
  );
}
