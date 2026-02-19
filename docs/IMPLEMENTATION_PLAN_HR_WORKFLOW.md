# Detaillierter Implementierungsplan: HR-Automation-Workflow Umstrukturierung

## Übersicht
Der HR-Automation-Workflow soll auf 8 Schritte umstrukturiert werden mit folgender neuer Struktur:

| Schritt | Name | Icon | Beschreibung |
|---------|------|------|--------------|
| 1 | Prozess-Analyse | fa-search | HR-Prozesse auswählen zur Automatisierung |
| 2 | Ist-Zustand | fa-clipboard-list | Aktuellen Digitalisierungsgrad bewerten |
| 3 | Vision & Ziele | fa-bullseye | Automatisierungsziele definieren |
| 4 | Prozess-Zeichnen | fa-pencil-alt | Prozesse auf Canvas skizzieren |
| 5 | Spracheingabe | fa-microphone | Prozesse per Text/Diktat beschreiben |
| 6 | BPMN-Generierung | fa-project-diagram | Automatische BPMN-Modell-Erstellung |
| 7 | Umsetzung | fa-road | Roadmap und Tools planen |
| 8 | Monitoring | fa-chart-bar | KPIs und kontinuierliche Verbesserung |

---

## AUFGABE 1: Schritt 4 (Prozess-Zeichnen) ersetzen

### Datei: `/Users/manumanera/Documents/GitHub/Persönliche Website/hr-automation-workflow.html`

### Suche nach diesem exakten Text (Zeilen ~1032-1055):
```html
        <!-- Step 4: Organisation & HR Operating Model -->
        <div class="workflow-step" data-step="4">
                <div class="step-number">4</div>
                    <h2>Organisation & HR Operating Model</h2>
                    <p>Harvard: HR Automation CoE - MIT: Citizen Development</p>
                    <label>Neue HR-Rollen für Automatisierung</label>
                            <input type="checkbox" id="role1" value="process-owner">
                            <label for="role1">HR Process Owner</label>
                            <input type="checkbox" id="role2" value="automation-architect">
                            <label for="role2">Automation Architect</label>
                            <input type="checkbox" id="role3" value="citizen-developer">
                            <label for="role3">Citizen Developer</label>
                            <input type="checkbox" id="role4" value="change-manager">
                            <label for="role4">Change Manager</label>
                            <input type="checkbox" id="role5" value="data-analyst">
                            <label for="role5">HR Data Analyst</label>
                            <input type="checkbox" id="role6" value="automation-specialist">
                            <label for="role6">Automation Specialist</label>
                    <label>HR Automation Center of Excellence</label>
                    <textarea id="coeStructure" placeholder="Beschreiben Sie die Struktur Ihres HR Automation CoE..."></textarea>
                    <label>Citizen Development Strategie</label>
                    <textarea id="citizenDevelopment" placeholder="Wie werden HR-Mitarbeiter selbst in die Lage versetzt, Automatisierungen zu konfigurieren?"></textarea>
                    <label>Change Management für Automatisierung</label>
                    <textarea id="changeManagement" placeholder="Wie begleiten Sie die Belegschaft im Übergang zu automatisierten HR-Prozessen?"></textarea>
```

