# Aktivitäten-Galerie Verwaltung

## Übersicht

Das Admin-Panel wurde erweitert, um eine umfassende Galerie-Verwaltung für alle "sonstigen Tätigkeiten" zu bieten. Jede Aktivität (Wohnmobil, Fotobox, E-Bike, SUP) hat jetzt einen eigenen Admin-Bereich mit vollständigem Galerie-Management.

## Neue Funktionen

### 1. Separate Admin-Bereiche
- **Wohnmobil**: Eigener Bereich mit Upload, Preisen und Features
- **Fotobox**: Separate Verwaltung für Event-bezogene Inhalte  
- **E-Bike**: Spezielle Einstellungen für Fahrradverleih
- **SUP**: Stand-Up-Paddle Management mit Wassersport-Fokus

### 2. Galerie-Upload Funktionen
- **Multi-File Upload**: Mehrere Bilder gleichzeitig hochladen
- **Bildvorschau**: Sofortige Vorschau aller hochgeladenen Bilder
- **Bildmetadaten**: Titel und Beschreibung für jedes Bild editieren
- **Bildlöschung**: Einzelne Bilder aus der Galerie entfernen
- **Drag & Drop**: Intuitive Bedienung (geplant für zukünftige Updates)

### 3. Erweiterte Datenverwaltung
- **Aktivitäts-spezifische Daten**: Titel, Untertitel, Beschreibung, Features, Preise
- **Galerie-Integration**: Bilder werden automatisch in den entsprechenden Bereichen angezeigt
- **Echtzeitvorschau**: Änderungen werden sofort sichtbar

## Admin-Panel Navigation

### Sidebar-Struktur
```
📋 Sonstige Tätigkeiten
├── 📋 Übersicht
├── 🏕️ Wohnmobil
├── 📷 Fotobox  
├── 🏄 Stand-Up-Paddle
└── 🚲 E-Bike
```

### Pro Aktivität verfügbar:
1. **Grundinformationen**: Titel, Untertitel, Beschreibung, Icon
2. **Bildergalerie**: Upload-Bereich mit Vorschau
3. **Preise & Details**: Spezifische Preisstrukturen
4. **Features**: Ausstattung und Leistungen

## Technische Implementierung

### Dateien

#### JavaScript
- `admin-script.js`: Erweitert um Galerie-Management Funktionen
- `js/activity-gallery.js`: Neue Galerie-Anzeige für Frontend-Seiten

#### CSS  
- `admin-styles.css`: Neue Stile für Galerie-Upload und -Verwaltung
- `styles.css`: Frontend-Galerie Stile mit Lightbox-Funktionalität

#### Datenstruktur
- `data/website-content.json`: Erweitert um Galerie-Metadaten und Details
- LocalStorage: `{activity}_images` Keys für hochgeladene Bilder

### Neue CSS-Klassen

#### Admin-Panel
```css
.activity-images         /* Galerie-Container */
.activity-image-item     /* Einzelnes Bild-Element */
.image-preview          /* Bildvorschau */
.image-overlay          /* Hover-Bedienelemente */
.image-info             /* Metadaten-Eingabefelder */
.upload-placeholder     /* Upload-Bereich */
```

#### Frontend-Galerie
```css
.gallery-section        /* Galerie-Sektion */
.gallery-grid          /* Bild-Grid Layout */
.gallery-item          /* Einzelnes Galerie-Element */
.lightbox              /* Vollbild-Ansicht */
.lightbox-content      /* Lightbox-Inhalt */
```

## Verwendung

### Als Administrator

1. **Admin-Panel öffnen**: `admin.html` aufrufen
2. **Aktivität auswählen**: In der Sidebar auf gewünschte Aktivität klicken
3. **Bilder hochladen**: 
   - Auf "+" Bereich klicken
   - Mehrere Bilder auswählen (max. 10MB pro Bild)
   - Titel und Beschreibung eingeben
4. **Speichern**: "Alle Änderungen speichern" klicken

### Als Besucher

1. **Aktivitäten-Seite besuchen**: z.B. `wohnmobil.html`
2. **Galerie ansehen**: Automatisch angezeigte Bildergalerie
3. **Lightbox**: Auf Bilder klicken für Vollbild-Ansicht
4. **Navigation**: ESC-Taste oder X-Button zum Schließen

## Datenfluss

```
Admin Upload → localStorage → Website Data → Frontend Display
```

1. **Upload**: Bilder werden in `{activity}_images` gespeichert
2. **Synchronisation**: `updateWebsiteData()` aktualisiert zentrale Daten
3. **Anzeige**: `activity-gallery.js` lädt und zeigt Bilder an
4. **Kommunikation**: PostMessage zwischen Admin und Frontend

## Sicherheit & Performance

### Validierung
- **Dateityp**: Nur Bilddateien (image/*)
- **Dateigröße**: Max. 10MB pro Bild
- **Anzahl**: Keine Begrenzung, aber Performance-Optimierung empfohlen

### Speicherung
- **LocalStorage**: Für Admin-uploaded Bilder
- **Base64**: Bilder werden als Data-URLs gespeichert
- **Fallback**: Graceful Degradation bei Speicher-Problemen

### Performance
- **Lazy Loading**: Bilder werden bei Bedarf geladen
- **Optimierung**: CSS-Transforms für flüssige Animationen
- **Responsive**: Grid-Layout passt sich an Bildschirmgröße an

## Browser-Kompatibilität

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Features**: CSS Grid, JavaScript ES6, File API, LocalStorage
- **Fallbacks**: Grundfunktionalität auch ohne JavaScript

## Zukünftige Erweiterungen

### Geplante Features
1. **Cloud-Integration**: Netlify/Vercel Storage für permanente Speicherung
2. **Bildoptimierung**: Automatische Kompression und Formatkonvertierung
3. **Bulk-Upload**: Drag & Drop für mehrere Ordner
4. **Bildfilter**: Kategorisierung und Filterung
5. **Galerie-Templates**: Verschiedene Anzeigeformate

### API-Integration
```javascript
// Beispiel für zukünftige Cloud-Integration
async function uploadToCloud(imageData, activityName) {
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: JSON.stringify({
            image: imageData,
            activity: activityName,
            metadata: { title, description }
        })
    });
    return response.json();
}
```

## Fehlerbehebung

### Häufige Probleme

#### Bilder werden nicht angezeigt
- **Lösung**: Browser-Cache leeren, localStorage prüfen
- **Debug**: Entwicklertools → Application → Local Storage

#### Upload funktioniert nicht  
- **Lösung**: Dateigröße prüfen (max. 10MB), Dateityp validieren
- **Debug**: Console → Fehlermeldungen prüfen

#### Galerie lädt nicht
- **Lösung**: JavaScript-Fehler prüfen, Pfade validieren
- **Debug**: Network-Tab → 404-Fehler suchen

### Debug-Kommandos
```javascript
// LocalStorage-Inhalte anzeigen
Object.keys(localStorage).filter(key => key.includes('_images'));

// Galerie neu laden
activityGallery.loadActivityImages();

// Alle Admin-Daten anzeigen
console.log(JSON.parse(localStorage.getItem('websiteData')));
```

## Support

Bei Problemen oder Fragen:
1. **Console-Logs prüfen**: Entwicklertools → Console
2. **LocalStorage validieren**: Application → Local Storage
3. **Datei-Integrität**: Alle JavaScript/CSS-Dateien vorhanden?
4. **Browser-Kompatibilität**: Moderne Browser-Version verwenden

---

*Letzte Aktualisierung: Januar 2025*
