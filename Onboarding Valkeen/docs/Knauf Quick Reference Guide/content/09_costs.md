# Plan Costs (Labor and Non-Labor)

:::roles PM/SM
:::

:::aag
- **Labor cost** is derived: switch the Allocations grid to **€ Cost** to see it.
- **Non-labor cost** lives in the **Financials** view: external consulting, licenses, leasing, managed services, other, CAPEX.
- The Financials grid lets you toggle **Include labor costs** to see one combined picture.
- Default grain in Financials at Knauf is **Quarter**; you can switch to Year or Month.
:::

## Labor Cost: From Allocations

The € Cost tab in the Allocations grid is read-only - it derives from your Mandays and the resource's daily rate.

![€ Cost view in the Allocations grid](screenshots/qrg_08_allocations_cost_pmsm.png)

> Tip: To change a labor cost, change the allocation (Manday tab). The € figure updates immediately. Rates are owned by IT Controlling and updated centrally.

## Non-Labor Cost: Financials View

Switch the view selector to **Financials**.

![Financials view for Service CRM (PM/SM Dummy)](screenshots/qrg_09_financials_pmsm.png)

## Toolbar Reference

| Control | Purpose |
| --- | --- |
| **Start / End date** | Window of the financial grid. |
| **Shift** | Bulk-shift lines by months. |
| **Total column** toggle | Add or remove the grand total column. |
| **Include labor costs** toggle | Pull labor cost into the same view. |
| **Series** (Planned / Actual) | Which series is editable. |
| **Quarter** dropdown | Time grain. |
| **Excel** | Export. |
| **Columns / Group by / Filter** | Grid customisation. |

## Columns You Will See

| Column | Use |
| --- | --- |
| **Name** | Cost line name (free text). |
| **Grand Total** | Sum across the timeframe. |
| **Code** | Optional internal code. |
| **Description** | Free text. |
| **Type** | `OpEx` or `CapEx`. |
| Time columns | Quarterly / yearly buckets, editable in Planned mode. |

## Roll-Up Rows

| Row | Meaning |
| --- | --- |
| **Total - Positive** (green) | Revenue or positive entries. Rare for Knauf IT projects. |
| **Total - Negative** (brown) | Sum of all cost lines. |
| **Allocation Labor Cost** | Pulled from Allocations when *Include labor costs* is ON. |
| **Grand Total (Net)** (bold) | Net result for the timeframe. |

## Add a Cost Line

:::steps
- Switch to the Financials view (the lock is shared with Allocations).
- Click **Checkout** if you have not done so already (in the Allocations view).
- Click the action to add a new line, then fill **Name**, **Description**, **Type** (`OpEx` / `CapEx`), and the cost value in the right time bucket.
- Save the project (Check In). The line shows in the totals and feeds portfolio rollups.
:::

> Warning: Cost values entered as positive numbers are typically displayed in parentheses `€(...)` because Tempus shows costs as a negative net effect. Stick to entering positive amounts in the cost lines and let Tempus take care of the sign.

## Seven Cost Categories - Reminder

When adding a non-labor line, pick a name that maps to one of:

1. External consulting
2. IT licenses
3. IT leasing
4. Managed IT services
5. Other costs
6. CAPEX
7. Internal effort (this one is implicit via Allocation Labor Cost)

> Note: The exact wording and codes are defined by IT Controlling. Stick to the agreed list so portfolio reports stay clean.