### Ersetze durch:
```html
        <!-- Step 4: Prozess-Zeichnen -->
        <div class="workflow-step" data-step="4">
            <div class="step-header">
                <div class="step-number">4</div>
                <div class="step-title">
                    <h2><i class="fas fa-pencil-alt"></i> Prozess-Zeichnen</h2>
                    <p>Skizzieren Sie Ihre HR-Prozesse visuell auf dem Canvas</p>
                </div>
            </div>
            <div class="step-content">
                <div class="form-group">
                    <label>Wählen Sie einen Prozess zum Zeichnen:</label>
                    <select id="processToSketch" onchange="loadProcessForSketching(this.value)">
                        <option value="">Prozess auswählen...</option>
                        <option value="recruiting">Recruiting</option>
                        <option value="onboarding">Onboarding</option>
                        <option value="payroll">Payroll</option>
                        <option value="performance">Performance Management</option>
                        <option value="learning">Learning & Development</option>
                        <option value="offboarding">Offboarding</option>
                        <option value="hr-admin">HR-Administration</option>
                    </select>
                </div>
                
                <div class="sketch-area">
                    <div class="sketch-toolbar" style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button type="button" class="btn btn-secondary btn-small" onclick="setSketchColor('#1f2937')"><i class="fas fa-pen"></i> Schwarz</button>
                        <button type="button" class="btn btn-secondary btn-small" onclick="setSketchColor('#6366f1')"><i class="fas fa-pen"></i> Lila</button>
                        <button type="button" class="btn btn-secondary btn-small" onclick="setSketchColor('#10b981')"><i class="fas fa-pen"></i> Grün</button>
                        <button type="button" class="btn btn-secondary btn-small" onclick="setSketchColor('#ef4444')"><i class="fas fa-pen"></i> Rot</button>
                        <button type="button" class="btn btn-secondary btn-small" onclick="setSketchWidth(2)">Dünn</button>
                        <button type="button" class="btn btn-secondary btn-small" onclick="setSketchWidth(5)">Dick</button>
                    </div>
                    
                    <div class="process-sketch-container" style="border: 2px solid rgba(255,255,255,0.2); border-radius: 16px; overflow: hidden; background: white;">
                        <canvas id="step4Canvas" class="process-sketch-canvas" width="800" height="450" style="width: 100%; cursor: crosshair;"></canvas>
                    </div>
                    
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button type="button" class="btn btn-secondary" onclick="clearStep4Canvas()">
                            <i class="fas fa-eraser"></i> Canvas löschen
                        </button>
                        <button type="button" class="btn btn-primary" onclick="saveStep4Sketch()">
                            <i class="fas fa-save"></i> Skizze speichern
                        </button>
                    </div>
                </div>
                
                <div class="form-group" style="margin-top: 1.5rem;">
                    <label>Notizen zur Skizze:</label>
                    <textarea id="sketchNotes" placeholder="Beschreiben Sie die wichtigsten Prozessschritte, die Sie gezeichnet haben..." rows="4"></textarea>
                </div>
            </div>
        </div>
```

---

## AUFGABE 2: Schritt 5 (Spracheingabe) ersetzen

### Suche nach diesem exakten Text (Zeilen ~1056-1092):
```html
        <!-- Step 5: Ethik, Fairness & Employee Trust -->
        <div class="workflow-step" data-step="5">
                <div class="step-number">5</div>
                    <h2>Ethik, Fairness & Employee Trust</h2>
```
(und alles bis zum nächsten `<!-- Step 6:`)

### Ersetze den kompletten Step 5 durch:
```html
        <!-- Step 5: Spracheingabe / Diktat -->
        <div class="workflow-step" data-step="5">
            <div class="step-header">
                <div class="step-number">5</div>
                <div class="step-title">
                    <h2><i class="fas fa-microphone"></i> Spracheingabe</h2>
                    <p>Beschreiben Sie Ihre Prozesse per Text oder Diktat für die BPMN-Generierung</p>
                </div>
            </div>
            <div class="step-content">
                <div class="form-group">
                    <label>Wählen Sie den Prozess zur Beschreibung:</label>
                    <select id="processToDictate">
                        <option value="">Prozess auswählen...</option>
                        <option value="recruiting">Recruiting</option>
                        <option value="onboarding">Onboarding</option>
                        <option value="payroll">Payroll</option>
                        <option value="performance">Performance Management</option>
                        <option value="learning">Learning & Development</option>
                        <option value="offboarding">Offboarding</option>
                        <option value="hr-admin">HR-Administration</option>
                    </select>
                </div>
                
                <div class="dictation-area" style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.1);">
                    <div class="dictation-controls" style="margin-bottom: 1rem; display: flex; gap: 0.5rem; align-items: center;">
                        <button type="button" class="btn btn-primary" id="startDictationBtn" onclick="startDictation()">
                            <i class="fas fa-microphone"></i> Diktat starten
                        </button>
                        <button type="button" class="btn btn-secondary" id="stopDictationBtn" onclick="stopDictation()" style="display: none;">
                            <i class="fas fa-stop"></i> Stoppen
                        </button>
                        <span id="dictationStatus" style="color: rgba(255,255,255,0.7); font-size: 0.9rem;"></span>
                    </div>
                    
                    <label>Prozessbeschreibung (tippen oder diktieren):</label>
                    <textarea id="processDescription" class="process-dictation-area" rows="10" placeholder="Beschreiben Sie den Prozess Schritt für Schritt:

Beispiel für Recruiting:
1. Stellenanforderung wird vom Fachbereich eingereicht
2. HR prüft Budget und Genehmigung
3. Stellenausschreibung wird erstellt und veröffentlicht
4. Bewerbungen werden gesammelt und gesichtet
5. Vorauswahl durch HR (CV-Screening)
6. Erstgespräche werden terminiert
7. Interviews werden durchgeführt
8. Entscheidung und Vertragsangebot
..."></textarea>
                    
                    <div style="margin-top: 1rem;">
                        <button type="button" class="btn btn-primary" onclick="saveDictation()">
                            <i class="fas fa-save"></i> Beschreibung speichern
                        </button>
                    </div>
                </div>
                
                <div class="info-box" style="margin-top: 1.5rem; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: #a5b4fc; margin-bottom: 0.5rem;">
                        <i class="fas fa-info-circle"></i>
                        <strong>Tipp für bessere BPMN-Generierung</strong>
                    </div>
                    <ul style="color: rgba(255,255,255,0.8); margin: 0; padding-left: 1.25rem; font-size: 0.9rem;">
                        <li>Beschreiben Sie jeden Schritt in einer neuen Zeile</li>
                        <li>Nummerieren Sie die Schritte (1., 2., 3., ...)</li>
                        <li>Nennen Sie Entscheidungspunkte explizit ("Wenn ja..., wenn nein...")</li>
                        <li>Geben Sie Verantwortlichkeiten an (HR, Fachbereich, Mitarbeiter)</li>
                    </ul>
                </div>
            </div>
        </div>
```

