# AWS Auth System Test Plan

## Test-Übersicht

Dieses Dokument beschreibt die Test-Schritte für das neue Unified AWS Auth System.

## Vorbereitung

1. ✅ Neue Dateien erstellt:
   - `js/unified-aws-auth.js`
   - `js/unified-auth-modals.js`
   - `components/unified-auth-modals.html`
   - `js/unified-auth-loader.js`

2. ✅ Migrierte Seiten:
   - `index.html`
   - `persoenlichkeitsentwicklung-uebersicht.html`

## Test-Szenarien

### 1. Registrierung

**Schritte:**
1. Öffne eine Seite mit Auth-System
2. Klicke auf "Anmelden" → "Jetzt registrieren"
3. Fülle das Registrierungsformular aus:
   - Vorname: Test
   - Nachname: User
   - E-Mail: test.user@example.com (verwende gültige E-Mail)
   - Passwort: TestPass123 (min. 8 Zeichen, Groß-, Kleinbuchstaben, Zahl)
   - Passwort bestätigen: TestPass123
4. Akzeptiere Nutzungsbedingungen
5. Klicke auf "Registrieren"

**Erwartetes Ergebnis:**
- ✅ Erfolgsmeldung: "Registrierung erfolgreich! Bitte prüfen Sie Ihr E-Mail-Postfach"
- ✅ Verification Modal öffnet sich automatisch
- ✅ E-Mail wird mit Bestätigungscode versendet

**Prüfungen:**
- [ ] Keine JavaScript-Fehler in Konsole
- [ ] Notification wird angezeigt
- [ ] Modal wechselt zu Verification
- [ ] E-Mail wird tatsächlich versendet

### 2. E-Mail-Bestätigung

**Schritte:**
1. Öffne E-Mail-Postfach
2. Kopiere den 6-stelligen Bestätigungscode
3. Füge Code in Verification Modal ein
4. Klicke auf "Bestätigen"

**Erwartetes Ergebnis:**
- ✅ Erfolgsmeldung: "E-Mail erfolgreich bestätigt!"
- ✅ Modal schließt sich
- ✅ Login Modal öffnet sich automatisch

**Prüfungen:**
- [ ] Code wird akzeptiert
- [ ] Keine Fehlermeldungen
- [ ] Modal-Wechsel funktioniert
- [ ] Benutzer ist jetzt bestätigt in AWS Cognito

### 3. Login

**Schritte:**
1. Öffne Login Modal
2. Gib E-Mail und Passwort ein
3. Klicke auf "Anmelden"

**Erwartetes Ergebnis:**
- ✅ Erfolgsmeldung: "Erfolgreich angemeldet!"
- ✅ Modal schließt sich
- ✅ UI aktualisiert sich (Login-Button zeigt Benutzer an)
- ✅ Session wird in localStorage gespeichert

**Prüfungen:**
- [ ] Keine Fehlermeldungen
- [ ] Session in localStorage vorhanden (`aws_auth_session`)
- [ ] UI zeigt angemeldeten Benutzer
- [ ] Token ist gültig (prüfe in DevTools → Application → Local Storage)

### 4. Session-Wiederherstellung

**Schritte:**
1. Mache Login (siehe Test 3)
2. Lade Seite neu (F5)
3. Öffne eine andere Seite

**Erwartetes Ergebnis:**
- ✅ Benutzer bleibt angemeldet
- ✅ UI zeigt weiterhin angemeldeten Status
- ✅ Keine erneute Anmeldung nötig

**Prüfungen:**
- [ ] Session wird aus localStorage geladen
- [ ] Token wird validiert
- [ ] UI wird korrekt aktualisiert
- [ ] Keine Fehlermeldungen

### 5. Token-Refresh

**Schritte:**
1. Mache Login
2. Warte bis Token fast abläuft (oder simuliere Ablauf in DevTools)
3. Führe eine Aktion aus, die Auth benötigt

**Erwartetes Ergebnis:**
- ✅ Token wird automatisch erneuert
- ✅ Benutzer bleibt angemeldet
- ✅ Keine Unterbrechung des User-Flows

**Prüfungen:**
- [ ] Refresh Token wird verwendet
- [ ] Neuer Access Token wird gespeichert
- [ ] Keine Fehlermeldungen
- [ ] Benutzer merkt nichts vom Refresh

### 6. Logout

**Schritte:**
1. Sei angemeldet
2. Klicke auf "Abmelden" (falls vorhanden)
3. Oder rufe `window.awsAuth.logout()` in Konsole auf

**Erwartetes Ergebnis:**
- ✅ Erfolgsmeldung: "Erfolgreich abgemeldet!"
- ✅ Session wird aus localStorage entfernt
- ✅ UI zeigt Login-Button
- ✅ Refresh Token wird widerrufen

