/**
 * QRG Builder — Template-Bibliothek
 *
 * Jeder Eintrag ist ein QRG mit einer `build(config)`-Funktion, die
 * eine Liste strukturierter Blöcke zurückgibt. Diese Blöcke werden
 * sowohl im Live-Preview als auch beim DOCX-/PDF-/Markdown-Export
 * gerendert. Hinzufügen weiterer QRGs = neuer Eintrag in `qrgTemplates`.
 *
 * Block-Typen:
 *   h1 / h2 / h3           — Überschriften
 *   p                      — Absatz
 *   ul / ol                — Listen (items: string[])
 *   note                   — gelbe Hinweis-Box
 *   tip                    — grüne Tipp-Box
 *   table                  — { columns: [], rows: [[...]] }
 *   spacer                 — Vertikaler Abstand
 */

function resourceTypeBullets(cfg) {
  const items = [];
  if (cfg.resources.hasNamed) {
    items.push('**Named resources:** Individuals allocated to projects and/or setup as Tempus users');
  }
  if (cfg.resources.hasGroup) {
    const ex = cfg.resources.groupExample
      ? ` (e.g., ${cfg.resources.groupExample})`
      : '';
    items.push(`**Group resources:** Resources with underlying capacity for multiple resources${ex}`);
  }
  if (cfg.resources.hasDemandPlanning) {
    items.push('**Demand Planning resources:** Unnamed resources; generic placeholders for a team or role, used solely for planning');
  }
  return items;
}

function projectTypeBullets(cfg) {
  const items = [];
  if (cfg.projects.hasStandard) {
    items.push('**Standard projects:** "Interrelated tasks organized together in order to reach a specific outcome"');
  }
  if (cfg.projects.hasProposals && cfg.terminology.proposalLabel) {
    const label = cfg.terminology.proposalLabel;
    items.push(`**${label}s:** Projects still pending approval${label === 'Proposal' ? ', denoted by a purple P icon' : ''}`);
  }
  if (cfg.projects.hasBau && cfg.terminology.bauLabel) {
    items.push(`**${cfg.terminology.bauLabel} projects:** Absence, Admin, Run, Change, etc.`);
  }
  return items;
}

function capacityUnitsList(cfg) {
  return cfg.capacity.units.length
    ? cfg.capacity.units.join(', ')
    : 'FTE, Hours';
}

function commonShortcutsSection() {
  return [
    { type: 'h1', text: 'Common Tempus Shortcuts' },
    { type: 'p', text: 'Tempus grids support the following Excel-like functionality:' },
    {
      type: 'ul',
      items: [
        'Column data can be sorted by clicking the column header',
        'Cell data can be copy-pasted via CTRL+C and CTRL+V',
        'Cell data can be copied across or down by clicking the bottom-right corner of a cell and dragged along',
      ],
    },
    { type: 'p', text: 'Tempus uses several icons (across multiple screens) to represent specific functionality:' },
    {
      type: 'ul',
      items: [
        '**Trash Can:** Delete selected item(s)',
        '**Pencil:** Edit/View selected item',
        '**Copy/Clone:** Copy selected item to clipboard OR Clone selected item',
        '**Lock/Unlock:** Indicates whether the selected record is locked by another user',
        '**Export To:** Standard icons for Excel, CSV, or PDF',
        '**Filter:** Filter results based on specified values',
        '**Notification:** Listed item may need attention',
        '**Demand Planning resource:** generic, role-based placeholder',
        '**Proposal:** project in proposal state',
      ],
    },
  ];
}

function loginSection(cfg) {
  return [
    { type: 'h2', text: 'Logging In' },
    {
      type: 'ol',
      items: [
        `Navigate to Tempus Resource using your web browser (${cfg.instance.tempusUrl})`,
        `${cfg.instance.browser} is the recommended browser.`,
        `Click on the orange button **${cfg.instance.ssoButtonLabel}**.`,
        'Sign in using your standard credentials.',
      ],
    },
  ];
}