---

## AUFGABE 3: Schritt 6 (BPMN-Generierung) ersetzen

### Suche nach dem alten Step 6 (`<!-- Step 6: Skalierung`) und ersetze komplett durch:
```html
        <!-- Step 6: BPMN-Generierung -->
        <div class="workflow-step" data-step="6">
            <div class="step-header">
                <div class="step-number">6</div>
                <div class="step-title">
                    <h2><i class="fas fa-project-diagram"></i> BPMN-Generierung</h2>
                    <p>Automatische Erstellung eines BPMN-Modells aus Ihrer Prozessbeschreibung</p>
                </div>
            </div>
            <div class="step-content">
                <div class="bpmn-generation-area">
                    <div class="form-group">
                        <label>Prozessbeschreibung aus Schritt 5:</label>
                        <div id="bpmnSourceText" style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 1rem; min-height: 100px; color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.1);">
                            <em>Laden Sie zuerst eine Prozessbeschreibung aus Schritt 5...</em>
                        </div>
                    </div>
                    
                    <div style="margin: 1.5rem 0;">
                        <button type="button" class="btn btn-primary btn-large" onclick="generateBPMN()" style="padding: 1rem 2rem; font-size: 1.1rem;">
                            <i class="fas fa-magic"></i> BPMN-Modell generieren
                        </button>
                    </div>
                    
                    <div id="bpmnGenerationStatus" style="display: none; padding: 1rem; background: rgba(251, 191, 36, 0.1); border-radius: 12px; border: 1px solid rgba(251, 191, 36, 0.3); margin-bottom: 1rem;">
                        <i class="fas fa-spinner fa-spin"></i> BPMN wird generiert...
                    </div>
                    
                    <div class="bpmn-result" id="bpmnResult" style="display: none;">
                        <label>Generiertes BPMN-Modell (XML):</label>
                        <div style="background: #1e293b; border-radius: 12px; padding: 1rem; overflow: auto; max-height: 400px;">
                            <pre id="bpmnXmlOutput" style="color: #10b981; font-family: monospace; font-size: 0.85rem; white-space: pre-wrap; margin: 0;"></pre>
                        </div>
                        
                        <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <button type="button" class="btn btn-primary" onclick="downloadBPMN()">
                                <i class="fas fa-download"></i> BPMN herunterladen
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="copyBPMN()">
                                <i class="fas fa-copy"></i> XML kopieren
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
```

---

## AUFGABE 4: Schritt 7 (Umsetzung) ersetzen

