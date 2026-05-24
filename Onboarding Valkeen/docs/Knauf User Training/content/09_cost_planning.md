# Cost Planning

At Knauf, costs in Tempus are split into two layers:

- **Labor costs** are derived automatically from the project's allocations multiplied by the applicable resource rate. They show up in the Allocations view (€ Cost tab) and in cost rollups.
- **Non-labor costs** (external consulting, software licenses, hardware, travel) are maintained explicitly in the project's **Financials** view.

This split keeps the resource plan and the financial plan in sync without double-booking.

Knauf’s controlling model distinguishes **seven financial category families** (for example external consulting, IT licenses, leasing, managed services, other, CAPEX, and internal effort via **daily rates × PD**). How they aggregate to portfolio reports is defined by Knauf workshops; use **Type / OpEx / CapEx** and Controlling instructions when you create lines.

## Labor Cost in the Allocations View

In the Allocations view, switch to the **€ Cost** tab to see the same allocations expressed in Euro. The grid mirrors the Manday view cell-for-cell; the only difference is the unit.

![Allocations grid in Cost (Euro) view](screenshots/19_cost_columns.png)

The total at the bottom of the grid gives you the planned labor cost for the project across the selected timeframe.

> Note: The € numbers update whenever you change an allocation or whenever a Knauf admin updates the rate definition. They should be considered a derived value, not an input.

## Non-Labor Cost in the Financials View

For everything that is not labor, open the **Financials** view from the view selector. The grid lets you maintain planned and actual cost line items.

![Financials view with planned and actual cost lines](screenshots/18_cost_settings.png)

### Anatomy of the Financials Grid

- **Start / End date** restrict the timeframe of the grid.
- **Planned / Actual** toggle decides which series is editable.
- **Total column** toggle adds a grand total column.
- **Include labor costs** toggle pulls labor cost (from Allocations) into the grid so you see the full picture in one place. Keep it off when you only want to plan non-labor items.
- **Quarter / Group by / Insert columns / Filter** work the same as in the Allocations view.

### Grid Columns

Each row represents a cost line and carries:

- **Name** - free text label, for example `Consulting (ext)`.
- **Planned / Actual** indicator on the right side of the name.
- **Grand Total** - sum across the timeframe.
- **Code** - cost code (optional).
- **Description** - free text.
- **Type** - cost classification (`OpEx`, `CapEx`).

The bottom of the grid shows three roll-up rows:

- **Total - Positive** - revenue / positive entries.
- **Total - Negative** - costs / negative entries (typically the dominant line for Knauf projects).
- **Grand Total (Net)** - net result.

### Adding a Cost Line

1. Check the project out from the Allocations view (the lock is shared).
2. Switch to the Financials view.
3. Add a new line via the toolbar action, fill in Name, Description, Type, and the cost value in the relevant time bucket.
4. Save the project.

## Cost Rollup to the Portfolio

When several Knauf projects roll into a program or portfolio, Tempus aggregates planned costs across the hierarchy. Labor and non-labor costs follow their own configured roll-up paths. The portfolio-level result is what you see in the Budget Management tile and in the financial portfolio reports.

> Note: Confirm with the Knauf controller which cost types (OpEx vs. CapEx) and which charging type apply in your area. The downstream reporting groups by these attributes, so consistent tagging matters.
