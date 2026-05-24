# 4. Project Attributes (master data)

The **Attributes** view is the long-form record of a single project. It
gathers everything the PMO needs to classify, govern and report on the
project, and as a PM/SM you are the steward of the data here. The view
opens automatically right after you finished the intake; you can also
reach it any time by clicking a project name in the grid and choosing
**Attributes** from the view selector in the top-right corner.

![Service CRM in the Attributes view with Save button highlighted|h=400](screenshots/annotated/05_attributes_annot.png)

The blue stripe at the top of the page tells you who you are looking
at and what state the record is in. Box **(1)** is the editable
**Project name** — change it at any time, it is the value that appears
everywhere else in the product. Box **(2)** is the **Save** button.
Tempus keeps a local draft of your edits, but they are only persisted
to the central database once you press **Save**; if you leave the
page without saving, your changes are lost. Box **(3)** is the **view
selector** — drop it open to jump between Attributes, Allocations and
Financials without going back to the grid.

To the right of those primary controls Tempus shows audit information
(*Created on 04.05.2026 by Magdalena Gint…* / *Updated on 08.05.2026
by …*) so you can always tell when the project was last touched and
by whom. The little :icon[icon_clone] icon under the project name is
**Clone Project**: useful when you start a new project that has the
same governance attributes as an existing one — clone, rename, adjust.

## Reading the Attributes sections

The body of the page is the same **Intake Form / PMO** structure you
already know from chapter 3, only filled with real values. Because
PMs/SMs can edit every field on this page after the project has been
created, treat the Attributes view as the *master data sheet* for the
project: keep `Type`, `Division`, `Product / Platform Area`,
`Lead Product/Platform`, `Business Portfolio` and the planning dates
correct at all times — those five attributes drive every report and
the Bulk Project Allocation views that the Resource Managers use to
plan their teams.

The **Project Manager** field deserves a dedicated note. Re-assigning
a project to a different PM/SM here is the only way that person will
later be allowed to *check the project out* for editing in
Allocations or Financials — see chapter 7 for the mechanics.

## A practical edit loop

The typical edit loop on this page is short and worth memorising:

1. Open the project from the Project Management Grid.
2. Make changes to the fields you need to update.
3. Click **Save** ![Save button|h=18](screenshots/details/05_save_button.png).
4. Wait for the green confirmation toast in the lower-right corner.
5. Switch to the next view if needed via the view selector in box **(3)**.

If a field is greyed out, you do not have the permission to change it
— most often that means the field is owned by the PMO. Reach out via
the standard PMO channel; do not work around it by editing a different
field.

## Services vs. projects

Services use the exact same Attributes view as projects — the only
difference is the value of the **Type** field at the very top of the
Intake Form: set it to ``Service`` and pick the corresponding **Service
Name** from the dropdown immediately to the right. After saving, the
record will appear with the standard service prefix in the grid (for
example ``Service CRM`` or ``Service Procurement - PTP``) and the
Resource Managers will plan recurring effort against it from the BPA
Flatgrid.
