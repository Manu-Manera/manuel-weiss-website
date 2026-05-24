# Creating a Project

A new project is created from the Project Management grid. Once it has a name and a valid date range, you can immediately move on to defining master data, resources, and costs.

## Open the Project Management Grid

From the homescreen, click the **Project Management** tile (or the small "+" badge on the tile for a shortcut into the create flow).

![Project Management grid](screenshots/05_pm_grid.png)

The grid lists every project you can access. You can switch between **Kanban**, **Grid**, and **Gantt** view via the tabs in the top-right. Knauf naming follows a pipe-separated convention (for example `XU | GLO | P4K | Release 2026.1`), so the **Search** field with "contains" semantics is the fastest way to find a project.

## Pick a Template

In the Project Management grid, click the green **Create Project** button. A dropdown opens with the templates that Knauf has configured. Phase 1 typically offers:

- **Regular Project** - the standard delivery template (tasks, allocations, financials).
- **New Service** - a Service template for recurring operational work; pre-populates a longer timeframe and the Service type.

![Create Project dropdown with Knauf templates](screenshots/06_create_project_dialog.png)

Pick the template that matches the work. The new project opens directly in its **Attributes** view so you can fill in the intake form.

> Note: Always start from a template rather than from a blank project. Templates carry Knauf's default attribute tagging and reduce setup time.

## Fill In the Intake Form

The Attributes view of a new project is organised in three sections (Intake Form, PMO, System Fields). At minimum, populate the fields marked with a red asterisk:

- **Project Name** - unique and descriptive.
- **Type** - Project or Service.
- **Service Name** - applicable when Type is Service; pick a service category.
- **Division** - Knauf division responsible for the work.
- **Product/Platform Area** - the area (for example MSS, MoB).
- **Lead Product/Platform** - the leading platform (for example SFX Platform).
- **Business Portfolio** - the business portfolio this project belongs to (for example MoB).
- **Planned Start date / Planned End Date** - the project's planning window. Tempus uses this to drive the allocation and financial grids.
- **Project Charging Type** - how the project is charged internally.
- **Legal Entity** - the Knauf legal entity.
- **Program Evolution Relation** - the relationship to a parent program.
- **Project Manager** - the responsible PM. The PM sees the project under the "My Projects" quick filter.

The optional fields (Program, Categorization, Project Category) help with portfolio reporting later on but are not required to save the project.

Press **Save** in the top toolbar. Tempus persists the project and unlocks the other project views (Allocations, Financials, Schedule, etc.).

## PMO and System Fields

After the intake form, scroll down to maintain the PMO information:

- **Above Red Line** - portfolio prioritisation flag.
- **Portfolio Status** - lifecycle status (default `0 - Draft`).
- **Ranking** - portfolio ranking.
- **Ext. Project Number** - the external project number; tagged `UNIQUE`, so duplicates are rejected.
- **Project Identifier Code (WBS)** - the Knauf WBS code, for example `A.0248.10.000460.22`.

System Fields hold the **Security Group** (defaults to `Default`) and the **Assignment Workflow**; only adjust these when an admin has briefed you.
