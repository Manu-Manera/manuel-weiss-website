# FAQ and Troubleshooting

:::roles Both
:::

:::aag
- Most "missing" tiles or buttons are not bugs - they are role-based filters.
- Most "save failed" issues come from locks or from missing mandatory fields.
- When in doubt, check the Audit Log of the affected project before raising a ticket.
:::

## Top Questions

### My homescreen only shows 2 tiles. Is that a bug?

No. PM/SM (the planner role you most likely have) sees **Project Management** and **Report Management** by design. RM sees a different set. Admin Light, IT Controlling, and PPM see more. The training screenshots in this guide are taken with a PM/SM Dummy login and reflect the production-style PM/SM view.

### I cannot find the "Create Project" button

The green button shows up only for users whose global role grants **Create Project**. PM/SM at Knauf has it. RM normally does not. If you are PM/SM and still do not see it, the most likely reasons are a project-security mismatch or a missing assignment to the Project Management tile.

### I cannot open project X even though I see it in the grid

Project visibility (grid row) and project edit access (open + edit) are governed by **two layers**: the global role and the project security group. You may have read-only access to a name without rights to open the detail. Ask the project owner to add you to the right security group, or open it as a member of a higher-level role.

### The Allocations grid is empty

Check that the project has both **Planned Start date** and **Planned End Date** set in the Attributes view. Without dates, Tempus has nowhere to render rows. Also check that you have not narrowed the timeframe selector at the top.

### I changed allocations but the € Cost stays at € 0

Switch the grain (Month / Quarter) - sometimes the rate is only defined for certain periods. If it still reads zero, the resource may not have a daily rate assigned. RM / IT Controlling owns that data.

### The Save button is greyed out

You forgot to **Checkout**. Click the green **Checkout** button at the top to acquire the edit lock, then edit.

### I cannot Checkout - another user has the lock

Tempus shows the locking user in the warning. Reach out, or wait. As an emergency, the Admin Light role can break the lock.

### My change does not appear in the report

Reports read **checked-in** data. Click **Save and Check In** to release the lock and propagate the change.

### Why is my cost shown as `€(250.000)` with brackets?

Brackets indicate the financial-direction convention: costs flow out, so they are displayed as negative for the company. The number you entered (positive) is the same; only the presentation is signed.

### Which time grain should I use?

| Where | Default Knauf grain |
| --- | --- |
| Single-project Allocations | Month |
| BPA Flatgrid (RM) | Month |
| Financials | Quarter |
| Portfolio reports | Quarter / Year |

### A field name is in green - is something wrong?

No. Green-highlighted dropdowns are a Knauf hint that the value is a recommended pick for the current combination of Division / Area / Portfolio.

## Icon Cheat Sheet

A one-page cheat-sheet of the icons referenced throughout this guide.

| Icon | Where you see it | Meaning |
| --- | --- | --- |
| :icon[icon_topbar_search] | Top bar | Global search. |
| :icon[icon_topbar_bell] | Top bar | Notifications (red dot = unread). |
| :icon[icon_topbar_menu] | Top bar | Navigation drawer. |
| :icon[icon_topbar_help] | Top bar | ProSymmetry Help Center. |
| :icon[icon_drag_handle] | View dropdown | Drag-to-reorder handle. |
| :icon[icon_lock] | View dropdown / project header | Lock a view, or "project is checked out". |
| :icon[icon_default_star_filled] | View dropdown | The selected default view. |
| :icon[icon_default_star_outline] | View dropdown | Click to set this view as default. |
| :icon[icon_edit_pencil] | View dropdown / labels | Edit / rename. |
| :icon[icon_clone] | View dropdown / items | Clone (copy a view, allocation, project). |
| :icon[icon_delete_trash] | View dropdown | Delete (private items only). |
| :icon[icon_public_eye] | View dropdown | Public view (admin-shared, read-only). |

## Help and Support

| Topic | Who |
| --- | --- |
| Access / permissions | Knauf Tempus admin. |
| Rates / cost categories / mappings | IT Controlling. |
| Resource requests for your projects | Your assigned RM. |
| Portfolio reporting / new reports | PPM / IT Controlling. |
| Bug or unexpected behaviour | Valkeen via the agreed support channel. |

> Note: Valkeen GmbH is the implementation partner and maintains this guide. Suggestions for improvements are welcome via the Knauf-Valkeen working group.
