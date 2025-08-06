# Manuel Weiss Professional Services - Website

Eine moderne, professionelle Website für Manuel Weiss Professional Services, die Beratungskompetenz in den Vordergrund stellt und Vermietdienstleistungen sowie IT/Upcycling-Projekte integriert.

## 🚀 Features

### Hauptfunktionen
- **Professionelle Beratung**: Fokus auf Digitalisierung, Prozessmanagement und HR-Tech
- **Vermietung**: Wohnmobil, Fotobox, Stand-Up-Paddles und E-Bikes
- **IT & Upcycling Projekte**: Innovative Lösungen und nachhaltige Projekte
- **Responsive Design**: Optimiert für alle Geräte
- **Moderne UI/UX**: Clean Design mit professioneller Farbpalette

### Technische Features
- **Mobile Navigation**: Hamburger-Menü für mobile Geräte
- **Smooth Scrolling**: Sanfte Übergänge zwischen Sektionen
- **Formular-Validierung**: Kontaktformular mit E-Mail-Validierung
- **Animationen**: Fade-in Effekte und Hover-Animationen
- **Performance-Optimiert**: Debounced Scroll-Events und Lazy Loading

## 📁 Projektstruktur

```
├── index.html          # Haupt-HTML-Datei
├── styles.css          # CSS-Styles
├── script.js           # JavaScript-Funktionalität
├── README.md           # Diese Datei
└── assets/             # Bilder und andere Assets (optional)
```

## 🎨 Design-Konzept

### Farbpalette
- **Primärfarbe**: #2563eb (Blau)
- **Sekundärfarbe**: #64748b (Grau)
- **Hintergrund**: #f8fafc (Hellgrau)
- **Text**: #1e293b (Dunkelgrau)

### Typografie
- **Schriftart**: Inter (Google Fonts)
- **Gewichtungen**: 300, 400, 500, 600, 700

### Layout
- **Container-Breite**: max-width: 1200px
- **Grid-System**: CSS Grid für responsive Layouts
- **Spacing**: Konsistente Abstände mit rem-Einheiten

## 🔧 Installation & Nutzung

### Lokale Entwicklung
1. Alle Dateien in einen Ordner kopieren
2. `index.html` in einem Browser öffnen
3. Für Live-Server: VS Code Extension "Live Server" verwenden

### Deployment
1. Alle Dateien auf einen Web-Server hochladen
2. Domain auf den Server zeigen lassen
3. SSL-Zertifikat für HTTPS einrichten (empfohlen)

## 📱 Responsive Breakpoints

- **Desktop**: > 768px
- **Tablet**: 768px - 480px
- **Mobile**: < 480px

## 🛠️ Anpassungen

### Inhalte ändern
- **HTML**: Direkt in `index.html` bearbeiten
- **Texte**: Alle Texte sind in deutscher Sprache
- **Kontaktdaten**: In der Kontakt-Sektion anpassen

### Styling anpassen
- **Farben**: In `styles.css` die CSS-Variablen ändern
- **Layout**: Grid-System in den entsprechenden Sektionen anpassen
- **Schriftarten**: Google Fonts Link in `index.html` ändern

### Funktionalität erweitern
- **JavaScript**: Neue Features in `script.js` hinzufügen
- **Formular**: Backend-Integration für Kontaktformular
- **Analytics**: Google Analytics oder andere Tracking-Tools

## 📧 Kontaktformular

Das Kontaktformular ist derzeit mit JavaScript-Validierung ausgestattet. Für die Produktivumgebung sollte eine Backend-Integration hinzugefügt werden:

### Optionen für Backend-Integration
1. **EmailJS**: Client-seitige E-Mail-Versendung
2. **Netlify Forms**: Automatische Formular-Verarbeitung
3. **PHP**: Eigenes Backend-Script
4. **Node.js**: Express.js Server

### Beispiel EmailJS Integration
```javascript
// In script.js nach der Formular-Validierung
emailjs.send('service_id', 'template_id', {
    name: name,
    email: email,
    service: service,
    message: message
});
```

## 🚀 Performance-Optimierungen

### Implementiert
- **Debounced Scroll Events**: Reduziert CPU-Last
- **Intersection Observer**: Effiziente Animationen
- **Lazy Loading**: Für zukünftige Bilder
- **Minifizierte Assets**: Für Produktivumgebung

### Empfohlen für Produktivumgebung
- **Bildoptimierung**: WebP-Format, responsive Images
- **CSS/JS Minifizierung**: Build-Prozess einrichten
- **CDN**: Für Fonts und externe Libraries
- **Caching**: Browser-Caching konfigurieren

## 🔍 SEO-Optimierung

### Meta-Tags
- Title: "Manuel Weiss - Professional Services | Beratung & Vermietung"
- Description: Vollständige Beschreibung der Services
- Viewport: Responsive Design Meta-Tag

### Strukturierte Daten
- Schema.org Markup für lokales Business
- Open Graph Tags für Social Media
- Twitter Card Meta-Tags

## 📊 Analytics & Tracking

### Empfohlene Tools
- **Google Analytics 4**: Website-Traffic
- **Google Search Console**: SEO-Performance
- **Hotjar**: User Behavior Analysis

## 🔒 Sicherheit

### Empfohlene Maßnahmen
- **HTTPS**: SSL-Zertifikat einrichten
- **Content Security Policy**: CSP-Header setzen
- **Formular-Validierung**: Server-seitige Validierung
- **XSS-Schutz**: Input-Sanitization

## 📝 Changelog

### Version 1.0.0 (2025-01-XX)
- Initiale Website-Erstellung
- Responsive Design
- Kontaktformular mit Validierung
- Mobile Navigation
- Smooth Scrolling
- Animationen und Hover-Effekte

## 🤝 Support

Bei Fragen oder Anpassungswünschen:
- **E-Mail**: weiss-manuel@gmx.de
- **Telefon**: +49 173 3993407

## 📄 Lizenz

Diese Website wurde speziell für Manuel Weiss Professional Services erstellt. Alle Rechte vorbehalten.

---

**Entwickelt mit ❤️ für professionelle Präsentation und optimale User Experience.** 