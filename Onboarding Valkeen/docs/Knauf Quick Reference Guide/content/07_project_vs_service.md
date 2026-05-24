# Project vs. Service

:::roles PM/SM
:::

:::aag
- The **Type** attribute (`Project` vs. `Service`) decides which template, fields, and roll-ups apply.
- At Knauf, **only Regular Projects** are created by PM/SM in Phase 1.
- Services already exist in the system (recognisable by the `Service ...` prefix); PM/SM can edit master data and costs on services they own, but resource planning on services is **not** part of Phase 1.
- The standard view is identical for both types; differences are in defaults and downstream reporting.
:::

## Decision Aid

| Situation | Type | Template at create time |
| --- | --- | --- |
| Defined start, end, deliverable | **Project** | `Regular Project` |
| Recurring run / maintenance work | **Service** | Created by RM / Controlling |
| Pending business approval | **Project** with **Portfolio Status = 0 - Draft** | `Regular Project` |
| What-if / scenario | Phase 2 - use **Tempus What if** | n/a |

## Examples from Knauf-DEV

| Project name | Type | Comment |
| --- | --- | --- |
| `XU \| GLO \| P4K \| Release 2026.1` | Project | Regular delivery project. |
| `Service CRM` | Service | Operational service (run + maintenance). |
| `Service CPQ` | Service | Operational service. |
| `XU EV \| GLO \| OneCRM \| Marketing \| Release Q1/27` | Project | Regular delivery project. |

## Planning Implications

| Concern | Project | Service |
| --- | --- | --- |
| **Resource Planning (Phase 1)** | In scope - Mandays per month/quarter. | **Out of scope** for the first year per Knauf decision. |
| **Cost Planning (Labor)** | Derived from Allocations × rate. | n/a for Phase 1. |
| **Cost Planning (Non-labor)** | Financials view: OpEx / CapEx lines. | In scope when configured. |
| **Reporting** | Filter by `Type = Project`. | Filter by `Type = Service`; usually feeds run-the-business reports. |

> Note: If you need to plan a service in detail before the Phase 2 rollout, raise it with IT Controlling. Avoid running parallel Excel plans - it defeats the single source of truth.

> Tip: The Project Management grid shows both types side by side. Add a `Type` column via **Columns** to filter and sort quickly.
