# Sign-in and Homescreen

:::roles Both
:::

:::aag
- Open `https://knaufdev.tempus-resource.com/` (sandbox) or your production URL in Chrome.
- Use **SSO** in production, or the local **Log In** for sandbox/training accounts.
- The homescreen tiles you see depend on your **global role**. PM/SM and RM see different sets.
:::

## Sign In

:::steps
- Open the Tempus URL provided by Knauf IT.
- Choose **Continue With Saml** (orange) for production SSO, or **Log In** (green) for sandbox/training accounts.
- For sandbox: enter the user (for example `pm` for PM/SM, `rm` for RM) plus the Knauf-issued password.
- Land on the Welcome screen with your name and the environment label (for example `Knauf - DEV`).
:::

> Warning: Never share passwords by email, chat, or in documents. Get sandbox credentials from the Knauf Tempus admin via the agreed secure channel.

## Homescreen for PM/SM

PM/SM sees a focused set of tiles: **Project Management** and **Report Management**. The "+" badge on Project Management opens the Create Project dialog directly.

![PM/SM (Dummy) homescreen - 2 tiles only](screenshots/qrg_01_homescreen_pmsm.png)

## Homescreen for RM (Typical)

RM typically sees more cross-project tiles, for example **Resource Management**, **Bulk Project Allocation Flatgrid**, **All Resource Requests** / **Resource Requests**, and **Bulk Resource Capacities**. The exact set depends on Knauf's RM global role.

> Note: If a screen mentioned in this guide is missing from your homescreen, you are most likely not granted that area. Ask the Knauf Tempus owner if access is intended.

## Top Bar Reference

The blue top bar is identical on every screen. Each icon is a single click.

| Icon | Name | What it does |
| --- | --- | --- |
| **Tempus logo** | Home | Back to the homescreen. |
| :icon[icon_topbar_search] | Search | Global search across projects, resources, reports. |
| :icon[icon_topbar_bell] | Notifications | In-app notifications. A red dot means unread items. |
| :icon[icon_topbar_menu] | Menu | Full navigation drawer with every module you have access to. |
| :icon[icon_topbar_help] | Help | Opens the **ProSymmetry Help Center** in a new tab. |
| **Moon / Sun** | Theme | Toggle dark mode. |
| **Your avatar** | Profile | Profile, Subscriptions, Logout. |

## Notification Subscriptions

:::steps
- Click your avatar > **Subscriptions**.
- On the **Project** tab, add the projects you want to follow.
- For each project, enable **Attributes**, **Allocations**, and **Deleted** notifications.
- On the **Resource Request** tab, enable the outcomes you care about for requests you submit.
:::

> Tip: Avoid the "all projects" option. Each subscription has to be removed individually, so being selective saves time.
