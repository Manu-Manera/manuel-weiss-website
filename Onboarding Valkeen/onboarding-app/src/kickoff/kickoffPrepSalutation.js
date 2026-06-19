/** Anrede für Willkommensseite: deiner / Ihrer / eurer */

export const PREP_SALUTATIONS = ['du', 'sie', 'ihr'];

export const PREP_AUDIENCES = ['individual', 'team'];

export function isValidPrepSalutation(v) {
  return PREP_SALUTATIONS.includes(v);
}

export function isValidPrepAudience(v) {
  return PREP_AUDIENCES.includes(v);
}

/** Possessiv im Titel: „Willkommen in … Tempus Implementation Suite“ */
export function possessiveLabel(salutation, locale = 'de') {
  if (locale === 'en') {
    return salutation === 'ihr' || salutation === 'du' ? 'your' : 'your';
  }
  const map = { du: 'deiner', sie: 'Ihrer', ihr: 'eurer' };
  return map[salutation] || 'Ihrer';
}

export function welcomeHeadline(salutation, locale = 'de') {
  const poss = possessiveLabel(salutation, locale);
  if (locale === 'en') {
    return `Welcome to ${poss} Tempus Implementation Suite`;
  }
  return `Willkommen in ${poss} Tempus Implementation Suite`;
}

export function welcomeSubtitle(audience, customer, salutation, locale = 'de') {
  const name = (customer || '').trim();
  const org = name || (locale === 'de' ? 'Ihrer Organisation' : 'your organization');

  if (locale === 'en') {
    if (audience === 'team') {
      return `This questionnaire prepares your project team at ${org} for the Tempus Resource kick-off workshop.`;
    }
    if (salutation === 'du') {
      return `This questionnaire helps you prepare for the Tempus Resource kick-off at ${org}.`;
    }
    return `This questionnaire helps you prepare for the Tempus Resource kick-off at ${org}.`;
  }

  if (audience === 'team') {
    if (salutation === 'du') {
      return `Dieser Fragebogen bereitet euer Projektteam bei ${org} auf den Tempus-Resource-Kick-off vor.`;
    }
    if (salutation === 'ihr') {
      return `Dieser Fragebogen bereitet euer Projektteam bei ${org} auf den Tempus-Resource-Kick-off vor.`;
    }
    return `Dieser Fragebogen bereitet Ihr Projektteam bei ${org} auf den Tempus-Resource-Kick-off vor.`;
  }

  if (salutation === 'du') {
    return `Dieser Fragebogen hilft dir, den Tempus-Resource-Kick-off bei ${org} vorzubereiten.`;
  }
  if (salutation === 'ihr') {
    return `Dieser Fragebogen hilft euch, den Tempus-Resource-Kick-off bei ${org} vorzubereiten.`;
  }
  return `Dieser Fragebogen hilft Ihnen, den Tempus-Resource-Kick-off bei ${org} vorzubereiten.`;
}

export function welcomeCtaLabel(salutation, locale = 'de') {
  if (locale === 'en') return 'Continue to questionnaire';
  if (salutation === 'du') return 'Weiter zum Fragebogen';
  if (salutation === 'ihr') return 'Weiter zum Fragebogen';
  return 'Weiter zum Fragebogen';
}

export function salutationAdminLabel(salutation, locale = 'de') {
  if (locale === 'en') {
    return { du: 'Informal (your)', sie: 'Formal (your)', ihr: 'Plural (your)' }[salutation];
  }
  return {
    du: 'Du — „… in deiner … Suite“',
    sie: 'Sie — „… in Ihrer … Suite“',
    ihr: 'Ihr — „… in eurer … Suite“',
  }[salutation];
}
