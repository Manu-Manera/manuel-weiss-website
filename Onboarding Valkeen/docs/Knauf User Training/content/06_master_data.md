# Project Master Data

Project master data lives in the **Attributes** view of the individual project screen. Keeping it accurate is the basis for clean filtering, grouping, and reporting later on.

## Open the Attributes View

1. From the Project Management grid, click any project name. The project opens in its default view.
2. From the view selector in the top-right of the project screen, choose **Attributes**.

The Attributes view is grouped into four collapsible sections.

![Project Attributes view](screenshots/09_attributes_detail.png)

## Intake Form

The Intake Form holds the core business attributes. The fields marked with a red asterisk are mandatory at Knauf.

- **Type** *: Project or Service.
- **Service Name** *: applicable when Type is Service; pick a service category. For regular projects this stays at `Project - n.a.`.
- **Division** *: for example `Enterprise Solutions`.
- **Product/ Platform Area** *: for example `MSS`.
- **Lead Product/Platform** *: for example `SFX Platform`.
- **Business Portfolio** *: for example `MoB`.
- **Planned Start date / Planned End Date**: drives the allocation and financial timelines.
- **Program**: optional - links the project to a parent program.
- **Categorization**: optional - `existing` or `new` business.
- **Project Category**: optional - for example `Maintenance`.
- **Project Charging Type** *: how the project is charged internally.
- **Legal Entity** *: the responsible Knauf legal entity.
- **Program Evolution Relation** *: relation to the wider program portfolio (for example `beneficial`).
- **Project Manager**: the Tempus user owning the project end-to-end.

> Note: The green highlights you see around some attribute values are visual indicators that Knauf has configured. They typically flag attribute combinations that are valid or recommended.

## PMO

The PMO section captures portfolio-level metadata used by Knauf's portfolio reporting:

- **Above Red Line** - prioritisation flag (Yes / No / Not Set).
- **Portfolio Status** - lifecycle status, starting at `0 - Draft` for a new project.
- **Ranking** - portfolio ranking.
- **Ext. Project Number** - the external project number; tagged `UNIQUE`.
- **Project Identifier Code (WBS)** - the Knauf WBS code (for example `A.0248.10.000460.22`).

## Dependency Section

Use the Dependency Section to point at predecessor and successor projects. Leave it as `Please select...` if there are no dependencies.

## System Fields

System Fields are mostly read-only or admin-managed:

- **ID** - the internal Tempus project ID (read-only).
- **Security Group** - controls who can see and edit the project. Defaults to `Default`.
- **Assignment Workflow** - which approval workflow applies to resource requests; set by admin.

## Editing Master Data

The Attributes view is editable in place. Adjust the values, then click **Save** in the top toolbar. There is no separate checkout step for the Attributes view at Knauf - changes are persisted directly.

If another user has the project locked, your edits will not save and you will see a warning. Wait for the lock to clear and retry.

> Note: Some attributes (Type, Service Name, Division, Portfolio fields) drive cost rollups and portfolio dashboards. Confirm with your Knauf admin which values are valid in your area, especially when creating a project from scratch.

## Additional Project Options

Below the project name (top-left) you find a row of icons that expose power-user options:

- **Clone** - create a copy of the project, including allocations and attributes.
- **Snapshot** - capture the current state for later comparison.
- **Lock / Unlock** - prevent or allow concurrent edits.
- **Create Template** - turn the current project into a reusable template for future projects.
- **Delete** - remove the project (usually reserved for admins).

![Additional project options buttons](screenshots/09_attributes_detail.png)
