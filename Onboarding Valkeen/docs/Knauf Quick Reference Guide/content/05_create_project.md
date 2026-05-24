# Create a Project

:::roles PM/SM
:::

:::aag
- PM/SM creates **Regular Projects** only. Services are created by RM / IT-Controlling per Knauf governance.
- A new project opens directly in the **Attributes** view with an intake form to fill in.
- Mandatory fields are marked with a red asterisk; you cannot save until they are set.
- The PMO section captures portfolio-level metadata (Above Red Line, Portfolio Status, WBS, etc.).
:::

## Start the Create Flow

:::steps
- Open the **Project Management** tile or the **+** badge on the Project Management tile.
- Click the green **Create Project** button.
- Pick a template - PM/SM at Knauf sees a single option, **Regular Project**.
- The new project opens immediately in its Attributes view.
:::

![Create Project intake form for PM/SM](screenshots/qrg_04_create_intake_pmsm.png)

## Intake Form - Mandatory Fields

| Field | Example value | Notes |
| --- | --- | --- |
| **Type** * | `Project` | Set by the template. |
| **Service Name** * | `Project - n.a.` | Stays at default for regular projects. |
| **Division** * | `Enterprise Solutions` | Drives portfolio roll-ups. |
| **Product/Platform Area** * | `MSS` | Sub-area. |
| **Lead Product/Platform** * | `SFX Platform` | Leading platform. |
| **Business Portfolio** * | `MoB` | Drives portfolio reporting. |
| **Project Charging Type** * | choose from list | Internal charging rule. |
| **Legal Entity** * | choose from list | Knauf legal entity. |
| **Program Evolution Relation** * | `beneficial` | Relation to the parent program. |

## Intake Form - Optional Fields

| Field | Used for |
| --- | --- |
| **Planned Start date / Planned End Date** | Drives the Allocations and Financials timeframe. |
| **Program** | Parent program link. |
| **Categorization** | `new`, `existing`, `extension`. |
| **Project Category** | For example `Maintenance`. |
| **Project Manager** | The Tempus user owning the project. |

## PMO Section

![PMO section in the Create Project dialog](screenshots/qrg_05_create_pmo_pmsm.png)

| PMO Field | Notes |
| --- | --- |
| **Above Red Line** | Portfolio prioritisation flag. |
| **Portfolio Status** | Starts at `0 - Draft`. |
| **Ranking** | Portfolio ranking. |
| **Ext. Project Number** | Tagged **UNIQUE** - no duplicates allowed. |
| **Project Identifier Code (WBS)** | Knauf WBS code, for example `A.0248.10.000460.22`. |

> Tip: Set Planned Start / End right away. Without them, the Allocations grid stays empty and the € Cost / Manday rows have nowhere to land.

## Save

:::steps
- Enter the **Project name** in the top-left field.
- Fill in all mandatory fields (red asterisks).
- Click **Create** (green button next to the project name).
- Tempus persists the project and reopens it in the Attributes view, ready for further work.
:::

> Warning: If a mandatory field is missing or a duplicate Ext. Project Number is detected, the **Create** click fails silently. Scroll through the intake form and look for red borders or the duplicate tooltip on the Ext. Project Number field.
