# Prep for Marc — 11:00 sync (2026-05-12)

Short notes to anchor the sync after Marc's feedback on `20260511_QRG_Knauf.docx`.

## TL;DR

- v2 rebuilt from scratch in Markdown — **37 pages**, PM/SM only,
  Marc's order (Create → Find/Open), pillar structure
  (Attributes / Resources / Financials).
- All content written fresh in this iteration; only screenshots reused
  from the PM/SM Guide screenshots folder.
- File: `Onboarding Valkeen/docs/Knauf QRG v2/Knauf_Tempus_QRG_PM-SM.docx`.

## What's changed vs. v1

| v1 problem (Marc-Feedback) | v2 fix |
|---|---|
| Scope mixed RM + PM/SM | RM section deleted; "Blended" clarified as PM/SM + PPM (cover + intro) |
| Find/Open *before* Create | Reordered: Create is chapter 4, Find/Open is chapter 8 |
| `Create a Project` heading was empty (stub) | Full chapter 4 — both paths (without/with template), Intake + PMO entry |
| `Project Master Data (Attributes)` appeared twice | Consolidated into pillar chapter 5; chapter 8 cross-refs back |
| `Plan Resources (Allocations)` had only Toolbar + Add | Expanded chapter 6 (SPA grid, ribbon, options, manday vs cost) |
| Financials missing entirely | New chapter 7 — full scope per Marc's list |
| TOC didn't match the structure | Word live TOC (refresh with F9 after opening) |

## Open questions for the sync (need Marc's input)

1. **Lock Periods at Knauf** — I assumed soft-lock = 5th business day of
   following month, hard-lock = 10th. Is this what Finance uses? If
   not, what's the actual cadence?
2. **Re-forecast cadence** — quarterly was the working assumption; the
   PMO publishes the window. Confirm or adjust.
3. **Templates (`TPL_*`)** — what's the real list at Knauf as of go-live?
   Currently I just say "alphabetical prefix `TPL_`" without naming
   specific templates.
4. **Rate Card** — Hourly Rate is the fallback; Advanced Rate exists.
   Is the Advanced Rate already populated for Knauf in DEV, or still
   roadmap?
5. **PMO Approve & Create** — currently described as the Intake → Approve
   path. Does Knauf use the standard Approve & Create flow, or a custom
   workflow that needs documenting?
6. **"What PM/SM cannot edit"** — chapter 5 + 7 + appendix carry the
   current restriction list. Anything I've missed for Phase 1?
7. **Naming convention** — I used `<Type abbreviation> – <short scope>`
   (e.g. `BAU – AD Hardening 2026`). Is there a Knauf-official scheme
   we should reference instead?
8. **Glossary terms** — anything Knauf-specific (German term, internal
   slang) we should add to chapter 9?

## Screenshot wish-list

What we **have** (re-used from PM/SM Guide):

- Homescreen (PM/SM) — `screenshots/01_homescreen_pmsm.png`
- Project Management Grid — `02_grid_pmsm.png`
- Create Intake dialog — `03_create_intake.png`
- Create via PMO template — `04_create_pmo.png`
- Attributes page — `05_attributes.png`
- SPA grid (manday view) — `06_allocations_manday.png`
- SPA grid (cost view) — `07_allocations_cost.png`
- Financials page (Budget vs Actual) — `08_financials.png`
- Reports — `09_reports.png` (not used in v2 yet)

What's **missing** (could be captured this week from Knauf DEV):

| Slot | Used in chapter | Priority |
|---|---:|---|
| **Knauf SSO login screen** (or placeholder) | 3 | medium |
| **Top bar with notification dropdown open** | 3 | medium |
| **Notification subscriptions dialog** | 3 | medium |
| **Project Management Grid with Advanced Tooltip** | 8 | high |
| **View Management dialog (Save as / Clone)** | 8 | medium |
| **Audit pane (right column on a project page)** | 5, 7 | medium |
| **Status pill (yellow Checked-out by you)** | 5 | low — text covers it |
| **Rate Card panel with effective dates** | 7 | high |
| **Cost Plan cell with manual override (orange dot)** | 7 | high |
| **Lock period indicator (padlock variants)** | 7 | high |
| **Budget vs Actual quarterly view with variance colours** | 7 | high |

## Suggested talking-points for the 11:00 sync

1. Walk Marc through chapters 4 → 7 (Create + the three pillars) — that's
   80 % of the value. He can read 8 + 9 later.
2. Get a green light on **Find/Open as "edit-loop only"** approach
   (cross-references to ch. 5–7 instead of duplicating). My assumption,
   Marc may want it fuller.
3. Agree the **screenshot wish-list** above — who shoots them and when
   (before Wednesday).
4. Confirm the **Financials open questions** (Lock Periods, Re-forecast
   cadence) — these are the most likely deltas vs. reality.
5. Decide whether **chapter 1 (Contents)** should be a static TOC for
   handover or stay as the live Word TOC field. Static is more robust
   for print; live updates as the doc evolves.

## What's left until Wednesday EOD

- Validate open questions against ProSymmetry Help Center +
  Knauf-DEV instance (after the 11:00 sync).
- Capture the missing screenshots.
- Optional: annotated highlights on the key screenshots (we already
  have the `build_screenshots.py` annotation helper).
- Final pagination tweaks (image heights, no orphan page breaks).
- Optional: German translation of the cover + section headings if Knauf
  prefers German-language printed copies.
