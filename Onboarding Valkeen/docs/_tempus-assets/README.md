# Tempus-Resource Asset-Bibliothek

Zentrale Bibliothek aus wiederverwendbaren Screenshots, Icons und UI-Crops für
**alle Tempus-Resource User Guides, Trainings und QRGs** (Knauf, künftige Kunden,
generische Vorlagen).

## Ordnerstruktur

```
_tempus-assets/
├── icons/        # Kleine UI-Icons (Eye, Lock, Edit, Clone, Delete, Star, ...)
├── buttons/      # Buttons & Toolbar-Elemente (Checkout, Save, Release, +Project, ...)
├── chrome/       # UI-Chrome-Crops (Top-Bar, View-Selector, Tab-Strip, Breadcrumb)
├── screens/      # Vollbild-Screenshots (homescreen, project grid, allocations, ...)
├── highlights/   # Screenshots mit gelbem/rotem Highlight für Step-by-Step
└── index.json    # Manifest aller Assets (ID, Datei, Quelle, Rolle, generic/customer)
```

## Naming Convention

- **icons/**: `icon_<concept>.png` – z. B. `icon_eye_public.png`, `icon_lock.png`
- **buttons/**: `btn_<concept>.png` – z. B. `btn_checkout.png`, `btn_save.png`
- **chrome/**: `chrome_<area>_<state>.png` – z. B. `chrome_view_selector.png`
- **screens/**: `screen_<module>_<role>.png` – z. B. `screen_homescreen_pmsm.png`
- **highlights/**: `hl_<module>_<step>.png` – z. B. `hl_views_clone_step3.png`

## Generic vs. Customer-spezifisch

Im `index.json` wird per Feld `scope` unterschieden:
- `generic` – wiederverwendbar in jedem Kundenkontext (z. B. Help-Center-Icons)
- `customer:<name>` – sandbox-spezifisch (z. B. `customer:knauf` für knaufdev)

Wo möglich, immer zuerst `generic` Assets verwenden.

## Verwendung in Markdown (QRG-Skript)

```markdown
Click :icon[edit] to edit a view.
```

oder explizit mit Pfad und Höhe:

```markdown
Click ![edit|h=14](lib:icons/icon_edit.png) to edit a view.
```

Für Highlight-Steps:

````markdown
:::highlight image=lib:highlights/hl_views_clone_step3.png caption="Click the copy icon next to a public view"
:::
````

Block-Screenshot (Vollbild):

```markdown
![Homescreen for PM/SM](lib:screens/screen_homescreen_pmsm.png)
```

## Neue Assets hinzufügen

1. Datei in passenden Unterordner kopieren (Naming-Convention beachten)
2. Eintrag in `index.json` ergänzen:

```json
"icon_edit": {
  "file": "icons/icon_edit.png",
  "scope": "generic",
  "source": "ProSymmetry Help Center – User Guide",
  "description": "Pencil edit icon used across views, attributes, schedules",
  "default_inline_height_pt": 14
}
```

3. Optional in einem Doc verlinken und prüfen, dass der Build durchläuft.

## Quellen

- **ProSymmetry Help Center** (support.tempusresource.com) – generische Icons,
  Workflows, Screenshots des Hilfecenters.
- **knaufdev.tempus-resource.com** – Knauf-Sandbox (kundenspezifisch).
- Andere Kunden-Sandboxes (in Zukunft entsprechend taggen).

## Tooling

Im Unterordner `_tools/` liegt `crop_icons.py`. Dieses Skript ist die Quelle
der Wahrheit, wie einzelne Icons aus den Quell-Screenshots herausgeschnitten
und in `index.json` registriert werden.

Workflow zum Anlegen neuer Icons:

1. Quell-Screenshot in `chrome/` oder `screens/` ablegen (Viewport 1024×924
   oder ähnlich).
2. In `crop_icons.py` einen neuen `CROPS["icon_…"]` Eintrag mit `box=(x1,y1,x2,y2)`
   und `source_label` ergänzen.
3. `python _tools/crop_icons.py` ausführen – das schreibt das PNG und
   aktualisiert `index.json`.
4. Im Markdown jeder Doc verwenden: `:icon[icon_…]`.

Tipp: Für `box`-Koordinaten reicht es, die Quelle in einem Bildbetrachter zu
öffnen und die Mauskoordinaten abzulesen, dann ±5 px Puffer einplanen.

## Verwendung in einem neuen Trainings-Dok

Ein neues Trainings-Dok (z. B. `Knauf Admin Guide/`, `Knauf Timesheet Guide/`)
kann das `generate_qrg_docx.py`-Skript als Vorlage kopieren. Das Skript löst
`lib:…`-Pfade und `:icon[name]`-Inline-Syntax automatisch auf die zentrale
Bibliothek auf. Voraussetzung: das neue Dok liegt **als Schwester-Ordner**
neben `_tempus-assets/` (also unter `Onboarding Valkeen/docs/<NeuerOrdner>/`),
sodass der relative Pfad `..\/_tempus-assets/` weiterhin funktioniert.
