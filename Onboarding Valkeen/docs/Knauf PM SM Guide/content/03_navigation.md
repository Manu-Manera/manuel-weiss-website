# 2. The Project Management Grid

The Project Management Grid is where 90 % of your time inside Tempus
is spent. Every project and service you have access to appears here as
a single row; everything you do — opening attributes, planning resources,
adding costs, exporting data — starts from this list.

![Project Management Grid with toolbar callouts|h=380](screenshots/annotated/02_grid_pmsm_annot.png)

The numbered highlights in the screenshot above correspond to the
six controls you will use every day. Box **(1)** are the three **view
tabs** Kanban, Grid and Gantt — they switch between a card-based view,
the spreadsheet-style grid (default, what you see here) and a
timeline. Box **(2)** is the **Create Project** button — used in
chapter 3 to launch a new regular project. Box **(3)** is the
free-text **Search** which filters the list in real time as you type.
Box **(4)** combines the **Filter** :icon[icon_topbar_search] funnel
and the **Columns** chooser which decides what data points are visible
as columns. Box **(5)** is the **Group by** dropdown that buckets the
list (for example *by Portfolio* or *by Division*). Finally, box
**(6)** is the **Default** view selector — the gateway to the View
Manager that we cover further down.

## Toolbar at a glance

The same toolbar zoomed in:

![Toolbar strip detail|h=36](screenshots/details/02_toolbar_strip.png)

| Element | Purpose |
| --- | --- |
| ``0/35`` selection counter | Number of currently selected rows vs. total. Stays at ``0/`` until you tick a row. |
| **Create Project** | Opens the *Regular Project* intake form (chapter 3). Available to PM/SMs only. |
| :icon[icon_topbar_search] Excel icon | One-click export of the visible grid to ``.xlsx``. Respects active filters and columns. |
| View dropdown (folder icon) | Switches between **saved Views** — your personal layouts and the public Knauf views. |
| **Search** | Free-text filter that matches the project name. |
| **Filter** | Multi-condition filter (for example *Division = Engineering AND Above Red Line = Yes*). |
| **Columns** | Toggle which attributes show up as columns. |
| **Group by** | Adds an outer grouping level (collapsible). |
| **Default** | The current view, click to open the View Manager (see below). |

## Searching and filtering

For ad-hoc lookups, the easiest path is the **Search** box: type any
fragment of the project name and the grid narrows down instantly. For
recurring lookups — for example *all my projects above the red line in
Engineering* — use **Filter** to build the condition once and save it
as part of a view. Filters are AND-combined; remove a single condition
by clicking the small ``×`` next to the chip below the toolbar.

## Tabs: Kanban, Grid, Gantt

![Tabs Kanban / Grid / Gantt|h=36](screenshots/details/02_tabs_strip.png)

The **Grid** tab is the default and the most useful working surface —
you can see many attributes side by side and edit them inline. The
**Kanban** tab presents the same projects as cards, grouped by
*Portfolio Status* by default, which is helpful when triaging the
portfolio. The **Gantt** tab plots planned start and end dates on a
horizontal timeline; it is read-only here and meant for sharing visual
schedules with stakeholders.

## Working with Views

A **View** is a saved combination of columns, filters, grouping, sort
order and grain. Tempus comes with one personal view — your
**Default** — and any number of public views published by the PMO.
Click the **Default** button on the right of the toolbar to open the
View Manager:

:::highlight image=lib:chrome/chrome_create_view_dropdown.png caption="The View Manager: drag-handle and lock for private views, star, edit, clone and delete icons; public views (eye icon) live below your private ones."
:::

The icons inside each row of the View Manager always mean the same
thing: :icon[icon_drag_handle] is the **drag handle** that lets you
reorder the views by importance. :icon[icon_lock] freezes a view so
that filter or column changes do **not** persist — useful while you
are demoing data. :icon[icon_default_star_filled] marks the view that
opens automatically when you load this page; click
:icon[icon_default_star_outline] on a different row to move the star.
:icon[icon_edit_pencil] opens the view definition; :icon[icon_clone]
duplicates a view, which is the recommended way to "edit" a public
view (you cannot save changes back to a public view directly).
:icon[icon_delete_trash] removes a private view permanently — only
visible on views you own. The :icon[icon_public_eye] eye marker at the
bottom of a row identifies a **public view**.

**Tip.** If you want to tweak one of the Knauf-standard views, always
start by cloning it with :icon[icon_clone]; then edit the copy and,
optionally, give it your :icon[icon_default_star_filled] so it becomes
your personal default.
