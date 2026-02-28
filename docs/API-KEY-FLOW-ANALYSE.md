# API-Key-Flow: Detaillierte Analyse

**Stand:** Nach Nutzer-Hinweis „er ist noch drin“ – Key ist im Admin-Panel sichtbar (AKTIV), wird aber beim BPMN/HR-Coach nicht gezogen.

---

## 1. Speicherorte des API-Keys

| Ort | Wann befüllt | Struktur |
|-----|--------------|----------|
| **mawps-api-settings** (DynamoDB) | Admin klickt „Speichern“ + eingeloggt | `userId` → `openai.apiKey` (verschlüsselt) |
| **mawps-user-profiles** (DynamoDB) | Nur wenn explizit „global“ gespeichert | `api-settings#global` → `openai.apiKey` |
| **global_api_keys** (localStorage) | Admin klickt „Speichern“ (seit letztem Fix immer) | `{ openai: { key, model, ... } }` |
| **admin_state** (localStorage) | Admin klickt „Speichern“ | `{ apiKeys: { openai: { apiKey, ... } } }` |
| **GlobalAPIManager** (Memory) | Admin klickt „Speichern“ + GlobalAPIManager geladen | Nur im aktuellen Tab |

---

## 2. Ablauf beim Speichern (Admin-Panel)

```
saveService('openai')
  → stateManager.setState('apiKeys', ...)     → admin_state
  → GlobalAPIManager.setAPIKey(...)           → Memory (nur wenn geladen)
  → localStorage global_api_keys              → global_api_keys
  → awsAPISettings.saveOpenAIKey(...)        → POST /api-settings → mawps-api-settings (nur wenn eingeloggt)
```

**Wichtig:** `api-settings#global` in mawps-user-profiles wird beim normalen Speichern **nicht** befüllt. Das passiert nur über einen separaten „global speichern“-Flow, der aktuell nicht genutzt wird.

---

## 3. Ablauf beim Abruf (HR-Selbsttest / BPMN-Generator)

```
getOpenAIApiKey() / getFullApiKey('openai')
  → awsAPISettings.getFullApiKey('openai')
    → 1. isUserLoggedIn()? → GET /api-settings?action=key&provider=openai (mit Auth)
    → 2. Falls nicht eingeloggt → GET ...&global=true (ohne Auth)
    → 3. Lambda: getFullApiKey(null, 'openai', true)
         → Liest mawps-user-profiles: userId='api-settings#global'
         → Wenn leer → 404
    → 4. Fallback (seit letztem Fix): _getKeyFromLocalStorage('openai')
         → global_api_keys
         → admin_state
```

---

## 4. Mögliche Fehlerquellen

### A) AWS-Pfad liefert keinen Key

- **api-settings#global** ist leer, weil Keys nur in mawps-api-settings (user-spezifisch) gespeichert werden.
- **User-spezifisch** funktioniert nur, wenn:
  - User im HR-Coach/BPMN eingeloggt ist (Cognito oder Admin-Session)
  - API Gateway den `userId` aus dem Token an die Lambda übergibt
  - Der Admin-Login und der HR-Coach-Login denselben User verwenden

### B) localStorage-Fallback greift nicht

- **Andere Origin:** admin.manuel-weiss.ch vs. manuel-weiss.ch → unterschiedlicher localStorage.
- **Noch nie gespeichert:** Key nur im Formular, nie auf „Speichern“ geklickt.
- **Falsche Struktur:** z.B. `global_api_keys.openai.apiKey` statt `global_api_keys.openai.key`.

### C) Admin-Panel zeigt Key, speichert aber nicht korrekt

- Bei **maskiertem Key** (z.B. `sk-••••••••`) wird `cachedApiKeys[service]` verwendet.
- Wenn `cachedApiKeys` nur `'MASKED'` enthält (von AWS-Load), wird beim Speichern `'MASKED'` statt des echten Keys gespeichert.

### D) API-URL / Konfiguration

- `getApiUrl('API_SETTINGS')` liefert `null`, wenn `AWS_APP_CONFIG.API_BASE` fehlt.
- Dann schlägt der Fetch fehl, und der localStorage-Fallback wird genutzt.

---

## 5. Domain-/Origin-Check

- **admin.html:** `https://manuel-weiss.ch/admin.html`
- **hr-selbsttest.html:** `https://manuel-weiss.ch/hr-selbsttest.html`
- **localStorage:** gleiche Origin → gemeinsamer Zugriff.

---

## 6. Empfohlene Diagnose (ohne Code-Änderung)

1. **Browser-Konsole auf hr-selbsttest.html öffnen** und „Workflow generieren“ klicken.
2. Nach Logs suchen:
   - `🔍 Lade vollständigen API Key von: ...` → welche URL?
   - `📡 Response Status: ...` → 200, 404, 401?
   - `✅ API-Key aus localStorage geladen` → Fallback aktiv?
   - `❌ API Key Request fehlgeschlagen` → Fehlermeldung?
3. **localStorage prüfen:**
   - `localStorage.getItem('global_api_keys')` → Struktur und Inhalt?
   - `localStorage.getItem('admin_state')` → `apiKeys.openai` vorhanden?
4. **API direkt testen:**
   ```bash
   curl "https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/api-settings?action=key&provider=openai&global=true"
   ```
   → 404 = api-settings#global leer; 200 = Key kommt von AWS.

---

## 7. Geplante Korrekturen (nach Bestätigung)

| Problem | Lösung |
|--------|--------|
| api-settings#global nie befüllt | Beim Speichern im Admin optional auch global schreiben (z.B. wenn Admin-Rolle) |
| cachedApiKeys = 'MASKED' beim Speichern | Vor dem Speichern bei maskiertem Input getFullApiKey aufrufen und echten Key holen |
| localStorage-Struktur-Inkonsistenz | Einheitliches Format: `key` und `apiKey` beide prüfen |

---

## 8. Aktueller Code-Stand (Relevante Stellen)

- **js/aws-api-settings.js:** `getFullApiKey` mit localStorage-Fallback (`_getKeyFromLocalStorage`)
- **js/admin/sections/api-keys.js:** `saveService` schreibt in global_api_keys und admin_state
- **lambda/api-settings/index.js:** `getFullApiKey` liest api-settings#global und user-spezifisch
