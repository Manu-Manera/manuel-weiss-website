# Plan Resources (Allocations)

:::roles PM/SM | RM
:::

:::aag
- The **Allocations** view of a project is the home for resource planning. PM/SM works here for their own projects; RM uses it when supporting a specific project.
- Standard unit at Knauf is **Manday**; switch to **€ Cost** for a live euro view.
- Default grain is **Month**. You can change to Day, Week, Quarter, or Year.
- Editing requires **Checkout** first. Save with **Check In**; release without saving with **Release**.
:::

## Open the Grid

From within an opened project, switch the view selector to **Allocations**. The grid loads with the project's date range.

![Allocations Manday view (PM/SM Dummy on Service CRM)](screenshots/qrg_07_allocations_manday_pmsm.png)

## Toolbar Reference

| Control | Purpose |
| --- | --- |
| **Checkout** (green) | Acquire the edit lock. |
| **Start / End date** | Restrict the visible window. |
| **Shift** | Bulk-shift assignments by N months. |
| **Allocation / Assignment** toggle | Switch between project-level and assignment-level edits. |
| **Planned / Actual** | Switch the editable series. |
| **Expand all** | Open all groups. |
| **Options** (gear) | Heatmaps, totals, filters. |
| **Excel export** | Export the current grid. |
| **Group by** | Group rows by attribute. |
| **Insert columns** | Add resource / project / assignment attributes as columns. |
| **Grain selector** | Day / Week / Month (default) / Quarter / Year. |
| **Unit tabs** | Time, € Cost, FTE, FTE %, Manday (default), Gantt. |

## Add a Resource

:::steps
- Click **Checkout** to acquire the lock.
- In the empty row at the bottom of the grid, start typing the resource role (for example `*Business Analyst`).
- Pick the role from the dropdown - a new row appears.
- Enter planned Mandays per month in each cell. Drag, copy-paste, or use the keyboard to fill ranges.
- Click **Save and Check In** at the top to persist; this also creates the resource request for RM approval.
:::

> Tip: The `*` prefix marks demand-planning (generic) roles. Use them in early planning; let RM replace them with named resources via the Build Team view as the project firms up.

## Switch to € Cost

Click the **€ Cost** tab to see the same allocation expressed in Euro. The numbers update automatically when allocations or rates change.

![Allocations € Cost view (PM/SM Dummy)](screenshots/qrg_08_allocations_cost_pmsm.png)

## Save vs. Release

| Button | When to use |
| --- | --- |
| **Save and Check In** | Keep the edits and release the lock. Creates / updates resource requests. |
| **Release** | Discard the edits and release the lock. Use when you experimented or made mistakes. |
| **Save** (without Check In) | Keep the lock for further editing while persisting the current state. |

## Resource Request Lifecycle

Whenever you save an allocation change, Tempus creates a resource request. The dot next to the resource shows the status:

| Status | Meaning |
| --- | --- |
| Pending (pink) | Awaiting RM decision. |
| Approved (green) | RM accepted - capacity is firm. |
| Replaced (blue) | RM swapped the demand role for a named resource. |
| Rejected (red) | Revise and re-submit, or escalate. |

> Note: Knauf's standard Knauf time grain on Allocations is **monthly**. Quarterly grain is mostly used for portfolio rollups in reports, not for daily planning.
