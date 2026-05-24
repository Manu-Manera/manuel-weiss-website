# Sign-in and Homescreen

## Logging in

Tempus Resource is reached via the Knauf Tempus instance at `knaufdev.tempus-resource.com` (DEV) or the production URL once go-live is finalised.

:::steps
1. Open **Google Chrome** (recommended browser).
2. Navigate to the Tempus URL provided by your Knauf admin.
3. Click **Knauf SSO Login** — you will be redirected to the Knauf identity provider.
4. Enter your standard Knauf credentials. Multi-factor follows the standard Knauf policy.
5. You land on the Tempus **Homescreen**.
:::

> Note: If the SSO redirect fails, click *Or use other methods* and request a local fallback from the Tempus admin. PM/SM do not have shared accounts — each Planner signs in with their own identity, which also drives the "my projects" filter on the grid.

## PM/SM Homescreen

After login you land on a focused Homescreen. PM/SM see two main tiles plus the standard top bar:

![PM/SM Homescreen with two tiles|h=320](screenshots/01_homescreen_pmsm.png)

:::aag
- **Project Management** tile — opens the Project Management Grid (your starting point for "find a project").
- The **+** badge on the tile opens the **Create Project** dialog directly without going through the grid first (see chapter 4).
- **Report Management** tile — opens your subscribed and saved reports.
- **Top bar** with global search, notifications, help, the hamburger menu and your profile.
:::

> Note: If your Knauf account also carries the PPM role, you may see an additional **Portfolio Overview** tile. RM tiles (Resource Management, Bulk Project Allocation Flatgrid, All Resources) are intentionally hidden for the PM/SM scope of this guide.

## Top Bar Reference

The blue top bar is identical on every screen in Tempus. Each icon is a single click.

| Element | What it does | Tip |
|---|---|---|
| Tempus logo (left) | Returns to the Homescreen from anywhere | Single click — no confirmation |
| Global Search | Searches across Projects, Resources, Attributes and Reports | Use a **contains** logic, narrow with the filter checkboxes |
| Bell — Notifications | Shows pending Resource Requests and system alerts | Red dot = unread count |
| Help (?) | Opens the in-app help and the Knowledge Base | Knauf admin can pin custom topics |
| Hamburger ☰ | Full navigation menu (alternative to the homescreen tiles) | Useful when you are deep inside a project |
| Profile (right) | Your account, language and sign-out | Language defaults to English for Knauf |

## Notification Subscriptions

Notifications keep you in the loop for the few moments where you actually need to react:

:::steps
1. Click the **bell** in the top bar.
2. Choose **Manage subscriptions**.
3. Subscribe to the events that matter for your role — typically: *Resource Request approved/rejected*, *Project status changed*, *Attribute value changed for my projects*.
4. Pick the delivery channel (in-app, email, or both). Knauf default: in-app + email digest.
5. Save. New events appear in the bell drop-down within seconds.
:::

> Tip: Don't subscribe to "all changes on all projects" — the noise will bury the important ones. Start with *Resource Request* events and add the rest only if you actually miss something.
