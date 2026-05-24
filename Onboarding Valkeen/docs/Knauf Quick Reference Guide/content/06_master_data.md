# Project Master Data (Attributes)

:::roles PM/SM
:::

:::aag
- The **Attributes** view holds all master data and is the first place to clean up after creating a project.
- The form is split into **Intake Form** and **PMO** sections. PM/SM does **not** see System Fields or Dependency Section.
- Edit directly in the view, click **Save** in the top-left. No separate checkout step for attributes.
- Green-highlighted dropdowns mark valid Knauf attribute combinations.
:::

![Service CRM Attributes view (PM/SM Dummy)](screenshots/qrg_06_attributes_pmsm.png)

## Editing Rules

| Rule | Effect |
| --- | --- |
| **Lock conflict** | If another user has the project locked, your save is rejected. Wait for the lock to clear. |
| **Audit trail** | Every change writes to the Audit Log; the CREATED / UPDATED badges show who and when. |
| **Cascade** | Some attributes (Division, Business Portfolio) drive cost roll-ups; changes ripple into portfolio reports. |
| **Green badge** | Cosmetic Knauf hint that the value is a recommended pick for the current Division / Area combination. |

## What to Maintain Day-to-Day

| When you... | Update this |
| --- | --- |
| Get a new project name from the business | **Project name**, **Ext. Project Number**, **Project Identifier Code (WBS)**. |
| Get scope clarity | **Categorization** (`new` / `existing` / `extension`), **Project Category**. |
| Get scheduling | **Planned Start / End Date**. |
| Get the responsible PM | **Project Manager**. |
| Reach a portfolio milestone | **Portfolio Status** (e.g. `0 - Draft` -> `1 - Approved`). |

## What PM/SM Cannot See / Edit

| Block | Who maintains it |
| --- | --- |
| **System Fields** (ID, Security Group, Assignment Workflow) | Admin Light / IT Controlling. |
| **Dependency Section** (predecessor / successor) | Admin Light / PPM. |
| **Financial Categories** master data | IT Controlling. |
| **Resource Hierarchy** | RM / Admin. |

> Note: A red asterisk on a field that you cannot edit usually means another role has to set it. Reach out via the agreed channel rather than trying to work around it.

## Saving

:::steps
- Make your edits in the dropdowns / text fields.
- Click **Save** in the top-left (green button).
- The CREATED / UPDATED badges at the top of the section refresh with your user.
- Move on to **Allocations** or **Financials** via the view selector.
:::

> Tip: Use **Search** in the Project Management grid to find your project again, even after you renamed it - search is contains-based.
