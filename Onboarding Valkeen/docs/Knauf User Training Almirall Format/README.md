# Knauf User Training — aus Almirall-Vorlage (tiefe Bereinigung)

## Pflichtlektüre

**`PROMPT_UND_ANFORDERUNGEN_KNAUF_PM.md`** — konsolidierte Ziele aus dem Projektchat (Scope PM/SM, Reihenfolge, keine Fremd-Tenant-Artefakte, QA-Kriterien).

## Ausgabe

| Datei | Beschreibung |
|-------|----------------|
| **`Knauf_User_Training_PM_Almirall_Format.docx`** | Neu gebaute Trainingsdatei (Styles/Inline-Icons wie Vorlage; Inhalt Knauf). |
| `Knauf_User_Training_PM_Almirall_Format.pdf` | Optional: `soffice --headless --convert-to pdf …` |

## Build

```bash
source "../Knauf PM SM Guide/.venv/bin/activate"
cd "Onboarding Valkeen/docs/Knauf User Training Almirall Format"
python build_knauf_almirall_format.py
```

Das Skript ist **idempotent**: immer Kopie aus `Almirall_PM_Training_ORIGINAL.docx`, dann Transformation.

### Was das Skript jetzt leistet (Kurz)

1. **Struktur** wie spezifiziert: BPA-Kapitel entfernt; Reihenfolge Create → Attributes → SPA → **Financials** → View Management; Homescreen-Tabelle PM/SM; Scope-Hinweis unter Overview.
2. **Textersatz** auf Absatz-/Tabellenebene (`python-docx`) für Lesbarkeit im Editor.
3. **OPC-ZIP-Tiefenersatz** in **allen** `*.xml` und `*.rels` (u. a. **Hyperlink-Ziele** in `document.xml.rels`, Fußzeilen, Felder): vollständige Entfernung von `Almirall`, `Almirall Hermal`, alten URLs usw.
4. **Screenshots:** alle **größeren** eingebetteten Rastergrafiken werden **automatisch** durch Bilder aus dem **Knauf-Screenshot-Pool** ersetzt (gesammelt aus `Knauf PM SM Guide/`, `Knauf QRG v2/`, `Knauf User Training/`, `Knauf Quick Reference Guide/`, `Knauf SHS Adapted/screenshots/`). Kleinste Icons (typ. ≤72×72) bleiben unangetastet.
5. **QA:** Abbruch mit Fehler, wenn irgendwo im Paket noch `almirall` vorkommt.

### Feinsteuerung einzelner Bilder

`config/image_mapping.json` — explizite Zuordnung `imageN.png` → Pfad relativ zu diesem Ordner (überschreibt den Pool für diese Datei).

## Weitere Guides unter `Onboarding Valkeen/docs/` (Referenz)

| Ordner | Nutzen für Inhalte/Screens |
|--------|----------------------------|
| `Knauf PM SM Guide/` | Ausführlicher Fließtext, annotierte & Detail-Screenshots. |
| `Knauf QRG v2/` | Kompakte PM/SM-QRG inkl. Financials-Kapitel (Markdown → DOCX). |
| `Knauf Quick Reference Guide/` | QRG mit `qrg_*`-Screens. |
| `Knauf User Training/` | Ältere breitere Trainings Screenshots (`02_homescreen.png`, …). |
| `Knauf SHS Adapted/` | ZIP-Media-Tausch + Text-Patterns als Referenzimplementierung. |
| `_tempus-assets/` | Icon-/Chrome-Bibliothek (generisch). |

## Bekannte Grenze

Automatischer Bild-Pool rotiert deterministisch — wenn **ein bestimmter** Abschnitt optisch das „falsche“ Knauf-Bild zeigt, bitte die entsprechende `imageN.png` in **`image_mapping.json`** fest verdrahten (einmalige Zuordnung nach visuellem QA in Word).
