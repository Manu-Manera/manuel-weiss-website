# Glossary & Quick Lookup

:::roles Both
:::

:::aag
- Tempus distinguishes **Projects** and **Services** via the **Type** attribute - drives templates, screens, and roll-ups.
- Planning uses **Mandays** as the standard capacity unit at Knauf, plus **Euro** for cost views.
- **Allocations** = labor capacity per resource. **Financials** = non-labor cost lines (and labor cost roll-up).
- Cycles: **Phase 1 = Budget** (this guide). **Phase 2 = Forecasting / Actuals / Reporting** (later).
- **Resource Requests** are workflow events created when allocations change; the responsible RM approves, replaces, or rejects them.
:::

## Roles in This Guide

| Badge | Knauf Global Role | Typical day-to-day |
| --- | --- | --- |
| **PM/SM** | Project Manager / Service Manager | Owns one or more projects/services; maintains master data, plans labor and non-labor costs, watches own projects. |
| **RM** | Resource Manager | Steers capacity across the pool; handles resource requests; bulk-edits allocations across many projects. |
| **Both** | Applies to PM/SM and RM | Sign-in, navigation, opening a project, reporting basics. |

> Note: IT-Controlling, Portfolio Management (PPM), Admin Light, and Executive Users exist in Tempus but follow separate training material. They may share screens with planners but with different rights.

## Capacity and Cost Units

| Unit | Where | Notes |
| --- | --- | --- |
| **Manday** | Allocations grid - `Manday` tab | Standard Knauf unit for labor capacity. |
| **€ Cost** | Allocations grid - `€ Cost` tab | Derived: Mandays × resource daily rate. |
| **FTE / FTE %** | Allocations grid | Same allocation, different unit. |
| **Cost line (EUR)** | Financials grid | Non-labor cost lines, planned vs. actual. |

## Time Grain Defaults

| Screen | Default at Knauf |
| --- | --- |
| Single Project Allocations | **Month** |
| Bulk Project Allocation Flatgrid (RM) | **Month** |
| Financials | **Quarter** |

> Tip: You can always switch grain (Day, Week, Month, Quarter, Year) from the dropdown above the grid. The granularity only affects display, not the underlying values.

## Phase 1 Scope at Knauf

| Topic | In scope (Phase 1) | Out of scope (Phase 1) |
| --- | --- | --- |
| Master data on projects/services | Yes | - |
| Resource planning on **projects** | Yes (Mandays) | - |
| Resource planning on **services** | **No** - first-year decision; review later | - |
| Cost planning (labor) | Yes (derived from allocations) | - |
| Cost planning (non-labor) | Yes (Financials) | Actuals load |
| Forecasting | Snapshot of budget only | Multiple forecast cycles |
| Actuals (SAP) | No | Yes in Phase 2 |
| Reporting | Consume existing reports | Build new dashboards (PPM/Controlling) |

## Seven Financial Categories (Knauf)

Use these consistently when adding a non-labor cost line in the Financials view:

1. External consulting
2. IT licenses
3. IT leasing
4. Managed IT services
5. Other costs
6. CAPEX
7. Internal effort (rate × person-days; derived from Allocations)

> Note: Codes, mapping to OpEx vs. CapEx, and portfolio roll-up rules are owned by IT-Controlling. Use the values your area has agreed.
