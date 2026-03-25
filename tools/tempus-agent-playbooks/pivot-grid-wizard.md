# Agent-Playbook: Tempus Pivot Grid (trial5) — bis Save

**Ziel:** Report **persistiert** (nicht mehr nur `/create`, oder unter **Mine** in der Liste).

## Regel (Produktlogik)

Nur **General** (Name, Beschreibung, Source model) reicht **nicht**. Mindestens **Dimensions** sinnvoll füllen (typisch: etwas in **Rows** und/oder **Columns**, oft zusätzlich **Measures**). Danach **Layout** nur bei Bedarf. **Erst dann Save.**

## URLs

- Liste: `https://trial5.tempus-resource.com/slot4/reportlist/list`
- Wizard: `.../reportview/pivotgrid/create`

## Schritte (immer wieder `browser_snapshot`, Refs neu nehmen)

1. **Liste:** Warten bis Tiles da → **erste Kachel** = Pivot Grid → **Doppelklick** (Refs meist `e13` bei sieben Tiles `e13`–`e19`; variiert).
2. **General:** Erstes `textbox` = Reportname, zweites = Beschreibung. Source model: `select`-Button → Option wählen (z. B. **Stardust 2026**).
3. **Tab Dimensions:** Klick auf Tab mit Namen **Dimensions** (Ref z. B. `e77`/`e139` — **immer Snapshot**).
4. **Dimensions-Baum expandieren:** Fokus auf Knoten **date Date** (`treeitem`), dann **`ArrowRight`** expandiert Kinder (Year, Quarter, Month, …). **Measures**-Knoten: oft Klick durch überlagernde Liste schwierig — alternativ Tastatur-Fokus im Baum (`Tab`/`ArrowDown`) testen.
5. **Felder zu Rows/Columns:** In der UI per **Drag&Drop** (Kendo).  
   **Grenze Cursor-Browser-MCP:** `browser_drag` scheitert mit *„does not appear to be draggable“* — kein HTML5-`draggable`. **Vollautomatischer Abschluss** braucht **Playwright** `locator.dragTo()` / Mauspfad oder manuellen Drag durch den Nutzer.
6. **Layout:** Tab nur wenn Save noch blockiert oder UI es verlangt.
7. **Save:** Nach gültiger Konfiguration; Ref fehlt oft → `browser_search` „Save“ für Position; ggf. Nutzer klickt einmal manuell.

## Validierung

- Zurück zur Liste → Suche nach Reportnamen → Filter **Mine**.

## Session-Notiz (2026-03-25)

- Erfolgreich getestet: Wizard offen, General ausgefüllt, Stardust 2026, Tab Dimensions, **date** per **ArrowRight** expandiert.
- Nicht durch MCP automatisierbar: **Drop in Rows** ohne Playwright/Maus-Synthese.
