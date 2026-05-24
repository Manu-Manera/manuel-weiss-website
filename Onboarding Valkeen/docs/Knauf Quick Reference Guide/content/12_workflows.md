# Workflows, Locks, and Saving

:::roles Both
:::

:::aag
- **Attributes** are saved directly; no checkout required.
- **Allocations** and **Financials** require **Checkout** before editing.
- Only one user can hold the lock at a time. The lock is released by **Save and Check In** or **Release**.
- Saving allocations creates **Resource Requests** that the RM has to handle.
:::

## Edit Modes per View

| View | Lock? | Save action |
| --- | --- | --- |
| **Attributes** | No | Direct **Save** (top toolbar). |
| **Allocations** | Yes :icon[icon_lock] | **Checkout** -> edit -> **Save and Check In** / **Release**. |
| **Financials** | Yes :icon[icon_lock] (shared with Allocations) | **Checkout** -> edit -> **Save and Check In** / **Release**. |
| **Build Team** | Yes :icon[icon_lock] | **Checkout** -> edit -> **Save and Check In** / **Release**. |
| **Reports** | n/a (read for planners) | Filters do not persist for others. |

> Tip: A red-shaded :icon[icon_lock] padlock at the top of a view means the project is currently checked out - either by you or by someone else.

## Concurrent Edits

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| **Save** is greyed out | You have not done **Checkout**. | Click Checkout first. |
| **Checkout** is greyed out | Another user has the lock. | Wait, or contact them. |
| Edits do not show in reports | Reports show **Check-in** data. | Check in or wait for the refresh. |
| Audit Log shows an undo | The other user released without saving while you were checked in. | Verify with them; re-enter changes if needed. |

> Warning: Never close the browser tab while you hold the lock. The lock stays with your user until released. Reopen the project and click **Release** or **Save and Check In**.

## Resource Request Workflow

```
PM/SM allocates -> request "Pending"
                |
                v
RM reviews -> Approves / Replaces / Rejects -> request closed
```

| Outcome | Effect on the Allocations grid |
| --- | --- |
| **Approved** | Capacity is firm; status dot turns green. |
| **Replaced** | Generic role swapped for a named resource; the row label updates. |
| **Rejected** | The change is rolled back on PM/SM side; status dot turns red. |

## Naming Conventions

| Object | Pattern | Example |
| --- | --- | --- |
| **Project name** | `<Division> | <Country> | <Area> | <Theme>` | `XU \| GLO \| P4K \| Release 2026.1` |
| **Service name** | `Service <Function>` | `Service CRM` |
| **WBS Code** | `<Country>.<Year>.<Counter>.<Project ID>` | `A.0248.10.000460.22` |
| **Ext. Project Number** | Free, but **UNIQUE**. | Use the agreed business number. |

> Tip: Sticking to the naming convention pays off in every report and every filter. Knauf's portfolio reports filter on the prefix to split work by division.
