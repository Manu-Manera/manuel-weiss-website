# Resource Planning

Resource planning at Knauf happens primarily in the **Allocations** view of an individual project. That is the main surface for **PM/SM** planners who own a project. **RM** planners may use the same view when supporting a project, but often spend more time in the **Bulk Project Allocation Flatgrid** (see there). Bulk operations across multiple projects are covered in the *Bulk Project Allocation Flatgrid* section.

## Open the Allocations View

From the Project Management grid, click any project name. From the view selector in the top-right of the project screen, choose **Allocations**.

![Single Project Allocations grid](screenshots/13_spa_grid.png)

## Anatomy of the Grid

Above the grid you see the project metadata and toolbar:

- **Project Name** with the **Checkout** button. To edit anything (allocations, rates, costs) you must check the project out first.
- **Start date** and **End date** picker that limits the grid timeframe (read-only until you check out).
- **Shift** button to bulk-shift assignments by a number of months.
- **Allocation** toggle and **Planned / Actual** selector.

The toolbar below contains:

- **Expand grid** - one-click expansion of every group.
- **Options (gear)** - per-grid options (heatmap, totals, etc.).
- **Excel export**, **info**.
- **Search**, **Group by**, **Insert columns**.

## Capacity Unit and Granularity

Knauf plans in **Mandays** (not Hours) and **Quarterly** buckets by default. You can switch via the tabs above the grid:

- **Time** - generic time unit.
- **€ Cost** - the same grid expressed in Euro, calculated from the allocations and the resource rate.
- **FTE** - full-time equivalents.
- **FTE %** - percentage of capacity.
- **Manday** - the default Knauf unit.
- **Gantt** - timeline view.

> Note: Switching between Manday and € Cost re-renders the same allocation in different units, with no underlying data change. It is the fastest way to sanity-check planned cost against capacity.

## Working with Allocations

### Add a Resource (Demand-Planning Role)

Knauf typically books capacity against demand-planning resources first (recognisable by the `*` prefix in the resource name, for example `*Agile / Scrum Master`, `*Business Analyst`). To add one:

1. Click **Checkout** to acquire the edit lock.
2. Click into the empty row labelled *Type a new resource* and start typing the role name. The dropdown narrows as you type.
3. Pick the role. A new row appears.

### Add Multiple Resources / Tasks at Once

Use the ellipsis menu next to a resource or task name to open the **Add Assignment** dialog. Pick one or more resources on the left and one or more tasks on the right, then click **Add** to create all combinations.

### Add a New Task

Scroll to the bottom of the task list to find the green row labelled *Type a new Task*. Enter the task name and confirm with Enter.

### Enter Allocations

Type the planned Mandays per cell. Values can be copied, pasted, or click-and-dragged across the grid. To request additional capacity for a resource already on a project, enter the new total allocation in the cell (not the delta).

### Save

Click **Save and Check In** in the top toolbar to persist the changes and trigger any resource requests, or **Release** to discard them.

![Allocation grid in Manday view with demand-planning roles](screenshots/13_spa_grid.png)

## Resource Request Workflow

Whenever you save an allocation change, Tempus creates a resource request that the responsible Resource Manager has to approve. The status icon to the left of the resource name shows where the request stands:

- **Pending** - awaiting approval.
- **Approved** - request approved (capacity is firm).
- **Rejected** - request rejected (revise or escalate).

## Advanced Assignment Options

Click the ellipsis next to an assigned resource to open **Assignment Options**:

- **Clone** - duplicate the assignment to another start date, task, or resource.
- **Shift** - move the assignment to a new start date.
