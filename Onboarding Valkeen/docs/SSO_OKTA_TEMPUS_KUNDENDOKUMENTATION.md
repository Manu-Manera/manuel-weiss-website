# SSO Setup: Okta ↔ Tempus Resource – Kundendokumentation

**Zielgruppe:** SSO-Spezialist:innen, Identity & Access Management  
**Version:** 1.1  
**Letzte Aktualisierung:** März 2026  
**Quelle:** ProSymmetry Support (SSO Set Up, General Settings → Miscellaneous)

---

## 1. Übersicht

Diese Dokumentation beschreibt die vollständige Konfiguration von **Single Sign-On (SAML 2.0)** zwischen **Okta** als Identity Provider (IdP) und **Tempus Resource** als Service Provider (SP). Sie richtet sich an Kundenseitige SSO-Spezialist:innen, die die Integration eigenständig durchführen.

### 1.1 Technische Grundlagen

| Komponente | Technologie |
|------------|-------------|
| Protokoll | SAML 2.0 |
| IdP | Okta |
| SP | Tempus Resource (ProSymmetry) |
| Binding | HTTP-POST (ACS) |

### 1.2 Voraussetzungen

- **Okta Admin-Zugang** (Administrator oder vergleichbare Rolle)
- **Tempus Admin-Zugang** (General Settings, Resource Management)
- **Tempus-Basis-URL** des Kunden (z.B. `https://kunde.tempus-resource.com`)
- **E-Mail-Adressen** der Benutzer:innen müssen in Okta und Tempus identisch sein (Tempus prüft nicht, ob es eine primäre oder sekundäre E-Mail im IdP ist)

---

## 2. URL-Struktur und Konventionen

Tempus verwendet eine feste URL-Struktur. Alle Werte müssen **exakt** übereinstimmen.

### 2.1 Berechnung der URLs

| Feld | Formel | Beispiel |
|------|--------|----------|
| **Tempus-Basis-URL** | `https://{slug}{env}.tempus-resource.com` | `https://acme.tempus-resource.com` |
| **Entity ID (SP)** | `{Basis-URL}/sg` | `https://acme.tempus-resource.com/sg` |
| **Reply URL (ACS)** | `{Basis-URL}/sg/home/saml` **(lowercase)** | `https://acme.tempus-resource.com/sg/home/saml` |

### 2.2 Wichtige Hinweise

- **Entity ID:** Case-sensitive. Keine abschließenden Slashes.
- **Reply URL:** Muss **lowercase** sein. Tempus erwartet exakt diese Schreibweise.
- **Umgebungen:** Staging/Test nutzen Suffixe wie `-staging` oder `-test` im Subdomain (z.B. `https://acme-staging.tempus-resource.com`).
- **Custom Domain:** Falls der Kunde eine eigene Domain nutzt (z.B. `https://resource.firma.ch`), muss diese explizit als Basis-URL verwendet werden.

---

## 3. Okta-Konfiguration

### 3.1 Neue SAML-Anwendung erstellen

