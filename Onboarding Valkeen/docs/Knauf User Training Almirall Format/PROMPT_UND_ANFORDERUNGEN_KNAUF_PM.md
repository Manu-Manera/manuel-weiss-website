# Arbeits-Prompt & konsolidierte Anforderungen — Knauf PM/SM Tempus Training (Almirall-Vorlage)

Dieses Dokument bündelt die **Zielrichtung aus dem gesamten bisherigen Chat** und dient als **verbindliche Spezifikation** für Builds und QA. Es ersetzt lose Schätzungen durch prüfbare Kriterien.

---

## 1. Zielgruppe & Scope

| Anforderung | Quelle / Begründung |
|-------------|---------------------|
| **Primär Planner PM/SM** (nicht RM im Fokus) | Feedback Marc: Guide auf PM/SM schärfen; RM später separat. |
| **Blended = PM/SM + PPM**, nicht RM | Korrektur zu früheren Versionen („Blended“ nicht als RM lesen). |
| **Bulk Project Allocation / RM-Schwerpunkte** | Für diese Ausgabe **nicht**: eigener RM-Guide später. |
| **Sprache der Auslieferung** | Englisch wie Vorlage Almirall/SHS (Tempus-Kundenunterlagen üblicherweise EN); deutschsprachige Begleitkommunikation möglich. |

---

## 2. Didaktische Reihenfolge (Planner-Flow)

| Priorität | Inhalt |
|-----------|--------|
| **1** | **Projekt anlegen** mit Schwerpunkt **Attribute**, **Ressourcen (SPA)**, **Finanzen** |
| **2** | **Projekt finden & öffnen** — gleiche Pflege-Schleifen wie bei „Create“, nur anderer Einstieg (Grid / Views). |

Konsequenz für die Word-Struktur: Nach dem Navigations-/Login-Teil muss die **Projekt-Kapitelfolge** diese Priorität widerspiegeln (Create → Stammdaten → SPA → Financials → Find/Open über Views).

---

## 3. Vorlage & Format („1:1“)

| Anforderung | Umsetzungsnote |
|-------------|----------------|
| **Ausgangsfile** | „User Training Guide_Project Manager_Almirall.docx“ als Layout-/Style-Vorlage (Heading-Hierarchie, List Paragraph, eingebettete **kleine Icon-Grafiken** im Fließtext). |
| **Kein Neu-Erfinden des Layouts** | Änderungen über **Bearbeitung der bestehenden DOCX** (Absätze verschieben/löschen, OPC-XML-Text ersetzen, Medien im ZIP tauschen), nicht durch einen zweiten Markdown→DOCX-Stil der andere Corporate-Optik hat. |
| **Bearbeitbare Highlights** | Wo gefordert (SHS-Zweig): Word-Shapes statt eingebrennter PIL-Annotation — für Almirall-Zweig sind Highlights oft bereits gelb markiert in Screenshots; langfristig nachziehen wenn gewünscht. |

---

## 4. Knauf-Branding & Datenhygiene (nicht verhandelbar)

**Alles**, was einen **anderen Mandanten** erkennen lässt, ist ein **Lieferfehler**:

| Kategorie | Akzeptanzkriterium |
|-----------|---------------------|
| **Text** | Keine Vorkommen von `Almirall`, `almirall`, **„Almirall Hermal“**, alte URLs `*.almirall.tempus-resource.com`, Siemens-/SHS-/anderen Alt-Kundenstrings (falls je eingekopiert), außer in rein technischen Repo-Pfaden oder diesem Prompt-Dokument. |
| **Hyperlinks** | OPC `word/document.xml` / Header / Footer: **gleiche Regeln wie sichtbarer Text** — Hyperlinks sind oft **nicht** über `python-docx`-Run-Text ersetzbar. |
| **Screenshots** | Alle **großen** Einbettungen (UI mit fremdem Tenant, Projektliste, Login, Homescreen, Grid, SPA, Financials, Dialoge) müssen auf **Knauf-Sandbox-/Genehmigt-Knauf**-Screens oder neutrale Hilfsmittel zeigen. |
| **Kleine Icons** | Dürfen **generisch** bleiben, wenn sie **tenant-neutral** sind; sobieselbe Grafik tenant-spezifische Pixel enthält → tauschen. |

**QA-Schritt nach jedem Build:** ZIP durchsuchen (`word/*.xml`) auf Reststrings + Stichprobe PNG auf Fremd-Branding.

---

## 5. Inhaltliche Tiefe (Anti-Oberflächlichkeit)

| Thema | Erwartung |
|-------|-----------|
| **Financials** | Nicht nur ein Absatz: mind. **Hourly vs Advanced Rate**, **Cost Plan**, **Budget vs Actual**, **Lock Periods**, **Re-forecast** — konsistent mit Marc-/Knauf-Phase-1-Diskussion. |
| **SPA** | Toolbar, Checkout, Capacity Units, Manday/Kosten-Ansicht, sinnvolle Optionen — nicht nur „Toolbar Reference“-Stub. |
| **Create** | Mit/ohne Template, realistische Felder/Hinweise zur PMO-/Intake-Logik soweit in Knauf-Umgebung bekannt. |

Referenz zu **weiteren Guides** unter `Onboarding Valkeen/docs/`:

- `Knauf PM SM Guide/` — ausführlicher Fließtext + annotierte Screens.
- `Knauf QRG v2/` — strukturierter QRG mit Financials-Kapitel.
- `Knauf Quick Reference Guide/` — kompakte Tabellen & qrg_* Screens.
- `Knauf User Training/` — frühere breitere User-Training-Ansätze + ältere Screens.
- `Knauf SHS Adapted/` — Muster für **ZIP-Medientausch** + `text_replacements.json`.

---

## 6. Build- & Wartungsprozess

1. **Quelle**: unveränderte `Almirall_PM_Training_ORIGINAL.docx` im selben Ordner.  
2. **Skript**: `build_knauf_almirall_format.py` — idempotent, kompletter Neuaufbau aus Vorlage.  
3. **Phasen**: Struktur (Kapitel/Duplikate) → Textersetzung inkl. **OPC-XML-Gesamtersatz** → **Medien-Tausch** (automatisch + optional `config/image_mapping.json`).  
4. **Ausgabe**: `Knauf_User_Training_PM_Almirall_Format.docx` + optional PDF-Vorschau.  
5. **Regression**: Automatischer Check „keine `almirall` in word/*.xml“.

---

## 7. Bekannte Einschränkungen / manuelles Feintuning

- Wenn ein **einzelner** Screenshot inhaltlich falsch platziert wirkt (weil automatisch aus dem Pool zugewiesen), **explizit** in `config/image_mapping.json` die Datei `imageN.png` zuweisen — QA im Word nach erstem Gesamtbuild.
- Felder/Inhaltsverzeichnis in Word einmal **aktualisieren (F9)**.

---

*Stand: automatisch aus Repo-/Chat-Anforderungen abgeleitet; bei Änderungen am Knauf-Produkt oder Rollout bitte diese Datei mitpflegen.*
