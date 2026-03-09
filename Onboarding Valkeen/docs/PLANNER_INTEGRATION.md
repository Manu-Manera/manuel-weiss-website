# Microsoft Planner Integration – Implementierungsplan

## Übersicht

Die Onboarding-App soll Aufgaben aus `onboardingData.js` als To-dos in Microsoft Planner anlegen. Der Nutzer klickt auf „In Planner exportieren“ und erhält alle Aufgaben in seinem Planner.

---

## Architektur-Optionen

### Option A: Shared Plan (empfohlen für den Start)

- **Eine** M365-Gruppe „Valkeen Onboarding“ mit einem Planner-Plan
- Buckets = Wochen (Woche 1 … Woche 12)
- Beim Export: Tasks werden erstellt und dem eingeloggten Nutzer zugewiesen
- Vorteil: Einfach, keine Gruppen-Erstellung nötig
- Nachteil: Alle Tasks liegen im selben Plan

### Option B: Persönlicher Plan pro Nutzer

- Pro Nutzer wird eine M365-Gruppe + Plan erstellt (z.B. „Onboarding Max Mustermann“)
- Jeder Nutzer hat seinen eigenen Plan
- Vorteil: Klare Trennung pro Person
- Nachteil: Erfordert `Group.ReadWrite.All`, mehr Logik

---

## Technischer Stack

| Komponente | Paket | Zweck |
|------------|-------|-------|
| Auth | `@azure/msal-browser` | Microsoft-Login im Browser |
| Graph | `@microsoft/microsoft-graph-client` | Planner-API aufrufen |
| Oder | `fetch` + Token | Direkte REST-Calls (leichter) |

---

## Azure App Registration

1. **Azure Portal** → App registrations → New registration
2. **Name:** z.B. „Valkeen Onboarding Planner“
3. **Redirect URI:** SPA → `https://[deine-domain]/onboarding` (und `http://localhost:5173/onboarding` für Dev)
4. **API Permissions:**
   - `User.Read` (Delegated)
   - `Tasks.ReadWrite` (Delegated) – Tasks erstellen/bearbeiten
   - Optional für Option B: `Group.ReadWrite.All` (Delegated)

---

## Implementierungsschritte

### 1. MSAL einrichten

```bash
npm install @azure/msal-browser @microsoft/microsoft-graph-client
```

- `MsalProvider` um die App legen
- Login-Button für Microsoft
- Token für Graph-Requests holen

### 2. Planner-Service (`src/services/plannerService.js`)

```javascript
// Kernfunktionen:
// - getAccessToken() – Token von MSAL
// - getOrCreatePlan(groupId) – Plan für Gruppe holen/erstellen
// - getOrCreateBuckets(planId, weeks) – Buckets pro Woche
// - createTasksFromOnboarding(planId, bucketMap, assignToUserId) – Tasks aus onboardingData
```

### 3. Konfiguration

- `groupId` der M365-Gruppe „Valkeen Onboarding“ (oder per Umgebungsvariable)
- Client ID der Azure App

### 4. UI-Erweiterung

- **Tracker-Seite:** Button „In Microsoft Planner exportieren“
- **Flow:** Login (falls nicht eingeloggt) → Plan/Buckets laden → Tasks erstellen → Erfolgsmeldung + Link zu Planner

---

## Datenfluss

```
onboardingData.js (weeks[].tasks)
        ↓
plannerService.createTasksFromOnboarding()
        ↓
Für jede Woche: Bucket "Woche X" (falls nicht vorhanden)
        ↓
Für jeden Task: POST /planner/tasks
  - planId
  - bucketId
  - title: task.text
  - assignments: { [userId]: { "@odata.type": "#microsoft.graph.plannerAssignment", "orderHint": " !" } }
  - details: { description: task.link ? `Link: ${task.link}` : undefined }
```

---

## API-Aufrufe (Beispiel)

### Plan für Gruppe holen

```
GET https://graph.microsoft.com/v1.0/groups/{groupId}/planner/plans
```

### Buckets eines Plans

```
GET https://graph.microsoft.com/v1.0/planner/plans/{planId}/buckets
```

### Bucket erstellen (falls nicht vorhanden)

```
POST https://graph.microsoft.com/v1.0/planner/buckets
{ "name": "Woche 1", "planId": "..." }
```

### Task erstellen

```
POST https://graph.microsoft.com/v1.0/planner/tasks
{
  "planId": "...",
  "bucketId": "...",
  "title": "Email-Konto einrichten mit Signatur",
  "assignments": {
    "{userId}": {
      "@odata.type": "#microsoft.graph.plannerAssignment",
      "orderHint": " !"
    }
  }
}
```

---

## Offene Punkte

1. **Gruppen-ID:** Valkeen muss eine M365-Gruppe „Valkeen Onboarding“ anlegen und die ID bereitstellen.
2. **Plan existiert?** Wenn die Gruppe einen Plan hat, wird dieser genutzt. Sonst: Plan erstellen (benötigt `Group.ReadWrite.All` oder entsprechende Rechte).
3. **Duplikate:** Beim erneuten Export: Sollen bestehende Tasks überschrieben/aktualisiert werden oder nur neue angelegt? (Empfehlung: Prüfung per Task-Titel oder Custom-Property, um Duplikate zu vermeiden.)

---

## Nächste Schritte

1. Azure App Registration anlegen
2. M365-Gruppe „Valkeen Onboarding“ erstellen (falls noch nicht vorhanden)
3. `plannerService.js` implementieren
4. MSAL + Login-Button in die App integrieren
5. „In Planner exportieren“-Button im Tracker
