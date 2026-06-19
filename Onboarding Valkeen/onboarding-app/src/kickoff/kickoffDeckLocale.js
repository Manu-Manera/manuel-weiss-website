import deck from '../data/kickoff-deck.json';
import deLocale from '../data/kickoff-deck-locale-de.json';

function replaceCustomer(text, customer) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/\{\{customer\}\}/g, customer || 'Ihre Organisation')
    .replace(/\{\{consultant_contact\}\}/g, deck.meta?.consultant_contact || 'Valkeen');
}

function mergeQuestions(base, translated) {
  if (!translated?.questions) return base.questions;
  return (base.questions || []).map((q, i) => ({
    ...q,
    ...(translated.questions[i] || {}),
  }));
}

function mergeOptions(base, translated) {
  if (!translated?.options) return base.options;
  return (base.options || []).map((o, i) => ({
    ...o,
    ...(translated.options[i] || {}),
  }));
}

/** Localized slide for display (does not mutate answers). */
export function localizeSlide(slide, locale, customer) {
  if (!slide) return slide;
  let s = { ...slide };
  if (locale === 'de') {
    const t = deLocale.slides?.[slide.id];
    if (t) {
      s = {
        ...s,
        ...t,
        questions: mergeQuestions(slide, t),
        options: mergeOptions(slide, t),
      };
    }
    if (deLocale.meta && slide.id === 'agenda') {
      /* meta applied separately */
    }
  }
  const fields = ['headline', 'subline', 'decision_label', 'facilitator_note'];
  for (const f of fields) {
    if (s[f]) s[f] = replaceCustomer(s[f], customer);
  }
  if (s.bullets) s.bullets = s.bullets.map((b) => replaceCustomer(b, customer));
  if (s.items) s.items = s.items.map((b) => replaceCustomer(b, customer));
  if (s.questions) {
    s.questions = s.questions.map((q) => ({
      ...q,
      q: replaceCustomer(q.q, customer),
      hint: replaceCustomer(q.hint, customer),
    }));
  }
  if (s.options) {
    s.options = s.options.map((o) => ({
      ...o,
      label: replaceCustomer(o.label, customer),
      note: replaceCustomer(o.note, customer),
    }));
  }
  return s;
}

export function localizedMeta(locale, customer) {
  const m = deck.meta || {};
  if (locale === 'de' && deLocale.meta) {
    return {
      ...m,
      title: deLocale.meta.title || m.title,
      subtitle: replaceCustomer(deLocale.meta.subtitle || m.subtitle, customer),
      gamma_title: deLocale.meta.gamma_title,
      gamma_audience: deLocale.meta.gamma_audience,
      customer: customer || m.customer_placeholder,
    };
  }
  return {
    ...m,
    subtitle: replaceCustomer(m.subtitle, customer),
    customer: customer || m.customer_placeholder,
  };
}

export function localizedClosing(locale, customer) {
  const c = deck.closing || {};
  if (locale === 'de' && deLocale.closing) {
    return {
      headline: replaceCustomer(deLocale.closing.headline, customer),
      subline: replaceCustomer(deLocale.closing.subline, customer),
      bullets: (deLocale.closing.bullets || []).map((b) => replaceCustomer(b, customer)),
    };
  }
  return {
    headline: replaceCustomer(c.headline, customer),
    subline: replaceCustomer(c.subline, customer),
    bullets: (c.bullets || []).map((b) => replaceCustomer(b, customer)),
  };
}

export function getDeckSlides() {
  return deck.slides || [];
}

export function getDeckMeta() {
  return deck.meta || {};
}

export { deck };
