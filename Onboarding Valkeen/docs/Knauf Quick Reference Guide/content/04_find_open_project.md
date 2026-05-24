# Find and Open a Project

:::roles Both
:::

:::aag
- The **Project Management** tile lists every project you can see.
- Knauf project names follow a pipe-separated pattern, for example `XU | GLO | P4K | Release 2026.1`.
- Use **Search** (contains-match) to find a project by any name fragment.
- The blue **P** badge next to a project marks a **Proposal** (not yet approved).
:::

## Open Project Management

![Project Management grid as seen by PM/SM (Dummy)](screenshots/qrg_02_project_grid_pmsm.png)

## Tabs

| Tab | Use it for |
| --- | --- |
| **Kanban** | Status-by-status visual board. |
| **Grid** | Tabular list with filters and grouping. **Default for planners.** |
| **Gantt** | Timeline view across projects. |

## Toolbar

| Control | What it does |
| --- | --- |
| **Create Project** (green) | Start a new project (PM/SM with rights only). |
| **Excel export** | Export the current grid. |
| **Search** | Free-text search on names. |
| **Filter** | Quick filters (attribute-based). |
| **Columns** | Insert / hide grid columns. |
| **Group by** | Group rows by any attribute. |
| **Default** view | Switch between saved / public views. |

:::steps
- Open the **Project Management** tile.
- Type a fragment of the project name into **Search**, for example `P4K`.
- Click the project name to open it. The project opens in its **Attributes** view by default.
- Switch to **Allocations**, **Financials**, etc. via the view selector on the top right.
:::

> Note: If you cannot find a project that should be there, the most likely reason is project-level security. PM/SM only sees projects where the security group grants access. Ask the project owner or the Tempus admin to add you.

## Project-Detail View Selector

Inside an opened project, the dropdown next to the project name switches between the **views**. Typical views available to PM/SM:

| View | Purpose |
| --- | --- |
| **Attributes** | Master data (intake form, PMO). |
| **Allocations** | Resource and labor cost planning. |
| **Financials** | Non-labor cost lines, planned vs. actual. |
| **Build Team** | Replace generic roles with named resources. |
| **Audit Log** | Project-specific change history. |
| **Files** | Attachments. |

## Managing Grid Views

Every grid (Project Management, Resource Management, Allocations, Financials, etc.) has its own list of **views** that you can save, share, and switch between. Open the view dropdown via the **Default** button on the top right of the toolbar.

:::highlight image=lib:chrome/chrome_create_view_dropdown.png caption="The view dropdown. Top row: your active 'Default' view with full controls. Below: public views shared by Knauf admins."
:::

| Icon | Meaning |
| --- | --- |
| :icon[icon_drag_handle] | Drag handle - reorder views by drag-and-drop. |
| :icon[icon_lock] | **Lock** a view in its current state. Locked views ignore any changes you make (filters, columns, etc.). Useful for reference views you do not want to disturb. |
| :icon[icon_default_star_filled] | **Default** view - opens automatically when you enter the screen. Click an outline star :icon[icon_default_star_outline] on another view to make it your default. |
| :icon[icon_edit_pencil] | **Edit** the view name. Provide a new name and confirm with the green checkmark. |
| :icon[icon_clone] | **Clone** the view. Creates a copy you can freely edit (the safe way to use a public view). |
| :icon[icon_delete_trash] | **Delete** the view. Only your own private views can be deleted. |
| :icon[icon_public_eye] | **Public view** - administratively shared. Cannot be edited or deleted, only cloned. |

> Tip: Public views (with the :icon[icon_public_eye] eye) are managed centrally by Knauf's Tempus admins. Always clone :icon[icon_clone] them before changing anything - your edits stay in the cloned copy.

:::steps
- Open any grid (for example **Project Management**).
- Click the **Default** view button to open the dropdown shown above.
- Click :icon[icon_clone] next to a public view if you want a personal copy.
- Click into the new view, change filters / columns / grouping, and changes save automatically.
- Optionally click :icon[icon_edit_pencil] to rename, :icon[icon_default_star_outline] to set as default, or :icon[icon_lock] to freeze it.
:::
