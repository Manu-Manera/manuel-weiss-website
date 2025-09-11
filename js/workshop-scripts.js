// Workshop Scripts für alle Persönlichkeitsentwicklungs-Methoden
class WorkshopScriptGenerator {
    constructor() {
        this.scripts = {
            'ikigai': {
                title: 'Ikigai-Workshop: Deinen Lebenssinn entdecken',
                duration: '3-4 Stunden',
                participants: '6-12 Personen',
                objectives: [
                    'Verstehen der Ikigai-Philosophie und ihrer vier Bereiche',
                    'Persönliche Reflexion über Leidenschaften, Mission, Berufung und Profession',
                    'Identifikation von Schnittmengen und Lebenssinn',
                    'Entwicklung eines persönlichen Aktionsplans'
                ],
                agenda: [
                    {
                        time: '0-15 Min',
                        title: 'Begrüßung & Einführung',
                        content: 'Willkommen, Vorstellungsrunde, Workshop-Ziele, Ikigai-Philosophie erklären'
                    },
                    {
                        time: '15-45 Min',
                        title: 'Was du liebst - Leidenschaften erkunden',
                        content: 'Einzelarbeit: Leidenschaften-Liste erstellen, Kindheitserinnerungen, Flow-Momente identifizieren'
                    },
                    {
                        time: '45-75 Min',
                        title: 'Was die Welt braucht - Mission definieren',
                        content: 'Gruppenarbeit: Weltprobleme diskutieren, persönliche Beiträge überlegen, Mission formulieren'
                    },
                    {
                        time: '75-105 Min',
                        title: 'Wofür du bezahlt wirst - Profession analysieren',
                        content: 'Einzelarbeit: Fähigkeiten und Talente bewerten, Marktbedarf analysieren, Berufung finden'
                    },
                    {
                        time: '105-135 Min',
                        title: 'Worin du gut bist - Stärken identifizieren',
                        content: 'Selbstreflexion: Stärken bewerten, Feedback von anderen einholen, Kompetenzen kartieren'
                    },
                    {
                        time: '135-165 Min',
                        title: 'Schnittmengen finden - Ikigai entwickeln',
                        content: 'Kreative Arbeit: Ikigai-Diagramm erstellen, Schnittmengen visualisieren, Lebenssinn formulieren'
                    },
                    {
                        time: '165-195 Min',
                        title: 'Aktionsplan erstellen',
                        content: 'Planung: Konkrete Schritte definieren, Zeitrahmen setzen, Unterstützung organisieren'
                    },
                    {
                        time: '195-210 Min',
                        title: 'Abschluss & Reflexion',
                        content: 'Teilung der Erkenntnisse, Feedback, nächste Schritte, Verabschiedung'
                    }
                ],
                materials: [
                    'Flipchart und Stifte',
                    'Ikigai-Vorlage (4 Kreise)',
                    'Reflexionsfragen-Blatt',
                    'Sticky Notes in verschiedenen Farben',
                    'Timer/Stoppuhr',
                    'Kaffee, Tee und Snacks'
                ],
                regieanweisungen: [
                    'Schaffe eine vertrauensvolle und offene Atmosphäre',
                    'Ermutige zu ehrlicher Selbstreflexion',
                    'Lasse genügend Zeit für Stille und Nachdenken',
                    'Fördere den Austausch zwischen den Teilnehmern',
                    'Sei flexibel mit der Zeit - manche brauchen mehr Zeit für Reflexion',
                    'Halte die Energie hoch mit kurzen Pausen und Bewegung',
                    'Dokumentiere wichtige Erkenntnisse für alle sichtbar',
                    'Beende jeden Abschnitt mit einer kurzen Zusammenfassung'
                ]
            },
            'values': {
                title: 'Werte-Klärungs-Workshop: Deine inneren Kompass finden',
                duration: '2-3 Stunden',
                participants: '8-15 Personen',
                objectives: [
                    'Identifikation der persönlichen Kernwerte',
                    'Verstehen der Bedeutung von Werten im Leben',
                    'Werte-Konflikte erkennen und lösen',
                    'Werte-basierte Entscheidungen treffen lernen'
                ],
                agenda: [
                    {
                        time: '0-15 Min',
                        title: 'Begrüßung & Einführung',
                        content: 'Willkommen, Vorstellungsrunde, Was sind Werte?, Bedeutung von Werten erklären'
                    },
                    {
                        time: '15-45 Min',
                        title: 'Werte-Sammlung',
                        content: 'Einzelarbeit: Werte-Liste durchgehen, persönliche Werte auswählen, eigene Werte hinzufügen'
                    },
                    {
                        time: '45-75 Min',
                        title: 'Werte-Ranking',
                        content: 'Priorisierung: Top 10 Werte auswählen, in Reihenfolge bringen, Begründungen finden'
                    },
                    {
                        time: '75-105 Min',
                        title: 'Werte-Konflikte analysieren',
                        content: 'Paararbeit: Konflikte zwischen Werten identifizieren, Lösungsansätze entwickeln'
                    },
                    {
                        time: '105-135 Min',
                        title: 'Werte in Lebensbereichen',
                        content: 'Mapping: Werte auf verschiedene Lebensbereiche anwenden, Ziele ableiten'
                    },
                    {
                        time: '135-165 Min',
                        title: 'Werte-basierte Entscheidungen',
                        content: 'Übung: Entscheidungen anhand der Werte treffen, Entscheidungsmatrix erstellen'
                    },
                    {
                        time: '165-180 Min',
                        title: 'Abschluss & Reflexion',
                        content: 'Teilung der Erkenntnisse, persönliche Commitments, Verabschiedung'
                    }
                ],
                materials: [
                    'Werte-Liste (100+ Werte)',
                    'Ranking-Vorlage',
                    'Lebensbereiche-Matrix',
                    'Entscheidungsmatrix-Vorlage',
                    'Sticky Notes',
                    'Flipchart'
                ],
                regieanweisungen: [
                    'Schaffe einen sicheren Raum für persönliche Reflexion',
                    'Ermutige zu ehrlichen Antworten ohne Urteile',
                    'Lasse genügend Zeit für schwierige Entscheidungen',
                    'Fördere den Austausch über Werte-Konflikte',
                    'Hilf bei der Priorisierung ohne zu drängen',
                    'Dokumentiere die wichtigsten Erkenntnisse',
                    'Beende mit konkreten nächsten Schritten'
                ]
            },
            'strengths': {
                title: 'Stärken-Workshop: Deine Talente entdecken und nutzen',
                duration: '2.5-3.5 Stunden',
                participants: '6-12 Personen',
                objectives: [
                    'Identifikation der persönlichen Stärken und Talente',
                    'Verstehen der Stärken-Theorie',
                    'Stärken in verschiedenen Kontexten anwenden',
                    'Entwicklungsplan für Stärken erstellen'
                ],
                agenda: [
                    {
                        time: '0-15 Min',
                        title: 'Begrüßung & Einführung',
                        content: 'Willkommen, Stärken-Theorie erklären, Workshop-Ziele, Vorstellungsrunde'
                    },
                    {
                        time: '15-45 Min',
                        title: 'Stärken-Selbstreflexion',
                        content: 'Einzelarbeit: Stärken-Liste durchgehen, persönliche Bewertung, Kindheitserinnerungen'
                    },
                    {
                        time: '45-75 Min',
                        title: 'Feedback von anderen',
                        content: 'Paararbeit: Stärken-Feedback geben und erhalten, Fremdbild vs. Selbstbild'
                    },
                    {
                        time: '75-105 Min',
                        title: 'Stärken-Kategorien',
                        content: 'Gruppenarbeit: Stärken in Kategorien einteilen, Muster erkennen'
                    },
                    {
                        time: '105-135 Min',
                        title: 'Stärken in Aktion',
                        content: 'Übung: Stärken in verschiedenen Situationen anwenden, Erfolgsgeschichten teilen'
                    },
                    {
                        time: '135-165 Min',
                        title: 'Stärken-Entwicklungsplan',
                        content: 'Planung: Stärken weiterentwickeln, Schwächen kompensieren, Ziele setzen'
                    },
                    {
                        time: '165-195 Min',
                        title: 'Stärken-Kombinationen',
                        content: 'Kreative Arbeit: Stärken kombinieren, einzigartige Talente identifizieren'
                    },
                    {
                        time: '195-210 Min',
                        title: 'Abschluss & Reflexion',
                        content: 'Teilung der Erkenntnisse, persönliche Commitments, Verabschiedung'
                    }
                ],
                materials: [
                    'Stärken-Assessment',
                    'Feedback-Vorlage',
                    'Stärken-Kategorien-Übersicht',
                    'Entwicklungsplan-Vorlage',
                    'Flipchart und Stifte',
                    'Timer'
                ],
                regieanweisungen: [
                    'Schaffe eine positive und ermutigende Atmosphäre',
                    'Fokussiere auf Stärken, nicht auf Schwächen',
                    'Ermutige zu ehrlichem Feedback',
                    'Lasse Zeit für Selbstreflexion',
                    'Fördere den Austausch von Erfolgsgeschichten',
                    'Hilf bei der Identifikation von Mustern',
                    'Beende mit konkreten Entwicklungszielen'
                ]
            }
        };
    }

