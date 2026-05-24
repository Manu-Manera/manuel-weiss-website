# Create a Project

:::roles PM/SM | Blended PM/SM + PPM
:::

Creating a project is the entry point for every Planner workflow. At Knauf there are two starting points, depending on whether the project has been pre-approved through the Intake process or whether the PMO wants to seed a brand-new project shell. Both lead to the same three pillars (Attributes → Resources → Financials), which are covered in chapters 5–7.

:::aag
Two ways to create a project at Knauf:

- **Without a template** — typed straight into Tempus; used for quick service-style work and ad-hoc demand.
- **With a template** — used when an Intake item has already been approved, or when the PMO wants the project to start from a baseline shell (status set, attributes pre-filled, owner assigned).
:::

## Where to start a project

PM/SM can open the **Create Project** dialog from three different entry points — pick whichever is closer to where you currently are in the tool:

| Entry point | When to use it |
|---|---|
| **+** badge on the *Project Management* tile (Homescreen) | You just logged in and have nothing else open |
| **+ Add projects** button in the Project Management Grid toolbar | You are already browsing the grid |
| Intake screen → **Approve & Create** | The project came in through Intake and is now being formalised |

![Create Project dialog (Intake)|h=360](screenshots/03_create_intake.png)

## Path A — Create *without* a template

Use this path for services, BAU work and any project where you do **not** want to inherit predefined attributes or assignments.

:::steps
1. From the Homescreen, click the **+** on the *Project Management* tile (or **+ Add projects** in the grid).
2. In the dialog, choose **Create blank project** (no template selection).
3. Enter the **Project name**. Knauf naming convention: `<Project type abbreviation> – <short scope>`, e.g. `BAU – AD Hardening 2026`.
4. Set the **Start date** and **End date**. These must be valid before the Single Project Allocation grid will accept assignments.
5. Confirm with **Create**. Tempus opens the new project's **Attributes** page automatically.
6. Continue with chapter 5 — *Set up Attributes* — to fill the mandatory master data before moving to Resources and Financials.
:::

> Note: A blank-project shell is created in status `Intake / Draft` until the mandatory attributes (chapter 5) are filled. You can save and come back, but the project will not show up in dashboards until status is moved to `Active` and the owner is assigned.

## Path B — Create *with* a template (PMO project)

Use this path when an Intake item has been approved by the Knauf PMO, or when a standard project profile applies (e.g. "Knauf IT Standard Project").

![Create Project from PMO template|h=360](screenshots/04_create_pmo.png)

:::steps
1. From the Homescreen, open **Project Management** and click **+ Add projects** → **Create from template**.
2. Pick the relevant template — the Knauf default templates are listed alphabetically, prefixed with `TPL_`.
3. The dialog pre-fills:
   - Project status (`Active` or `Planning`, depending on template)
   - Default attribute values (Business Unit, Phase, Cost Center, ...)
   - A predefined task structure on the Allocation grid (e.g. "Specification / Build / Test / Hypercare")
4. Override **Project name**, **Start/End date**, and **Project owner** as needed — these are the four fields that are almost always template-specific.
5. Click **Create**. Tempus opens the new project on the Attributes page.
6. Walk through chapters 5–7 once to validate the inherited values; in 80 % of cases you only adjust **dates** and **owner**.
:::

> Tip — bulk-fill: If you create several similar projects in a row (typical at the start of a fiscal year), use the **Clone** action on an existing project from the grid instead of going through the template dialog every time.

## What happens after *Create*

On a successful Create, Tempus drops you straight onto the new project's **Attributes** page. From here the path is always the same:

1. **Attributes** — fill the master-data fields (chapter 5).
2. **Resources** — open the Single Project Allocation grid and add the planned demand (chapter 6).
3. **Financials** — set the rate card, the Cost Plan, and the Budget (chapter 7).
4. **Save & Check-in** — release your check-out so other Planners can edit, and the figures appear in dashboards (covered at the end of chapter 6).

> Warning: Until you **save and check in**, the project is invisible to RM Resource Requests and to Reports. A brand-new project that is never checked in will sit silently in your drafts without any visibility.
