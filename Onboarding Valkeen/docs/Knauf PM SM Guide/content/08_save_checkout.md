# 7. Save, Checkout & Release

Tempus uses two complementary mechanics to commit your work:
**Save** for the surfaces that simply persist what you typed, and
**Checkout / Release** for the surfaces where multiple users could
collide. Knowing which surface uses which mechanic prevents the most
common source of frustration — lost edits.

## Save-only surfaces

The **Attributes** view (chapter 4) is a save-only surface. Multiple
PMs/SMs almost never edit the same project's master data at the same
moment, so Tempus does not enforce exclusivity. Edits stay in your
browser as a *draft*; pressing **Save** in the top-right corner
persists them and refreshes the audit information
("Updated on … by …"). If a colleague saves something
between your open and your save, Tempus will warn you and let you
reload before overwriting.

## Checkout-style surfaces

The **Allocations** (chapter 5) and **Financials** (chapter 6) views
*do* enforce exclusivity, because numbers in those views feed
downstream calculations and conflicting edits would silently corrupt
the plan. The cycle is:

| Step | What you click | What happens |
| --- | --- | --- |
| 1 | **Checkout** | The grid becomes editable. A lock :icon[icon_lock] is placed on the project under your name. No-one else can edit Allocations or Financials of this project until you release. |
| 2 | *(edit)* | Your changes are persisted to your private draft on every cell change. |
| 3 | **Save** | Your draft becomes the new central version. The lock stays with you. |
| 4 | **Release** | The lock is removed and the project is editable by other authorised users again. |

The **Save** and **Release** actions live in the same top-right strip
of the project page. *Always* press **Release** before leaving the
project — otherwise your colleagues will see a friendly *"Locked by
PM/SM (Dummy)"* message and will be blocked. The PMO has an admin
override but using it should remain the exception.

> Tip: **What if I forgot to release?** Just go back to the project,
> press **Release**. You do *not* need to save again — the central
> data is already up to date from the last **Save**.

## Edit modes per view

| View | Edit mode | Save target | Lock holder | Notes |
| --- | --- | --- | --- | --- |
| Attributes | Save-only | Central | none | Save persists immediately. |
| Allocations | Checkout :icon[icon_lock] | Central, after Save | You, until Release | Mandays or Cost |
| Financials | Checkout :icon[icon_lock] | Central, after Save | You, until Release | Non-labor cost lines |

## What "the central plan" means

Whenever this guide mentions *"the central plan"*, it refers to the
record of truth that all reports, the Resource Managers' BPA flatgrid
and the Knauf finance dashboards read from. Your draft edits do
**not** affect that record until you press **Save**. That is by
design — it lets you try out scenarios without anyone else seeing
half-baked numbers. The flipside is that you really must remember to
**Save and Release**; otherwise your work neither shows up in the
plan nor frees the project for the rest of the team.
