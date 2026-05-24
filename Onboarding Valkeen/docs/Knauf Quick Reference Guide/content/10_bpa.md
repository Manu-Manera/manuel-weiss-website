# Bulk Project Allocation Flatgrid

:::roles RM
:::

:::aag
- **RM-only** screen in the Knauf role model. PM/SM does not see the BPA Flatgrid tile.
- The Flatgrid lets you edit allocations across **many projects and resources** in one grid.
- Three filter modes drive what is loaded: by **Project**, by **Resource**, or **Default**.
- Saving works the same way as in single-project Allocations: each change creates resource requests.
:::

![Bulk Project Allocation Flatgrid (sandbox view with elevated rights)](screenshots/qrg_11_bpa_rm.png)

> Note: The screenshot above was captured in the sandbox with an admin-style profile so the full toolbar is visible. The day-to-day RM profile sees the same grid and toolbar.

## Filter Modes

| Mode | Behaviour | Use when |
| --- | --- | --- |
| **Project** | Pick projects -> their resources are auto-loaded. | You manage a portfolio and want resource demand per project. |
| **Resource** | Pick resources -> their projects are auto-loaded. | You manage people and want every project they touch. |
| **Default** | Free choice on both sides; lets you add new allocations to resources not yet on a project. | Initial setup or modelling. |

## Toolbar Highlights

| Control | What it does |
| --- | --- |
| **Expand grid** | One-click full expansion. |
| **Add assignment** | Create a Resource-Project-Task combination on the fly. |
| **Options** | Heatmaps, totals, filter by request status. |
| **Insert columns / Group by** | Customise what you see. |
| **Time granularity** | Day / Week / Month / Quarter / Year. |
| **Unit tabs** | Manday (typical), € Cost, FTE, FTE %, Time, Gantt. |
| **View management** | Save / clone / lock / set default / delete personal views. |

## Working Pattern for RM

:::steps
- Switch the mode selector to **Resource** and pick the resources you cover.
- Confirm the timeframe matches the cycle you are working in (typically the budget year).
- Insert columns: Project name, Business Portfolio, Type, Project Manager.
- Group by **Project name** for a per-project view, or by **Resource** for a per-person view.
- Save a personal view if you find yourself recreating the same setup.
:::

## Add a New Assignment

:::steps
- Click **Add assignment**.
- Pick a project, a resource, and a task.
- Tick **Allow new Resources** if the resource is not yet on the project, or **Add new Task** to introduce a task on the fly.
- Click **Add new assignment**. A row appears with editable cells.
- Type the allocations per period and **Save**.
:::

## Reviewing Pending Resource Requests

:::steps
- Open **Options** in the toolbar.
- Open **Filter by Resource Request Status** and tick **Pending**.
- The grid filters down to assignments waiting for your action.
- Approve / replace / reject row by row, then **Save**.
:::

> Tip: Public views are read-only. Clone the public view first if you want to tweak filters or columns and keep them across sessions.
