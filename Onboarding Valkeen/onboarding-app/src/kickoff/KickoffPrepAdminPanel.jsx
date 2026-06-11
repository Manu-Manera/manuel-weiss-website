import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Link2, Loader2 } from 'lucide-react';
import { uiPrep } from './kickoffPrepI18n';
import {
  PREP_AUDIENCES,
  PREP_SALUTATIONS,
  salutationAdminLabel,
} from './kickoffPrepSalutation';
import {
  newPrepId,
  prepQuestionnaireUrl,
  prepWelcomeUrl,
} from './kickoffPrepShare';
import { adminUpsertPrep } from './kickoffPrepService';
import { resolveEditPassword } from './kickoffStudioService';

export default function KickoffPrepAdminPanel({ session, locale, editPassword, onSessionUpdate }) {
  const t = (k) => uiPrep(locale, k);
  const [prepId, setPrepId] = useState(session.prepId || '');
  const [salutation, setSalutation] = useState(session.prepSalutation || 'sie');
  const [audience, setAudience] = useState(session.prepAudience || 'team');
  const [customerPassword, setCustomerPassword] = useState('');
  const [status, setStatus] = useState(session.prepStatus || 'draft');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    setPrepId(session.prepId || '');
    setSalutation(session.prepSalutation || 'sie');
    setAudience(session.prepAudience || 'team');
    setStatus(session.prepStatus || 'draft');
  }, [session.prepId, session.prepSalutation, session.prepAudience, session.prepStatus]);

  const release = useCallback(async () => {
    setBusy(true);
    setErr('');
    const id = prepId || newPrepId();
    try {
      const pw = resolveEditPassword(editPassword);
      const payload = {
        prepId: id,
        customer: session.customer,
        locale: session.locale,
        tenantSlug: session.tenantSlug,
        linkLabel: session.linkLabel,
        includeIntegrations: session.includeIntegrations,
        linkedSessionId: session.sessionId,
        salutation,
        audience,
        accessPassword: customerPassword || undefined,
        access: {
          status: 'released',
          releasedAt: new Date().toISOString(),
          requiresPassword: !!(customerPassword || '').trim(),
        },
        answers: session.prepAnswers || {},
      };
      await adminUpsertPrep(payload, pw);
      setPrepId(id);
      setStatus('released');
      onSessionUpdate?.({
        prepId: id,
        prepSalutation: salutation,
        prepAudience: audience,
        prepStatus: 'released',
      });
      return id;
    } catch (e) {
      setErr(e.message);
      return null;
    } finally {
      setBusy(false);
    }
  }, [
    prepId,
    session,
    salutation,
    audience,
    customerPassword,
    editPassword,
  ]);

  const copyLink = async (which) => {
    const id = prepId || (await release());
    if (!id) return;
    const url = which === 'welcome' ? prepWelcomeUrl(id) : prepQuestionnaireUrl(id);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
    setCopied(which);
    setTimeout(() => setCopied(''), 2000);
  };

  const statusLabel =
    status === 'submitted'
      ? t('prepStatusSubmitted')
      : status === 'released'
        ? t('prepStatusReleased')
        : t('prepStatusDraft');

  return (
    <div className="kickoff-prep-admin-block">
      <p className="text-sm font-semibold text-white/90 m-0">{t('prepAdminTitle')}</p>
      <p className="kickoff-settings-hint">{t('prepAdminHint')}</p>

      <label className="block mt-3">
        <span className="text-xs text-white/60">{t('prepSalutation')}</span>
        <select
          className="kickoff-input mt-1"
          value={salutation}
          onChange={(e) => setSalutation(e.target.value)}
        >
          {PREP_SALUTATIONS.map((s) => (
            <option key={s} value={s}>
              {salutationAdminLabel(s, locale)}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="mt-3 border-0 p-0 m-0">
        <legend className="text-xs text-white/60 mb-1">{t('prepAudience')}</legend>
        <div className="flex flex-wrap gap-3">
          {PREP_AUDIENCES.map((a) => (
            <label key={a} className="kickoff-settings-toggle-row m-0">
              <input
                type="radio"
                name="prep-audience"
                checked={audience === a}
                onChange={() => setAudience(a)}
              />
              <span>
                {a === 'team' ? t('prepAudienceTeamOpt') : t('prepAudienceIndividualOpt')}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block mt-3">
        <span className="text-xs text-white/60">{t('prepCustomerPassword')}</span>
        <input
          type="password"
          className="kickoff-input mt-1"
          value={customerPassword}
          placeholder="optional"
          onChange={(e) => setCustomerPassword(e.target.value)}
        />
      </label>

      <div className="flex flex-wrap gap-2 mt-3 items-center">
        <button type="button" className="kickoff-btn-primary text-sm" onClick={release} disabled={busy}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
          {t('prepRelease')}
        </button>
        <span className="text-xs text-[#00a878]">{statusLabel}</span>
        {prepId && <span className="text-xs text-white/40 font-mono">{prepId}</span>}
      </div>

      {err && <p className="text-xs text-amber-300 mt-2">{err}</p>}

      {prepId && status === 'released' && (
        <div className="kickoff-prep-admin-links">
          <div>
            <span className="text-xs text-white/55">{t('prepWelcomeLink')}</span>
            <code>{prepWelcomeUrl(prepId)}</code>
            <button
              type="button"
              className="kickoff-btn-secondary text-xs mt-1"
              onClick={() => copyLink('welcome')}
            >
              {copied === 'welcome' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {t('prepCopyWelcome')}
            </button>
          </div>
          <div>
            <span className="text-xs text-white/55">{t('prepFormLink')}</span>
            <code>{prepQuestionnaireUrl(prepId)}</code>
            <button
              type="button"
              className="kickoff-btn-secondary text-xs mt-1"
              onClick={() => copyLink('form')}
            >
              {copied === 'form' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {t('prepCopyForm')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