    generateScript(methodId) {
        const script = this.scripts[methodId];
        if (!script) {
            return null;
        }

        return {
            ...script,
            generatedAt: new Date().toLocaleDateString('de-DE'),
            methodId: methodId
        };
    }

    generatePDF(methodId) {
        const script = this.generateScript(methodId);
        if (!script) {
            console.error('Workshop-Skript nicht gefunden für Methode:', methodId);
            return;
        }

        // HTML für PDF-Generierung
        const htmlContent = this.createHTMLContent(script);
        
        // PDF generieren und herunterladen
        this.downloadPDF(htmlContent, `${script.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    }

    createHTMLContent(script) {
        return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${script.title}</title>
    <style>
        body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #6366f1;
            padding-bottom: 20px;
        }
        .title {
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .meta {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-bottom: 20px;
            font-size: 14px;
            color: #6b7280;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 15px;
            border-left: 4px solid #6366f1;
            padding-left: 15px;
        }
        .objectives ul, .materials ul, .regieanweisungen ul {
            list-style: none;
            padding: 0;
        }
        .objectives li, .materials li, .regieanweisungen li {
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }
        .objectives li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
        }
        .materials li:before {
            content: "📋";
            position: absolute;
            left: 0;
        }
        .regieanweisungen li:before {
            content: "🎯";
            position: absolute;
            left: 0;
        }
        .agenda-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .agenda-table th, .agenda-table td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
        }
        .agenda-table th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
        }
        .time {
            font-weight: 600;
            color: #6366f1;
            width: 100px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${script.title}</h1>
        <div class="meta">
            <span>⏱️ Dauer: ${script.duration}</span>
            <span>👥 Teilnehmer: ${script.participants}</span>
            <span>📅 Erstellt: ${script.generatedAt}</span>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Workshop-Ziele</h2>
        <ul class="objectives">
            ${script.objectives.map(obj => `<li>${obj}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2 class="section-title">Agenda</h2>
        <table class="agenda-table">
            <thead>
                <tr>
                    <th>Zeit</th>
                    <th>Aktivität</th>
                    <th>Inhalt</th>
                </tr>
            </thead>
            <tbody>
                ${script.agenda.map(item => `
                    <tr>
                        <td class="time">${item.time}</td>
                        <td><strong>${item.title}</strong></td>
                        <td>${item.content}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2 class="section-title">Benötigte Materialien</h2>
        <ul class="materials">
            ${script.materials.map(material => `<li>${material}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2 class="section-title">Regieanweisungen</h2>
        <ul class="regieanweisungen">
            ${script.regieanweisungen.map(instruction => `<li>${instruction}</li>`).join('')}
        </ul>
    </div>

    <div class="footer">
        <p>Workshop-Skript generiert von Manuel Weiss - Persönlichkeitsentwicklung</p>
        <p>Für weitere Informationen besuchen Sie: mawps.netlify.app</p>
    </div>
</body>
</html>`;
    }

    downloadPDF(htmlContent, filename) {
        // Erstelle ein neues Fenster mit dem HTML-Inhalt
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Warte kurz, dann drucke als PDF
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }
}

// Globale Instanz erstellen
window.workshopScriptGenerator = new WorkshopScriptGenerator();

// Funktion für Button-Klicks
function downloadWorkshopScript(methodId) {
    window.workshopScriptGenerator.generatePDF(methodId);
}
