# Appendix

:::roles PM/SM | Blended PM/SM + PPM
:::

## A. Keyboard Shortcuts

Tempus uses a small set of Excel-like shortcuts. The ones PM/SM use most:

| Shortcut | Where it works | Action |
|---|---|---|
| **Ctrl + C / Ctrl + V** | Any grid | Copy / paste cell content |
| **Tab** | Editable grids | Move to next cell on the right |
| **Enter** | Editable grids | Move down one row |
| **Shift + Click** | Grid headers / cells | Select a column / range |
| **Drag the "+" handle** (bottom-right of a selected cell) | Editable grids | Replicate value across the dragged range |
| **Ctrl + S** | Anywhere | Save current page (equivalent to clicking *Save*) |
| **Ctrl + F** | Grids | Open the in-grid search |
| **Esc** | Modals | Close without saving |

## B. Tempus Icon Reference (most used)

| Icon | Meaning |
|---|---|
| Trash can | Delete selected item |
| Pencil | Edit / view selected item |
| Copy / Clone | Duplicate selected item |
| Lock / Unlock (open / closed padlock) | Whether record is locked by another user |
| Excel / CSV / PDF | Export the current view |
| Filter funnel | Apply column-level filter |
| Bell | Notifications — red dot = unread |
| Blue eye | Public (read-only) view |
| Star (filled) | Default view |
| Demand-resource silhouette | Generic / role-based resource row |
| Proposal marker | Resource on a project in *Planning* status |

## C. Status Pills

| Pill | Where | Meaning |
|---|---|---|
| **Available** (green) | Project header | Page is not checked out — anyone can edit |
| **Checked out by you** (yellow) | Project header | You hold the lock |
| **Checked out by <name>** (yellow w/ avatar) | Project header | Someone else is editing — read-only for you |
| **Planned / Baselined** | SPA grid header | Project's allocation has a baselined version |
| **Draft / Active / On Hold / Closed** | Attributes header | Project status (see chapter 5 status flow) |

## D. What PM/SM Cannot See or Edit (Phase 1)

A quick lookup of fields and pages that are intentionally hidden or read-only for PM/SM in the Knauf Phase 1 rollout. Owners listed are the right contact when something needs to change.

| Restricted item | Owner |
|---|---|
| Resource Rate Card overrides (per-resource) | RM / Finance |
| Resource Manager assignment per role | RM |
| Bulk Project Allocation Flatgrid | RM (separate guide) |
| Resource Replace (per project & advanced) | RM |
| Rate Card values (Hourly + Advanced) | Finance admin |
| Effective-date bands on the Rate Card | Finance admin |
| Currency configuration per project | PPM admin |
| Lock-period schedule | Finance admin |
| Actuals correction (timesheet adjustment) | Time-tracking admin |
| Custom attribute schema changes | Admin / PPM |
| Audit-log purge | Admin |

## E. FAQ

**Q: I saved an attribute change but it's not visible in the report.**
A: You probably forgot to **Check-in**. Save persists the value to your draft; Check-in releases the lock and triggers downstream visibility. Open the project → click *Check-in* → wait for the green toast → refresh the report.

**Q: The Cost shown in the Allocation grid (Cost view) is different from the Cost Plan on the Financials page.**
A: You very likely have a **manual override** on the Financials page that does not match the calculated hours × rate. Open Financials → look for orange-dot cells in the Cost Plan panel → either right-click → *Reset to calculated*, or update the Allocation grid to match.

**Q: I want to delete a project I just created.**
A: PM/SM can delete a project only as long as it has **no assignments and no actuals**. Open the grid → hover the row → *⋯ More* → *Delete*. If Delete is greyed out, the project already has data — contact PMO for archival instead.

**Q: A resource shows red in the Heatmap — is that a Tempus error?**
A: No — the resource is over-allocated across all their projects (not just yours). Toggle to *Resource Heatmap* in Options to see the global picture; you typically need to discuss the conflict with the RM rather than change your plan unilaterally.

**Q: Why is my project missing from the *My projects* Quick Filter?**
A: The *My projects* filter uses the **Project owner** attribute. If you are not the owner — even if you are doing the planning — the project will not show up. Either ask the current owner to change it, or use *Owner = me* via a custom filter.

**Q: How do I revert a wrong save?**
A: Tempus does not have a global Undo. Two options: (1) Manually re-enter the previous value (you can see prior values in the Audit pane on the right of every project page) or (2) for SPA grid changes, ask an admin to restore the most recent baseline.

## F. Glossary

| Term | Meaning |
|---|---|
| **Allocation** | Planned demand of a resource on a project for a given period |
| **Actual** | Logged hours from the timesheet system, multiplied by the applicable rate to give Actual cost |
| **Assignment** | The link between a resource and a project (one row in the SPA grid) |
| **Baseline** | A frozen snapshot of the plan, used as the comparison point for variance |
| **Blended (Knauf role)** | PM/SM + PPM combination — full Planner scope plus Portfolio view |
| **Check-out / Check-in** | Lock / release mechanism that allows safe editing |
| **Cost Plan** | Hours × applicable rate, shown on the Financials page |
| **Demand / Generic resource** | A role-based placeholder ("Senior Dev DE") that triggers a Resource Request |
| **Effective Rate** | The rate Tempus actually used for a given resource × month (Hourly or Advanced) |
| **Lock Period** | A closed financial period — Cost cannot be changed (soft or hard) |
| **Re-forecast** | Quarterly update of the Cost Plan for remaining open quarters |
| **Resource Request** | RM workflow that approves a demand on a resource |
| **SPA grid** | Single Project Allocation grid — the per-project planning surface |
| **Time grain / Time granularity** | The bucket size on the grid (Month, Quarter, Year) |
| **View** | Saved combination of filters, columns, group-by and sort |
