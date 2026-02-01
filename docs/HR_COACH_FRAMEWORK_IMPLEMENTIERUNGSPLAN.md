# HR Coach Framework - Detaillierter Implementierungsplan

## Übersicht

Dieses Dokument enthält einen schrittweisen Implementierungsplan für das HR Coach Framework basierend auf dem Yoga-Teppich Modell. Jeder Schritt ist so detailliert beschrieben, dass er einzeln ausgeführt werden kann.

---

## PHASE 1: Grundstruktur erstellen

### Schritt 1.1: Hauptseite hr-coach-framework.html erstellen

**Datei:** `/hr-coach-framework.html`

**Aktion:** Neue HTML-Datei erstellen mit folgendem Inhalt:

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HR Coach Framework - Umfassende HR-Analyse | Manuel Weiss</title>
    <meta name="description" content="Wissenschaftlich fundiertes HR Coach Framework mit 10 Kernbereichen. Detaillierte Analysen, KI-Empfehlungen und Best Practices.">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="css/starry-background.css">
    <link rel="stylesheet" href="css/hr-coach-framework.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body class="starry-theme">
    <!-- Navbar hier einfügen (kopieren von hr-coach.html) -->
    
    <!-- Hero Section -->
    <section class="framework-hero">
        <div class="container">
            <div class="hero-badge">
                <i class="fas fa-certificate"></i>
                Harvard & MIT Methodik
            </div>
            <h1>HR Coach Framework</h1>
            <p class="hero-subtitle">Umfassende Analyse aller HR-Dimensionen mit KI-gestützten Empfehlungen</p>
        </div>
    </section>
    
    <!-- Yoga-Teppich SVG Übersicht -->
    <section class="yoga-teppich-section">
        <div class="container">
            <div id="yogaTeppichSVG"></div>
        </div>
    </section>
    
    <!-- 10 Bereichskarten -->
    <section class="framework-areas">
        <div class="container">
            <div class="areas-grid" id="areasGrid"></div>
        </div>
    </section>
    
    <!-- Gesamtfortschritt -->
    <section class="overall-progress">
        <div class="container">
            <div id="overallProgressCard"></div>
        </div>
    </section>
    
    <script src="js/hr-coach-framework.js"></script>
    <script src="js/shooting-stars.js"></script>
</body>
</html>
```

---

### Schritt 1.2: CSS-Datei css/hr-coach-framework.css erstellen

**Datei:** `/css/hr-coach-framework.css`

**Aktion:** Neue CSS-Datei erstellen. Kopiere das Dark-Theme Design von `ki-strategie-workflow.html`:

```css
/* HR COACH FRAMEWORK - DARK GLASSMORPHISM THEME */

body {
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
    min-height: 100vh;
    color: #e2e8f0;
}

/* Navbar */
.navbar {
    background: rgba(15, 23, 42, 0.9) !important;
    backdrop-filter: blur(20px) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Hero Section */
.framework-hero {
    padding: 5rem 0 3rem;
    text-align: center;
    position: relative;
    z-index: 2;
}

.framework-hero h1 {
    font-size: 3.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #fff, #a5b4fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
}

.hero-subtitle {
    font-size: 1.25rem;
    color: #c7d2fe;
    max-width: 700px;
    margin: 0 auto;
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(99, 102, 241, 0.2);
    border: 1px solid rgba(99, 102, 241, 0.3);
    padding: 0.5rem 1.25rem;
    border-radius: 50px;
    font-size: 0.9rem;
    color: #a5b4fc;
    margin-bottom: 1.5rem;
}

/* Areas Grid */
.areas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    padding: 2rem 0;
}

