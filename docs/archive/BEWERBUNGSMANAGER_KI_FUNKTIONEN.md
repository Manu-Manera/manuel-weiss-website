# Bewerbungsmanager - Erweiterte KI-Funktionen

## Übersicht

Der Bewerbungsmanager nutzt jetzt **ChatGPT 3.5 Turbo** für die intelligente Generierung von Anschreiben und Lebensläufen. Zusätzlich wurden erweiterte Textbearbeitungsfunktionen implementiert, die eine präzise Anpassung einzelner Textpassagen ermöglichen.

## 🔑 API Key Einrichtung

1. Öffnen Sie die Anschreiben-Generator Seite
2. Klicken Sie auf "OpenAI API Key Einstellungen"
3. Geben Sie Ihren OpenAI API Key ein (beginnt mit `sk-...`)
4. Klicken Sie auf "Speichern"

Der API Key wird sicher in Ihrem Benutzerprofil gespeichert.

## ✨ Neue Funktionen

### 1. KI-gestützte Generierung

#### Anschreiben-Generator
- **Vollständige ChatGPT Integration**: Generiert individuelle Anschreiben basierend auf:
  - Stellenbeschreibung
  - Ihrem Profil
  - Gewählten Optionen (Tonalität, Länge, Fokus)
- **Intelligente Keyword-Erkennung**: Identifiziert relevante Fähigkeiten aus der Stellenbeschreibung
- **Fallback-System**: Nutzt Templates wenn kein API Key vorhanden

#### Lebenslauf-Generator (CV Tailor)
- **Professionelle Formulierungen**: Optimiert für ATS-Systeme
- **Zielgerichtete Anpassung**: Passt den Lebenslauf an spezifische Stellenausschreibungen an
- **Multiple Formate**: Export als PDF, DOCX oder Text

### 2. Erweiterte Textbearbeitung

#### Kontextmenü (Rechtsklick)
1. **Text markieren**: Wählen Sie einen Textbereich aus
2. **Rechtsklick**: Öffnet das Kontextmenü
3. **Optionen wählen**:
   - 🔍 **Formulierungsvorschläge**: 3 alternative Formulierungen
   - ✨ **Text verbessern**: Macht den Text professioneller
   - 📏 **Text kürzen**: Reduziert auf das Wesentliche
   - 📝 **Text erweitern**: Fügt relevante Details hinzu
   - 💼 **Professioneller formulieren**: Optimiert für Bewerbungen

#### Alternativvorschläge
- **3 Varianten**: Die KI generiert drei unterschiedliche Formulierungen
- **Doppelklick**: Übernehmen der gewählten Alternative
- **Instant Preview**: Sehen Sie die Alternativen direkt im Modal

### 3. Intelligente Features

#### Auto-Save
- Änderungen werden automatisch gespeichert
- Integration mit AWS Backend für Cloud-Speicherung

#### Progress Tracking
- Fortschritt wird für jeden Workflow-Schritt gespeichert
- Nahtlose Fortsetzung bei späteren Besuchen

#### Smart Templates
- Templates passen sich an Ihre Eingaben an
- Dynamische Längenanpassung
- Branchenspezifische Formulierungen

## 📋 Verwendung

### Anschreiben erstellen
1. Füllen Sie die Stelleninformationen aus
2. Wählen Sie Tonalität, Länge und Fokus
3. Klicken Sie auf "Anschreiben generieren"
4. Nutzen Sie das Kontextmenü für Feinabstimmungen

### Text optimieren
1. Markieren Sie den zu bearbeitenden Text
2. Rechtsklick für Kontextmenü
3. Wählen Sie die gewünschte Aktion
4. Doppelklick auf eine Alternative zum Übernehmen

## 🛠️ Technische Details

### Verwendete Technologien
- **OpenAI API**: GPT-3.5-turbo Modell
- **AWS Integration**: DynamoDB, S3, Lambda
- **Frontend**: Vanilla JavaScript mit modernem ES6+

### API Limits
- Max. 800 Tokens pro Anschreiben-Generierung
- Max. 300 Tokens für Alternativvorschläge
- Max. 200 Tokens für Textverbesserungen

## 🚀 Tipps für beste Ergebnisse

1. **Detaillierte Stellenbeschreibungen**: Je mehr Informationen, desto besser das Ergebnis
2. **Vollständiges Profil**: Füllen Sie Ihr Profil komplett aus
3. **Iterative Verbesserung**: Nutzen Sie die Textbearbeitungsfunktionen für Feintuning
4. **Keywords beachten**: Die KI erkennt und integriert relevante Keywords automatisch

## ❓ Häufige Fragen

**F: Was kostet die Nutzung?**  
A: Sie benötigen einen eigenen OpenAI API Key. Die Kosten hängen von Ihrer Nutzung ab (ca. 0,001€ pro Anschreiben).

**F: Werden meine Daten gespeichert?**  
A: Ja, in Ihrem persönlichen AWS-Profil. Alle Daten sind verschlüsselt und nur für Sie zugänglich.

**F: Funktioniert es auch ohne API Key?**  
A: Ja, es gibt ein Template-basiertes Fallback-System, aber die KI-Features sind dann nicht verfügbar.

**F: Kann ich die generierten Texte bearbeiten?**  
A: Ja, alle Texte sind vollständig editierbar. Nutzen Sie das Kontextmenü für KI-gestützte Verbesserungen.

## 📞 Support

Bei Fragen oder Problemen wenden Sie sich an:
- Email: support@manuel-weiss.ch
- Dokumentation: https://mawps.netlify.app/docs

---

*Version 1.0 - November 2024*