### Suche nach dem alten Step 7 und ersetze durch:
```html
        <!-- Step 7: Umsetzung -->
        <div class="workflow-step" data-step="7">
            <div class="step-header">
                <div class="step-number">7</div>
                <div class="step-title">
                    <h2><i class="fas fa-road"></i> Umsetzung</h2>
                    <p>Roadmap und Tool-Auswahl für Ihre Prozessautomatisierung</p>
                </div>
            </div>
            <div class="step-content">
                <div class="form-group">
                    <label>Automatisierungs-Tools auswählen:</label>
                    <div class="checkbox-group">
                        <div class="checkbox-item">
                            <input type="checkbox" id="tool1" value="uipath">
                            <label for="tool1">UiPath (RPA)</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="tool2" value="power-automate">
                            <label for="tool2">Microsoft Power Automate</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="tool3" value="zapier">
                            <label for="tool3">Zapier</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="tool4" value="workato">
                            <label for="tool4">Workato</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="tool5" value="camunda">
                            <label for="tool5">Camunda (BPMN Engine)</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="tool6" value="custom">
                            <label for="tool6">Eigenentwicklung</label>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Umsetzungs-Priorität:</label>
                    <select id="implementationPriority">
                        <option value="">Priorität wählen...</option>
                        <option value="quick-wins">Quick Wins zuerst (< 2 Wochen)</option>
                        <option value="high-impact">High Impact zuerst (größter ROI)</option>
                        <option value="low-risk">Low Risk zuerst (einfache Prozesse)</option>
                        <option value="strategic">Strategisch (nach Roadmap)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Geplanter Starttermin:</label>
                    <input type="date" id="implementationStart">
                </div>
                
                <div class="form-group">
                    <label>Verantwortlicher / Projektleiter:</label>
                    <input type="text" id="projectLead" placeholder="Name des Projektleiters">
                </div>
                
                <div class="form-group">
                    <label>Budget (optional):</label>
                    <input type="text" id="budget" placeholder="z.B. 50.000 CHF">
                </div>
                
                <div class="form-group">
                    <label>Umsetzungs-Notizen:</label>
                    <textarea id="implementationNotes" rows="4" placeholder="Weitere Details zur Umsetzung..."></textarea>
                </div>
            </div>
        </div>
```

---

## AUFGABE 5: Schritt 8 (Monitoring) hinzufügen

### Nach Schritt 7, VOR dem schließenden `</div>` des viewStrategy, füge hinzu:
```html
        <!-- Step 8: Monitoring -->
        <div class="workflow-step" data-step="8">
            <div class="step-header">
                <div class="step-number">8</div>
                <div class="step-title">
                    <h2><i class="fas fa-chart-bar"></i> Monitoring & KPIs</h2>
                    <p>Definieren Sie Erfolgskennzahlen und kontinuierliche Verbesserung</p>
                </div>
            </div>
            <div class="step-content">
                <div class="form-group">
                    <label>Wichtigste KPIs für Ihre Automatisierung:</label>
                    <div class="checkbox-group">
                        <div class="checkbox-item">
                            <input type="checkbox" id="kpi1" value="time-savings">
                            <label for="kpi1">Zeitersparnis (Stunden/Monat)</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="kpi2" value="cost-savings">
                            <label for="kpi2">Kosteneinsparung (CHF/Jahr)</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="kpi3" value="error-rate">
                            <label for="kpi3">Fehlerquote (%)</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="kpi4" value="processing-time">
                            <label for="kpi4">Durchlaufzeit (Tage)</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="kpi5" value="satisfaction">
                            <label for="kpi5">Mitarbeiterzufriedenheit</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="kpi6" value="automation-rate">
                            <label for="kpi6">Automatisierungsgrad (%)</label>
                        </div>
                    </div>
                </div>
                
                <div class="kpi-targets" style="margin-top: 1.5rem;">
                    <label>KPI-Zielwerte definieren:</label>
                    <div class="kpi-grid">
                        <div class="kpi-item">
                            <label>Zeitersparnis-Ziel (Std/Monat)</label>
                            <input type="number" id="targetTimeSavings" placeholder="z.B. 100">
                        </div>
                        <div class="kpi-item">
                            <label>Kosteneinsparung-Ziel (CHF/Jahr)</label>
                            <input type="number" id="targetCostSavings" placeholder="z.B. 50000">
                        </div>
                        <div class="kpi-item">
                            <label>Fehlerquote-Ziel (%)</label>
                            <input type="number" id="targetErrorRate" placeholder="z.B. 2" max="100">
                        </div>
                        <div class="kpi-item">
                            <label>Automatisierungsgrad-Ziel (%)</label>
                            <input type="number" id="targetAutomationRate" placeholder="z.B. 80" max="100">
                        </div>
                    </div>
                </div>
                
                <div class="form-group" style="margin-top: 1.5rem;">
                    <label>Review-Rhythmus:</label>
                    <select id="reviewCycle">
                        <option value="">Rhythmus wählen...</option>
                        <option value="weekly">Wöchentlich</option>
                        <option value="biweekly">Alle 2 Wochen</option>
                        <option value="monthly">Monatlich</option>
                        <option value="quarterly">Quartalsweise</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Kontinuierliche Verbesserung - nächste Schritte:</label>
                    <textarea id="nextSteps" rows="4" placeholder="Was sind die nächsten konkreten Schritte nach diesem Assessment?"></textarea>
                </div>
                
                <div class="summary-actions" style="margin-top: 2rem; padding: 1.5rem; background: rgba(16, 185, 129, 0.1); border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.3);">
                    <h3 style="color: #10b981; margin-bottom: 1rem;"><i class="fas fa-check-circle"></i> Workflow abschließen</h3>
                    <p style="color: rgba(255,255,255,0.8); margin-bottom: 1rem;">Sie haben alle 8 Schritte durchlaufen. Jetzt können Sie Ihre Ergebnisse exportieren.</p>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button type="button" class="btn btn-primary" onclick="exportWorkflowResults()">
                            <i class="fas fa-download"></i> Alle Ergebnisse exportieren
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="resetWorkflow()">
                            <i class="fas fa-redo"></i> Workflow zurücksetzen
                        </button>
                    </div>
                </div>
            </div>
        </div>
```

