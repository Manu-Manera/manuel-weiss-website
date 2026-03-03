# Valkeen Onboarding Hub

Eine moderne Glass-Morphism Web-App für das 90-Tage Onboarding bei Valkeen.

## Features

- **Dashboard** - Übersicht über Fortschritt, aktuelle Phase und Meilensteine
- **Aufgaben-Tracker** - Alle Aufgaben nach Wochen organisiert mit Checkpoints
- **Wissens-Quiz** - Interaktive Quiz-Fragen zu jeder Woche
- **KI-Coach** - GPT-basierter Sparring-Partner für PPM & Tempus Resource
- **Kalender** - Visualisierung der Meilensteine und Fortschritt
- **Ressourcen-Bibliothek** - Alle Lernmaterialien an einem Ort
- **Report** - Fortschrittsbericht zum Exportieren und Teilen

## Tech Stack

- React 19 + Vite
- Tailwind CSS 4
- React Router
- Lucide Icons
- date-fns
- OpenAI API (für KI-Coach)

## Installation

```bash
cd onboarding-app
npm install
npm run dev
```

Die App läuft dann unter http://localhost:3000

## KI-Coach Setup

1. Gehe zur "KI Coach" Seite
2. Gib deinen OpenAI API-Key ein (wird lokal gespeichert)
3. Starte das Gespräch!

## Daten-Persistenz

Alle Fortschrittsdaten werden im LocalStorage des Browsers gespeichert:
- Aufgaben-Status
- Quiz-Ergebnisse
- Notizen
- Startdatum

## Struktur

```
src/
├── components/     # Wiederverwendbare UI-Komponenten
├── data/          # Onboarding-Daten (Aufgaben, Quiz, Ressourcen)
├── hooks/         # Custom React Hooks (LocalStorage)
├── pages/         # Seiten-Komponenten
└── utils/         # Hilfsfunktionen
```

## Anpassung

Die Onboarding-Daten können in `src/data/onboardingData.js` angepasst werden:
- Wochen und Aufgaben
- Quiz-Fragen
- Ressourcen-Links
- Meilensteine

---

Erstellt für Valkeen GmbH
