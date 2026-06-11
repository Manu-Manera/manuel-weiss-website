import { useState } from 'react';
import { Copy, Sparkles, Lightbulb, Check, Loader2 } from 'lucide-react';
import { ui } from './kickoffStudioI18n';
import { hintForSlide, gammaInstructionsForSlide } from './kickoffSlideDesignHints';
import { slideToGammaBrief } from './kickoffStudioGamma';
import { requestGammaSlideDesign, resolveEditPassword } from './kickoffStudioService';

export default function KickoffSlideDesignPanel({
  slide,
  locale,
  customer,
  onApplyCards,
  password,
  onGammaUrl,
}) {
  const t = (k) => ui(locale, k);
  const hint = hintForSlide(slide?.id, locale);
  const [copied, setCopied] = useState(false);
  const [gammaLoading, setGammaLoading] = useState(false);
  const [gammaErr, setGammaErr] = useState('');

  if (!hint && !slide) return null;

  const copyGammaBrief = async () => {
    const text = slideToGammaBrief(slide, locale, customer);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runGammaSlide = async () => {
    setGammaLoading(true);
    setGammaErr('');
    try {
      const res = await requestGammaSlideDesign(
        { slide, locale, customer },
        resolveEditPassword(password)
      );
      if (res.gammaUrl) onGammaUrl?.(res.gammaUrl);
      else if (res.error) setGammaErr(res.error);
    } catch (e) {
      const msg = e.message || '';
      setGammaErr(
        msg.includes('Load failed') || msg.includes('Failed to fetch')
          ? t('gammaLoadFailed')
          : msg || t('gammaUnavailable')
      );
    } finally {
      setGammaLoading(false);
    }
  };

  return (
    <aside className="kickoff-design-panel">
      <div className="kickoff-design-panel-head">
        <Lightbulb className="w-4 h-4 text-amber-300" />
        <span>{t('designPanelTitle')}</span>
      </div>
      {hint?.summary && <p className="kickoff-design-panel-summary">{hint.summary}</p>}
      {hint?.tips?.length > 0 && (
        <ul className="kickoff-design-panel-tips">
          {hint.tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      )}
      <p className="kickoff-design-panel-gamma-label">{t('designPanelGamma')}</p>
      <p className="kickoff-design-panel-gamma-hint text-xs text-white/45">
        {gammaInstructionsForSlide(slide, locale).slice(0, 180)}…
      </p>
      <div className="kickoff-design-panel-actions">
        <button type="button" className="kickoff-btn-secondary text-xs" onClick={onApplyCards}>
          {t('designApplyCards')}
        </button>
        <button type="button" className="kickoff-btn-secondary text-xs" onClick={copyGammaBrief}>
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {t('designCopyGamma')}
        </button>
        <button
          type="button"
          className="kickoff-btn-primary text-xs"
          onClick={runGammaSlide}
          disabled={gammaLoading}
        >
          {gammaLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          {gammaLoading ? t('gammaRunning') : t('designGammaOneSlide')}
        </button>
      </div>
      {gammaErr && <p className="text-xs text-amber-300 mt-2">{gammaErr}</p>}
    </aside>
  );
}
