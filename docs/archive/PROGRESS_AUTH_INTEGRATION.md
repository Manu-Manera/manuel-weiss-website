# 🔐 Progress & Auth Integration

## Übersicht

Diese Dokumentation beschreibt, wie Progress unter dem eingeloggten User gespeichert wird und wie beim ersten "Weiter"-Klick eine Anmeldung eingefordert wird.

---

## ✅ Implementierte Features

### 1. **Progress wird unter eingeloggtem User gespeichert**

- ✅ Progress wird in DynamoDB mit `userId` gespeichert
- ✅ Automatische User-ID-Erkennung beim Speichern
- ✅ Validierung, dass User angemeldet ist, bevor gespeichert wird
- ✅ Fallback auf localStorage, wenn User nicht angemeldet ist

### 2. **Login-Prompt beim ersten "Weiter"-Klick**

- ✅ Login-Prompt wird nur beim ersten "Weiter"-Klick angezeigt
- ✅ Schönes Modal mit Benefits der Anmeldung
- ✅ Automatische Ausführung der Aktion nach erfolgreicher Anmeldung
- ✅ Keine Unterbrechung für bereits angemeldete User

---

## 📁 Dateien

### **Neue Datei:**
- `js/auth-required-action.js` - Zentrale Auth-Prüfung für "Weiter"-Buttons

### **Aktualisierte Dateien:**
- `js/user-progress-tracker.js` - Progress-Speicherung mit userId-Validierung
- `js/workflow-progress-integration.js` - Integration der Auth-Prüfung in Workflows

---

## 🔧 Verwendung

### **In Workflows (automatisch integriert):**

Die `WorkflowProgressIntegration` verwendet automatisch die Auth-Prüfung:

```javascript
// Automatisch beim Klick auf "Weiter"
async nextStep() {
    // Prüft Auth und zeigt Login-Prompt falls nötig
    await window.authRequiredAction.handleNextButton(async () => {
        // Diese Aktion wird nur ausgeführt, wenn User angemeldet ist
        await this.executeNextStep();
    });
}
```

### **Manuelle Verwendung:**

```javascript
// In eigenen "Weiter"-Button Handlern
document.getElementById('next-btn').addEventListener('click', async () => {
    const canProceed = await window.authRequiredAction.handleNextButton(async () => {
        // Deine "Weiter"-Logik hier
        console.log('User ist angemeldet, fahre fort...');
    }, {
        message: 'Bitte melde dich an, um fortzufahren.'
    });
    
    if (!canProceed) {
        // Login-Prompt wurde angezeigt
        return;
    }
});
```

### **Direkte Auth-Prüfung:**

```javascript
// Prüfe ob User angemeldet ist
const isAuthenticated = await window.authRequiredAction.requireAuth(() => {
    // Aktion, die nach Login ausgeführt wird
    console.log('User ist angemeldet!');
});

if (!isAuthenticated) {
    // Login-Prompt wurde angezeigt
}
```

---

## 📊 Progress-Speicherung

### **Wie Progress gespeichert wird:**

1. **User klickt auf "Weiter"**
   - Auth-Prüfung wird ausgeführt
   - Falls nicht angemeldet: Login-Prompt wird angezeigt
   - Falls angemeldet: Fortfahren

2. **Progress wird gespeichert:**
   ```javascript
   // Automatisch in user-progress-tracker.js
   async saveProgress() {
       // 1. Prüfe ob User angemeldet ist
       if (!window.realUserAuth.isLoggedIn()) {
           // Speichere nur lokal
           this.saveToLocalStorage();
           return;
       }
       
       // 2. Stelle sicher, dass userId gesetzt ist
       if (!this.userId) {
           const user = window.realUserAuth.getCurrentUser();
           this.userId = user.id || user.userId || user.email;
       }
       
       // 3. Speichere in DynamoDB mit userId
       await window.awsProfileAPI.saveProfile({
           userId: this.userId,
           progressData: this.progressData,
           ...
       });
   }
   ```

