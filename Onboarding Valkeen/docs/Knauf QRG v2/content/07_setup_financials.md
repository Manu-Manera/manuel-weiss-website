# Pillar 3 — Financials

:::roles PM/SM | Blended PM/SM + PPM
:::

Financials answer **what does this project cost, and is it on budget**. At Knauf, PM/SM are accountable for the **Cost Plan** and the **Budget vs. Actual** comparison; rates and lock periods are administered by Finance / PPM but must be understood by every Planner.

This is the pillar most often skipped at Create time — and the one that pays off the most when you do it properly at the start. Plan once, re-forecast quarterly.

:::aag
- **Hourly Rate** — single value per resource (admin-maintained).
- **Advanced Rate** — time-and role-dependent rate card (admin-maintained).
- **Cost Plan** — derived from the Allocation grid × the applicable rate. PM/SM-editable for adjustments.
- **Budget vs. Actual** — Cost Plan as Plan; actual logged hours × rate as Actual.
- **Lock Periods** — closed months/quarters where Cost cannot be changed.
- **Re-forecast** — PM/SM-driven update of remaining quarters' Cost Plan.
:::

## Opening the Financials page

From the project header (Attributes, Allocations, …), choose **Financials** in the view selector. The page shows three stacked panels:

![Financials page with Cost Plan and Budget|h=380](screenshots/08_financials.png)

| Panel | Shows | Editable by PM/SM |
|---|---|---|
| **Rate Card** | Hourly Rate per resource (or per role for generics), with effective dates | No — read-only reference |
| **Cost Plan** | Calculated cost per resource × month from the Allocation grid | Yes — manual override per cell allowed |
| **Budget vs. Actual** | Plan (Cost Plan) vs. Actual (logged hours × rate) per month / quarter / year | Plan editable; Actual read-only |

## 1. Hourly Rate

The **Hourly Rate** is the simplest rate model — a single rate per resource, valid for a date range. Knauf uses it for:

- Named resources whose rate does not change with the activity (e.g. "Lina Vorontsova — Senior Architect — 145 €/h").
- Generic / role-based resources where a single blended rate is acceptable (e.g. "Senior Dev DE — 120 €/h").

PM/SM can **read** the Hourly Rate in the Rate Card panel and in any Allocation-grid column. To change it, request a rate update from Finance — there is no PM/SM-side override on the Hourly Rate.

> Note: Hourly Rate is the **fallback** rate. If no Advanced Rate applies for a given month/role, Tempus uses the Hourly Rate.

## 2. Advanced Rate

The **Advanced Rate** is a richer rate model — multiple rates for the same resource depending on **time** (effective from / to) **and** on **role / activity**. Used at Knauf for:

- Annual rate uplifts (e.g. 2026 rate jumps to 150 €/h on Jan 1).
- Cross-charging where the rate depends on the role the resource is playing (Lead vs. Reviewer).
- External vendors whose rate is contract-bound and changes per phase.

Advanced Rate is administered by Finance. PM/SM see the resolved rate in the Cost view of the Allocation grid (chapter 6) and in the Cost Plan panel below.

> Tip — when the Cost number surprises you: open the **Insert columns** dropdown on the SPA grid and add the *Effective Rate* column. The grid will show which rate row (Hourly vs. Advanced, which date band) Tempus actually used per resource — the most common source of "wrong-cost" tickets.

## 3. Cost Plan

The **Cost Plan** is the financial twin of the Allocation grid. Whenever you save and check-in on the SPA grid, Tempus recalculates the Cost Plan cell-by-cell as:

```
Cost Plan[resource, month] = Hours[resource, month] × Effective Rate[resource, month]
```

For most planning sessions you do nothing here — the Cost Plan is correct because the Allocation grid is correct. The two cases where PM/SM **manually adjust** the Cost Plan:

