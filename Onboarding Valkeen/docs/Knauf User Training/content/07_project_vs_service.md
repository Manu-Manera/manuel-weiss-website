# Project vs. Service

Knauf plans two distinct kinds of work in Tempus: projects and services. They share the same allocation, master-data, and reporting screens, but Tempus distinguishes them through the **Type** attribute, which drives several downstream behaviours.

## Templates at Creation Time

The distinction starts already in the Create Project dropdown. The Knauf templates available to you **when your role allows project creation** are typically:

- **Regular Project** - default template for delivery efforts with a defined goal, start, and end. Use this for transformation initiatives, rollouts, platform releases, and similar work.
- **New Service** - template for recurring operational work (run, change, maintenance, admin). The template pre-fills Type with `Service` and a longer default timeframe.

> Note: Pick the template at creation time; it pre-populates the attributes correctly. Changing Type later is possible but rarely needed and triggers a re-evaluation of cost and workflow logic.

![Create Project template selector](screenshots/06_create_project_dialog.png)

## Where the Difference Surfaces

Once created, both projects and services live side-by-side in the Project Management grid. Knauf typically prefixes services in the project name (for example `Service CRM`, `Service CPQ`) to make them easy to spot.

The Attributes view shows the difference explicitly:

- For projects, **Type** is `Project` and **Service Name** is `Project - n.a.`.
- For services, **Type** is `Service` and **Service Name** carries the service category.

## Decision Aid

- The work has a defined start and end with a delivery target -> Regular Project.
- The work is operational, ongoing, and team-based -> Service.
- The work is pending approval or still a "what-if" scenario -> use Tempus What if (Phase 2) to model it.

## Implications for Planning

**Knauf Phase 1 (Budget) organisational rule**: For the **first year** of operations, Knauf intends **no resource planning on services** in production workflows — focus **resource and capacity planning on projects** first; services remain relevant for **master data**, **cost categories**, and reporting alignment. *(Training material and sandbox may still use service examples so you recognise screens.)* Later phases may extend **resource planning to services**; follow announcements from IT Governance / Controlling.

Where Knauf enables planning for both types, the same screens apply (allocations, financials, reports) with different defaults:

- **Timeframe**: Services often use longer horizons in templates; projects follow delivery milestones.
- **Granularity**: Planning is typically in **Mandays** and in **month or quarter** buckets, depending on the grid.
- **Cost rollup**: Services typically map to “run-the-business” portfolios; projects to “change-the-business” where reports split by Type.
- **Reporting**: Portfolio reports may filter by Type; use attributes consistently so filters work.

**Financial categories (Phase 1)**: Knauf tracks **seven** cost dimensions in the controlling model, including external consulting, IT licenses, IT leasing, managed IT services, other costs, CAPEX, and **internal effort** (via rates × person-days). Exact aggregation to financial types is defined in Knauf workshops and may evolve — use the **Financials** view and Controlling guidance for mandatory coding.
