# Find and Open a Project

:::roles PM/SM | Blended PM/SM + PPM
:::

The second daily workflow is **find an existing project and edit it**. Mechanically, the edit pages are identical to the Create-time pages you already know:

- Attributes → chapter 5
- Resources → chapter 6
- Financials → chapter 7

This chapter therefore only covers what is *different* in edit mode: the **Project Management Grid** (how to find the project) and the **Open** mechanics (how to land on the right tab the first time). For everything that happens after that, jump back to the relevant pillar chapter — the edit-loop instructions are intentionally the same.

## Project Management Grid

From the Homescreen, click the **Project Management** tile. You land on the Project Management Grid — your repository of all visible projects.

![Project Management Grid with toolbar|h=340](screenshots/02_grid_pmsm.png)

:::aag
- **Toolbar** — *+ Add projects* (chapter 4), *Search*, *Filter*, *Insert columns*, *Group by*, **View** selector.
- **Body** — one row per project, with the columns of the currently selected view.
- **Row actions** — hover a row to reveal the **⋯ More** menu (Open, Clone, Delete-if-empty).
:::

### View Management

A **View** is the saved combination of: selected columns, applied filters, group-by setting and sort order. Knauf ships a small set of public views; PM/SM can clone them into personal views.

| View type | Icon | Editable by you | Typical use |
|---|---|---|---|
| **Public view** | Blue eye | No — read-only | "All Active Projects", "My Department — Standard", PMO master views |
| **Public default** | Star (filled) | No | The view you land on when you open the grid |
| **Personal view** | Pencil / private | Yes | Your personal filter, e.g. "My projects, this quarter only" |
| **Personal default** | Star (outline) | You set it | One personal view auto-loads on grid open |

:::steps
1. Open the **View** drop-down (top-right of the grid toolbar).
2. To save your current filter + columns: **Save as new view** → name it → choose *Private*.
3. To start from a public view: **Clone** the public view → adjust → save as private.
4. To set a personal default: open your view → click the star icon next to its name in the drop-down.
:::

> Tip: Don't fight the public views — clone them. Public views are versioned by the PMO and updated globally; your personal clones are immune from those updates.

### Search, Filter and Quick Filters

| Control | Behaviour |
|---|---|
| **Search bar** | Searches the *Project name* column with **contains** logic |
| **Filter** | Adds column-level filters; multiple filters are AND-combined |
| **Quick Filters** | Predefined buttons in the toolbar — *My projects*, *Active*, *This quarter*, *Owner = me*, *Recently changed* |
| **Group by** | Group by any attribute; multi-level grouping supported (e.g. Phase → Owner) |

> Note: *My projects* uses the **owner** attribute on Attributes (chapter 5). If a project is missing from your *My projects* view, check the owner field first — it is almost always wrong-attribution, not a Tempus bug.

## Open a project

Two ways to open a project from the grid:

| Action | Lands on | Use when |
|---|---|---|
| Click the **project name** (left-most column) | Attributes page | You want to start with master data |
| Hover the row → **⋯ More** → pick *Allocations* / *Financials* / *Schedule* / … | The chosen tab | You know exactly which tab you need |

### Advanced tooltip — direct deep-link

Hovering over any project name shows an **Advanced Tooltip** with shortcut icons to all areas of that project that you have access to (Attributes, Allocations, Audit Log, Build Team, File Management, Financials, Milestones, Project Risk Profile, Schedule, Sheets, Snapshots).

:::steps
1. Hover the project name in the grid — the Advanced Tooltip opens.
2. Click the area icon you want (e.g. **Financials**).
3. Tempus opens the project directly on that tab, skipping the default Attributes landing page.
:::

> Tip: Bookmark the project URL after you've opened it once — Tempus URLs are deep-linkable to the exact tab (Attributes / Allocations / Financials / …). Pin a few high-traffic projects in your browser bookmarks for one-click access.

## Edit loop — same as Create

Once a project is open, the edit-loop is identical to the Create-time setup:

| If you are editing… | Go to | Edit-loop reference |
|---|---|---|
| Master data (owner, dates, status, classification, custom flags) | **Attributes** | Chapter 5 |
| Resources (named, generic, manday, cost view) | **Allocations** | Chapter 6 |
| Financials (Cost Plan overrides, Budget vs. Actual, Re-forecast) | **Financials** | Chapter 7 |

The Check-out / Save / Check-in discipline applies on every page — see the warnings at the end of chapter 5 (Attributes) and chapter 6 (Allocations).

> Warning: Editing **without check-in** is the #1 source of "ghost changes" at Knauf — the edits live on your machine but never reach Reports. Always check in before you sign off, even if it's "just a quick fix".
