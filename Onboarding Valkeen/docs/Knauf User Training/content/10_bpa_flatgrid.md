# Bulk Project Allocation Flatgrid

The Bulk Project Allocation Flatgrid (BPA Flatgrid) is the tool for **editing allocations across many projects in one grid**. In Knauf’s role model it is typically assigned to **Resource Managers (RM)**; **PM/SM** profiles often use the **single-project Allocations** view instead unless Knauf has explicitly granted BPA. If you do not see the **Bulk Project Allocation Flatgrid** tile, assume your global role does not include it and speak to your Tempus owner.

Open it from the homescreen by clicking the **Bulk Project Allocation Flatgrid** tile **when that tile is visible**.

![BPA Flatgrid overview](screenshots/20_bpa_overview.png)

## Grid Overview

- The **project timeframe** sits in the top-left and is editable via the date picker. A small calendar icon next to the end date offers quick-pick timeframes.
- The **Planned / Actual** toggle and the **Allocation / Assignment** toggle control what is editable.
- The **Resource and Project** selector in the centre supports three modes:
  - **Project** - select projects; their resources are auto-loaded.
  - **Resource** - select resources; the projects they are on are auto-loaded.
  - **Default** - free choice; useful for adding allocations to resources not yet on a project.
  The numeric badges next to *Resource* and *Project* show how many items are currently selected.
- The **View Management** dialog in the top-right (`Default`) lets you create, clone, lock, set-default, edit, or delete views.

## Customisation Ribbon

Above the grid you find:

- **Expand grid** - one-click expansion.
- **Add assignment** - create a new Resource-Project-Task combination on the fly.
- **Options** - heatmaps, totals, filters (see below).
- **Insert columns** - add project, resource, or assignment attribute columns.
- **Group by** - any project, resource, or assignment attribute.
- **Time granularity** dropdown - typically `Month` at Knauf for BPA Flatgrid usage.

The unit tabs above the grid (`Time`, `€ Cost`, `FTE`, `FTE %`, `Manday`, `Gantt`) work identically to the Single Project Allocation view. Most Knauf PMs work in **Manday**.

## Options Menu

The **Options** menu adds advanced controls:

- **Overlay Heatmap** - Resource Heatmap, Resource Request Heatmap, or Non-Zero Heatmap.
- **Hide Task** - drop the task column when not needed.
- **Show Total Row** at every aggregation level.
- **Show Total Demand Planning / Show Named Total** - totals on generic vs. named resources.
- **Show Unallocated %** - share of assignments still to be redistributed from generic to named resources.
- **Show Selection Calculations** - average / sum / min / max / count for the selected cells.
- **Tasks to Show** - generic (project-level) vs. non-generic (custom tasks).
- **Weekly Display Format** - week number, start date, or end date.
- **Filter by Resource Request Status** - filter to pending, approved, or rejected requests.

## A Working Pattern for Knauf PMs

1. Switch the mode selector to **Project** and pick the projects you are responsible for. The BPA Flatgrid pre-loads the assigned resources.
2. Confirm the timeframe matches your reporting window.
3. Insert the columns you care about (Business Portfolio, Type, Project Manager, etc.).
4. Group by the right attribute (for example by Project) so that totals roll up the way you want to look at them.
5. If you find yourself recreating the same setup repeatedly, save it as a personal view.

> Note: Public views are administratively defined and read-only. Clone the public view first, then work in the copy.

## Updating Existing Assignments

1. Click into the cell and edit the value.
2. Click **Save** at the top of the grid. Tempus creates a new resource request for the change automatically.

## Adding New Assignments

1. Click **Add Assignment**.
2. Pick a project, resource, and task. Tick **Allow new Resources** to add a resource not yet on the project. Use **Add new Task** to introduce a task on the fly.
3. Click **Add new assignment** to confirm.
4. A new row appears. Enter the allocation values.
5. Click **Save** to persist the changes.

## Reviewing Pending Resource Requests

In the **Options** menu open the **Filter by Resource Request Status** dropdown and tick **Pending**. The grid filters down to only the requests still awaiting a Resource Manager response.