---

## AUFGABE 6: JavaScript-Funktionen hinzufügen

### Suche nach dem `<script>` Block am Ende der Datei und füge diese Funktionen hinzu (vor dem schließenden `</script>`):

```javascript
        // === NEUE FUNKTIONEN FÜR 8-SCHRITTE-WORKFLOW ===
        
        // Step 4: Canvas-Funktionen
        var step4CanvasCtx = null;
        var step4Drawing = false;
        var currentSketchColor = '#1f2937';
        var currentSketchWidth = 2;
        
        function initStep4Canvas() {
            var canvas = document.getElementById('step4Canvas');
            if (!canvas) return;
            step4CanvasCtx = canvas.getContext('2d');
            canvas.onmousedown = function(e) {
                step4Drawing = true;
                var r = canvas.getBoundingClientRect();
                step4CanvasCtx.beginPath();
                step4CanvasCtx.moveTo(e.clientX - r.left, e.clientY - r.top);
            };
            canvas.onmousemove = function(e) {
                if (!step4Drawing) return;
                var r = canvas.getBoundingClientRect();
                step4CanvasCtx.lineTo(e.clientX - r.left, e.clientY - r.top);
                step4CanvasCtx.stroke();
            };
            canvas.onmouseup = canvas.onmouseleave = function() {
                step4Drawing = false;
            };
            // Touch-Support für Mobile
            canvas.ontouchstart = function(e) {
                e.preventDefault();
                step4Drawing = true;
                var r = canvas.getBoundingClientRect();
                var touch = e.touches[0];
                step4CanvasCtx.beginPath();
                step4CanvasCtx.moveTo(touch.clientX - r.left, touch.clientY - r.top);
            };
            canvas.ontouchmove = function(e) {
                e.preventDefault();
                if (!step4Drawing) return;
                var r = canvas.getBoundingClientRect();
                var touch = e.touches[0];
                step4CanvasCtx.lineTo(touch.clientX - r.left, touch.clientY - r.top);
                step4CanvasCtx.stroke();
            };
            canvas.ontouchend = function() {
                step4Drawing = false;
            };
            step4CanvasCtx.strokeStyle = currentSketchColor;
            step4CanvasCtx.lineWidth = currentSketchWidth;
            step4CanvasCtx.lineCap = 'round';
        }
        
        function setSketchColor(color) {
            currentSketchColor = color;
            if (step4CanvasCtx) step4CanvasCtx.strokeStyle = color;
        }
        
        function setSketchWidth(width) {
            currentSketchWidth = width;
            if (step4CanvasCtx) step4CanvasCtx.lineWidth = width;
        }
        
        function clearStep4Canvas() {
            var canvas = document.getElementById('step4Canvas');
            if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        }
        
        function saveStep4Sketch() {
            var canvas = document.getElementById('step4Canvas');
            var process = document.getElementById('processToSketch').value || 'allgemein';
            if (canvas) {
                var dataUrl = canvas.toDataURL('image/png');
                localStorage.setItem('hrWorkflow_sketch_' + process, dataUrl);
                alert('Skizze für "' + process + '" gespeichert!');
            }
        }
        
        function loadProcessForSketching(processId) {
            if (!processId) return;
            var saved = localStorage.getItem('hrWorkflow_sketch_' + processId);
            if (saved) {
                var canvas = document.getElementById('step4Canvas');
                var ctx = canvas.getContext('2d');
                var img = new Image();
                img.onload = function() { ctx.drawImage(img, 0, 0); };
                img.src = saved;
            } else {
                clearStep4Canvas();
            }
        }
        
        // Step 5: Diktat-Funktionen
        var recognition = null;
        
        function startDictation() {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                alert('Spracherkennung wird von Ihrem Browser nicht unterstützt. Bitte tippen Sie die Beschreibung.');
                return;
            }
            var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.lang = 'de-DE';
            recognition.continuous = true;
            recognition.interimResults = true;
            
            recognition.onresult = function(event) {
                var textarea = document.getElementById('processDescription');
                var transcript = '';
                for (var i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                textarea.value = textarea.value + transcript;
            };
            
            recognition.onstart = function() {
                document.getElementById('startDictationBtn').style.display = 'none';
                document.getElementById('stopDictationBtn').style.display = 'inline-flex';
                document.getElementById('dictationStatus').textContent = '🔴 Aufnahme läuft...';
            };
            
            recognition.onend = function() {
                document.getElementById('startDictationBtn').style.display = 'inline-flex';
                document.getElementById('stopDictationBtn').style.display = 'none';
                document.getElementById('dictationStatus').textContent = '';
            };
            
            recognition.start();
        }
        
        function stopDictation() {
            if (recognition) recognition.stop();
        }
        
        function saveDictation() {
            var process = document.getElementById('processToDictate').value || 'allgemein';
            var text = document.getElementById('processDescription').value;
            localStorage.setItem('hrWorkflow_dictation_' + process, text);
            alert('Beschreibung für "' + process + '" gespeichert!');
        }
        
        // Step 6: BPMN-Generierung
        function generateBPMN() {
            var text = document.getElementById('processDescription').value || localStorage.getItem('hrWorkflow_dictation_allgemein') || '';
            if (!text.trim()) {
                alert('Bitte geben Sie zuerst in Schritt 5 eine Prozessbeschreibung ein.');
                return;
            }
            
            document.getElementById('bpmnSourceText').innerHTML = text.replace(/\n/g, '<br>');
            document.getElementById('bpmnGenerationStatus').style.display = 'block';
            document.getElementById('bpmnResult').style.display = 'none';
            
            // Versuche API-Aufruf (AWS API Gateway)
            var apiUrl = '/api/text-to-bpmn';
            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            })
            .then(function(response) { return response.json(); })
            .then(function(data) {
                document.getElementById('bpmnGenerationStatus').style.display = 'none';
                document.getElementById('bpmnResult').style.display = 'block';
                if (data && data.bpmnXml) {
                    document.getElementById('bpmnXmlOutput').textContent = data.bpmnXml;
                    localStorage.setItem('hrWorkflow_bpmn', data.bpmnXml);
                } else {
                    showFallbackBPMN(text);
                }
            })
            .catch(function() {
                showFallbackBPMN(text);
            });
        }
        
        function showFallbackBPMN(text) {
            document.getElementById('bpmnGenerationStatus').style.display = 'none';
            document.getElementById('bpmnResult').style.display = 'block';
            var fallbackXml = '<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">\n  <bpmn:process id="Process_1" isExecutable="true">\n    <bpmn:startEvent id="StartEvent_1" name="Start"/>\n    <bpmn:task id="Task_1" name="' + text.substring(0, 50).replace(/[<>"]/g, '') + '..."/>\n    <bpmn:endEvent id="EndEvent_1" name="Ende"/>\n  </bpmn:process>\n</bpmn:definitions>';
            document.getElementById('bpmnXmlOutput').textContent = fallbackXml;
            localStorage.setItem('hrWorkflow_bpmn', fallbackXml);
        }
        
        function downloadBPMN() {
            var xml = document.getElementById('bpmnXmlOutput').textContent;
            var blob = new Blob([xml], { type: 'application/xml' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'hr-prozess.bpmn';
            a.click();
            URL.revokeObjectURL(url);
        }
        
        function copyBPMN() {
            var xml = document.getElementById('bpmnXmlOutput').textContent;
            navigator.clipboard.writeText(xml).then(function() {
                alert('BPMN-XML in Zwischenablage kopiert!');
            });
        }
        
        // Step 8: Export & Reset
        function exportWorkflowResults() {
            var results = {
                timestamp: new Date().toISOString(),
                sketches: {},
                dictations: {},
                bpmn: localStorage.getItem('hrWorkflow_bpmn'),
                formData: {}
            };
            
            // Alle Sketches und Dictations sammeln
            for (var key in localStorage) {
                if (key.startsWith('hrWorkflow_sketch_')) {
                    results.sketches[key.replace('hrWorkflow_sketch_', '')] = localStorage.getItem(key);
                }
                if (key.startsWith('hrWorkflow_dictation_')) {
                    results.dictations[key.replace('hrWorkflow_dictation_', '')] = localStorage.getItem(key);
                }
            }
            
            // Formular-Daten sammeln
            var inputs = document.querySelectorAll('input, select, textarea');
            inputs.forEach(function(input) {
                if (input.id && input.value) {
                    results.formData[input.id] = input.type === 'checkbox' ? input.checked : input.value;
                }
            });
            
            var blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'hr-automation-workflow-results.json';
            a.click();
            URL.revokeObjectURL(url);
        }
        
        function resetWorkflow() {
            if (confirm('Möchten Sie wirklich alle Daten zurücksetzen? Dies kann nicht rückgängig gemacht werden.')) {
                // Alle hrWorkflow_ Einträge löschen
                for (var key in localStorage) {
                    if (key.startsWith('hrWorkflow_')) {
                        localStorage.removeItem(key);
                    }
                }
                location.reload();
            }
        }
        
        // Canvas initialisieren wenn Schritt 4 aktiv wird
        document.addEventListener('DOMContentLoaded', function() {
            // Original init...
            
            // Neuen Canvas initialisieren beim Schrittwechsel
            var originalShowStep = window.showStep;
            window.showStep = function(step) {
                if (typeof originalShowStep === 'function') originalShowStep(step);
                if (step === 4) {
                    setTimeout(initStep4Canvas, 100);
                }
                if (step === 6) {
                    // Lade Diktat-Text in BPMN-Ansicht
                    var savedText = localStorage.getItem('hrWorkflow_dictation_allgemein') || document.getElementById('processDescription').value || '';
                    if (savedText) {
                        document.getElementById('bpmnSourceText').innerHTML = savedText.replace(/\n/g, '<br>');
                    }
                }
            };
        });
```