1. **Okta Admin Console** öffnen: [https://login.okta.com/admin/apps/active](https://login.okta.com/admin/apps/active)
2. **Applications** → **Add Application** → **Create New App Integration**
3. **Sign-in method:** SAML 2.0
4. **Application type:** Single-Page Application (SPA) oder Web Application – je nach Okta-Version; bei „Web Application“ fortfahren.

### 3.2 General Settings (Okta)

| Feld | Wert | Hinweis |
|------|------|---------|
| **App name** | z.B. `Tempus [Kundenname]` | Beliebig, zur Identifikation |
| **Logo** | Optional | – |
| **Visibility** | Nach Bedarf | App Catalog, Self-Service etc. |

### 3.3 SAML 2.0 Konfiguration (Okta)

**Configure SAML:**

| Okta-Feld | Wert | Quelle |
|-----------|------|--------|
| **Single sign-on URL** | `https://{kunde}.tempus-resource.com/sg/home/saml` | Von Tempus/Projekt erhalten |
| **Audience URI (SP Entity ID)** | `https://{kunde}.tempus-resource.com/sg` | Von Tempus/Projekt erhalten |
| **Name ID format** | `EmailAddress` oder `Unspecified` | Empfohlen: EmailAddress (für User-Matching) |
| **Application username** | `Email` | Wichtig für Tempus User-Matching |

**Advanced Sign-On Settings (falls verfügbar):**

- **Response:** Signed
- **Assertion Signature:** Signed (empfohlen)
- **Signature Algorithm:** RSA-SHA256
- **Digest Algorithm:** SHA256

### 3.4 Attribute Statements (Okta)

Tempus nutzt die E-Mail-Adresse für das User-Matching. Konfigurieren Sie:

| Name | Value |
|------|-------|
| `email` oder `user.email` | `user.email` |
| `name` (optional) | `user.firstName` + `user.lastName` |

**Hinweis:** Die E-Mail im SAML-Response muss exakt mit der E-Mail in Tempus Resource Management übereinstimmen.

### 3.5 Okta-spezifische Besonderheiten (laut ProSymmetry)

- **Entity ID:** Bei Okta muss die Entity ID in der Regel nicht manuell eingegeben werden – sie wird automatisch befüllt.
- Nach dem Speichern: **Assign** Users oder Groups zur Anwendung.
- **Identity Provider metadata** herunterladen (wird für Tempus benötigt).

---

## 4. IdP-Metadaten aus Okta extrahieren

Tempus kann entweder die **SAML Configuration URL** (Metadaten-URL) nutzen oder die Werte **manuell** eintragen. Bei Okta funktioniert die Metadaten-URL laut ProSymmetry – nach dem Speichern ist die SSO-Konfiguration fertig. Bei manueller Eintragung werden SAML Endpoint und X.509-Zertifikat benötigt.

### 4.1 Metadaten herunterladen

1. In der Okta-App: **Sign On** → **View SAML setup instructions**
2. Oder: **Identity Provider metadata**-Link verwenden (z.B. `https://{your-domain}.okta.com/app/{app-id}/sso/saml/metadata`)
3. XML-Datei herunterladen oder URL im Browser öffnen

### 4.2 Benötigte Werte aus der XML

| Tempus-Feld | XML-Element | Beispiel |
|-------------|-------------|----------|
| **SAML endpoint** | `<md:SingleSignOnService Location="..."/>` | `https://acme.okta.com/app/xxx/sso/saml` |
| **SAML certificate** | `<ds:X509Certificate>...</ds:X509Certificate>` | Base64-kodierter Zertifikatsinhalt |

### 4.3 Zertifikat formatieren

Der Inhalt von `<X509Certificate>` ist Base64-kodiert. Für Tempus:

1. **Option A:** Bei [samltool.com – Format X509](https://www.samltool.com/format_x509cert.php) einfügen und als `.cer` oder `.pem` exportieren.
2. **Option B:** Manuell mit Header/Footer:
   ```
   -----BEGIN CERTIFICATE-----
   [Base64-Inhalt aus XML]
   -----END CERTIFICATE-----
   ```

Tempus akzeptiert `.cer` oder `.pfx` (laut ProSymmetry-Dokumentation).

---

## 5. Tempus-Konfiguration

### 5.1 Navigationspfad

**General Settings** → **Miscellaneous** → **SSO**

### 5.2 SAML aktivieren

Tempus unterstützt parallel: **Password**, **Google**, **Microsoft**, **SAML**. Alle Optionen können gleichzeitig aktiv sein.

### 5.3 Felder in Tempus eintragen

| Tempus-Feld | Wert (Okta) | Quelle |
|-------------|-------------|--------|
| **SAML application id** | **Entity Id aus der Okta-Metadaten-XML** | Nicht die SP-Entity-ID! ProSymmetry: „If using Okta, please use the Entity Id that is found within the metadata file.“ |
| **SAML endpoint** | z.B. `https://acme.okta.com/app/xxx/sso/saml` | Aus Okta-Metadaten-XML (`SingleSignOnService` / Post-Location) |
| **SAML certificate file** | Zertifikat (.cer oder .pfx) | Aus Okta-Metadaten-XML (X509Certificate, bei samltool.com formatieren) |
| **Custom label** | z.B. `Log In` oder `Continue With SSO` | Optional, erscheint auf dem Login-Button |

**Hinweis:** Bei Okta ist die SAML Application ID in Tempus die **IdP-Entity-ID** aus den Okta-Metadaten, nicht die SP-Entity-ID (`https://client.tempus-resource.com/sg`). Die SP-Entity-ID wird nur in Okta als Audience URI verwendet.

### 5.4 SAML Configuration URL (Metadaten-URL)

| Option | Okta | Azure Entra ID |
|--------|------|----------------|
| **SAML configuration URL** | **Unterstützt.** Metadaten-URL aus Okta einfügen → Speichern → SSO ist konfiguriert. | **Mit Einschränkung:** Nach dem Speichern muss die SAML Application ID manuell auf `https://[clientname].tempus-resource.com/sg` zurückgesetzt und erneut gespeichert werden (Tempus überschreibt sonst mit IdP-Entity-ID). |

**Quelle:** ProSymmetry-Dokumentation – „Copy the metadata link from the IdP and paste it into the SAML Configuration URL field, and then click Save in Tempus.“

---

## 6. Bekannte Fehler und Troubleshooting

### 6.1 Fehler durch Metadaten-URL (nur Azure Entra ID)

**Symptom:** Nach Konfiguration mit Metadaten-URL erscheint ein Fehler wie `AADSTS700016` oder „Application not found“.

**Ursache:** Bei Azure überschreibt Tempus die SAML Application ID mit der IdP-Entity-ID.

**Lösung (Azure):** Nach dem Speichern die SAML Application ID manuell auf `https://[clientname].tempus-resource.com/sg` zurücksetzen und erneut speichern. Bei Okta tritt dieses Problem nicht auf.

### 6.2 User wird nicht gefunden

**Symptom:** Login scheint zu funktionieren, aber Tempus meldet „User not found“ oder ähnlich.

**Ursache:** E-Mail im SAML-Response stimmt nicht mit der E-Mail in Tempus überein.

**Tempus prüft (laut ProSymmetry):** mail, User.email, emailaddress, NameId (in dieser Reihenfolge). Der IdP muss die E-Mail in einem dieser Felder senden. UPN funktioniert, wenn es eine E-Mail-Adresse ist und als E-Mail-Feld gesendet wird.

**Lösung:**
1. Resource Management → User Identity prüfen
2. E-Mail exakt wie in Okta eintragen (Groß-/Kleinschreibung kann relevant sein)
3. SSO für den User aktivieren (Häkchen setzen)

### 6.3 Reply URL / ACS-Fehler

**Symptom:** Okta leitet nicht korrekt zurück oder meldet „Invalid ACS URL“.

**Lösung:**
- Reply URL muss **lowercase** sein: `https://kunde.tempus-resource.com/sg/home/saml`
- Kein trailing slash
- Keine Tippfehler in der Domain

### 6.4 Zertifikatsfehler

**Symptom:** „Invalid certificate“ oder Signatur-Validierung schlägt fehl.

**Lösung:**
- Zertifikat aus der **aktuellen** Okta-Metadaten-XML verwenden
- Bei Zertifikatswechsel in Okta: Neues Zertifikat in Tempus hochladen
- Format prüfen (PEM/CER mit korrekten Headers)

---

## 7. Benutzeraktivierung in Tempus

Nach der technischen SSO-Konfiguration müssen Benutzer:innen für SSO freigeschaltet werden:

1. **Resource Management** → **Benutzer** → gewünschten User öffnen
2. **User Identity** → **E-Mail** eintragen (muss mit Okta übereinstimmen)
3. **SSO aktivieren** (Häkchen setzen)
4. **Speichern**

**Empfehlung (ProSymmetry):** Zuerst mit einem **anderen** User testen, nicht mit sich selbst – so vermeiden Sie, sich bei Fehlern auszusperren.

---

## 8. Checkliste für SSO-Spezialist:innen

### Vor der Konfiguration

- [ ] Tempus-Basis-URL bestätigt (inkl. Umgebung: Prod/Staging/Test)
- [ ] Entity ID und Reply URL berechnet bzw. vom Projekt erhalten
- [ ] Okta Admin-Zugang vorhanden
- [ ] Tempus Admin-Zugang vorhanden

### Okta

- [ ] SAML 2.0 App erstellt
- [ ] Single sign-on URL = Reply URL (lowercase)
- [ ] Audience URI = Entity ID (exakt)
- [ ] Name ID / Attribute: E-Mail korrekt gemappt
- [ ] Users/Groups der App zugewiesen
- [ ] IdP-Metadaten-XML heruntergeladen

### Metadaten

- [ ] SAML endpoint (SingleSignOnService URL) extrahiert
- [ ] X509Certificate extrahiert und formatiert (.cer/.pem)

### Tempus

- [ ] General Settings → Miscellaneous → SSO geöffnet
- [ ] SAML aktiviert
- [ ] **Okta:** SAML application id = Entity Id aus Okta-Metadaten-XML (nicht SP-Entity-ID)
- [ ] **Alternativ:** SAML configuration URL = Okta-Metadaten-URL (funktioniert bei Okta)
- [ ] Bei manueller Eintragung: SAML endpoint + certificate file
- [ ] Custom label gesetzt (optional)
- [ ] Gespeichert

### Benutzer

- [ ] Mindestens ein Test-User: E-Mail + SSO aktiviert
- [ ] Login getestet (idealerweise in Inkognito/anderem Browser)

---

## 9. Kontakt und Support

Bei Fragen zur Tempus-Instanz oder zur Bereitstellung der URLs wenden Sie sich an Ihren Tempus-Projektverantwortlichen oder an den technischen Support von Tempus/ProSymmetry.

---

## 10. Anhang: Beispielwerte

**Beispiel für Kunde „Acme Corp“ (Produktion):**

| Feld | Wert |
|------|------|
| Tempus-Basis-URL | `https://acme.tempus-resource.com` |
| SP Entity ID (für Okta Audience URI) | `https://acme.tempus-resource.com/sg` |
| Reply URL | `https://acme.tempus-resource.com/sg/home/saml` |
| Okta Single sign-on URL | `https://acme.tempus-resource.com/sg/home/saml` |
| Okta Audience URI | `https://acme.tempus-resource.com/sg` |
| **Tempus SAML application id** | **Entity Id aus Okta-Metadaten** (nicht die SP-Entity-ID!) |

**Beispiel für Staging:**

| Feld | Wert |
|------|------|
| Tempus-Basis-URL | `https://acme-staging.tempus-resource.com` |
| Entity ID | `https://acme-staging.tempus-resource.com/sg` |
| Reply URL | `https://acme-staging.tempus-resource.com/sg/home/saml` |
