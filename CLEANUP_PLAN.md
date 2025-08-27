# 🧹 Cleanup Plan - Doppelte Dateien bereinigen

## Aktuelle Situation

### Doppelte Dateien:
1. **index.html** (modernisiert) vs **index-modern.html** (Duplikat)
2. **styles.css** (alt, 2264 Zeilen) vs **styles-modern.css** (neu, 1370 Zeilen)
3. **admin-styles.css** (alt) vs **admin-modern.css** (neu)
4. **script.js** (nur Weiterleitung) vs **script-modern.js** (neue Funktionen)

## Empfohlene Aktionen:

### 1. Index-Dateien
- ✅ **Behalten**: `index.html` (bereits modernisiert)
- ❌ **Löschen**: `index-modern.html` (Duplikat)

### 2. Style-Dateien
- ❌ **Löschen**: `styles.css` (alte Version)
- ✅ **Umbenennen**: `styles-modern.css` → `styles.css`
- ❌ **Löschen**: `admin-styles.css` (alte Version)
- ✅ **Umbenennen**: `admin-modern.css` → `admin-styles.css`

### 3. Script-Dateien
- ❌ **Löschen**: `script.js` (nur Weiterleitung)
- ✅ **Umbenennen**: `script-modern.js` → `script.js`

### 4. Fehlende Komponenten prüfen:
- Activity-Seiten (wohnmobil.html, etc.) - müssen modernisiert werden
- Kontaktformular-Funktionalität
- Bildupload-Integration
- Admin-Panel Vollständigkeit

## Cleanup-Schritte:

1. Lösche doppelte Dateien
2. Benenne moderne Versionen um
3. Update alle Referenzen in HTML-Dateien
4. Teste Funktionalität
5. Committe Änderungen
