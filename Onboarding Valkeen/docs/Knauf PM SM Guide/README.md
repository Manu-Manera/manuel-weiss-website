# Knauf · Tempus PM/SM Guide

A focused **flow-text style guide** for Project Managers and Service
Managers at Knauf, built from the live ``knaufdev.tempus-resource.com``
sandbox using the **PM/SM (Dummy)** login.

## What's in this folder

| Path | Purpose |
| --- | --- |
| ``Knauf_Tempus_PM-SM_Guide.docx`` | The generated, ready-to-share Word document (25 pages, 11 tables, ~33 inline images). |
| ``generate_pmsm_guide.py`` | The build script. Reads ``content/*.md``, renders to DOCX. Supports custom inline image (``![alt|h=NN](path)``) and icon (``:icon[name]``) syntax, ``:::highlight``, ``:::aag``, ``:::steps``, ``:::toc`` fenced blocks. |
| ``build_screenshots.py`` | Generates the annotated and cropped screenshots from the raw captures. |
| ``content/`` | The Markdown source — one file per chapter. |
| ``screenshots/`` | Raw captures (1024×924, PM/SM Dummy login). |
| ``screenshots/annotated/`` | Auto-generated overlays with numbered yellow highlight boxes. |
| ``screenshots/details/`` | Small cropped UI snippets used inline in the body text. |
| ``requirements.txt`` | Python dependencies (``python-docx``, ``Pillow``). |
| ``.preview/`` | PDF + PNG previews for visual QA (gitignored). |

## Building the document

```bash
# 1. Activate the virtual env
source .venv/bin/activate

# 2. (Optional) re-build the annotated screenshots after refreshing raw captures
python build_screenshots.py

# 3. Build the DOCX
python generate_pmsm_guide.py

# 4. (Optional) preview as PDF + PNG pages
soffice --headless --convert-to pdf --outdir .preview Knauf_Tempus_PM-SM_Guide.docx
pdftoppm -r 90 .preview/Knauf_Tempus_PM-SM_Guide.pdf .preview/p -png
```

## Document scope

This is the **compact, planner-facing** variant. Compared to the older
*Knauf Quick Reference Guide* it intentionally drops the RM-facing
sections (BPA Flatgrid), the long glossary, the standalone
*Project vs. Service* chapter and the separate Workflows chapter. The
ten chapters that remain map 1:1 to the daily PM/SM workflow:

1. Getting started — sign-in + homescreen
2. Project Management Grid — navigation, search, views
3. Creating a project — Regular Project intake
4. Project Attributes (master data)
5. Allocations — planning mandays
6. Financials — non-labor costs
7. Save, Checkout & Release
8. Reports
9. Quick reference — icon cheat sheet + FAQ

## How inline screenshots work

The guide pulls images from three locations, in this priority order:

1. Local path (``screenshots/...``) — captures specific to this guide.
2. Central asset library (``lib:...``) — generic assets shared across
   the Knauf Tempus documentation set, see
   ``../_tempus-assets/README.md``.
3. Icon shorthand (``:icon[icon_lock]``) — resolved via the asset
   library's ``index.json``.

Inline images accept an optional height hint, e.g.
``![alt|h=24](screenshots/details/05_save_button.png)`` to render the
image at 24 pt high.

Annotated images live in ``screenshots/annotated/<id>_annot.png`` and
are referenced from the Markdown the same way as raw captures.

## Refreshing screenshots

If the Knauf sandbox UI changes:

1. Sign in to ``knaufdev.tempus-resource.com`` as **PM/SM (Dummy)**.
2. Open each chapter's screen, replace the raw capture under
   ``screenshots/`` (keep the file name).
3. Adjust the bounding boxes in ``build_screenshots.py`` if the UI
   moved noticeably.
4. Re-run ``python build_screenshots.py`` then
   ``python generate_pmsm_guide.py``.
