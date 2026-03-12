/**
 * Standardwerte für Training Admin
 * Wird verwendet wenn keine Config in AWS existiert
 */

export const DEFAULT_TABS = [
  { id: 'dashboard', label: 'Dashboard', advanced: false },
  { id: 'rm', label: 'Resource Manager', advanced: false },
  { id: 'rmAdv', label: 'RM Advanced', advanced: true },
  { id: 'pm', label: 'Project Manager', advanced: false },
  { id: 'pmAdv', label: 'PM Advanced', advanced: true },
  { id: 'admin', label: 'Admin', advanced: false },
  { id: 'adminAdv', label: 'Admin Advanced', advanced: true }
];

export const DEFAULT_LOGO = {
  logoText: 'TR',
  logoLabel: 'Tempus Resource',
  logoImageUrl: null
};

export const DEFAULT_DASHBOARD = {
  title: 'Tempus Resource Training',
  subtitle: 'Wähle dein Training – Grundlagen oder Advanced mit schwierigen Aufgaben und Musterlösungen.'
};

/** Alle Screenshots mit data-edit-id, relativer src und caption */
export const DEFAULT_SCREENSHOTS = [
  { id: 'login_p7_2', src: 'screenshots/inline/login_p7_2.png', caption: 'Homepage mit Kacheln (Project Management, Resource Management, etc.)', alt: 'Homepage' },
  { id: 'login_p7_1', src: 'screenshots/inline/login_p7_1.png', caption: 'Login-Seite mit Healthineers ID Login Button', alt: 'Login' },
  { id: 'homepage_p8_4', src: 'screenshots/inline/homepage_p8_4.png', caption: 'Projektliste mit Suchfeld und Filter', alt: 'Filter' },
  { id: 'subscriptions_p10_2', src: 'screenshots/inline/subscriptions_p10_2.png', caption: 'Resource request management → Submitted aktivieren', alt: 'Subscriptions' },
  { id: 'subscriptions_p10_1', src: 'screenshots/inline/subscriptions_p10_1.png', caption: 'Tab «Resource Request» im Dialog', alt: 'Resource Request Tab' },
  { id: 'resource_grid_p15_5', src: 'screenshots/inline/resource_grid_p15_5.png', caption: 'Ressource → SHS IT Attributes', alt: 'Attributes' },
  { id: 'resource_grid_p16_1', src: 'screenshots/inline/resource_grid_p16_1.png', caption: 'Attributes: Resource Managers, Is Resource Manager', alt: 'Workflow' },
  { id: 'resource_grid_p12_3', src: 'screenshots/inline/resource_grid_p12_3.png', caption: 'Kontextmenü (Attributes & Identity, Capacity, Sheets)', alt: 'Kontextmenü' },
  { id: 'net_availability_p18_2', src: 'screenshots/inline/net_availability_p18_2.png', caption: 'Net Availability Button & Options', alt: 'Net Availability' },
  { id: 'net_availability_p18_4', src: 'screenshots/inline/net_availability_p18_4.png', caption: 'Impact Assessment beim Klick auf Zelle', alt: 'Impact Assessment' },
  { id: 'resource_requests_p21_3', src: 'screenshots/inline/resource_requests_p21_3.png', caption: 'Allokations-Grid (Ressourcen, Monatsspalten)', alt: 'Allokations-Grid' },
  { id: 'resource_requests_p23_5', src: 'screenshots/inline/resource_requests_p23_5.png', caption: 'Approve/Reject/Delegate, Delegate-Dropdown', alt: 'Delegate' },
  { id: 'creating_requests_p24_5', src: 'screenshots/inline/creating_requests_p24_5.png', caption: 'Blaue Zelle «Type a new resource» – Ressource eingeben', alt: 'Type a new resource' },
  { id: 'creating_requests_p25_3', src: 'screenshots/inline/creating_requests_p25_3.png', caption: 'Monatsspalten für Allokation', alt: 'Allocation' },
  { id: 'nonproject_p26_3', src: 'screenshots/inline/nonproject_p26_3.jpg', caption: 'Non-Project Activities – Checkout, Tasks (Generic, Absence)', alt: 'Non-Project' },
  { id: 'nonproject_p27_7', src: 'screenshots/inline/nonproject_p27_7.png', caption: 'Bulk assignment – Ressourcen zu Absence/Admin zuweisen', alt: 'Bulk assignment' },
  { id: 'bpa_flatgrid_p32_3', src: 'screenshots/inline/bpa_flatgrid_p32_3.png', caption: 'View-Auswahl: Resources & Projects, Public View', alt: 'View-Auswahl' },
  { id: 'bpa_flatgrid_p35_1', src: 'screenshots/inline/bpa_flatgrid_p35_1.png', caption: 'BPA Flatgrid Options (Heatmap, Filter by Resource Request)', alt: 'Options' },
  { id: 'reports_p37_2', src: 'screenshots/inline/reports_p37_2.png', caption: 'Report Management – Report list, Report folder, Files', alt: 'Report Management' },
  { id: 'reports_p37_3', src: 'screenshots/inline/reports_p37_3.png', caption: 'Report-Liste mit Name, Description, Owner', alt: 'Report-Liste' },
  { id: 'reports_p37_4', src: 'screenshots/inline/reports_p37_4.png', caption: 'Geöffneter Report mit Beschreibung', alt: 'Report' },
  { id: 'pm_login_p5_1', src: 'screenshots/inline_pm/pm_login_p5_1.png', caption: 'Login-Seite mit Healthineers ID Login', alt: 'Login' },
  { id: 'pm_login_p5_2', src: 'screenshots/inline_pm/pm_login_p5_2.png', caption: 'Homepage mit PM-Tiles', alt: 'Homepage' },
  { id: 'pm_homepage_p6_4', src: 'screenshots/inline_pm/pm_homepage_p6_4.png', caption: 'Task Bar, Navigation', alt: 'Task Bar' },
  { id: 'pm_subscriptions_p7_1', src: 'screenshots/inline_pm/pm_subscriptions_p7_1.png', caption: 'Subscriptions – Project & Resource Request Tab', alt: 'Subscriptions' },
  { id: 'pm_project_grid_p8_3', src: 'screenshots/inline_pm/pm_project_grid_p8_3.png', caption: 'Project Management Grid – Suche, Filter', alt: 'Grid' },
  { id: 'pm_project_grid_p8_4', src: 'screenshots/inline_pm/pm_project_grid_p8_4.png', caption: 'Views: Lock, Default, Edit, Clone, Delete', alt: 'Views' },
  { id: 'pm_project_grid_p9_10', src: 'screenshots/inline_pm/pm_project_grid_p9_10.png', caption: 'Public Views (blaues Auge) – klonen zum Bearbeiten', alt: 'Public Views' },
  { id: 'pm_single_project_p10_2', src: 'screenshots/inline_pm/pm_single_project_p10_2.png', caption: 'Projektname & Checkout-Button oben', alt: 'Checkout' },
  { id: 'pm_single_project_p11_6', src: 'screenshots/inline_pm/pm_single_project_p11_6.png', caption: 'Options: Total Column, Heatmap, Tasks to Show', alt: 'Options' },
  { id: 'pm_single_project_p12_2', src: 'screenshots/inline_pm/pm_single_project_p12_2.png', caption: 'Add assignment – Ressourcen & Tasks auswählen', alt: 'Add assignment' },
  { id: 'pm_assignment_options_p13_1', src: 'screenshots/inline_pm/pm_assignment_options_p13_1.png', caption: 'Assignment Options – Clone', alt: 'Clone' },
  { id: 'pm_assignment_options_p13_2', src: 'screenshots/inline_pm/pm_assignment_options_p13_2.png', caption: 'Assignment Options – Shift', alt: 'Shift' },
  { id: 'pm_bpa_flatgrid_p15_1', src: 'screenshots/inline_pm/pm_bpa_flatgrid_p15_1.png', caption: 'BPA Flatgrid – Zeitraum, Resource/Project', alt: 'BPA' },
  { id: 'pm_bpa_flatgrid_p17_1', src: 'screenshots/inline_pm/pm_bpa_flatgrid_p17_1.png', caption: 'Options: Total Row, Heatmap, Filter', alt: 'Options' },
  { id: 'pm_bpa_flatgrid_p18_1', src: 'screenshots/inline_pm/pm_bpa_flatgrid_p18_1.png', caption: 'Projekte suchen & auswählen', alt: 'Projects' },
  { id: 'pm_pending_requests_p20_1', src: 'screenshots/inline_pm/pm_pending_requests_p20_1.png', caption: 'Filter by Resource Request Status', alt: 'Filter' },
  { id: 'pm_pending_requests_p20_2', src: 'screenshots/inline_pm/pm_pending_requests_p20_2.png', caption: 'Pending-Checkbox aktivieren', alt: 'Pending' }
];

/** Generiert eine eindeutige ID */
export function genId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

/** Leerer Block für neue Inhalte */
export function createBlock(type) {
  const id = genId();
  if (type === 'text') return { id, type: 'text', title: '', content: '' };
  if (type === 'image') return { id, type: 'image', src: '', caption: '', alt: '' };
  if (type === 'quiz') return { id, type: 'quiz', questions: [{ id: genId(), text: '', options: ['', '', '', ''], correctIndex: 0 }] };
  return { id, type: 'text', title: '', content: '' };
}

/** Leere Quiz-Frage */
export function createQuizQuestion() {
  return { id: genId(), text: '', options: ['', '', '', ''], correctIndex: 0 };
}
