# Pillar 2 — Resources (Allocations)

:::roles PM/SM | Blended PM/SM + PPM
:::

Resources answer the question **who works on this project and how much**. PM/SM at Knauf plan demand using the **Single Project Allocation (SPA) grid**. The same grid is used at create time (initial planning) and during the project lifecycle (re-planning, re-forecast).

This chapter walks through the grid layout, the standard "add a resource" loop and the most important grid options. Bulk Project Allocation (BPA) is a different grid for RM and is intentionally out of scope.

## Opening the Allocation grid

From the project's Attributes page (chapter 5), switch to the Allocation grid via the **view selector** in the top-right corner of the project header (it lists *Attributes*, *Allocations*, *Financials*, *Audit*, …). Pick **Allocations**.

> Note: The Allocation grid only becomes editable once the project has a valid Start and End date on the Attributes page. If you forgot to set them at Create time, you will see a placeholder banner instead of the grid — go back to Attributes and fill the dates.

## SPA grid at a glance

![SPA grid in manday view|h=320](screenshots/06_allocations_manday.png)

:::aag
- **Header strip** — project name, **Check-out / Check-in** button, planned status pill (`PLANNED` / `BASELINED`), Start/End date.
- **Ribbon** — main grid controls (Expand, Search, Group by, Insert columns, Time granularity, Capacity unit, **Options** menu).
- **Body** — rows of resources/tasks, columns of time buckets (months by default).
- **Right gutter** — totals (Total Hours, Total Mandays, FTE average, depending on capacity unit).
:::

## How to add a resource

The standard add-resource loop at Knauf:

:::steps
1. Click **Check-out** in the header (yellow pill appears — only you can edit).
2. Click **+ Add Row** above the grid body and pick the resource type:
   - **Named resource** — a specific person from the Resource pool. Use when you already know who will work on the project.
   - **Generic / role-based resource** — a placeholder ("Senior Dev DE", "Tester IN") that triggers a Resource Request to the RM later. Use when staffing is still open.
3. The new row appears with zeros in every time bucket.
4. Type the allocation directly into the time buckets you want to load. **Tab** moves right (next month), **Enter** moves down (next resource).
5. Repeat for additional resources.
6. Click **Save** — wait for the green toast.
7. Click **Check-in** — releases the lock. Generic rows now trigger Resource Requests automatically; named rows go into the RM's approval queue.
:::

> Tip — bulk fill: select a range of cells with Shift+click, then type a value and press Enter — the value is replicated across all selected cells. Combined with **Group by Resource** this is the fastest way to load standard demand for a 12-month service project.

## Ribbon options PM/SM use most

| Control | What it does | Knauf default |
|---|---|---|
| **Expand** | Toggles the grid into full-screen mode | Off |
| **Search** | Searches within the grid (resource name when grouped by resource, task name when grouped by task) | Empty |
| **Group by** | Switch between *Resource* and *Task* grouping | *Resource* |
| **Insert columns** | Adds project, resource or assignment attributes as columns (Cost Center, Role, Status …) | Role + Status |
| **Time granularity** | Month / Quarter / Year (Week is RM-only) | Month |
| **Capacity unit** | Hours / Mandays / FTE / FTE % | Hours (PM/SM views also show Mandays) |

## Options menu (Advanced)

Open the **Options** drop-down in the ribbon to reach the more advanced display toggles. All of them affect *only your view*, never other Planners.

| Option | What it does | When to enable |
|---|---|---|
| **Total Column** | Adds a final column with the total Hours / Mandays per row | Always on at Knauf |
| **Resource Heatmap** | Background colour per cell based on overall allocation % of the resource | Useful when validating named resources against their other commitments |
| **Resource Request Heatmap** | Background colour based on Resource Request status (Pending / Approved / Rejected) | When chasing approvals before go-live of a project |
| **Overlay Heatmap — Rows / Groups** | Applies the selected heatmap to individual rows or groupings | Match the visualisation to your "Group by" choice |
| **Tasks to show** | Filters _generic vs. non-generic tasks | Hide generics during go-live freeze |
| **Date Range Filter** | Limits the grid to a sub-range without changing the project timeframe | Quarterly re-forecast loop |

![Cost view with Cost Plan overlay|h=320](screenshots/07_allocations_cost.png)

## Switch between Manday and Cost view

PM/SM commonly toggle between the two main views of the same SPA grid:

| View | Capacity unit | Used for |
|---|---|---|
| **Manday view** | Hours or Mandays | Discussion with Project Owners, Resource Managers, status reports |
| **Cost view** | Cost (calculated from the rate card) | Discussion with Finance and PMO; cross-check against Financials page |

The switch is a single click on **Capacity unit → Cost**; no save needed. Behind the scenes Tempus multiplies each cell's hours by the resource's Hourly Rate (chapter 7) and shows the resulting Cost.

> Tip: Toggle Cost view briefly at the end of every planning session — anomalies (e.g. a senior architect accidentally loaded at junior rate) jump out immediately.

## Save & Check-in — the discipline

Every change must be **saved + checked in** to be visible to the rest of Knauf:

| Action | What it does | What it does NOT do |
|---|---|---|
| **Save** | Persists your edits | Does not release the lock; reports still don't see the changes |
| **Check-in** | Releases your lock; recalculates totals; triggers RM Resource Requests | Does not save unsaved edits — always Save first |

> Warning: A check-out left open at end of day blocks other Planners. The Knauf rule is: **always check in before lunch and before sign-off**. If you forget, an admin can force-release the lock, but you will lose unsaved edits.