| Reason to override | Example |
|---|---|
| Fixed-price line item not driven by hours | A vendor invoice of 25 k€ in Q2, irrespective of effort |
| One-off cost (license, hardware) | 8 k€ Tableau license in Jan |
| Currency adjustment manually applied | A foreign-currency external is being billed at a non-standard rate |

:::steps
1. On the Financials page, in the **Cost Plan** panel, click into the target cell (resource × month).
2. Enter the override value. The cell shows a small "manual override" indicator (orange dot at the corner).
3. Click **Save** in the panel header, then **Check-in** at the project header.
4. If you need to revert to the calculated value, right-click the cell → **Reset to calculated**.
:::

> Warning: A manual override **survives** changes to the Allocation grid — if you later add hours to that resource/month, your override is still shown and the calculated value is hidden. Reset overrides when they no longer apply.

## 4. Budget vs. Actual

The **Budget vs. Actual** panel compares the Cost Plan (Plan) to the Actuals (logged hours × applicable rate). Three flavours are available via the panel's view selector:

| View | Granularity | Used for |
|---|---|---|
| **Monthly** | One bar per month | Operational tracking |
| **Quarterly** | Q1 / Q2 / Q3 / Q4 | Standard Knauf status meeting |
| **Annual** | Single Plan / Actual total | Year-end close, audit |

> Note: Actuals at Knauf are loaded from the Timesheet system once a week (Sunday night batch). A spike in Actuals on Monday morning is normal — it includes the previous week's bookings.

The **Variance** column is colour-coded:

| Colour | Meaning | Knauf threshold |
|---|---|---|
| Green | Actual within ±5 % of Plan | OK |
| Amber | Variance ±5 % to ±15 % | Flag in next status report |
| Red | Variance > ±15 % | Escalate to PMO; trigger re-forecast |

## 5. Lock Periods

A **Lock Period** is a date range (typically a closed financial month or quarter) in which Cost cannot be changed. Lock Periods exist to protect month-end reporting from retro-active edits.

| State | Symbol on the grid | What you can do |
|---|---|---|
| Open | No symbol | Edit freely |
| Soft-locked | Padlock outline | Edit with a comment (audit-tracked) |
| Hard-locked | Filled padlock | Read-only; no edit possible without PMO override |

> Warning: At Knauf the previous month is **soft-locked** on the 5th business day of the following month and **hard-locked** on the 10th. Schedule your Cost Plan adjustments before those dates. Soft-locked edits are tracked and reported to Finance.

## 6. Re-forecast

A **Re-forecast** is a structured update of the Cost Plan for all remaining open months/quarters of a project. The Knauf cadence is quarterly:

:::steps
1. **Trigger** — at the start of each quarter, PMO publishes the re-forecast window (typically two weeks).
2. **Open** the project's Financials page and switch the Budget vs. Actual view to **Quarterly**.
3. **Compare** Actuals vs. Plan for the closed quarter. Red and amber rows are your candidates for adjustment.
4. **Adjust** the Cost Plan for the remaining quarters — preferably by editing the **Allocation grid** (chapter 6) so hours and cost stay in sync. Use manual Cost Plan overrides only for non-hour-driven items.
5. **Save & Check-in** — the new Plan becomes the active baseline for the next quarter's reporting.
6. **Comment** — leave a short note on the Audit pane (right column) summarising what changed and why. PMO uses these comments in the quarterly variance review.
:::

> Tip: Don't re-forecast a project the day before status meeting — the new figures land in dashboards on the next overnight refresh, and you want the PMO to see the same Plan you discuss.

## What PM/SM cannot edit on Financials

| Read-only / admin-only | Owner |
|---|---|
| Rate Card values (Hourly + Advanced) | Finance admin |
| Effective-date bands on the Rate Card | Finance admin |
| Currency configuration per project | PPM admin |
| Lock-period schedule | Finance admin |
| Actuals correction (timesheet adjustment) | Time-tracking admin |

If you spot a Rate Card error or an Actual you believe is wrong, document it in the Audit pane and raise the ticket with Finance — there is no PM/SM-side workaround.
