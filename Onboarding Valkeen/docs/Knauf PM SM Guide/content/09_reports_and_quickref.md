# 8. Reports

The **Report Management** tile on the homescreen leads to the library
of standard Knauf reports — portfolio dashboards, financial
roll-ups, allocation overviews, and resource utilisation views built
and curated by the PMO. As a PM/SM you only *consume* these reports;
authoring is done by the PMO.

![Report Management library|h=380](screenshots/annotated/09_reports_annot.png)

The page shows two helpful controls at the top of the list. Box
**(1)** is the **All / Mine** toggle — flip it to *Mine* to see only
reports that you have personally subscribed to (via the
**Subscriptions** menu in your avatar dropdown). Box **(2)** is the
**Search** box that filters the library by report name in real time.

To run a report, click its title. Most reports open in a new tab with
a parameter prompt (typically *Portfolio*, *Time frame*, *Above Red
Line*). Set the parameters and press **Run**. The result can be
exported to Excel or PDF from the toolbar of the result page.

> Tip: **Subscribing.** If you find yourself running the same report
> every Monday morning, open it, click *Subscribe* in the toolbar and
> pick the weekly cadence. Tempus will email you the rendered report
> on schedule.

---

# 9. Quick reference

This section is the cheat sheet you can keep open while you work. It
collects the icons, shortcuts and remedies for the recurring questions
that PMs/SMs ask in their first weeks with Tempus.

## Icon cheat sheet

| Inline | Where you see it | Meaning |
| --- | --- | --- |
| :icon[icon_topbar_search] | Top bar | Global search |
| :icon[icon_topbar_bell] | Top bar | System notifications (red dot = unread) |
| :icon[icon_topbar_menu] | Top bar | Module shortcut menu |
| :icon[icon_topbar_help] | Top bar | ProSymmetry Help Center |
| :icon[icon_drag_handle] | View Manager | Reorder views |
| :icon[icon_lock] | View Manager / project header | Locked view or checked-out project |
| :icon[icon_default_star_filled] | View Manager | The current personal default view |
| :icon[icon_default_star_outline] | View Manager | Click to make this view your default |
| :icon[icon_edit_pencil] | View Manager | Edit view definition |
| :icon[icon_clone] | View Manager / Attributes | Clone (view or project) |
| :icon[icon_delete_trash] | View Manager | Delete the private view |
| :icon[icon_public_eye] | View Manager row footer | Public view marker |

## Mini FAQ

**My Save button is grey on Allocations / Financials.**  You have
not pressed **Checkout** yet. The button is only active for the user
who holds the lock — see chapter 7.

**Tempus says "Locked by …" on a project I want to edit.**  Another
user is currently checked out on Allocations or Financials of that
project. Ask them to **Release**; in an emergency the PMO can force-
release via an admin tool.

**I cannot see the BPA Flatgrid tile on my homescreen.**  Correct —
that tile belongs to Resource Managers, not PM/SMs. You provide
demand by entering allocations on each project (chapter 5); the RM
consumes it from the BPA Flatgrid.

**My project does not show up in the Portfolio Dashboard.**  Check
that **Above Red Line**, **Portfolio Status**, **Division** and
**Business Portfolio** are set on the Attributes page. Reports
filter on those four attributes by default.

**Edits disappear after a page reload.**  You forgot to **Save**.
For Allocations / Financials, double-check that the **Save** button
turned green (= you held the lock) before you typed.

**The Mandays / Cost numbers do not match my business case.**  Open
the project's Attributes and verify that the **Project Charging
Type** and **Legal Entity** are correct — those drive the rate
conversion that fills the Cost mode.

**A field I need to change is greyed out.**  The field is owned by
the PMO. Reach out to the PMO inbox; do not work around it through a
different field.

**I want to clone a Knauf-standard public view.**  Open the View
Manager, click :icon[icon_clone] on the row of the public view, then
edit the copy. You cannot save changes back into a public view
directly.

## Where to go from here

Once you are comfortable with the eight chapters above, the
ProSymmetry Help Center (:icon[icon_topbar_help] in the top bar) is
the right next stop for any topic that is not Knauf-specific —
keyboard shortcuts, advanced filter syntax, history of cell edits.
For Knauf process questions (when to advance Portfolio Status, what
to write in External Project Number, how often to re-plan), the PMO
team is the right contact.
