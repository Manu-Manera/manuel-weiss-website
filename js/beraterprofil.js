(() => {
    function downloadBeraterprofil() {
        console.log('📄 Beraterprofil wird heruntergeladen...');
        
        const profileData = {
            name: 'Manuel Alexander Weiss',
            title: 'HR Consultant',
            email: 'info@manuel-weiss.ch',
            phone: '+41 79 838 55 90',
            location: 'Pilatusstrasse 40, 8330 Pfäffikon ZH',
            website: 'https://manuel-weiss.ch',
            linkedin: 'https://linkedin.com/in/manuel-weiss',
            experience: [
                {
                    position: 'HR Consultant',
                    company: 'HR Campus AG, Zürich',
                    period: '12.2021 - 06.2025',
                    description: 'End-to-end UKG HRSD Implementierungen für SME und Enterprise Kunden. Design, Automatisierung und Integration von HR-Prozessen über SAP SuccessFactors/HCM, DocuSign. ADONIS BPMN 2.0 Modellierung und HR Health Checks.'
                },
                {
                    position: 'Process Consultant',
                    company: 'BOC Information Technologies Consulting GmbH, Berlin',
                    period: '12.2019 - 12.2021',
                    description: 'Business Process Management (BPM) Praxis für Kundenorganisationen. Prozess-Discovery Sessions, Workflow-Dokumentation, Gap-Analyse, SIPOC und Root-Cause-Analyse. ADONIS Prozess-Management Suite Deployment.'
                },
                {
                    position: 'IT Project Manager, Sales & Contract Management',
                    company: 'eeMobility (Startup), München',
                    period: '03.2019 - 09.2019',
                    description: 'End-to-end Vertragsmanagement Lifecycle, Digitalisierungsprojekte für optimierte Workflows. Trade-Fair Koordination und 6-monatiges Sales Training mit externem Coach.'
                },
                {
                    position: 'Production Technician',
                    company: 'Work and travel Australia',
                    period: '09.2017 - 02.2019',
                    description: 'Assemblierung von Stahl- und Faser-Seilen nach technischen Toleranzen. Lean-Management (5S) Implementation zur Verbesserung der Shop-Floor Organisation.'
                }
            ],
            projects: [
                {
                    name: 'UKG HRSD Implementierungen',
                    type: 'KSA, Binelli, Sonnhalde Gempen, PDGR, Pestalozzi, Spital Muri, Schindler',
                    period: '2021 - 2025',
                    description: 'End-to-end UKG HRSD Implementierungen mit Wissensdatenbank, Prozessoptimierung und digitalem Personaldossier für verschiedene Branchen.',
                    skills: ['UKG HRSD', 'Wissensdatenbank', 'Digitales Personaldossier', 'Prozessoptimierung']
                },
                {
                    name: 'ADONIS BPMN 2.0 Einführung',
                    type: 'Müller Milch, KFW',
                    period: '2019 - 2021',
                    description: 'Einführung von ADONIS und Business Process Management bei Müller Milch sowie GRC-Implementierung bei KFW.',
                    skills: ['ADONIS', 'BPMN 2.0', 'GRC', 'Governance']
                },
                {
                    name: 'Prozessschulungen & Workshops',
                    type: 'Landeshauptstadt München, Dywidag, Fiege Logistik, VKB, GEMA, Universität der Bundeswehr',
                    period: '2019 - 2021',
                    description: 'Durchführung von BPM-Schulungen und Workshops für verschiedene Organisationen.',
                    skills: ['Prozessschulungen', 'Workshops', 'BPM-Training', 'Change Management']
                },
                {
                    name: 'Business Process Management (BPM)',
                    type: 'BOC Information Technologies',
                    period: '2019 - 2021',
                    description: 'Strukturierte BPM-Praxis inkl. Prozess-Discovery, Workflow-Dokumentation und Gap-Analyse.',
                    skills: ['BPM', 'Prozess-Discovery', 'Gap-Analyse', 'SIPOC', 'Root-Cause-Analyse']
                }
            ],
            skills: {
                'HR-Tech & Process Expertise (9/10)': [
                    'UKG HRSD', 'SAP SuccessFactors/HCM', 'ADONIS BPMN 2.0', 'HR Data Migration', 'Interface Design', 'HR Health Checks'
                ],
                'Project Governance & Delivery (9/10)': [
                    'PRINCE2 Practitioner', 'Scrum Master', 'Agile/Waterfall', 'Hybrid Approaches', 'Project Tailoring'
                ],
                'Language Proficiency (8/10)': [
                    'Deutsch (Muttersprache)', 'Englisch C1 (18 Monate Australien)', 'Spanisch A2'
                ],
                'Collaboration & Productivity (9/10)': [
                    'Microsoft 365 Power-User', 'Teams', 'SharePoint', 'Power Automate', 'Co-Authoring'
                ]
            },
            education: [
                {
                    degree: 'Bachelor in Wirtschaftswissenschaften',
                    institution: 'Munich University of Applied Sciences',
                    period: '04.2012 - 06.2017',
                    description: 'Schwerpunkte: Human Resource Management, Supply Chain Management, Service Management.'
                },
                {
                    degree: 'Master Professional in Business Administration (Skilled Crafts)',
                    institution: 'Handwerkskammer für Schwaben',
                    period: '04.2009 - 04.2010',
                    description: 'Weiterbildung während der Abendschule.'
                }
            ]
        };
        
        const profileHTML = createBeraterprofilHTML(profileData);
        createAndDownloadPDF(profileHTML, 'Manuel_Weiss_Beraterprofil.pdf');
    }
    
    function createBeraterprofilHTML(data) {
        return `
            <!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Beraterprofil - ${data.name}</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 2rem;
                        background: #fff;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 3rem;
                        padding: 2rem;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border-radius: 12px;
                    }
                    .header h1 {
                        font-size: 2.5rem;
                        margin-bottom: 0.5rem;
                    }
                    .header h2 {
                        font-size: 1.5rem;
                        opacity: 0.9;
                        margin-bottom: 1rem;
                    }
                    .contact-info {
                        display: flex;
                        justify-content: center;
                        gap: 2rem;
                        flex-wrap: wrap;
                    }
                    .section {
                        margin-bottom: 2.5rem;
                    }
                    .section h3 {
                        color: #667eea;
                        border-bottom: 2px solid #667eea;
                        padding-bottom: 0.5rem;
                        margin-bottom: 1.5rem;
                    }
                    .experience-item, .project-item {
                        margin-bottom: 1.5rem;
                        padding: 1rem;
                        background: #f8f9fa;
                        border-radius: 8px;
                        border-left: 4px solid #667eea;
                    }
                    .experience-item h4, .project-item h4 {
                        color: #1f2937;
                        margin-bottom: 0.5rem;
                    }
                    .skills-grid {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.5rem;
                    }
                    .skill-tag {
                        background: #667eea;
                        color: white;
                        padding: 0.25rem 0.75rem;
                        border-radius: 12px;
                        font-size: 0.875rem;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${data.name}</h1>
                    <h2>${data.title}</h2>
                    <div class="contact-info">
                        <span>📧 ${data.email}</span>
                        <span>📞 ${data.phone}</span>
                        <span>📍 ${data.location}</span>
                        <span>🌐 ${data.website}</span>
                    </div>
                </div>
                <!-- Weitere Abschnitte werden per JS eingefügt -->
            </body>
            </html>
        `;
    }
    
    function createAndDownloadPDF(htmlContent, filename) {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Bitte Pop-ups für diese Seite erlauben, um das Profil herunterzuladen.');
            return;
        }
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }
    
    window.downloadBeraterprofil = downloadBeraterprofil;
    
    document.addEventListener('DOMContentLoaded', () => {
        const profileDownloadBtn = document.getElementById('profileDownloadBtn');
        if (profileDownloadBtn) {
            profileDownloadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                downloadBeraterprofil();
            });
        }
    });
})();