**Prüfungen:**
- [ ] Session wird gelöscht
- [ ] UI aktualisiert sich
- [ ] Keine Fehlermeldungen
- [ ] Benutzer muss sich erneut anmelden

### 7. Passwort zurücksetzen

**Schritte:**
1. Öffne Login Modal
2. Klicke auf "Passwort vergessen?"
3. Gib E-Mail-Adresse ein
4. Klicke auf "Code senden"
5. Öffne E-Mail-Postfach
6. Kopiere Reset-Code
7. Gib Code und neues Passwort ein
8. Klicke auf "Passwort ändern"

**Erwartetes Ergebnis:**
- ✅ Code wird per E-Mail versendet
- ✅ Reset Modal öffnet sich
- ✅ Passwort wird erfolgreich geändert
- ✅ Login Modal öffnet sich

**Prüfungen:**
- [ ] E-Mail wird versendet
- [ ] Code wird akzeptiert
- [ ] Passwort wird geändert
- [ ] Login mit neuem Passwort funktioniert

### 8. Fehlerbehandlung

**Test-Fälle:**

#### 8.1 Ungültige Anmeldedaten
- Falsches Passwort eingeben
- **Erwartet:** Fehlermeldung "Ungültige Anmeldedaten"

#### 8.2 Nicht bestätigter Benutzer
- Mit unbestätigter E-Mail anmelden
- **Erwartet:** Verification Modal öffnet sich automatisch

#### 8.3 Abgelaufener Code
- Alten Bestätigungscode verwenden
- **Erwartet:** Fehlermeldung "Code abgelaufen"

#### 8.4 Passwörter stimmen nicht überein
- Bei Registrierung unterschiedliche Passwörter eingeben
- **Erwartet:** Validierungsfehler vor Absenden

#### 8.5 Schwaches Passwort
- Passwort ohne Großbuchstaben/Nummern eingeben
- **Erwartet:** Validierungsfehler

## UI-Tests

### 9. Responsive Design

**Schritte:**
1. Öffne Seite auf Desktop
2. Öffne Modals
3. Teste auf Tablet (768px)
4. Teste auf Mobile (375px)

**Erwartetes Ergebnis:**
- ✅ Modals sind responsive
- ✅ Formulare passen sich an
- ✅ Buttons sind erreichbar
- ✅ Text ist lesbar

**Prüfungen:**
- [ ] Desktop: Modal zentriert, gute Größe
- [ ] Tablet: Modal passt sich an
- [ ] Mobile: Modal vollbreit, scrollbar wenn nötig

### 10. Accessibility

**Prüfungen:**
- [ ] Alle Inputs haben Labels
- [ ] Focus-States sind sichtbar
- [ ] ESC-Taste schließt Modal
- [ ] Tab-Navigation funktioniert
- [ ] ARIA-Attribute vorhanden (optional)

## Browser-Kompatibilität

### Zu testen in:
- [ ] Chrome (neueste Version)
- [ ] Firefox (neueste Version)
- [ ] Safari (neueste Version)
- [ ] Edge (neueste Version)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Performance-Tests

### 11. Ladezeiten

**Prüfungen:**
- [ ] Auth-System lädt in < 2 Sekunden
- [ ] Modals laden in < 1 Sekunde
- [ ] Keine Blockierung des UI während Ladevorgang

### 12. Memory Leaks

**Prüfungen:**
- [ ] Keine wachsenden Memory-Verbrauch bei wiederholter Nutzung
- [ ] Event Listeners werden korrekt entfernt
- [ ] Keine Speicherlecks nach Logout

## Integration-Tests

### 13. Multi-Tab Synchronisation

**Schritte:**
1. Öffne Seite in Tab 1
2. Melde dich an
3. Öffne gleiche Seite in Tab 2
4. Prüfe Auth-Status

**Erwartetes Ergebnis:**
- ✅ Tab 2 zeigt auch angemeldeten Status (nach Storage-Event)

### 14. Cross-Page Navigation

**Schritte:**
1. Melde dich auf index.html an
2. Navigiere zu persoenlichkeitsentwicklung-uebersicht.html
3. Prüfe Auth-Status

**Erwartetes Ergebnis:**
- ✅ Auth-Status bleibt erhalten
- ✅ UI wird korrekt aktualisiert

## Checkliste

- [ ] Alle Test-Szenarien durchgeführt
- [ ] Alle Prüfungen erfolgreich
- [ ] Keine kritischen Fehler
- [ ] Browser-Kompatibilität bestätigt
- [ ] Performance akzeptabel
- [ ] Dokumentation aktualisiert

## Bekannte Probleme

Liste alle gefundenen Probleme hier:

1. 
2. 
3. 

## Test-Protokoll

**Datum:** _______________
**Tester:** _______________
**Version:** 1.0.0

**Ergebnisse:**
- ✅ Erfolgreich
- ⚠️  Mit Problemen
- ❌ Fehlgeschlagen

