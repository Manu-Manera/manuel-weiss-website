# Overview

This guide supports **planners** at Knauf who work in Tempus Resource in **Phase 1 (Budget)**: **Project Manager / Service Manager (PM/SM)** and **Resource Manager (RM)**. IT-Controlling, Portfolio Management (PPM), executives, and administrators use overlapping features but follow separate training and governance material.

Screenshots in this document were taken in the Knauf sandbox and may show **additional tiles** (for example Admin, support, or combined test roles). Your production homescreen shows **only the entry points your global role and security group allow**.

## Why Tempus at Knauf

**Main purpose**: Provide one online tool where IT colleagues maintain **budget, forecast, and actuals** per project and service with consistent structures and reporting.

**Objectives** (Phase 1 alignment):

- Move away from Excel as the primary controlling spreadsheet for these figures.
- Hold **budget, forecast, and actuals-related information in one database** with shared layouts and reporting across dimensions **without manual consolidation**.
- Ensure all colleagues work on the **same platform** with **agreed definitions and standards**.

**Problems Tempus is meant to reduce**:

- Poor data quality and many parallel file versions.
- Manual merging of local spreadsheets.
- **Single source of truth** for planning and cost views.
- Less time on data preparation, more time on analysis.
- Reporting across dimensions (for example cost vs. revenue views, divisions, IT products) for IT stakeholders.

## Current vs. Target State (Summary)

**Today (simplified)**:

- **Projects**: Ideas are collected, estimated (internal effort, consulting, licenses, leasing, managed services, other costs, CAPEX), aligned for capacity, prioritised into an IT portfolio, then iterated with management.
- **Services**: Budget **cash-out** by cost category; **resource planning in Tempus for services was not the standard process** before go-live.

**Pain points** that motivated the tool:

- Too many Excel versions, missing mandatory fields, **divergent prioritisation logic** between IT divisions, and **incomplete forecast/actual pictures** (often only cash-out positions).

**Target**:

- Easier views of **actuals vs. budget and forecast** with aggregation (divisions, IT products, portfolios).
- **Aligned** resource planning and **standardised** processes with fewer manual adjustments.

## Phase 1 vs. Phase 2 (Relevance for This Guide)

| Topic | Phase 1 (Budget) – this guide | Phase 2 (Forecasting / Actuals / Reporting) |
| --- | --- | --- |
| Focus | Enter required master data, **resource and cost information by cost type** on projects (and services where Knauf opens this up). | Additional forecast cycles; **actuals** loaded (for example from SAP); deeper reporting. |
| Services – resource planning | **Knauf decision for the first year**: **no resource planning on services** in production; focus on **project** delivery workstreams first. Services remain in scope for **master data and cost lines** as configured. *(Sandbox training may still illustrate service objects for learning.)* | Resource planning for services **foreseen for later years** per Knauf roadmap. |
| Historical data | Not migrated in Phase 1. | Active projects and actuals to be loaded per Knauf data strategy. |

## Who Does What (High Level)

| Role | Typical Tempus responsibilities in the Knauf model |
| --- | --- |
| **IT product (area) & service manager (PM/SM)** | Budgeting and forecasting **per cost type and project** (Phase 1); enter **resource and financial** planning on **projects** as configured. |
| **Resource Manager (RM)** | **Capacity and resource allocation** across the pool; review **resource requests**; often uses **cross-project** tools (for example Bulk Project Allocation Flatgrid) **when granted**. |
| **IT-Controlling** | Coordinates cycles, snapshots, reporting; **loads actuals** in Phase 2. *Separate training.* |
| **Portfolio Management (PPM)** | Portfolio and capacity steering; broader reporting. *Separate training.* |
| **Senior Management** | Consumers of reports. *No operational training in this document.* |

> Note: Exact field lists, approval rules, and **which tiles appear** are defined by Knauf **global roles** (for example `PM/SM G*`, `RM G*`) and **project/resource security**. If a chapter describes a screen you cannot open, ask your Tempus owner whether your role is meant to have access.

## Core Concepts

- **Sign-in**: Production users typically use **SSO** (`Continue With Saml`). Sandbox testers may use local **Log In** accounts issued by Knauf **through a secure channel** – never share passwords in email or tickets.
- **Resource types**: Named resources (individuals) vs. **demand-planning** resources (generic roles, often shown with a `*` prefix).
- **Projects vs. services**: Distinguished by the **Type** attribute and templates. See *Project vs. Service*.
- **Assignments**: Link a resource to a project (or task) with a capacity unit. At Knauf, planning is typically in **Mandays** (and **Euro** in cost views), not necessarily clock hours.
- **Resource requests**: Changing allocations usually creates a request that an **RM** (or workflow) must approve.
