/**
 * Anonymizer – Pseudonymisiert personenbezogene Daten (PII) bevor sie
 * an externe Dienste (Anthropic API) gesendet werden.
 *
 * DSGVO Art. 25 (Privacy by Design), Art. 44-49 (Drittlandtransfer)
 *
 * Strategie:
 * - Nur Spaltenstruktur + Datentypen + anonymisierte Samples an AI senden
 * - Echte Namen/E-Mails/IDs durch Platzhalter ersetzen
 * - Zahlen, Datumswerte und booleans bleiben erhalten (nicht personenbezogen)
 * - Rückmapping ist nicht nötig, da AI nur Struktur-Analyse liefert
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s\-()]{7,}$/;
const NAME_PATTERN = /^[A-ZÄÖÜ][a-zäöüß]+(\s[A-ZÄÖÜ][a-zäöüß]+)+$/;
const IBAN_REGEX = /^[A-Z]{2}\d{2}[\s]?[\dA-Z]{4}[\s]?[\dA-Z]{4}/;
const SSN_REGEX = /^\d{3}-?\d{2}-?\d{4}$/;

type PiiCategory = 'email' | 'phone' | 'name' | 'iban' | 'ssn' | 'id' | 'none';

function detectPiiCategory(value: unknown): PiiCategory {
  if (value == null || value === '') return 'none';
  const str = String(value).trim();

  if (EMAIL_REGEX.test(str)) return 'email';
  if (IBAN_REGEX.test(str)) return 'iban';
  if (SSN_REGEX.test(str)) return 'ssn';
  if (PHONE_REGEX.test(str) && str.length >= 7) return 'phone';
  if (NAME_PATTERN.test(str)) return 'name';

  return 'none';
}

function isPiiColumnName(columnName: string): boolean {
  const lower = columnName.toLowerCase();
  const piiTerms = [
    'name', 'vorname', 'nachname', 'first name', 'last name', 'full name',
    'email', 'e-mail', 'mail', 'telefon', 'phone', 'mobile', 'handy',
    'adresse', 'address', 'strasse', 'street', 'plz', 'zip', 'ort', 'city',
    'geburtsdatum', 'birthday', 'birth date', 'ssn', 'sozialversicherung',
    'iban', 'konto', 'account', 'personal', 'mitarbeiter', 'employee',
    'resource name', 'ressource', 'verantwortlich', 'manager', 'owner',
    'kontakt', 'contact', 'ansprechpartner',
  ];
  return piiTerms.some(term => lower.includes(term));
}

let counter = 0;
function pseudonym(category: PiiCategory): string {
  counter++;
  switch (category) {
    case 'email': return `person${counter}@example.com`;
    case 'phone': return `+49-XXX-${counter.toString().padStart(4, '0')}`;
    case 'name': return `Person ${counter}`;
    case 'iban': return `DE00XXXX${counter.toString().padStart(10, '0')}`;
    case 'ssn': return `XXX-XX-${counter.toString().padStart(4, '0')}`;
    case 'id': return `ID-${counter}`;
    default: return String(counter);
  }
}

function anonymizeValue(value: unknown, columnName: string): unknown {
  if (value == null || value === '') return value;

  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;
  if (value instanceof Date) return value;

  const str = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return value;
  if (/^\d{1,2}\.\d{1,2}\.\d{4}/.test(str)) return value;
  if (/^-?\d+(\.\d+)?$/.test(str)) return value;
  if (/^(true|false|ja|nein|yes|no)$/i.test(str)) return value;

  const category = detectPiiCategory(value);
  if (category !== 'none') {
    return pseudonym(category);
  }

  if (isPiiColumnName(columnName)) {
    return pseudonym('name');
  }

  return value;
}

/**
 * Anonymisiert Sample-Rows für die AI-Analyse.
 * Struktur und Datentypen bleiben erhalten, PII wird durch Pseudonyme ersetzt.
 */
export function anonymizeSampleRows(
  rows: Record<string, unknown>[],
  headers: string[],
): Record<string, unknown>[] {
  counter = 0;
  const pseudonymMap = new Map<string, string>();

  return rows.map(row => {
    const anonymized: Record<string, unknown> = {};
    for (const header of headers) {
      const originalValue = row[header];
      if (originalValue == null || originalValue === '') {
        anonymized[header] = originalValue;
        continue;
      }

      const strVal = String(originalValue);
      const key = `${header}::${strVal}`;

      if (pseudonymMap.has(key)) {
        anonymized[header] = pseudonymMap.get(key);
      } else {
        const anon = anonymizeValue(originalValue, header);
        if (anon !== originalValue) {
          pseudonymMap.set(key, String(anon));
        }
        anonymized[header] = anon;
      }
    }
    return anonymized;
  });
}

/**
 * Anonymisiert Sample-Values in einer Column-Analysis.
 */
export function anonymizeSampleValues(
  sampleValues: unknown[],
  columnName: string,
): unknown[] {
  counter = 0;
  return sampleValues.map(v => anonymizeValue(v, columnName));
}

/**
 * Prüft ob eine Spalte potenziell PII enthält.
 */
export function containsPii(values: unknown[], columnName: string): boolean {
  if (isPiiColumnName(columnName)) return true;
  const sample = values.slice(0, 20);
  return sample.some(v => detectPiiCategory(v) !== 'none');
}

/**
 * Erstellt einen PII-Report für Transparenz.
 */
export function generatePiiReport(
  headers: string[],
  rows: Record<string, unknown>[],
): Array<{ column: string; piiDetected: boolean; category: PiiCategory; sampleCount: number }> {
  return headers.map(header => {
    const values = rows.map(r => r[header]).filter(v => v != null && v !== '');
    const piiValues = values.filter(v => detectPiiCategory(v) !== 'none');
    const category = piiValues.length > 0 ? detectPiiCategory(piiValues[0]) : 'none';
    const byName = isPiiColumnName(header);

    return {
      column: header,
      piiDetected: piiValues.length > 0 || byName,
      category: byName && category === 'none' ? 'name' : category,
      sampleCount: piiValues.length,
    };
  });
}
