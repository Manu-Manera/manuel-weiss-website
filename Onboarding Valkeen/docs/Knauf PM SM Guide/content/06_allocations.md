# 5. Allocations — planning mandays

The **Allocations** view is the heart of project planning. Here you
record how much effort each role (and, once nominated, each named
person) is expected to spend on the project, per month. The total of
all role rows is what eventually shows up in the Resource Manager's
Bulk Project Allocation Flatgrid; the demand you create here drives
their staffing decisions.

You reach the view in two clicks: open the project from the grid,
then choose **Allocations** from the view selector in the top-right
corner of the project page.

![Allocations view in Mandays mode with the Checkout button highlighted|h=400](screenshots/annotated/06_allocations_manday_annot.png)

Three controls deserve attention right away. Box **(1)** is the
**project name** strip, identical to the one on the Attributes view —
you can change the name here as well, but you usually will not.
Box **(2)** is the prominent red-bordered **Save** button. Because
Allocations are a *checkout-style* surface (see chapter 7), the
button is grey and labelled *Checkout* until you reserve the project
for editing; once you do, it turns green and becomes the *Save*
action. Box **(3)** is the view selector — your shortcut back to
Attributes or forward to Financials. Box **(4)** is the most
important new control: the **Mandays ↔ Cost** toggle that decides
what unit the cells of the grid display.

## Mandays vs. Cost

Allocations can be entered in two equivalent units:

![Mandays / Cost toggle detail|h=44](screenshots/details/07_view_toggle.png)

In **Mandays** mode (default, shown above) each cell is an integer
number of *resource-days* per role per period. In **Cost** mode the
same cell shows the corresponding euro amount, derived from the role's
internal cost rate. The two units are different *views* of the same
underlying data — Tempus converts on the fly. PM/SMs typically plan
in Mandays because they think about effort, then flip to Cost once or
twice during the planning cycle to sanity-check the resulting budget:

![Allocations view in Cost mode|h=380](screenshots/annotated/07_allocations_cost_annot.png)

Box **(1)** is the toggle on Cost; box **(2)** sets the **time grain**
of the columns — monthly is the standard, but you can switch to
quarters or years when you want a high-level view.

## How to enter allocations

The recommended workflow is:

1. From the Attributes view of an existing project, switch to
   **Allocations**.
2. Press the **Checkout** button. It immediately turns into **Save**
   and the grid becomes editable.
3. Click into the leftmost column of the row of the role you want to
   plan (or use **Add Row** above the grid if the role is not yet
   present). Pick the role from the dropdown.
4. Type the desired number of mandays into each month cell. Use
   ``Tab`` to advance to the next column or ``Enter`` to drop to the
   next row.
5. When done, click **Save** in the top-right corner. The toast in the
   lower-right corner confirms the persistence.

> Tip: **Bulk fill.** Click the column header of any period and pick
> *Fill down* from the small column menu to copy the value of the
> selected cell into the whole column. This is the fastest way to
> seed a flat baseline that you then refine.

## Requesting named resources

Up to this point you have allocated **roles**, not people. Once your
plan is stable, you can nominate concrete colleagues by opening the
*Resource Request* dialog on a role row (right-click → *Request
resource*). The request lands in the inbox of the relevant Resource
Manager, who decides whether to fulfil it from their team. The
allocated mandays remain unchanged; only the row's *Resource* column
moves from the generic role to a named person once the request is
accepted.

## Common pitfalls

A handful of issues come up repeatedly when PMs/SMs plan in Allocations:

- **Editing without Checkout.** If the Save button is grey, you have
  not checked the project out. Any keystrokes are visual only and will
  vanish on reload.
- **Editing outside your planning horizon.** Tempus does not stop you
  from editing past months, but those values do not contribute to
  future capacity calculations. Use *Planned Start* / *Planned End*
  on the Attributes view to keep the horizon honest.
- **Forgetting to release.** Saving persists the data, but the project
  remains *checked out* under your name until you press **Release**
  (chapter 7). Other people on the same project cannot edit while you
  hold the lock.