3. **DynamoDB Struktur:**
   ```json
   {
     "userId": "user-123",
     "type": "user-profile",
     "progressData": {
       "pages": {
         "ikigai": {
           "firstVisit": "2025-11-16T10:00:00Z",
           "lastVisit": "2025-11-16T10:30:00Z",
           "formData": { ... },
           "steps": { ... }
         }
       },
       "sections": {
         "bewerbungsmanager": {
           "step-1": { "data": { ... } }
         }
       }
     }
   }
   ```

---

## 🎨 Login-Prompt

### **Aussehen:**

- ✅ Modernes Modal mit Gradient-Icon
- ✅ Klare Benefits-Liste
- ✅ Anmelden- und Registrieren-Buttons
- ✅ Schließen-Button (optional)

### **Verhalten:**

- ✅ Wird nur einmal angezeigt (beim ersten "Weiter"-Klick)
- ✅ Automatisches Schließen nach erfolgreicher Anmeldung
- ✅ Automatische Ausführung der gespeicherten Aktion nach Login
- ✅ Event-Listener für Auth-State-Änderungen

---

## 🔄 Workflow-Beispiel

### **Vorher (ohne Auth-Prüfung):**
```
User klickt "Weiter" → Fortschritt wird lokal gespeichert → Keine Persistenz
```

### **Nachher (mit Auth-Prüfung):**
```
User klickt "Weiter" 
  ↓
Auth-Prüfung
  ↓
Nicht angemeldet? → Login-Prompt anzeigen
  ↓
User meldet sich an
  ↓
Progress wird in DynamoDB gespeichert (mit userId)
  ↓
Aktion wird automatisch ausgeführt
```

---

## 📝 Integration in bestehende Seiten

### **1. Script einbinden:**

```html
<!-- In HTML-Seiten, die "Weiter"-Buttons haben -->
<script src="../js/auth-required-action.js"></script>
<script src="../js/user-progress-tracker.js"></script>
<script src="../js/workflow-progress-integration.js"></script>
```

### **2. Workflow initialisieren:**

```javascript
// Automatisch bei DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-workflow]')) {
        window.workflowProgressIntegration.init(null, totalSteps);
    }
});
```

### **3. "Weiter"-Button:**

```html
<!-- Button wird automatisch von workflow-progress-integration.js behandelt -->
<button data-action="next-step" class="btn btn-primary">
    Weiter
</button>
```

---

## 🧪 Testing

### **Test-Szenarien:**

1. **Nicht angemeldeter User:**
   - ✅ Klickt auf "Weiter" → Login-Prompt erscheint
   - ✅ Meldet sich an → Aktion wird automatisch ausgeführt
   - ✅ Progress wird in DynamoDB gespeichert

2. **Angemeldeter User:**
   - ✅ Klickt auf "Weiter" → Kein Prompt, direkt weiter
   - ✅ Progress wird sofort in DynamoDB gespeichert

3. **Progress-Speicherung:**
   - ✅ Progress wird mit korrektem userId gespeichert
   - ✅ Progress kann von anderen Geräten geladen werden
   - ✅ Fallback auf localStorage funktioniert

---

## 🐛 Troubleshooting

### **Problem: Login-Prompt erscheint nicht**

**Lösung:**
- Prüfe ob `auth-required-action.js` geladen wurde
- Prüfe Browser-Console auf Fehler
- Stelle sicher, dass `window.realUserAuth` verfügbar ist

### **Problem: Progress wird nicht gespeichert**

**Lösung:**
- Prüfe ob User angemeldet ist: `window.realUserAuth.isLoggedIn()`
- Prüfe ob `window.awsProfileAPI` verfügbar ist
- Prüfe Browser-Console auf Fehler
- Prüfe DynamoDB Table `mawps-user-profiles`

### **Problem: userId ist nicht gesetzt**

**Lösung:**
- Stelle sicher, dass `window.realUserAuth.getCurrentUser()` funktioniert
- Prüfe ob User korrekt in Cognito angemeldet ist
- Prüfe Browser-Console auf Auth-Fehler

---

## 📚 Weitere Informationen

- **Architektur:** Siehe `ARCHITEKTUR_ÜBERSICHT.md`
- **Daten-Speicherung:** Siehe `DATENSPEICHERUNG_ÜBERSICHT.md`
- **API-Dokumentation:** Siehe `API_OVERVIEW.md`

---

**Letzte Aktualisierung:** November 2025  
**Version:** 1.0

