# 6. Financials — non-labor costs

The **Financials** view captures everything that is *not* paid in
mandays: external service fees, software licences, hardware, travel,
contingency. Labor costs derived from the allocations of chapter 5
flow into the same financial picture automatically — you do **not**
re-enter them here.

Switch to Financials from any project page using the view selector
in the top-right corner.

![Financials view of a project|h=400](screenshots/annotated/08_financials_annot.png)

The structure mirrors the Allocations view. Box **(1)** is again the
Checkout / Save button — Financials use the same checkout mechanic as
Allocations (chapter 7). Box **(2)** is the **toolbar** above the
grid containing the **Add Row** action that appends a new cost line.
The grid itself shows one row per cost line, with the planning periods
as columns.

## How to enter cost lines

A cost line in Tempus is a tuple of:

| Column | Meaning |
| --- | --- |
| Cost Category | The bucket the cost belongs to (e.g. *External Services*, *Licences*, *Hardware*, *Travel*, *Other*). Picklist owned by Finance. |
| Cost Type | Refinement of the category (e.g. *T&M consulting* under *External Services*). Filtered to entries that match the chosen category. |
| Supplier (optional) | A reference for documentation; does not affect the calculation. |
| Currency | Always EUR for Knauf. Locked. |
| Amount per period | The euro amount you expect to spend in that month/quarter/year. |

To add a new cost line:

1. Press **Checkout** in the top-right corner (the button turns green
   and becomes **Save**).
2. Click **Add Row** in the toolbar of box **(2)**. A blank row is
   appended at the bottom of the grid.
3. Pick the **Cost Category** and **Cost Type** in the first two
   columns of the new row.
4. Type the euro amount into each period column. Decimals are
   accepted, the locale is German (``1.234,56``).
5. Press **Save** when done. The Finance reports will pick up the
   value at the next scheduled refresh.

> **Capex vs. Opex.** Both flow through the same view; the
> capitalisation rule is derived from the *Project Charging Type* on
> the Attributes page. If a cost line is showing up under the wrong
> bucket in the finance report, fix the Charging Type first, then
> save — Tempus re-classifies the cost lines automatically.

## Validating the budget

Once you have entered allocations *and* cost lines, switch the
Allocations view to **Cost** mode (see chapter 5) and compare the
labor totals to the non-labor totals in Financials. Together they give
you the total committed project budget. The same number appears in
the *Total Cost* column of the Project Management Grid — make sure it
matches your business case before you ask the PMO to advance the
project's *Portfolio Status*.

## When the grid is empty

A project with **no** cost rows in Financials means *the PM/SM did
not plan any non-labor cost yet*. That is a valid state for early-
stage projects but should not last past the *Pipeline* phase: empty
financials cause Knauf's portfolio dashboards to under-report the
real investment. The PMO will follow up if a project sits in *In
Plan* with empty financials for more than two weeks.
