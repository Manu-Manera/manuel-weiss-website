# 3. Creating a project

Every initiative you want to plan in Tempus — be it a true project or a
service — starts with the same intake form. As a PM/SM you only ever
see one entry, **Regular Project**, in the *Create Project* dropdown;
Knauf reserves any other intake template for the PMO core team.

## Launching the intake form

From the **Project Management Grid** click the green **Create Project**
button in the toolbar. A short pulldown appears with the single option
**Regular Project** — pick it and the intake screen opens immediately
on a blank record. The header strip looks like this:

![Create Project header with project name field and Create button|h=70](screenshots/details/03_create_header.png)

The two essentials are the **Project name** field on the left (box
**(1)**) and the green **Create** button (box **(2)**). Until you type
a name and click **Create**, *no* row exists in the database, so you
can safely close the page if you change your mind. The View selector
in the top right corner is fixed to **Attributes** while you are
creating a record — sections like Allocations or Financials only
become available *after* the record has been saved.

## Filling in the Intake Form

The intake form is split into two collapsible sections. The first,
**Intake Form**, gathers everything the PMO needs to slot the project
into the portfolio:

![Intake Form section with all fields visible|h=420](screenshots/annotated/03_create_intake_annot.png)

The two top fields decide what *kind* of work you are recording: in
box **(3)** choose the **Type** — ``Project`` if this is a one-off
initiative, ``Service`` if it represents recurring run effort. As soon
as you pick ``Service``, the **Service Name** dropdown in box **(4)**
becomes mandatory and must point to the corresponding service entry
(typically a recurring activity such as *CRM Run* or *Procurement —
PTP*). Below that you select the **Division**, the **Product /
Platform Area**, the **Lead Product/Platform** and the **Business
Portfolio**; all of these are picklists maintained by the PMO and they
control where the project surfaces in the public reports.

The next block sets the timing — **Planned Start date** and **Planned
End Date** — both pre-filled with sensible defaults that you should
adjust to your actual plan. The trio **Program**, **Categorization**
and **Project Category** lets you group the project under a program
or campaign; leave them as *Not Set* if there is no program in scope.

The bottom half of the section concerns governance: **Project Charging
Type** decides how time and costs are charged (CAPEX, OPEX, internal,
…), **Legal Entity** ties the project to the booking unit, and
**Program Evolution Relation** marks whether the project is a *new*
investment or an *existing* activity. Box **(5)** highlights the
**Project Manager** field — this points to *you* by default. Switch
the value only if you are intaking a project on behalf of a colleague,
because the Project Manager controls who can later check the project
out for editing.

> **Required fields** are marked with a small red asterisk in the UI.
> Tempus refuses to create the project until every red-starred field
> is filled — but you can always *save* the intake with non-required
> fields left empty and complete them later from the Attributes view
> covered in chapter 4.

## Filling in the PMO section

Scrolling further down you reach the **PMO** section. The fields here
are owned by the PMO but you should still set the ones you know:

![PMO section with Above Red Line, Portfolio Status, Ext. Project Number and WBS|h=320](screenshots/annotated/04_create_pmo_annot.png)

Box **(1)** is **Above Red Line** — answer *Yes* if the project is
part of the strategic above-the-line portfolio, *No* otherwise.
Box **(2)** is **Portfolio Status** — leave it on ``0 - Draft`` until
the project has been formally approved; the PMO will move it forward
through the lifecycle (``1 - Pipeline``, ``2 - In Plan``, etc.). Box
**(3)** is the **Ext. Project Number** that ties this record to your
external bookkeeping. The little

![UNIQUE badge|h=14](screenshots/details/04_unique_badge.png)

badge that appears next to the field is Tempus telling you that the
value has to be unique across the whole tenant — if you accidentally
re-use a number, the save will be rejected. Finally, box **(4)** is
the **Project Identifier Code (WBS)** which is the technical key under
which time bookings and finance entries are reconciled.

## Saving and exiting the intake

When all required fields are green-checked, click **Create**. Tempus
takes a moment to provision the record and then jumps you straight
into the **Attributes** view of the new project — that is the same
screen we look at in detail in chapter 4. From there you can switch
to **Allocations** or **Financials** using the view selector in the
top-right corner of the screen.

If you need to leave the intake form before creating the project, use
the back-arrow (**←**) in the top-left corner. Anything you typed but
did not save will be discarded. To revisit an already created project,
return to the Project Management Grid and click the project name.
