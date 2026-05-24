# Pillar 1 — Attributes (Master Data)

:::roles PM/SM | Blended PM/SM + PPM
:::

Attributes describe **what** the project is. Every report, every dashboard tile and every Resource Request inherits from attributes — incorrect master data here makes the rest of the tool unreliable.

This chapter applies to both moments:

- When you have **just created** a project (chapter 4 → continue here).
- When you have **opened an existing** project and need to update master data (chapter 8 → comes back here).

The page itself, the fields, the edit-loop and the validation are identical.

## The Attributes page at a glance

After Create, Tempus opens the project shell with the **Attributes** tab active. The layout has three zones:

![Attributes page layout|h=380](screenshots/05_attributes.png)

:::aag
- **Top — Project header** with project name, status pill, project owner, start/end dates and the **Check-out / Check-in** button.
- **Left — Attribute groups** ("General", "Classification", "Time & Money", "Custom" — Knauf-specific group labels may differ slightly per template).
- **Centre — Attribute fields**, grouped by the section selected on the left. Required fields are marked with a small red asterisk.
- **Right — Audit & Activity** column (recent changes, last edited by, version pin).
:::

> Note: Check-out is **automatic** as soon as you start editing an attribute, provided no one else holds the lock. The header switches from a green *Available* pill to a yellow *Checked out by you* pill.

## What to maintain at create time

The Knauf go-live scope expects PM/SM to populate these fields on every new project. Templates pre-fill many of them, but always verify.

| Group | Field | Why it matters | PM/SM-fillable? |
|---|---|---|---|
| General | Project name | Identifies the project everywhere | Yes |
| General | Project type | Standard / Service / BAU / Non-project (Admin, Run …) | Yes (limited list) |
| General | Status | Drives visibility on the grid and in reports | Yes — see status flow below |
| General | Project owner | Default Planner used in Quick Filters | Yes |
| Classification | Business unit | Cost-center alignment | Yes |
| Classification | Phase | Drives template lifecycle (Intake → Planning → Active → Hypercare → Closed) | Yes |
| Time & Money | Start / End date | Boundaries of the SPA grid | Yes |
| Time & Money | Currency | EUR by default at Knauf | Read-only (admin) |
| Custom | Risk profile / Strategic flag / Vendor | Knauf-specific reporting | Yes |

## Editing rules (single project)

The page is a classic *edit-many, save-once* form — there is no per-field save, but you must trigger Save before you leave the page or the changes are dropped.

:::steps
1. Click into the field you want to change. Tempus auto-checks out the project on first edit (yellow pill appears in the header).
2. Make as many changes as needed across the attribute groups on the left.
3. Click **Save** in the top-right of the page.
4. Wait for the green confirmation toast in the lower-right corner. If validation fails (mandatory field missing, invalid date range, …) the toast is red and the offending field is highlighted with a red border.
5. When all changes are saved, **Check-in** to release the lock. Other PM/SM can now edit; reports refresh on their next scheduled run.
:::

> Tip — keep yourself short: the typical Knauf edit loop touches 2–3 fields (e.g. *Status*, *End date*, *Risk profile*). Don't open the page with the intent to clean all groups in one sitting; you will create more lock contention than value.

## Project status flow (PM/SM-controllable)

The status field has tight rules — Tempus blocks invalid transitions with a red toast. The legal path for PM/SM:

| From | To | Trigger / requirement |
|---|---|---|
| Draft | Active | All mandatory attributes filled; owner set |
| Active | On Hold | Optional, reversible |
| On Hold | Active | Reverses the hold |
| Active | Closed | End date reached AND all assignments checked out by RM |
| Closed | Re-open | Only by PMO admin, not PM/SM |

> Warning: Setting a project to *Closed* freezes the Allocation grid and the Financials page. Make sure all planned hours/costs are checked in **before** closing — there is no PM/SM bypass.

## What PM/SM cannot see or edit

A few fields and pages remain RM- or admin-only at Knauf in Phase 1. They are visible on the page (grey) so you know they exist, but the field is read-only or the icon is greyed out.

| Read-only for PM/SM | Owned by |
|---|---|
| Resource Rate Card overrides (per-resource) | RM / Finance |
| Resource Manager assignment per role | RM |
| Audit-log purge | Admin |
| Custom attribute schema changes | Admin |
| Lock-period setup | Finance admin |

If you genuinely need one of these changed, open a **Resource Request** with comment, or contact the PMO directly.

## Cross-references

- After Attributes, continue with **Resources** (chapter 6) — the same project, but now on the Allocation grid.
- For Financials (rates, Cost Plan, Budget), see chapter 7.
- To return here from the Project Management Grid later, see chapter 8 — the edit loop is identical to the one above.
