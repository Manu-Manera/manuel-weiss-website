# DSGVO-Maßnahmen – Tempus Excel Mapper

## 1. Technische und Organisatorische Maßnahmen (TOM)

### 1.1 Verschlüsselung (Art. 32 DSGVO)
| Maßnahme | Umsetzung |
|----------|-----------|
| Transport-Verschlüsselung | HTTPS/TLS 1.2+ (über AWS ALB / CloudFront) |
| Security Headers | Helmet.js (HSTS, CSP, X-Frame-Options, Referrer-Policy) |
| API-Key-Schutz | Keys nur im Server-RAM, nie auf Disk, nie in Logs |

### 1.2 Zugriffskontrolle (Art. 32 DSGVO)
| Maßnahme | Umsetzung |
|----------|-----------|
| CORS-Restriktion | Nur konfigurierte Domains (`ALLOWED_ORIGINS`) |
| Rate Limiting | 100 Requests/15 Min (allgemein), 20 Uploads/15 Min |
| Session-TTL | 15 Minuten, automatische Löschung |
| File-Upload-Validierung | Nur .xlsx/.xls, max 50 MB |

### 1.3 Datenminimierung (Art. 5 Abs. 1 lit. c DSGVO)
| Maßnahme | Umsetzung |
|----------|-----------|
| Keine Persistenz | Alle Daten nur im RAM, kein Disk-Schreiben |
| Kurze Retention | Sessions nach 15 Min automatisch gelöscht |
| Anonymisierung für AI | PII wird pseudonymisiert bevor Daten an Anthropic gehen |
| Minimale Sample-Daten | Nur 3-5 Beispielzeilen (anonymisiert) an AI |

## 2. Privacy by Design (Art. 25 DSGVO)

### 2.1 PII-Anonymisierung für AI-Aufrufe

**Problem:** Anthropic ist ein US-Unternehmen. Personenbezogene Daten (Namen, E-Mails) dürfen nicht ohne Schutzmaßnahmen übertragen werden.

**Lösung – Pseudonymisierungsschicht (`anonymizer.ts`):**

```
Excel-Daten (mit PII)
    ↓
PII-Erkennung (Regex + Spaltenname-Analyse)
    ↓ Treffer?
    ├─ Name → "Person 1", "Person 2", ...
    ├─ E-Mail → "person1@example.com", ...
    ├─ Telefon → "+49-XXX-0001", ...
    ├─ IBAN → "DE00XXXX0000000001", ...
    └─ Zahlen/Datum → unverändert (kein Personenbezug)
    ↓
Anonymisierte Daten → Anthropic API
```

**Was wird übertragen:**
- Spaltenüberschriften (z.B. "Project Name", "Start Date")
- Datentypen (string, number, date)
- Pseudonymisierte Beispielwerte
- Strukturinformationen (Sheet-Namen, Zeilenanzahl)

**Was wird NICHT übertragen:**
- Echte Personennamen
- E-Mail-Adressen
- Telefonnummern
- IBANs oder Kontodaten
- Vollständige Datensätze

### 2.2 Explizite AI-Einwilligung

Die AI-Verarbeitung ist **optional** und erfordert eine **separate, explizite Einwilligung** (Art. 49 Abs. 1 lit. a DSGVO):

- Datenschutzhinweis-Dialog beim Start der Anwendung
- Checkbox 1 (Pflicht): Allgemeine Datenverarbeitung
- Checkbox 2 (Optional): AI-Verarbeitung mit Drittlandtransfer
- Ohne AI-Consent: Nur regelbasiertes Matching (keine Datenübertragung an Dritte)

### 2.3 Audit-Trail ohne PII

Der Audit-Log (`auditLog.ts`) protokolliert:
- **JA:** Zeitstempel, Aktionstyp, Ergebnis (success/error), Metadaten (Zeilenanzahl, Sheet-Anzahl)
- **NEIN:** Dateiinhalte, Personennamen, API-Keys, E-Mails, Fehlermeldungen mit PII

Session-IDs werden maskiert (erste/letzte 4 Zeichen).

## 3. Betroffenenrechte (Art. 15-22 DSGVO)

| Recht | Umsetzung |
|-------|-----------|
| **Auskunft (Art. 15)** | `GET /api/privacy/info` – Vollständige Auskunft über Verarbeitung |
| **Löschung (Art. 17)** | `DELETE /api/sessions/:id` – Sofortige Session-Löschung |
| **Löschung aller Daten** | `DELETE /api/sessions` – Alle Sessions löschen |
| **Einschränkung (Art. 18)** | AI-Opt-Out = keine Drittverarbeitung |
| **Datenportabilität (Art. 20)** | Export-Download enthält alle verarbeiteten Daten |
| **Widerspruch (Art. 21)** | Session jederzeit löschbar, AI jederzeit deaktivierbar |

## 4. Drittland-Transfer (Art. 44-49 DSGVO)

### Anthropic (USA)
| Aspekt | Details |
|--------|---------|
| **Rechtsgrundlage** | Art. 49 Abs. 1 lit. a – Ausdrückliche Einwilligung |
| **Schutzmaßnahme** | PII-Pseudonymisierung vor Übertragung |
| **Umfang** | Nur anonymisierte Spaltenstruktur + pseudonymisierte Samples |
| **Opt-Out** | Vollständig möglich, Tool funktioniert regelbasiert ohne AI |
| **Vertragliche Basis** | Anthropic Usage Policy + Data Protection Addendum |

### Tempus (ProSymmetry)
| Aspekt | Details |
|--------|---------|
| **Rechtsgrundlage** | Art. 6 Abs. 1 lit. f – Berechtigtes Interesse (Kernfunktion) |
| **Datenfluss** | Nur Lese-Abfragen (GET) an die vom Kunden gehostete Tempus-Instanz |
| **Hosting** | Vom Kunden bestimmt (typischerweise EU) |

## 5. Error Handling und Logging

### Fehler-Sanitisierung
Fehlermeldungen werden bereinigt bevor sie an den Client oder ins Log gehen:
- API-Keys werden durch `***` ersetzt
- E-Mail-Adressen werden maskiert
- Fehlermeldungen auf 200 Zeichen gekürzt

### Kein PII in Console-Output
`console.error` wird nur für strukturierte Fehlermeldungen verwendet, nie für Rohdaten.

## 6. Verzeichnis der Verarbeitungstätigkeiten (Art. 30)

| Nr. | Verarbeitungstätigkeit | Datenkategorie | Rechtsgrundlage | Empfänger | Löschfrist |
|-----|------------------------|----------------|-----------------|-----------|------------|
| 1 | Excel-Upload & Parsing | Projektdaten, Ressourcendaten | Art. 6(1)(f) | Keine (intern) | 15 Min |
| 2 | Struktur-Analyse (regelbasiert) | Spaltenheader, Datentypen | Art. 6(1)(f) | Keine (intern) | 15 Min |
| 3 | AI-Analyse (optional) | Pseudonymisierte Samples | Art. 49(1)(a) | Anthropic (USA) | Sofort nach Antwort |
| 4 | Tempus-Datenabgleich | Projekt-/Ressourcen-IDs | Art. 6(1)(f) | Tempus-Instanz (Kunde) | 15 Min |
| 5 | Mapping-Generierung | Zuordnungsvorschläge | Art. 6(1)(f) | Keine (intern) | 15 Min |
| 6 | Export-Generierung | Transformierte Daten | Art. 6(1)(f) | Download (Nutzer) | 15 Min |
