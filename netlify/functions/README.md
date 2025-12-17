# ⚠️ DEPRECATED: Netlify Functions

**Diese Netlify Functions sind veraltet und werden nicht mehr verwendet.**

Das System wurde komplett auf **AWS Lambda API-First** umgestellt:

- ✅ **Rental Images**: `lambda/rental-images-api/` (statt Netlify Functions)
- ✅ **Contact Email**: `lambda/contact-email-api/` (statt `send-contact-email.js`)

## Migration

Alle Funktionen wurden zu AWS Lambda migriert:
- Konsistente API-Struktur
- Bessere Skalierbarkeit
- Einheitliche Architektur

Die alten Netlify Functions bleiben hier für Referenzzwecke, werden aber nicht mehr deployed.

