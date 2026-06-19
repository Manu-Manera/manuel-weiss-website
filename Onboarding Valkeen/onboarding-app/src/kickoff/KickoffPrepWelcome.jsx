import { ArrowRight, Users, User } from 'lucide-react';
import KickoffBrandLogo from './KickoffBrandLogo';
import {
  welcomeCtaLabel,
  welcomeHeadline,
  welcomeSubtitle,
} from './kickoffPrepSalutation';
import { uiPrep } from './kickoffPrepI18n';

export default function KickoffPrepWelcome({ prep, onContinue }) {
  const locale = prep?.locale || 'de';
  const salutation = prep?.salutation || 'sie';
  const audience = prep?.audience || 'team';
  const t = (k) => uiPrep(locale, k);

  const headline = welcomeHeadline(salutation, locale);
  const subtitle = welcomeSubtitle(audience, prep?.customer, salutation, locale);
  const cta = welcomeCtaLabel(salutation, locale);

  return (
    <div className="kickoff-prep-page">
      <header className="kickoff-prep-header">
        <KickoffBrandLogo className="kickoff-prep-logo" />
        {prep?.logoUrl && (
          <img src={prep.logoUrl} alt="" className="kickoff-prep-customer-logo" />
        )}
      </header>

      <main className="kickoff-prep-welcome-main">
        <div className="kickoff-prep-welcome-card">
          <p className="kickoff-prep-kicker">{t('prepWelcomeKicker')}</p>
          <h1 className="kickoff-prep-welcome-title">{headline}</h1>
          <p className="kickoff-prep-welcome-sub">{subtitle}</p>

          <div className="kickoff-prep-welcome-meta">
            {audience === 'team' ? (
              <span className="kickoff-prep-audience-badge">
                <Users className="w-4 h-4" aria-hidden />
                {salutation === 'du' || salutation === 'ihr'
                  ? locale === 'de'
                    ? 'Für euer Projektteam'
                    : 'For your project team'
                  : t('prepAudienceTeam')}
              </span>
            ) : (
              <span className="kickoff-prep-audience-badge">
                <User className="w-4 h-4" aria-hidden />
                {salutation === 'du'
                  ? locale === 'de'
                    ? 'Persönlich für dich'
                    : 'Just for you'
                  : t('prepAudienceIndividual')}
              </span>
            )}
          </div>

          <ul className="kickoff-prep-welcome-steps">
            <li>{t('prepWelcomeStep1')}</li>
            <li>{t('prepWelcomeStep2')}</li>
            <li>{t('prepWelcomeStep3')}</li>
          </ul>

          <button type="button" className="kickoff-btn-primary kickoff-prep-cta" onClick={onContinue}>
            {cta}
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="kickoff-prep-welcome-foot">{t('prepWelcomeFoot')}</p>
        </div>
      </main>

      <footer className="kickoff-prep-footer">
        <span>{t('prepPoweredBy')}</span>
      </footer>
    </div>
  );
}