/* Area Card */
.area-card {
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.area-card:hover {
    transform: translateY(-8px);
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.area-card-icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    margin-bottom: 1.5rem;
}

.area-card h3 {
    color: #fff;
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
}

.area-card p {
    color: #c7d2fe;
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

/* Progress Bar in Card */
.area-progress {
    background: rgba(255, 255, 255, 0.1);
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.75rem;
}

.area-progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s ease;
}

.area-progress-text {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #a5b4fc;
}

/* Icon Farben pro Bereich */
.icon-analytics { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
.icon-strategie { background: linear-gradient(135deg, #ec4899, #f43f5e); }
.icon-recruiting { background: linear-gradient(135deg, #06b6d4, #0ea5e9); }
.icon-onboarding { background: linear-gradient(135deg, #10b981, #14b8a6); }
.icon-admin { background: linear-gradient(135deg, #f59e0b, #eab308); }
.icon-performance { background: linear-gradient(135deg, #8b5cf6, #a855f7); }
.icon-compensation { background: linear-gradient(135deg, #f97316, #fb923c); }
.icon-learning { background: linear-gradient(135deg, #14b8a6, #22d3d8); }
.icon-leadership { background: linear-gradient(135deg, #ef4444, #f97316); }
.icon-wellbeing { background: linear-gradient(135deg, #22c55e, #84cc16); }

/* Yoga Teppich SVG Container */
.yoga-teppich-section {
    padding: 3rem 0;
    position: relative;
    z-index: 2;
}

#yogaTeppichSVG {
    max-width: 800px;
    margin: 0 auto;
}

/* Overall Progress */
.overall-progress {
    padding: 3rem 0;
    position: relative;
    z-index: 2;
}

#overallProgressCard {
    background: rgba(99, 102, 241, 0.15);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 2.5rem;
    border: 1px solid rgba(99, 102, 241, 0.3);
    text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
    .framework-hero h1 {
        font-size: 2.5rem;
    }
    
    .areas-grid {
        grid-template-columns: 1fr;
    }
}
```

---

### Schritt 1.3: JavaScript-Datei js/hr-coach-framework.js erstellen

**Datei:** `/js/hr-coach-framework.js`

**Aktion:** Neue JS-Datei erstellen mit der Datenstruktur:

```javascript
// HR COACH FRAMEWORK - HAUPTDATEI
// ═══════════════════════════════════════════════════════════════════════════

// 10 HR-Kernbereiche Definition
const HR_FRAMEWORK_AREAS = [
    {
        id: 'analytics',
        title: 'Analytics & Reporting',
        description: 'KPIs, Dashboards, Predictive Analytics und datengetriebene Entscheidungen',
        icon: 'fa-chart-line',
        iconClass: 'icon-analytics',
        color: '#6366f1',
        workflowPage: 'hr-coach-analytics-workflow.html',
        criteria: 8
    },
    {
        id: 'strategie',
        title: 'Strategie & Kultur',
        description: 'Kulturanalyse, Werte-Alignment, strategische HR-Planung',
        icon: 'fa-chess',
        iconClass: 'icon-strategie',
        color: '#ec4899',
        workflowPage: 'hr-coach-strategie-workflow.html',
        criteria: 8
    },
    {
        id: 'recruiting',
        title: 'Recruiting & Employer Branding',
        description: 'Talentgewinnung, Candidate Journey, Arbeitgebermarke',
        icon: 'fa-user-plus',
        iconClass: 'icon-recruiting',
        color: '#06b6d4',
        workflowPage: 'hr-coach-recruiting-workflow.html',
        criteria: 8
    },
    {
        id: 'onboarding',
        title: 'Onboarding & Offboarding',
        description: 'Pre-/Onboarding, Exit-Management, Employee Lifecycle',
        icon: 'fa-door-open',
        iconClass: 'icon-onboarding',
        color: '#10b981',
        workflowPage: 'hr-coach-onboarding-workflow.html',
        criteria: 8
    },
    {
        id: 'admin',
        title: 'HR Administration',
        description: 'Prozessoptimierung, Self-Service, Digitalisierung',
        icon: 'fa-cogs',
        iconClass: 'icon-admin',
        color: '#f59e0b',
        workflowPage: 'hr-coach-admin-workflow.html',
        criteria: 8
    },
    {
        id: 'performance',
        title: 'Performance Management',
        description: 'Feedback-Kultur, OKRs, Zielvereinbarungen, Leistungsbeurteilung',
        icon: 'fa-bullseye',
        iconClass: 'icon-performance',
        color: '#8b5cf6',
        workflowPage: 'hr-coach-performance-workflow.html',
        criteria: 8
    },
    {
        id: 'compensation',
        title: 'Compensation & Benefits',
        description: 'Vergütungsstrategie, Total Rewards, Benefit-Programme',
        icon: 'fa-coins',
        iconClass: 'icon-compensation',
        color: '#f97316',
        workflowPage: 'hr-coach-compensation-workflow.html',
        criteria: 8
    },
    {
        id: 'learning',
        title: 'Learning & Succession',
        description: 'Karrierepfade, Nachfolgeplanung, Weiterbildung, Talententwicklung',
        icon: 'fa-graduation-cap',
        iconClass: 'icon-learning',
        color: '#14b8a6',
        workflowPage: 'hr-coach-learning-workflow.html',
        criteria: 8
    },
    {
        id: 'leadership',
        title: 'Leadership Development',
        description: 'Führungsstile, Coaching, Management-Entwicklung',
        icon: 'fa-users-cog',
        iconClass: 'icon-leadership',
        color: '#ef4444',
        workflowPage: 'hr-coach-leadership-workflow.html',
        criteria: 8
    },
    {
        id: 'wellbeing',
        title: 'BGM & Wellbeing',
        description: 'Mental Health, Work-Life-Balance, Gesundheitsmanagement',
        icon: 'fa-heart',
        iconClass: 'icon-wellbeing',
        color: '#22c55e',
        workflowPage: 'hr-coach-wellbeing-workflow.html',
        criteria: 8
    }
];

// Initialisierung beim Laden
document.addEventListener('DOMContentLoaded', function() {
    renderAreasGrid();
    renderOverallProgress();
    renderYogaTeppich();
});

// Areas Grid rendern
function renderAreasGrid() {
    const grid = document.getElementById('areasGrid');
    if (!grid) return;
    
    grid.innerHTML = HR_FRAMEWORK_AREAS.map(area => {
        const progress = getAreaProgress(area.id);
        return `
            <div class="area-card" onclick="navigateToArea('${area.workflowPage}')">
                <div class="area-card-icon ${area.iconClass}">
                    <i class="fas ${area.icon}"></i>
                </div>
                <h3>${area.title}</h3>
                <p>${area.description}</p>
                <div class="area-progress">
                    <div class="area-progress-fill" style="width: ${progress}%; background: ${area.color};"></div>
                </div>
                <div class="area-progress-text">
                    <span>${progress}% abgeschlossen</span>
                    <span>${area.criteria} Kriterien</span>
                </div>
            </div>
        `;
    }).join('');
}

// Fortschritt aus localStorage laden
function getAreaProgress(areaId) {
    const saved = localStorage.getItem(`hrCoach_${areaId}_progress`);
    return saved ? parseInt(saved) : 0;
}

// Gesamtfortschritt rendern
function renderOverallProgress() {
    const card = document.getElementById('overallProgressCard');
    if (!card) return;
    
    let totalProgress = 0;
    HR_FRAMEWORK_AREAS.forEach(area => {
        totalProgress += getAreaProgress(area.id);
    });
    const avgProgress = Math.round(totalProgress / HR_FRAMEWORK_AREAS.length);
    
    card.innerHTML = `
        <h2 style="color: #fff; font-size: 1.75rem; margin-bottom: 1rem;">
            <i class="fas fa-chart-pie" style="margin-right: 0.5rem;"></i>
            Ihr Gesamtfortschritt
        </h2>
        <div style="font-size: 4rem; font-weight: 800; color: #a5b4fc; margin: 1.5rem 0;">
            ${avgProgress}%
        </div>
        <p style="color: #c7d2fe; font-size: 1.1rem;">
            ${avgProgress < 30 ? 'Beginnen Sie mit der Analyse Ihrer HR-Bereiche' : 
              avgProgress < 70 ? 'Guter Fortschritt! Setzen Sie die Analyse fort' :
              'Fast geschafft! Schließen Sie die letzten Bereiche ab'}
        </p>
        <div style="margin-top: 2rem;">
            <button onclick="exportFullReport()" class="btn-export" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; padding: 1rem 2rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer;">
                <i class="fas fa-file-pdf"></i> Gesamtbericht exportieren
            </button>
        </div>
    `;
}

// Navigation zu Bereich
function navigateToArea(page) {
    window.location.href = page;
}

// Yoga Teppich SVG rendern (Platzhalter)
function renderYogaTeppich() {
    const svg = document.getElementById('yogaTeppichSVG');
    if (!svg) return;
    
    // SVG wird in Phase 3 implementiert
    svg.innerHTML = '<p style="text-align: center; color: #a5b4fc;">Interaktive Übersicht wird geladen...</p>';
}

// Export Funktion (Platzhalter)
function exportFullReport() {
    alert('PDF-Export wird in Phase 4 implementiert');
}
```

---

## PHASE 2: Ersten Workflow erstellen (Analytics als Vorlage)

### Schritt 2.1: Template-Workflow hr-coach-analytics-workflow.html erstellen

**Datei:** `/hr-coach-analytics-workflow.html`

**Aktion:** Erstelle die Workflow-Seite. **WICHTIG:** Kopiere die Struktur von `ki-strategie-workflow.html` und ersetze:

1. **Titel:** "Smart Analytics & Reporting Workflow"
2. **Beschreibung:** "Analysieren Sie Ihre HR-Analytics Reife mit wissenschaftlich fundierten Kriterien"
3. **Kriterien:** Ersetze die KI-Kriterien mit Analytics-Kriterien (siehe unten)

**Analytics-Kriterien (8 Hauptkriterien mit je 4 Unterkriterien):**

```javascript
const analyticsCriteria = [
    {
        id: 'dataFoundation',
        title: 'Datenbasis & Qualität',
        description: 'Wie gut ist Ihre HR-Datenbasis strukturiert und gepflegt?',
        icon: 'fa-database',
        subCriteria: [
            { id: 'dataCompleteness', title: 'Vollständigkeit der Stammdaten' },
            { id: 'dataAccuracy', title: 'Genauigkeit und Aktualität' },
            { id: 'dataIntegration', title: 'Integration verschiedener Datenquellen' },
            { id: 'dataGovernance', title: 'Daten-Governance und Standards' }
        ]
    },
    {
        id: 'kpiFramework',
        title: 'KPI-Framework',
        description: 'Haben Sie ein strukturiertes System für HR-Kennzahlen?',
        icon: 'fa-tachometer-alt',
        subCriteria: [
            { id: 'kpiDefinition', title: 'Klar definierte HR-KPIs' },
            { id: 'kpiAlignment', title: 'Ausrichtung an Unternehmenszielen' },
            { id: 'kpiTracking', title: 'Regelmäßiges KPI-Tracking' },
            { id: 'kpiBenchmarking', title: 'Benchmarking mit Industrie-Standards' }
        ]
    },
    {
        id: 'reporting',
        title: 'Reporting & Dashboards',
        description: 'Wie fortgeschritten sind Ihre Reporting-Fähigkeiten?',
        icon: 'fa-chart-bar',
        subCriteria: [
            { id: 'reportingAutomation', title: 'Automatisierte Reports' },
            { id: 'dashboardAvailability', title: 'Interaktive Dashboards' },
            { id: 'selfServiceReporting', title: 'Self-Service für Manager' },
            { id: 'mobileAccess', title: 'Mobile Verfügbarkeit' }
        ]
    },
    {
        id: 'descriptiveAnalytics',
        title: 'Deskriptive Analytik',
        description: 'Können Sie vergangene HR-Ereignisse analysieren?',
        icon: 'fa-history',
        subCriteria: [
            { id: 'historicalAnalysis', title: 'Historische Trendanalysen' },
            { id: 'segmentation', title: 'Segmentierung nach Mitarbeitergruppen' },
            { id: 'rootCauseAnalysis', title: 'Ursachenanalysen' },
            { id: 'comparisonAnalysis', title: 'Vergleichsanalysen (YoY, MoM)' }
        ]
    },
    {
        id: 'diagnosticAnalytics',
        title: 'Diagnostische Analytik',
        description: 'Verstehen Sie die Gründe hinter HR-Trends?',
        icon: 'fa-search',
        subCriteria: [
            { id: 'correlationAnalysis', title: 'Korrelationsanalysen' },
            { id: 'driverAnalysis', title: 'Treiber-Analysen' },
            { id: 'anomalyDetection', title: 'Erkennung von Anomalien' },
            { id: 'deepDiveCapability', title: 'Deep-Dive Fähigkeiten' }
        ]
    },
    {
        id: 'predictiveAnalytics',
        title: 'Prädiktive Analytik',
        description: 'Können Sie zukünftige HR-Entwicklungen vorhersagen?',
        icon: 'fa-crystal-ball',
        subCriteria: [
            { id: 'turnoverPrediction', title: 'Fluktuation vorhersagen' },
            { id: 'performancePrediction', title: 'Performance vorhersagen' },
            { id: 'hiringNeeds', title: 'Personalbedarf prognostizieren' },
            { id: 'skillGaps', title: 'Skill-Gaps frühzeitig erkennen' }
        ]
    },
    {
        id: 'prescriptiveAnalytics',
        title: 'Präskriptive Analytik',
        description: 'Erhalten Sie datenbasierte Handlungsempfehlungen?',
        icon: 'fa-lightbulb',
        subCriteria: [
            { id: 'recommendations', title: 'Automatische Empfehlungen' },
            { id: 'scenarioPlanning', title: 'Szenario-Planung' },
            { id: 'optimizationModels', title: 'Optimierungsmodelle' },
            { id: 'actionableInsights', title: 'Umsetzbare Erkenntnisse' }
        ]
    },
    {
        id: 'analyticsCapability',
        title: 'Analytik-Kompetenz',
        description: 'Wie gut sind die Analytics-Fähigkeiten im Team?',
        icon: 'fa-users',
        subCriteria: [
            { id: 'dataLiteracy', title: 'Daten-Kompetenz im HR-Team' },
            { id: 'analyticsTools', title: 'Umgang mit Analytics-Tools' },
            { id: 'dataStorytelling', title: 'Data Storytelling Fähigkeiten' },
            { id: 'continuousLearning', title: 'Kontinuierliche Weiterbildung' }
        ]
    }
];
```

---

### Schritt 2.2: Workflow-Seite vollständig implementieren

**Aktion:** Öffne `ki-strategie-workflow.html` und kopiere die komplette Struktur. Dann:

1. Ersetze alle Vorkommen von "KI-Strategie" mit "Analytics & Reporting"
2. Ersetze die Kriterien-Array mit `analyticsCriteria` (siehe oben)
3. Ersetze die localStorage-Keys:
   - `kiStrategyWorkflow` → `hrCoachAnalytics`
   - `kiDetailAssessments` → `hrCoachAnalyticsDetails`
4. Passe die Farbgebung an (Primary: #6366f1)
5. Ersetze den Link "Zurück zur KI-Übersicht" mit "Zurück zum HR Coach Framework"

---

## PHASE 3: Alle 10 Workflows erstellen

### Schritt 3.1 - 3.10: Kopiere Analytics-Workflow für jeden Bereich

Für jeden der folgenden Bereiche:

| Nr. | Bereich | Dateiname | Primärfarbe |
|-----|---------|-----------|-------------|
| 1 | Analytics | hr-coach-analytics-workflow.html | #6366f1 |
| 2 | Strategie | hr-coach-strategie-workflow.html | #ec4899 |
| 3 | Recruiting | hr-coach-recruiting-workflow.html | #06b6d4 |
| 4 | Onboarding | hr-coach-onboarding-workflow.html | #10b981 |
| 5 | Admin | hr-coach-admin-workflow.html | #f59e0b |
| 6 | Performance | hr-coach-performance-workflow.html | #8b5cf6 |
| 7 | Compensation | hr-coach-compensation-workflow.html | #f97316 |
| 8 | Learning | hr-coach-learning-workflow.html | #14b8a6 |
| 9 | Leadership | hr-coach-leadership-workflow.html | #ef4444 |
| 10 | Wellbeing | hr-coach-wellbeing-workflow.html | #22c55e |

**Für jeden Bereich:**
1. Kopiere `hr-coach-analytics-workflow.html`
2. Benenne die Datei um
3. Ersetze Titel und Beschreibung
4. Ersetze die Kriterien (siehe Kriterien-Listen unten)
5. Passe Farben an
6. Aktualisiere localStorage-Keys

---

## PHASE 4: Kriterien für alle Bereiche

### 4.1 Strategie & Kultur Kriterien

```javascript
const strategieCriteria = [
    { id: 'hrVision', title: 'HR-Vision & Mission', icon: 'fa-eye', subCriteria: [
        { id: 'visionClarity', title: 'Klare HR-Vision formuliert' },
        { id: 'missionAlignment', title: 'Alignment mit Unternehmensmission' },
        { id: 'stakeholderBuyin', title: 'Stakeholder Buy-in vorhanden' },
        { id: 'visionCommunication', title: 'Regelmäßige Kommunikation der Vision' }
    ]},
    { id: 'cultureAnalysis', title: 'Kulturanalyse', icon: 'fa-users', subCriteria: [
        { id: 'cultureAssessment', title: 'Regelmäßige Kultur-Assessments' },
        { id: 'valueDefinition', title: 'Klar definierte Unternehmenswerte' },
        { id: 'cultureFit', title: 'Culture-Fit in allen HR-Prozessen' },
        { id: 'cultureMetrics', title: 'Messbare Kultur-KPIs' }
    ]},
    { id: 'strategicPlanning', title: 'Strategische Planung', icon: 'fa-chess', subCriteria: [
        { id: 'longTermPlanning', title: 'Langfristige HR-Strategie (3-5 Jahre)' },
        { id: 'annualGoals', title: 'Jährliche strategische Ziele' },
        { id: 'resourcePlanning', title: 'Ressourcenplanung' },
        { id: 'budgetAlignment', title: 'Budget-Ausrichtung an Strategie' }
    ]},
    { id: 'changeCapability', title: 'Veränderungsfähigkeit', icon: 'fa-sync', subCriteria: [
        { id: 'changeReadiness', title: 'Veränderungsbereitschaft der Organisation' },
        { id: 'agileMethodology', title: 'Agile Methoden im HR' },
        { id: 'innovationCulture', title: 'Innovationskultur gefördert' },
        { id: 'failureAcceptance', title: 'Konstruktiver Umgang mit Fehlern' }
    ]},
    { id: 'employeeEngagement', title: 'Mitarbeiterengagement', icon: 'fa-heart', subCriteria: [
        { id: 'engagementSurveys', title: 'Regelmäßige Engagement-Befragungen' },
        { id: 'actionPlanning', title: 'Konkrete Maßnahmenplanung' },
        { id: 'feedbackCulture', title: 'Offene Feedback-Kultur' },
        { id: 'recognitionPrograms', title: 'Anerkennungsprogramme' }
    ]},
    { id: 'diversityInclusion', title: 'Diversity & Inclusion', icon: 'fa-globe', subCriteria: [
        { id: 'diStrategy', title: 'D&I-Strategie vorhanden' },
        { id: 'diversityMetrics', title: 'Diversity-Kennzahlen erfasst' },
        { id: 'inclusionPrograms', title: 'Inklusions-Programme' },
        { id: 'biasTraining', title: 'Unconscious Bias Training' }
    ]},
    { id: 'employerBrand', title: 'Arbeitgebermarke', icon: 'fa-award', subCriteria: [
        { id: 'evp', title: 'Employee Value Proposition definiert' },
        { id: 'brandConsistency', title: 'Konsistente Markenkommunikation' },
        { id: 'employeeAdvocacy', title: 'Mitarbeiter als Markenbotschafter' },
        { id: 'brandMeasurement', title: 'Arbeitgebermarken-Messung' }
    ]},
    { id: 'hrBusinessPartnership', title: 'HR Business Partnership', icon: 'fa-handshake', subCriteria: [
        { id: 'strategicRole', title: 'HR als strategischer Partner' },
        { id: 'businessAcumen', title: 'Business-Verständnis im HR' },
        { id: 'consultingCapability', title: 'Beratungskompetenz' },
        { id: 'decisionInfluence', title: 'Einfluss auf Geschäftsentscheidungen' }
    ]}
];
```

### 4.2 Recruiting Kriterien

```javascript
const recruitingCriteria = [
    { id: 'talentStrategy', title: 'Talent-Strategie', icon: 'fa-bullseye', subCriteria: [
        { id: 'workforcePlanning', title: 'Strategische Personalplanung' },
        { id: 'talentPipeline', title: 'Talent-Pipeline aufgebaut' },
        { id: 'successProfiles', title: 'Erfolgsprofile definiert' },
        { id: 'skillMapping', title: 'Skill-Mapping durchgeführt' }
    ]},
    { id: 'sourcing', title: 'Sourcing & Kanäle', icon: 'fa-search', subCriteria: [
        { id: 'channelMix', title: 'Diverser Recruiting-Kanal-Mix' },
        { id: 'activeSourcing', title: 'Active Sourcing Kompetenz' },
        { id: 'socialRecruiting', title: 'Social Media Recruiting' },
        { id: 'employeeReferrals', title: 'Mitarbeiterempfehlungsprogramm' }
    ]},
    { id: 'candidateExperience', title: 'Candidate Experience', icon: 'fa-smile', subCriteria: [
        { id: 'applicationProcess', title: 'Einfacher Bewerbungsprozess' },
        { id: 'communicationSpeed', title: 'Schnelle Kommunikation' },
        { id: 'candidateFeedback', title: 'Feedback an Kandidaten' },
        { id: 'touchpointOptimization', title: 'Touchpoint-Optimierung' }
    ]},
    { id: 'selectionProcess', title: 'Auswahlverfahren', icon: 'fa-filter', subCriteria: [
        { id: 'structuredInterviews', title: 'Strukturierte Interviews' },
        { id: 'assessmentCenter', title: 'Assessment Center bei Bedarf' },
        { id: 'competencyBasedSelection', title: 'Kompetenzbasierte Auswahl' },
        { id: 'dataBasedDecisions', title: 'Datengestützte Entscheidungen' }
    ]},
    { id: 'employerBranding', title: 'Employer Branding', icon: 'fa-star', subCriteria: [
        { id: 'careerPage', title: 'Attraktive Karriereseite' },
        { id: 'socialPresence', title: 'Social Media Präsenz' },
        { id: 'contentMarketing', title: 'Employer Content Marketing' },
        { id: 'awardParticipation', title: 'Arbeitgeber-Awards' }
    ]},
    { id: 'recruitingTech', title: 'Recruiting-Technologie', icon: 'fa-robot', subCriteria: [
        { id: 'ats', title: 'Modernes ATS-System' },
        { id: 'aiScreening', title: 'KI-gestütztes Screening' },
        { id: 'videoInterviews', title: 'Video-Interview-Tools' },
        { id: 'analytics', title: 'Recruiting Analytics' }
    ]},
    { id: 'diversity', title: 'Diversity Recruiting', icon: 'fa-users', subCriteria: [
        { id: 'inclusiveJobAds', title: 'Inklusive Stellenanzeigen' },
        { id: 'diverseSourcing', title: 'Diverse Sourcing-Kanäle' },
        { id: 'biasReduction', title: 'Bias-Reduzierung im Prozess' },
        { id: 'diversityTargets', title: 'Diversity-Ziele definiert' }
    ]},
    { id: 'qualityMetrics', title: 'Qualitätsmetriken', icon: 'fa-chart-line', subCriteria: [
        { id: 'timeToHire', title: 'Time-to-Hire optimiert' },
        { id: 'qualityOfHire', title: 'Quality-of-Hire gemessen' },
        { id: 'costPerHire', title: 'Cost-per-Hire überwacht' },
        { id: 'offerAcceptance', title: 'Offer Acceptance Rate' }
    ]}
];
```

---

## PHASE 5: Detail-Seiten erstellen

### Schritt 5.1: Für jedes Kriterium eine Detail-Seite

**Muster:** `hr-coach-detail-{bereich}-{kriterium}.html`

**Beispiel:** `hr-coach-detail-analytics-dataFoundation.html`

**Aktion:** Kopiere `ki-assessment-detail-skills.html` als Vorlage und passe an:
1. Titel und Beschreibung
2. Kriterien und Unterkriterien
3. Farben (passend zum Bereich)
4. localStorage-Keys

---

## PHASE 6: PDF-Export implementieren

### Schritt 6.1: PDF-Export-Funktion in js/hr-coach-pdf-export.js

**Datei:** `/js/hr-coach-pdf-export.js`

**Aktion:** Erstelle PDF-Export mit jsPDF:

```javascript
// Hochglanz PDF Export
async function generatePremiumPDF(areaId) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Farbpalette
    const colors = {
        primary: [99, 102, 241],
        dark: [15, 23, 42],
        light: [229, 231, 235]
    };
    
    // Header mit Gradient-Effekt
    doc.setFillColor(...colors.dark);
    doc.rect(0, 0, 210, 50, 'F');
    
    // Logo-Bereich
    doc.setFillColor(...colors.primary);
    doc.circle(30, 25, 12, 'F');
    
    // Titel
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('HR Coach Framework', 50, 22);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Analyse-Report', 50, 32);
    
    // Datum
    doc.setFontSize(10);
    doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 50, 42);
    
    // ... weitere Implementierung
    
    doc.save(`HR-Coach-${areaId}-Report.pdf`);
}
```

---

## PHASE 7: Yoga-Teppich SVG implementieren

### Schritt 7.1: Interaktives SVG in js/yoga-teppich-svg.js

**Datei:** `/js/yoga-teppich-svg.js`

**Aktion:** Erstelle interaktives Kreisdiagramm:

```javascript
function renderYogaTeppichSVG(containerId) {
    const container = document.getElementById(containerId);
    const areas = HR_FRAMEWORK_AREAS;
    const anglePerArea = 360 / areas.length;
    
    let svgContent = `
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        
        <!-- Hintergrund -->
        <circle cx="200" cy="200" r="180" fill="rgba(15, 23, 42, 0.5)" stroke="rgba(99, 102, 241, 0.3)" stroke-width="2"/>
        
        <!-- Segmente -->
        ${areas.map((area, i) => {
            const startAngle = i * anglePerArea - 90;
            const endAngle = (i + 1) * anglePerArea - 90;
            const progress = getAreaProgress(area.id);
            return createSegment(area, startAngle, endAngle, progress, i);
        }).join('')}
        
        <!-- Zentrum -->
        <circle cx="200" cy="200" r="60" fill="rgba(99, 102, 241, 0.3)" stroke="rgba(165, 180, 252, 0.5)" stroke-width="2"/>
        <text x="200" y="195" text-anchor="middle" fill="white" font-size="14" font-weight="bold">HR Coach</text>
        <text x="200" y="212" text-anchor="middle" fill="#a5b4fc" font-size="10">Framework</text>
    </svg>
    `;
    
    container.innerHTML = svgContent;
}

function createSegment(area, startAngle, endAngle, progress, index) {
    // SVG Pfad für Segment berechnen
    // ... Implementierung
}
```

---

## PHASE 8: Integration und Testing

### Schritt 8.1: Links in hr-coach.html aktualisieren

**Datei:** `/hr-coach.html`

**Aktion:** Füge Button zum neuen Framework hinzu:

```html
<a href="hr-coach-framework.html" class="btn-primary">
    <i class="fas fa-play-circle"></i>
    HR Coach Framework starten
</a>
```

### Schritt 8.2: Navigation aktualisieren

**Aktion:** In allen neuen Seiten die Navigation konsistent halten

### Schritt 8.3: Deployment

```bash
# Alle neuen Dateien deployen
aws s3 sync . s3://manuel-weiss-website/ --exclude "*" \
    --include "hr-coach-framework.html" \
    --include "hr-coach-*-workflow.html" \
    --include "hr-coach-detail-*.html" \
    --include "css/hr-coach-framework.css" \
    --include "js/hr-coach-framework.js" \
    --include "js/hr-coach-pdf-export.js" \
    --include "js/yoga-teppich-svg.js"

# Cache invalidieren
aws cloudfront create-invalidation --distribution-id E305V0ATIXMNNG --paths "/*"
```

---

## Zusammenfassung der Dateien

| Phase | Datei | Beschreibung |
|-------|-------|--------------|
| 1 | hr-coach-framework.html | Hauptseite mit Übersicht |
| 1 | css/hr-coach-framework.css | Dark Theme Styles |
| 1 | js/hr-coach-framework.js | Hauptlogik und Daten |
| 2-3 | hr-coach-{bereich}-workflow.html | 10 Workflow-Seiten |
| 5 | hr-coach-detail-{bereich}-{kriterium}.html | ~80 Detail-Seiten |
| 6 | js/hr-coach-pdf-export.js | PDF-Export |
| 7 | js/yoga-teppich-svg.js | Interaktives SVG |

---

## Zeitschätzung pro Phase

| Phase | Aufgabe | Geschätzte Dateien |
|-------|---------|-------------------|
| 1 | Grundstruktur | 3 Dateien |
| 2 | Analytics Workflow | 1 Datei |
| 3 | Weitere 9 Workflows | 9 Dateien |
| 4 | Kriterien definieren | In Workflows |
| 5 | Detail-Seiten | ~80 Dateien |
| 6 | PDF-Export | 1 Datei |
| 7 | Yoga-Teppich SVG | 1 Datei |
| 8 | Integration | Updates |

**Gesamte neue Dateien:** ~95 Dateien
