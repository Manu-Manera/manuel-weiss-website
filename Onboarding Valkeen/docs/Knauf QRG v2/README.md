# Knauf Tempus QRG — PM/SM (v2)

Quick Reference Guide for Knauf Planners (PM, SM, Blended PM/SM + PPM),
rebuilt from scratch after the v1 review with Marc on 2026-05-11.

## What's in this folder

| Path | Purpose |
|---|---|
| `content/00..09_*.md` | Markdown source per chapter |
| `screenshots/*.png` | Knauf-DEV screenshots (re-used from PM/SM Guide where possible) |
| `generate_qrg_v2.py` | Build script — reads `content/*.md`, writes the DOCX |
| `build_screenshots.py` | Helper for annotated and detail-cropped screenshots |
| `Knauf_Tempus_QRG_PM-SM.docx` | **Final document** (regenerated on every build) |
| `Knauf_Tempus_QRG_PM-SM.pdf` | LibreOffice-rendered preview |
| `preview/page-*.png` | Page-by-page PNGs for visual QA |
| `MARC_PREP.md` | Open questions + screenshot wish-list for the 11:00 meeting |

## Build & preview

```bash
# from repo root, with the shared venv:
source "Onboarding Valkeen/docs/Knauf PM SM Guide/.venv/bin/activate"
cd "Onboarding Valkeen/docs/Knauf QRG v2"
python generate_qrg_v2.py
soffice --headless --convert-to pdf Knauf_Tempus_QRG_PM-SM.docx
pdftoppm -r 110 Knauf_Tempus_QRG_PM-SM.pdf preview/page -png
```

The build is **idempotent** — re-running always regenerates the DOCX
from scratch, so deleting an entry from a Markdown file simply makes
that change vanish from the next build.

## Scope (after Marc's review)

> "Der Guide ist in erster Linie für Planner PM/SM (nicht RM's). Die
> RM's sind gerade nicht im Fokus (noch nicht). Und die Blended sind
> auch nicht RM's sondern PM/SM + PPM. Reihenfolge: 1 create Project
> (Fokus: Attribute, Ressourcen, Finanzen) 2 find and open a project."

In: PM, SM, Blended PM/SM + PPM · Create Project + Find/Open ·
Attributes, Resources, Financials (full scope incl. Hourly/Advanced
Rate, Cost Plan, Budget vs Actual, Lock Periods, Re-forecast).

Out: RM workflows, Bulk Project Allocation, Resource Replace,
Heatmap admin, Rate-card administration. Goes into a separate guide.

## Chapter map

| Chapter | Markdown | Approx. pages | Status |
|---|---|---:|---|
| Cover | `00_cover.md` | 1 | done |
| Contents (Word TOC) | `01_contents.md` | 1 | done — F9 to refresh in Word |
| How to use / Roles / Time grain | `02_intro.md` | 2 | done |
| Sign-in & Homescreen | `03_sign_in_and_homescreen.md` | 3 | done — RM tile removed |
| **Create a Project** | `04_create_project.md` | 4 | done — both paths covered |
| **Pillar 1 — Attributes** | `05_setup_attributes.md` | 4 | done |
| **Pillar 2 — Resources** | `06_setup_resources.md` | 4 | done |
| **Pillar 3 — Financials** | `07_setup_financials.md` | 5 | done — full scope |
| Find & Open (edit-loop only) | `08_find_and_open.md` | 3 | done — cross-refs to ch. 5–7 |
| Appendix (shortcuts, FAQ, glossary) | `09_appendix.md` | 4 | done |

Total: ~37 pages at the current screenshot sizing.

## How to iterate after Marc's feedback

1. **Content tweaks** — edit the relevant `.md`, run `python generate_qrg_v2.py`.
2. **Reorder chapters** — change `SECTIONS` at the top of `generate_qrg_v2.py`.
3. **New screenshot** — drop into `screenshots/<name>.png`, reference in
   markdown as `![Caption|h=320](screenshots/<name>.png)` (h = max height
   in points; smaller numbers = smaller image, fewer page breaks).
4. **New callout type** — `:::aag` (at-a-glance, blue) / `:::steps`
   (numbered how-to, lavender) / `> Note:` / `> Tip:` / `> Warning:`
   are already wired into the renderer.
5. **Change role badges** — `:::roles PM/SM | Blended PM/SM + PPM`
   at the top of a chapter renders a coloured badge ribbon.

## Open dependencies

- ProSymmetry Help Center reference where Knauf-specific behaviour is
  ambiguous (e.g. exact Lock-Period dates, Re-forecast cadence) — see
  `MARC_PREP.md` for the open questions list.
- New screenshots needed for: Global Search dropdown, Notification
  subscription dialog, PMO template picker, Lock-period view, Audit
  pane in Financials. Wish-list in `MARC_PREP.md`.
