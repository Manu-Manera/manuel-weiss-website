# 🚨 NOTFALL-LÖSUNG: Netlify zeigt alte Version

## PROBLEM IDENTIFIZIERT
- Service Worker cached alte Version!
- Netlify zeigt NICHT die aktuelle admin.html
- User Management fehlt komplett auf der Live-Seite

## SOFORT-LÖSUNG

### 1. Service Worker im Browser löschen:
```javascript
// Öffne https://mawps.netlify.app/admin
// Öffne Browser Console (F12) und führe aus:

navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
        registration.unregister();
    }
});

// Dann:
location.reload(true);
```

### 2. Alternative URL testen:
Füge einen Query-Parameter hinzu um Cache zu umgehen:
```
https://mawps.netlify.app/admin.html?v=new
https://mawps.netlify.app/admin.html?nocache=1
```

### 3. Netlify Cache manuell löschen:
1. Login bei https://app.netlify.com
2. Wähle deine Site
3. Gehe zu "Deploys"
4. Klicke auf "Trigger deploy" → "Clear cache and deploy site"

## PERMANENT-FIX
Service Worker deaktivieren in script.js!