---

## AUFGABE 7: Navigation-JavaScript anpassen

### Suche nach der `showStep` Funktion und stelle sicher, dass sie 8 Schritte unterstützt:

Die `totalSteps` Variable muss auf 8 gesetzt werden. Suche nach:
```javascript
var totalSteps = 7;
```
Ersetze durch:
```javascript
var totalSteps = 8;
```

---

## AUFGABE 8: CloudFront Cache invalidieren

Nach allen Änderungen, führe diese Befehle aus:
```bash
cd "/Users/manumanera/Documents/GitHub/Persönliche Website"
aws s3 cp hr-automation-workflow.html s3://manuel-weiss-website/
aws cloudfront create-invalidation --distribution-id E1234EXAMPLE --paths "/hr-automation-workflow.html" "/*"
```

---

## Zusammenfassung der Änderungen

| Datei | Änderung |
|-------|----------|
| hr-automation-workflow.html | Progress-Tabs auf 8 Schritte erweitert |
| hr-automation-workflow.html | Schritt 4: Prozess-Zeichnen (Canvas) |
| hr-automation-workflow.html | Schritt 5: Spracheingabe/Diktat |
| hr-automation-workflow.html | Schritt 6: BPMN-Generierung |
| hr-automation-workflow.html | Schritt 7: Umsetzung |
| hr-automation-workflow.html | Schritt 8: Monitoring & KPIs |
| hr-automation-workflow.html | JavaScript-Funktionen für alle neuen Features |

## Wichtige Hinweise

1. **Touch-Support:** Der Canvas unterstützt auch Touch-Geräte (Tablets, Smartphones)
2. **Lokale Speicherung:** Alle Daten werden im localStorage gespeichert
3. **BPMN-API:** Nutzt den AWS API-Gateway-Endpunkt `/api/text-to-bpmn` (z. B. Lambda + SES), mit lokalem Fallback
4. **Export:** Schritt 8 ermöglicht Export aller Ergebnisse als JSON