function homepageSection(cfg, role = 'PM') {
  return [
    { type: 'h2', text: 'Homepage' },
    {
      type: 'ul',
      items: [
        `All ${role} users will have access to **${cfg.instance.homepageTileCount} tiles** on the homepage. Click on any tile to navigate to the relevant area.`,
        'The actions may vary depending on each user\'s role and access permissions.',
      ],
    },
    { type: 'p', text: 'The blue ribbon along the top (Task Bar) is available from all screens in Tempus.' },
    {
      type: 'ul',
      items: [
        'Click the Tempus logo (top-left) to return to the homepage from any screen',
        'View notifications by clicking on the bell icon',
        'Locate a specific project via Global Search',
        'Navigate to any area via the hamburger menu',
        'From the username menu, set up in-app Subscriptions or Logout',
      ],
    },
  ];
}

function workflowSection(cfg) {
  if (!cfg.workflow.hasResourceRequest) return [];
  const reject = cfg.terminology.rejectActionLabel || 'reject';
  return [
    { type: 'h2', text: 'Resource Request Workflow' },
    { type: 'p', text: 'Resource Managers must approve assignments.' },
    {
      type: 'ul',
      items: [
        'Applicable resources are assigned Resource Managers.',
        'A resource request is generated for: new allocations, or updates to previously approved allocations.',
        `A Resource Manager reviews and can: approve, replace, or **${reject}** the request.`,
        'The RM can also update the request prior to approval (assign different resource, split between several resources, etc.).',
      ],
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────
// TEMPLATE 1 — How to Populate Excel Import Templates
// ─────────────────────────────────────────────────────────────────────
function buildExcelTemplate(cfg) {
  const blocks = [
    { type: 'h1', text: 'How to Populate Excel Import Templates' },
    {
      type: 'p',
      text: `Tempus' Excel Data Sync functionality simplifies initial data import and enables ${cfg.meta.customerShort} to get started on the Resource Management journey without much effort. This guide outlines the essential information needed to populate Excel templates for **Resources**, **Projects**, and **Assignments**. Required fields are highlighted in green.`,
    },

    { type: 'h2', text: 'Step 1 — Resource Data' },
    {
      type: 'p',
      text: 'The purpose of this step is to import resources, their capacity, and any relevant metadata or custom attributes. Import named individuals, demand planning resources, and any other resources like rooms, devices, etc.',
    },
    {
      type: 'table',
      caption: 'Key steps to complete the Resources template',
      columns: ['Step', 'Column', 'Field', 'Type', 'Description'],
      rows: [
        ['1', 'C', 'Resource Name', 'Required', 'A unique name for the resource to be imported.'],
        ['2', 'D', 'Billing Rate', 'Optional', 'Hourly rate/cost for the resource. Left blank → 0.'],
        [
          '3',
          'E',
          'Demand Planning',
          'Required',
          `Set to **FALSE** for named individuals.${cfg.resources.hasDemandPlanning ? ' Set to **TRUE** for placeholder/generic resources.' : ''}`,
        ],
        [
          '4',
          'F',
          'Capacity Aggregation',
          'Required',
          `Measure of Base Capacity (same for all rows). Options: ${cfg.capacity.aggregations.join(', ')}. Recommended: **${cfg.capacity.recommendedAggregation}**.`,
        ],
        [
          '5',
          'G',
          'Capacity Unit',
          'Required',
          `Options: ${capacityUnitsList(cfg)}. Recommended: **${cfg.capacity.recommendedUnit}**.`,
        ],
        ['6', 'O', 'E-Mail', 'Optional', 'Unique email address.'],
        [
          '7',
          'U',
          'Is Resource Manager',
          'Optional',
          'TRUE = user can approve Resource Requests. FALSE = no RM rights.',
        ],
        ['8', 'V', 'Resource Managers', 'Optional', 'Up to 10 RMs per resource.'],
        [
          '9',
          'W+',
          'Custom Attributes',
          'Optional',
          `Add columns for: ${cfg.projects.customAttributesExamples}`,
        ],
        [
          '10',
          'Z+',
          'Date columns',
          'Required',
          `Header format ${cfg.capacity.dateFormat}. Must match the chosen Capacity Aggregation.`,
        ],
      ],
    },

    { type: 'h2', text: 'Step 2 — Project Data' },
    {
      type: 'p',
      text: 'Import projects, their start and end dates, and any relevant metadata or custom attributes — projects in execution and in proposal phases.',
    },
    {
      type: 'table',
      caption: 'Key steps to complete the Projects template',
      columns: ['Step', 'Column', 'Field', 'Type', 'Description'],
      rows: [
        ['1', 'C', 'Project Name', 'Required', 'Unique project name.'],
        ['2', 'D', 'Start Date', 'Required', `Format ${cfg.capacity.dateFormat}.`],
        ['3', 'E', 'End Date', 'Required', `Format ${cfg.capacity.dateFormat}.`],
        cfg.projects.hasProposals
          ? [
              '4',
              'G',
              `Is ${cfg.terminology.proposalLabel || 'Proposal'}`,
              'Optional',
              `TRUE = ${cfg.terminology.proposalLabel || 'Proposal'} pending approval. FALSE = approved/in execution.`,
            ]
          : null,
        ['5', 'J', 'Is Template', 'Optional', 'TRUE = template project. FALSE = actual project.'],
        [
          '6',
          'K+',
          'Custom Attributes',
          'Optional',
          `e.g. ${cfg.projects.customAttributesExamples}`,
        ],
      ].filter(Boolean),
    },

    { type: 'h2', text: 'Step 3 — Assignment / Task Data' },
    {
      type: 'p',
      text: 'Combine resources and projects with tasks to create assignments.',
    },
    {
      type: 'table',
      caption: 'Key steps to complete the Assignments template',
      columns: ['Step', 'Column', 'Field', 'Type', 'Description'],
      rows: [
        ['1', 'A', 'Project', 'Required', 'Project name.'],
        ['2', 'C', 'Resource', 'Required', 'Resource name.'],
        ['3', 'E', 'Task', 'Required', 'Task/phase/work item. For project-level: **Generic**.'],
        ['4', 'F', 'Data Input', 'Required', `Capacity Unit. Options: ${capacityUnitsList(cfg)}.`],
        [
          '5',
          'I',
          'Time Period',
          'Required',
          `Same for all rows. Options: ${cfg.capacity.timePeriods.join(', ')}.`,
        ],
        [
          '6',
          'M',
          'Project Allocation',
          'Conditional',
          'Required if Time Period = Project. Total Hours/FTE for the project.',
        ],
        ['7', 'N+', 'Custom Attributes', 'Optional', 'Desired Skills, Experience Level, Location, …'],
        ['8', 'O+', 'Date columns', 'Conditional', `Required unless Time Period = Project. Format ${cfg.capacity.dateFormat}.`],
      ],
    },

    {
      type: 'note',
      text: `For ${cfg.meta.customerName}: the recommended starting setup is **${cfg.capacity.recommendedUnit}** as Capacity Unit with **${cfg.capacity.recommendedAggregation}** aggregation — Tempus auto-calculates hours based on weekdays.`,
    },
  ];
  return blocks;
}

// ─────────────────────────────────────────────────────────────────────
// TEMPLATE 2 — Demand Basics
// ─────────────────────────────────────────────────────────────────────
function buildDemandBasicsTemplate(cfg) {
  const grid = cfg.terminology.gridLabel;
  const work = cfg.terminology.workItemLabel;

  return [
    { type: 'h1', text: 'Creating a Project and Allocating Resources' },
    {
      type: 'p',
      text: `This guide outlines the basic steps to create a demand in 3 parts — creating a project, allocating resources, and viewing the status of resource requests.`,
    },

    { type: 'h2', text: 'How to create a project' },
    {
      type: 'p',
      text: 'There are two ways to start creating a regular project:',
    },
    {
      type: 'ol',
      items: [
        `Click the **plus icon** on the ${grid} tile on the homepage, **or**`,
        `Click **Create ${work}** at the top-left of the ${grid} and select **Regular ${work}**.`,
        'You land on the Attributes screen. Enter name and required/optional project attributes.',
        'Click **Create** to complete project creation.',
      ],
    },

    { type: 'h2', text: 'How to allocate resources' },
    {
      type: 'ol',
      items: [
        'Click **Checkout** next to the Project Name (top) to make edits.',
        'Top-right, click **Attributes** to reveal the Project Navigation dropdown.',
        'Choose **Allocations** to open the Single Project Allocation grid.',
        'Enter project Start date and End date to reveal the Allocations grid.',
        'Choose roll-up: **by Resource** or **by Activity/Task**.',
        'In Resource view, click a blue cell and start typing the resource name.',
        `Choose time granularity and ${capacityUnitsList(cfg)} unit at the top-right.`,
        'Expand the resource to enter Generic (project-level) or Activity-level allocations. Values can be copy-pasted or dragged like in MS Excel.',
        'In Activity view, click a green cell to add activities, expand to enter allocations.',
        'For advanced options (Single and Bulk), click **Add assignment**.',
        'To save changes, click **Save and Check In**, or **Release** to revert.',
      ],
    },

    cfg.workflow.hasResourceRequest && { type: 'h2', text: 'Viewing Resource Request Status' },
    cfg.workflow.hasResourceRequest && {
      type: 'p',
      text: 'Resource request status can be viewed from the Single Project Allocation grid at any time. The status is indicated by an icon to the left of a resource name:',
    },
    cfg.workflow.hasResourceRequest && {
      type: 'ul',
      items: [
        '⏳ **Pending** — Resource Manager has not yet responded',
        '✅ **Approved** — Resource Manager approved the request',
        '❌ **Rejected** — Resource Manager rejected the request',
        '◐ **Partially Approved** — RM approved part of the requested allocation',
      ],
    },
  ].filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────
// TEMPLATE 3 — Project Manager User Training Guide
// ─────────────────────────────────────────────────────────────────────
function buildPmTrainingTemplate(cfg) {
  const m = cfg.modules.pm;
  const grid = cfg.terminology.gridLabel;
  const blocks = [
    { type: 'h1', text: `${cfg.meta.customerName} · Project Manager — User Training Guide` },

    { type: 'h1', text: 'Overview' },
    {
      type: 'ul',
      items: [
        '**User Access:** Tempus access varies based on individual user setup (managed by Admin team)',
        'Resources who require access can log in via SSO and are assigned a user role and security group',
      ],
    },
    { type: 'p', text: '**Resource Types:**' },
    { type: 'ul', items: resourceTypeBullets(cfg) },
    { type: 'p', text: '**Project Types:**' },
    { type: 'ul', items: projectTypeBullets(cfg) },
    { type: 'p', text: '**Assignments:**' },
    {
      type: 'ul',
      items: [
        'Assignments are created by linking a Resource to a Project',
        `Assignments must include a specific number of time units (${capacityUnitsList(cfg)})`,
        'Assignments can be created for one project at a time, or for multiple projects at once',
        'Assignments can be applied to the Project (generic task) or to individual named tasks',
      ],
    },

    ...workflowSection(cfg),
    ...commonShortcutsSection(),

    { type: 'h1', text: 'Tempus Resource Navigation' },
    {
      type: 'p',
      text: 'This section covers Logging In, Homepage and Main Task Bar, and Notifications.',
    },
    ...(m.coverHomepage ? loginSection(cfg) : []),
    ...(m.coverHomepage ? homepageSection(cfg, 'PM') : []),
  ];

  if (m.coverPmGrid) {
    blocks.push(
      { type: 'h1', text: grid },
      { type: 'h2', text: 'How to Create a Project' },
      {
        type: 'ol',
        items: [
          `From the homepage, click **Create ${cfg.terminology.workItemLabel}** at the top of the ${grid}.`,
          'Select **Regular Project** (or template).',
          'Fill in the required and optional project attributes.',
          'Click **Create**.',
        ],
      },
      { type: 'h2', text: 'View Management' },
      {
        type: 'p',
        text: `Customize the ${grid}: add/remove columns, sort, filter, and save the current setup as a personal or public view.`,
      },
      { type: 'h2', text: 'How to Update Project Attributes' },
      {
        type: 'ul',
        items: [
          '**Single project:** click the pencil icon next to the project row → update → save.',
          '**Multiple projects:** select multiple rows → Bulk Edit → choose attribute → apply.',
        ],
      },
    );
  }

  if (m.coverSpaGrid) {
    blocks.push(
      { type: 'h1', text: 'Single Project Allocation Grid' },
      { type: 'h2', text: 'Grid Overview' },
      {
        type: 'p',
        text: 'The Single Project Allocation grid is used to manage allocations for one project at a time. Rows = resources or activities; columns = time periods.',
      },
      { type: 'h2', text: 'How to Assign Resources to Projects' },
      {
        type: 'ol',
        items: [
          'Open a project and click **Checkout**.',
          'Choose **Allocations** from the dropdown.',
          'Click a blue cell to add a resource (typeahead).',
          `Enter values per period (${capacityUnitsList(cfg)}).`,
          'Click **Save and Check In**.',
        ],
      },
    );
    if (m.coverResourceReplace) {
      blocks.push(
        { type: 'h2', text: 'Replacing a Resource' },
        {
          type: 'p',
          text: 'The Resource Replace screen allows you to fully or partially replace a resource with another, including transferring planned allocations.',
        },
        {
          type: 'ul',
          items: [
            '**Full replace:** all remaining allocations transfer to the new resource.',
            '**Partial replace:** split allocation between current and new resource by period or %.',
          ],
        },
      );
    }
    if (m.coverAdvancedAssignment) {
      blocks.push(
        { type: 'h2', text: 'Advanced Assignment Options' },
        {
          type: 'ul',
          items: [
            '**Clone:** duplicate an assignment to apply elsewhere.',
            '**Shift:** move an entire assignment in time (e.g. delay 2 weeks).',
            '**Bulk add:** add the same allocation pattern across multiple resources/projects.',
          ],
        },
      );
    }
  }

  if (m.coverBpaFlatgrid) {
    blocks.push(
      { type: 'h1', text: 'Bulk Project Allocation Flatgrid' },
      { type: 'h2', text: 'Grid Overview' },
      {
        type: 'p',
        text: 'The BPA Flatgrid is a multi-project, flat (non-pivoted) view to manage allocations across many projects at once.',
      },
      { type: 'h2', text: 'How to Create a Multi-Project View' },
      {
        type: 'ol',
        items: [
          'Open the BPA Flatgrid.',
          'Apply filters (project, resource, time period, custom attributes).',
          'Save as a personal or public view.',
        ],
      },
      { type: 'h2', text: 'Actions in the BPA Flatgrid' },
      {
        type: 'ul',
        items: [
          '**Update existing assignments** — edit values in place.',
          '**Add new assignments** — start typing in an empty row.',
          '**Replace a Resource (Advanced)** — use Resource Replace Advanced for cross-project replacements.',
        ],
      },
    );
  }

  blocks.push({
    type: 'note',
    text: `Trial-Instanz: ${cfg.instance.tempusUrl} — Login via **${cfg.instance.ssoButtonLabel}**.`,
  });

  return blocks;
}

// ─────────────────────────────────────────────────────────────────────
// TEMPLATE 4 — Resource Manager User Training Guide
// ─────────────────────────────────────────────────────────────────────
function buildRmTrainingTemplate(cfg) {
  const m = cfg.modules.rm;
  const blocks = [
    { type: 'h1', text: `${cfg.meta.customerName} · Resource Manager — User Training Guide` },

    { type: 'h1', text: 'Overview' },
    { type: 'p', text: '**Resource Types:**' },
    { type: 'ul', items: resourceTypeBullets(cfg) },
    { type: 'p', text: '**Project Types:**' },
    { type: 'ul', items: projectTypeBullets(cfg) },

    ...workflowSection(cfg),
    ...commonShortcutsSection(),

    { type: 'h1', text: 'Tempus Resource Navigation' },
    ...loginSection(cfg),
    ...homepageSection(cfg, 'RM'),
  ];

  if (m.coverRmGrid) {
    blocks.push(
      { type: 'h1', text: 'Resource Management Grid' },
      { type: 'h2', text: 'Grid Overview' },
      {
        type: 'p',
        text: 'The RM Grid shows all resources you manage, their capacity, allocations, net availability, and metadata. Use filters and views to focus on relevant resources.',
      },
      { type: 'h2', text: 'Customizing the Grid' },
      {
        type: 'ul',
        items: [
          'Add/remove columns via column manager.',
          'Sort and filter on attributes.',
          'Save personal or public views.',
        ],
      },
    );
  }

  if (m.coverIndividualResourceProfile) {
    blocks.push(
      { type: 'h1', text: 'Individual Resource Profile' },
      { type: 'h2', text: 'Capacity, Attributes, Allocations' },
      {
        type: 'p',
        text: 'The Individual Resource Profile centralizes everything for one resource: capacity over time, custom attributes (skills, role, team), allocations, and net availability.',
      },
      {
        type: 'ul',
        items: [
          'Edit capacity per period (FTE/Hours/Mandays as configured).',
          'Update attributes such as Skills, Department, Hiring Date.',
          'View planned allocations across all projects.',
        ],
      },
    );
  }

  if (m.coverResourceRequests && cfg.workflow.hasResourceRequest) {
    blocks.push(
      { type: 'h1', text: 'Responding to Resource Requests' },
      { type: 'h2', text: 'Approval Workflow' },
      {
        type: 'ol',
        items: [
          'Open the Resource Requests inbox via the bell icon or RM Grid.',
          'Review the request: requested resource, project, period, and amount.',
          `Choose an action: **Approve**, **Partial approve**, **Replace**, or **${cfg.terminology.rejectActionLabel}**.`,
          'Optionally add a comment for the requester.',
          'Confirm the action.',
        ],
      },
    );
  }

  if (m.coverNetAvailability) {
    blocks.push(
      { type: 'h1', text: 'Net Availability' },
      {
        type: 'p',
        text: 'Net Availability = Base Capacity − Approved Allocations. Use it to identify under- or over-allocated resources.',
      },
      {
        type: 'tip',
        text: 'Tip: use heatmap views to spot bottlenecks across teams quickly.',
      },
    );
  }

  blocks.push({
    type: 'note',
    text: `Trial-Instanz: ${cfg.instance.tempusUrl} — Login via **${cfg.instance.ssoButtonLabel}**.`,
  });
  return blocks;
}

// ─────────────────────────────────────────────────────────────────────
// TEMPLATE 5 — Resource Requester User Training Guide
// ─────────────────────────────────────────────────────────────────────
function buildRrTrainingTemplate(cfg) {
  const m = cfg.modules.rr;
  const grid = cfg.terminology.gridLabel;
  const blocks = [
    { type: 'h1', text: `${cfg.meta.customerName} · Resource Requester — User Training Guide` },

    { type: 'h1', text: 'Overview' },
    { type: 'p', text: '**Resource Types:**' },
    { type: 'ul', items: resourceTypeBullets(cfg) },
    { type: 'p', text: '**Project Types:**' },
    { type: 'ul', items: projectTypeBullets(cfg) },

    ...workflowSection(cfg),

    { type: 'h1', text: 'Tempus Navigation' },
    ...loginSection(cfg),
    ...homepageSection(cfg, 'Resource Requester'),

    cfg.instance.helpCenterAccess && { type: 'h2', text: 'Accessing the Tempus Resource Help Center' },
    cfg.instance.helpCenterAccess && {
      type: 'p',
      text: 'Click the help icon in the top ribbon to access the Help Center (registration required).',
    },

    ...commonShortcutsSection(),
  ];

  if (m.coverProjectCreation) {
    blocks.push(
      { type: 'h1', text: 'Creating a Project' },
      {
        type: 'ol',
        items: [
          `From the homepage, click the plus icon on the ${grid} tile, or`,
          `From the ${grid}, click **Create ${cfg.terminology.workItemLabel}**.`,
          'Fill in name and required project attributes.',
          'Click **Create**.',
        ],
      },
      { type: 'h2', text: `Customizing the ${grid}` },
      {
        type: 'p',
        text: 'Add/remove columns, apply filters, save personal views.',
      },
      { type: 'h2', text: 'Updating Project Attributes' },
      {
        type: 'p',
        text: 'Click the pencil icon on the project row, update attributes, save.',
      },
      { type: 'h2', text: 'Shifting a Project' },
      {
        type: 'p',
        text: 'Use the Shift action to move all dates and allocations of a project by a delta (e.g. +2 weeks). This preserves the relative spacing of activities.',
      },
    );
  }

  if (m.coverResourceRequest) {
    blocks.push(
      { type: 'h1', text: 'Requesting a Resource' },
      {
        type: 'ol',
        items: [
          'Open a project and choose **Allocations** from the dropdown.',
          'Click a blue cell and type the resource name (named or demand planning).',
          `Enter the desired allocation per period (${capacityUnitsList(cfg)}).`,
          'Click **Save and Check In** to submit the request to the Resource Manager.',
        ],
      },
      cfg.workflow.hasResourceRequest && { type: 'h2', text: 'Viewing Resource Request Status' },
      cfg.workflow.hasResourceRequest && {
        type: 'ul',
        items: [
          '⏳ Pending · RM not yet responded',
          '✅ Approved',
          '❌ Rejected',
          '◐ Partially approved',
        ],
      },
    );
  }

  if (m.coverScribe) {
    blocks.push(
      { type: 'h1', text: 'Using Scribe' },
      {
        type: 'p',
        text: 'Scribe is a built-in step-by-step recording tool that captures screens as you complete a task. Use it to share procedures with colleagues.',
      },
    );
  }

  blocks.push({
    type: 'note',
    text: `Trial-Instanz: ${cfg.instance.tempusUrl} — Login via **${cfg.instance.ssoButtonLabel}**.`,
  });

  return blocks.filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────
export const qrgTemplates = [
  {
    id: 'excel',
    label: 'Excel Import Templates',
    short: 'Excel',
    description: 'Resources · Projects · Assignments aus Excel laden',
    icon: 'FileSpreadsheet',
    color: 'from-emerald-500 to-teal-600',
    roleFlag: 'includeExcelImport',
    build: buildExcelTemplate,
  },
  {
    id: 'demand',
    label: 'Demand Basics',
    short: 'Demand',
    description: 'Projekt anlegen · Ressourcen zuweisen · Status',
    icon: 'Sparkles',
    color: 'from-sky-500 to-blue-600',
    roleFlag: 'includeDemandBasics',
    build: buildDemandBasicsTemplate,
  },
  {
    id: 'pm',
    label: 'Project Manager · User Training',
    short: 'PM',
    description: 'PMG · SPA · BPA · Resource Replace',
    icon: 'Calendar',
    color: 'from-purple-500 to-pink-500',
    roleFlag: 'includePM',
    build: buildPmTrainingTemplate,
  },
  {
    id: 'rm',
    label: 'Resource Manager · User Training',
    short: 'RM',
    description: 'RM Grid · IRP · Requests · Net Availability',
    icon: 'Users',
    color: 'from-orange-500 to-red-500',
    roleFlag: 'includeRM',
    build: buildRmTrainingTemplate,
  },
  {
    id: 'rr',
    label: 'Resource Requester · User Training',
    short: 'RR',
    description: 'Projekt anlegen · Request stellen · Status',
    icon: 'UserCheck',
    color: 'from-indigo-500 to-violet-600',
    roleFlag: 'includeRR',
    build: buildRrTrainingTemplate,
  },
];

/** Build alle aktiven Templates für eine Config. */
export function buildAllQrgs(cfg) {
  return qrgTemplates
    .filter((t) => cfg.roles[t.roleFlag])
    .map((t) => ({
      ...t,
      blocks: t.build(cfg),
    }));
}
