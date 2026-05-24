# Tempus Resource Navigation

This section covers logging in, the Knauf homescreen (tiles vary by **your** role), the task bar, and notification subscriptions. It is written for **PM/SM** and **RM** planners; other roles may see different tiles even on the same URL.

## Logging In

1. Open Tempus Resource in your browser at `https://knaufdev.tempus-resource.com/`. Google Chrome is the recommended browser.
2. You will see two sign-in paths:
   - **Log In** (green button) - local Tempus user ID and password (typically **sandbox / training** accounts issued by Knauf).
   - **Continue With Saml** (orange button) - **SSO** for production; most Knauf colleagues use this path.
3. Authenticate as instructed by Knauf IT or Controlling.

> Note: Sandbox credentials are distributed through a **secure channel** only. Do not commit passwords to git, wikis, or this training package.

## Homescreen

After signing in, you land on a Knauf-branded homescreen titled *Welcome &lt;Your Name&gt;* with an environment label (for example *Knauf - DEV*). The layout usually combines a **tile grid** with optional panels such as **Audit Log** (only if your role includes that permission).

The screenshot below illustrates **one** possible layout; **your tile count and labels depend on your global role** (for example PM/SM vs RM vs admin) and security group.

![Knauf homescreen with tiles and Audit Log](screenshots/02_homescreen.png)

### How many tiles you see

Knauf controls **which modules appear as tiles** through Tempus **global roles**. The same physical person in sandbox and production may see different tiles if roles differ. Examples (not exhaustive, subject to Knauf configuration):

- **PM/SM (planner)**: Often **Project Management**, **Report Management**, and project-deep links; **Bulk Project Allocation Flatgrid** and **Budget Management** may be **off** unless explicitly granted. Focus is **single-project** planning and master data.
- **RM (planner)**: Often **Resource Management**, **Bulk Project Allocation Flatgrid**, **resource request** tiles, **Bulk Resource Capacities**; cross-project and capacity workflows. **Project creation** can be restricted depending on project role.
- **Combined or admin-style test users** (sandbox only): May show **Admin Settings**, **Audit Log**, **Tempus What if**, **Scribe Rollup**, and more — **do not expect these in a pure PM/SM or RM production profile**.

### Tile reference (if shown for your login)

- **Project Management** - project repository; the **+** badge may open **Create Project** if you have rights.
- **Resource Management** - resource repository.
- **Report Management** - reports and dashboards.
- **Bulk Project Allocation Flatgrid** - multi-project allocation grid (**often RM**; see that chapter).
- **Roadmap Management** - roadmap / portfolio timeline (if licensed and granted).
- **All Resource Requests** / **Resource Requests** - request inbox and workflow.
- **Bulk Resource Capacities** - capacity editing at scale (**often RM**).
- **Budget Management** - budget rollups (if granted).
- **Admin Settings** - configuration (**admin**).
- **Tempus What if** - scenarios (**separate** governance).
- **Scribe Rollup** - rollup views (if granted).
- **Audit Log** - activity stream (**only** with audit permission).

> Note: If your homescreen looks “empty” compared to a colleague’s, that is usually **role-based**, not a defect.

### Audit Log

The right-hand pane shows recent platform activity such as recent logins and project updates. It is read-only and helps you spot what other Knauf users have changed without leaving the homescreen.

### Task Bar

The blue ribbon across the top is available from every screen:

- The **Tempus logo** (top-left) returns you to the homescreen.
- The **magnifying glass** opens global search to find a project, resource, or report.
- The **bell** opens notifications.
- The **hamburger menu** opens the full navigation drawer.
- The **question mark** opens the Help Center.
- The **moon / sun icon** toggles dark mode.
- The **user avatar** opens the profile menu (Profile, Subscriptions, My skill matrix, Logout).

## Recommended Notification Subscriptions

Planners (PM/SM and RM) should configure notifications from the **Subscriptions** entry in the profile menu where your role allows it.

### Project Notifications

In the **Project** tab, add the projects you want to follow. Avoid the "all projects" option, since each entry must be unsubscribed individually.

Recommended notifications per project:

- **Attributes** - any change to project attributes.
- **Allocations** - any change to project allocations.
- **Deleted** - notification when the project is deleted.

### Resource Request Notifications

In the **Resource Request** tab, opt in to one or more outcomes for the resource requests you have submitted (approved, replaced, rejected, etc.).
