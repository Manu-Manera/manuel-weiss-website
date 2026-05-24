# Knauf SHS Adapted — Workflow

This folder adapts the original SHS-IT Project-Manager training (which we
authored at Valkeen) for the Knauf engagement. The original DOCX is treated
as a **read-only template**; every customer-specific tweak lives in one of
three JSON configs that drive `adapt_shs.py`.

## What gets produced

- `Knauf_PM_Training.docx` — the final, customer-ready document
- `Knauf_PM_Training.pdf`  — automatically rendered preview (LibreOffice)
- `preview/page-*.png`      — page-by-page PNG previews for visual QA

Everything else (`*.py`, `config/*.json`, `screenshots/*.png`) is source.

## How the build works

```
SHS_PM_Original.docx                      (read-only template)
        │
        │  shutil.copy
        ▼
Knauf_PM_Training.docx (working copy)
        │
        │  1. apply_image_replacements()   ← config/image_mapping.json
        │     (ZIP-level swap with aspect-fit so the doc layout stays stable)
        │
        │  2. apply_text_replacements()    ← config/text_replacements.json
        │     (run-level + paragraph-level fallback)
        │
        │  3. apply_highlights()           ← config/highlights.json
        │     (DrawingML rectangles → real Word shapes, editable!)
        ▼
Knauf_PM_Training.docx (ready)
```

Re-running `python adapt_shs.py` is idempotent: it always clones the
source template fresh and re-applies the configs from scratch, so
deleting/editing a JSON entry just makes that change vanish from the
next build.

## The three configs

### 1. `config/text_replacements.json`

```json
{ "replacements": [
  { "from": "Siemens Healthineers", "to": "Knauf" },
  { "from": "Healthineers-ID Login", "to": "Knauf SSO Login" }
]}
```

Each entry is a simple `from`/`to` pair, applied across body text, all
table cells, and headers/footers. The replacement is run-level when
possible (formatting preserved) and falls back to paragraph-level if a
target string is split across multiple runs.

### 2. `config/image_mapping.json`

```json
{ "replacements": {
  "image12.png": "screenshots/login_knauf.png",
  "image13.png": "screenshots/homescreen_tiles.png"
}}
```

The key is the **filename inside `word/media/`** of the source DOCX.
Use `python adapt_shs.py --list-images` (or the auto-generated
`image_inventory.md`) to see all 84 candidates with their pixel size
and a suggested action.

The new image is **aspect-fit** into the original's pixel dimensions,
so the layout in `document.xml` never shifts. The PNG is centred on a
white canvas if the aspect ratio differs.

### 3. `config/highlights.json`

```json
{ "highlights": [
  { "paragraph_index": 62, "x_cm": 3.0, "y_cm": 1.4,
    "w_cm": 7.3, "h_cm": 1.6, "color": "F2B807",
    "line_width_pt": 2.25, "label": "Knauf SSO button" }
]}
```

This drops a **Word-native floating rectangle** (DrawingML `wps:wsp`,
rounded corners, transparent fill, coloured border) onto the paragraph
at `paragraph_index`. Position is relative to that paragraph's top-left
in centimetres. Once the file is open in Word you can:

- Click the rectangle → drag to move
- Drag the corner handles → resize
- Format → Shape Outline → recolour / change weight / dash style
- Right-click → Send to Back / Bring to Front

To find the right `paragraph_index` for a target image, open the DOCX
in a python-docx REPL:

```python
from docx import Document
d = Document("Knauf_PM_Training.docx")
for i, p in enumerate(d.paragraphs):
    if p._p.xpath(".//w:drawing"):           # paragraphs that contain images
        print(i, p.text[:60])
```

## Adding more substitutions — recommended workflow

1. Open `image_inventory.md` and decide which images need a Knauf
   counterpart. Many will be **generic Tempus chrome** (icons, toolbar
   strips, footer lines) and should stay as-is.
2. Drop the new screenshot into `screenshots/<name>.png`.
3. Add a new entry under `replacements` in `config/image_mapping.json`.
4. Run `python adapt_shs.py` — done.
5. (Optional) Add a yellow highlight box: append to
   `config/highlights.json` and re-run.

## What's currently mapped (demo state)

| Slot       | Replaced with                       | Notes                                  |
|------------|--------------------------------------|----------------------------------------|
| image12    | `login_knauf.png`                    | Built from SHS login with PIL relabel  |
| image13    | `homescreen_tiles.png`               | From the Knauf-DEV sandbox             |
| image37    | `pm_grid.png`                        | PM Grid (context menu pending)         |
| image41    | `spa_manday.png`                     | SPA grid — man-day allocations         |

Text replacements: `Siemens Healthineers → Knauf`,
`Healthineers-ID Login → Knauf SSO Login`,
`Healthineers-ID → Knauf SSO`.

Highlight shape: one demo rectangle on the Knauf SSO Login button
(paragraph 62), to verify Word-native editing works.

## Source files

- `../_shs-source/SHS_PM_Original.pdf`    — original PDF the customer received
- `../_shs-source/SHS_PM_Original.docx`   — same, re-imported via `pdf2docx`
- `../_shs-source/extracted_images/`       — all embedded media as PNG

The DOCX in `_shs-source` is the **template input** and must not be
edited by hand: re-run `adapt_shs.py` to regenerate.

## Dependencies

Shares the Python venv already configured at
`../Knauf PM SM Guide/.venv/`. Required packages: `python-docx`,
`pdf2docx`, `lxml`, `Pillow`.
