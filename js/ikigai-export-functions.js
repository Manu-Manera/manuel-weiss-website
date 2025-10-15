</html>\`;
        }

        function generateWordContent(data) {
            // Simplified Word document content
            return generatePDFContent(data);
        }

        function generateCSVContent(data) {
            let csv = 'Frage,Antwort\n';
            csv += `"Erstellt am","${data.date}"\n`;
            csv += `"Fortschritt","${data.completionPercentage}%"\n`;
            csv += `"Zeit investiert","${data.timeSpent}"\n\n`;
            
            csv += '"=== SCHRITT 1: LEBENSVISION ====",""\n';
            csv += `"Lebensvision & Vermächtnis","${data.steps.step1.data.lifeVision || ''}"\n`;
            csv += `"Was würdest du am meisten bedauern?","${data.steps.step1.data.regretQuestion || ''}"\n`;
            csv += `"Mit unbegrenzten Ressourcen","${data.steps.step1.data.unlimitedResources || ''}"\n`;
            csv += `"Grabstein-Wörter","${data.steps.step1.data.legacyWords || ''}"\n`;
            csv += `"Zeitkapsel für Enkelkinder","${data.steps.step1.data.timeCapsule || ''}"\n`;
            csv += `"Geschenk an die Welt","${data.steps.step1.data.giftToWorld || ''}"\n\n`;
            
            csv += '"=== SCHRITT 2: LEIDENSCHAFTEN ====",""\n';
            csv += `"Kreative Aktivitäten","${data.steps.step2.data.creativeActivities || ''}"\n`;
            csv += `"Lernbereiche","${data.steps.step2.data.learningAreas || ''}"\n`;
            csv += `"Körperliche Aktivitäten","${data.steps.step2.data.physicalActivities || ''}"\n`;
            csv += `"Soziale Aktivitäten","${data.steps.step2.data.socialActivities || ''}"\n`;
            csv += `"Kindheits-Leidenschaft","${data.steps.step2.data.childhoodPassion || ''}"\n`;
            csv += `"Freier Tag","${data.steps.step2.data.freeDayPassion || ''}"\n`;
            csv += `"Leidenschaft als Beruf","${data.steps.step2.data.passionAsCareer || ''}"\n`;
            csv += `"Neugier-Passion","${data.steps.step2.data.curiosityPassion || ''}"\n`;
            csv += `"Flow-Passion","${data.steps.step2.data.flowPassion || ''}"\n`;
            
            return csv;
        }
        
        function updateIkigaiStep() {
            console.log('Updating to step:', currentIkigaiStep);
            
            // Hide all steps
            document.querySelectorAll('.workflow-step').forEach(step => {
                step.classList.remove('active');
            });
            
            // Show current step
            const currentStepElement = document.querySelector(`.workflow-step:nth-child(${currentIkigaiStep})`);
            if (currentStepElement) {
                currentStepElement.classList.add('active');
                console.log('Activated step element:', currentStepElement);
            }
            
            // Update progress indicators
            document.querySelectorAll('.progress-step').forEach((step, index) => {
                const stepNumber = index + 1;
                step.classList.remove('active', 'completed');
                
                if (stepNumber === currentIkigaiStep) {
                    step.classList.add('active');
                } else if (stepNumber < currentIkigaiStep) {
                    step.classList.add('completed');
                }
            });
            
            // Update navigation buttons
            const prevBtn = document.getElementById('prev-step');
            const nextBtn = document.getElementById('next-step');
            const saveBtn = document.getElementById('save-progress');
            
            if (prevBtn) {
                prevBtn.disabled = currentIkigaiStep === 1;
            }
            
            if (nextBtn && saveBtn) {
                if (currentIkigaiStep === totalIkigaiSteps) {
                    nextBtn.style.display = 'none';
                    saveBtn.style.display = 'inline-block';
                } else {
                    nextBtn.style.display = 'inline-block';
                    saveBtn.style.display = 'none';
                }
            }
            
            // Scroll to Ikigai workflow section
            const ikigaiSection = document.getElementById('ikigai-workflow');
            if (ikigaiSection) {
                ikigaiSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                // Fallback to top if section not found
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
        
        // Progress Save System with Detailed Tracking
        function saveIkigaiProgress() {
            const progressData = {
                currentStep: currentIkigaiStep,
                timestamp: new Date().toISOString(),
                stepData: {},
                completionPercentage: Math.round((currentIkigaiStep / totalIkigaiSteps) * 100),
                timeSpent: calculateTimeSpent(),
                lastUpdated: new Date().toLocaleString('de-DE')
            };

            // Collect all form data
            document.querySelectorAll('textarea, input[type="text"], input[type="range"], input[type="checkbox"]').forEach(input => {
                if (input.id && input.value) {
                    progressData.stepData[input.id] = input.value;
                }
            });

            // Save to localStorage
            localStorage.setItem('ikigaiProgress', JSON.stringify(progressData));
            
            // Show save confirmation
            showSaveNotification();
            
            console.log('Ikigai progress saved:', progressData);
        }

        function loadIkigaiProgress() {
            const savedProgress = localStorage.getItem('ikigaiProgress');
            if (savedProgress) {
                const progressData = JSON.parse(savedProgress);
                currentIkigaiStep = progressData.currentStep || 1;
                
                // Restore form data
                Object.keys(progressData.stepData).forEach(inputId => {
                    const input = document.getElementById(inputId);
                    if (input) {
                        input.value = progressData.stepData[inputId];
                    }
                });
                
                updateIkigaiStep();
                showLoadNotification(progressData);
            }
        }

        function calculateTimeSpent() {
            const startTime = localStorage.getItem('ikigaiStartTime');
            if (startTime) {
                const timeDiff = Date.now() - parseInt(startTime);
                const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                return `${hours}h ${minutes}m`;
            }
            return '0h 0m';
        }

        function showSaveNotification() {
            const notification = document.createElement('div');
            notification.className = 'save-notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-check-circle"></i>
                    <span>Fortschritt gespeichert!</span>
                </div>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }

        function showLoadNotification(progressData) {
            const notification = document.createElement('div');
            notification.className = 'load-notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-history"></i>
                    <span>Fortschritt geladen: ${progressData.completionPercentage}% abgeschlossen</span>
                </div>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 4000);
        }

        // Auto-save every 30 seconds
        setInterval(saveIkigaiProgress, 30000);

        // Save on input changes
        document.addEventListener('input', function(e) {
            if (e.target.matches('textarea, input[type="text"], input[type="range"], input[type="checkbox"]')) {
                setTimeout(saveIkigaiProgress, 1000); // Debounced save
            }
        });

        // Reminder System
        function setupReminderSystem() {
            // Check if user wants reminders
            const reminderSettings = JSON.parse(localStorage.getItem('ikigaiReminderSettings') || '{}');
            
            if (reminderSettings.enabled) {
                scheduleReminders(reminderSettings);
            }
        }

        function showReminderSettings() {
            const modal = document.createElement('div');
            modal.className = 'reminder-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>🔔 Erinnerungen einrichten</h3>
                        <button class="close-btn" data-action="close-reminder-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="reminder-option">
                            <label>
                                <input type="checkbox" id="enable-reminders">
                                Erinnerungen aktivieren
                            </label>
                        </div>
                        <div class="reminder-option">
                            <label>Erinnerungsintervall:</label>
                            <select id="reminder-interval">
                                <option value="daily">Täglich</option>
                                <option value="weekly">Wöchentlich</option>
                                <option value="biweekly">Alle 2 Wochen</option>
                                <option value="monthly">Monatlich</option>
                            </select>
                        </div>
                        <div class="reminder-option">
                            <label>Erinnerungszeit:</label>
                            <input type="time" id="reminder-time" value="09:00">
                        </div>
                        <div class="reminder-option">
                            <label>Erinnerungstext:</label>
                            <textarea id="reminder-message" placeholder="Deine persönliche Erinnerungsnachricht...">Es ist Zeit, an deinem Ikigai zu arbeiten! 🌟</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" data-action="save-reminder-settings">Speichern</button>
                        <button class="btn btn-secondary" data-action="close-reminder-modal">Abbrechen</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        function saveReminderSettings() {
            const settings = {
                enabled: document.getElementById('enable-reminders').checked,
                interval: document.getElementById('reminder-interval').value,
                time: document.getElementById('reminder-time').value,
                message: document.getElementById('reminder-message').value
            };
            
            localStorage.setItem('ikigaiReminderSettings', JSON.stringify(settings));
            
            if (settings.enabled) {
                scheduleReminders(settings);
                showNotification('Erinnerungen wurden eingerichtet!', 'success');
            } else {
                clearReminders();
                showNotification('Erinnerungen wurden deaktiviert.', 'info');
            }
            
            closeReminderModal();
        }

        function scheduleReminders(settings) {
            clearReminders();
            
            const now = new Date();
            const reminderTime = new Date();
            const [hours, minutes] = settings.time.split(':');
            reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            // If time has passed today, schedule for tomorrow
            if (reminderTime <= now) {
                reminderTime.setDate(reminderTime.getDate() + 1);
            }
            
            const intervalMs = getIntervalMs(settings.interval);
            
            const reminderId = setInterval(() => {
                showReminderNotification(settings.message);
                // Reschedule for next interval
                setTimeout(() => scheduleReminders(settings), intervalMs);
            }, reminderTime.getTime() - now.getTime());
            
            localStorage.setItem('ikigaiReminderId', reminderId.toString());
        }

        function getIntervalMs(interval) {
            switch (interval) {
                case 'daily': return 24 * 60 * 60 * 1000;
                case 'weekly': return 7 * 24 * 60 * 60 * 1000;
                case 'biweekly': return 14 * 24 * 60 * 60 * 1000;
                case 'monthly': return 30 * 24 * 60 * 60 * 1000;
                default: return 24 * 60 * 60 * 1000;
            }
        }

        function clearReminders() {
            const reminderId = localStorage.getItem('ikigaiReminderId');
            if (reminderId) {
                clearInterval(parseInt(reminderId));
                localStorage.removeItem('ikigaiReminderId');
            }
        }

        function showReminderNotification(message) {
            if (Notification.permission === 'granted') {
                new Notification('Ikigai-Workflow Erinnerung', {
                    body: message,
                    icon: '/favicon.ico',
                    tag: 'ikigai-reminder'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        showReminderNotification(message);
                    }
                });
            }
        }

        function closeReminderModal() {
            const modal = document.querySelector('.reminder-modal');
            if (modal) {
                document.body.removeChild(modal);
            }
        }

        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }, 4000);
        }

        // Method Navigation Functions
        function scrollToSection(sectionId) {
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        function showMethodModal(methodId) {
            const methodData = getMethodData(methodId);
            const modal = document.createElement('div');
            modal.className = 'method-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="method-icon-large">
                            <i class="${methodData.icon}"></i>
                        </div>
                        <h3>${methodData.title}</h3>
                        <button class="close-btn" data-action="close-method-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p class="method-description">${methodData.description}</p>
                        
                        <div class="method-details">
                            <h4>Was erwartet dich:</h4>
                            <ul class="method-features-list">
                                ${methodData.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="method-benefits">
                            <h4>Nutzen für dich:</h4>
                            <ul class="benefits-list">
                                ${methodData.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="method-duration">
                            <div class="duration-info">
                                <i class="fas fa-clock"></i>
                                <span>Geschätzte Dauer: ${methodData.duration}</span>
                            </div>
                            <div class="difficulty-info">
                                <i class="fas fa-signal"></i>
                                <span>Schwierigkeit: ${methodData.difficulty}</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" data-action="start-method" data-param="${methodId}">Jetzt starten</button>
                        <button class="btn btn-secondary" data-action="close-method-modal">Schließen</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        function getMethodData(methodId) {
            const methods = {
                'values-clarification': {
                    title: 'Werte-Klärung',
                    icon: 'fas fa-heart',
                    description: 'Identifiziere deine persönlichen Werte und schaffe Klarheit darüber, was dir im Leben wirklich wichtig ist. Diese Methode hilft dir, Entscheidungen zu treffen, die mit deinen tiefsten Überzeugungen übereinstimmen.',
                    features: [
                        'Werte-Ranking und Priorisierung',
                        'Konflikt-Analyse zwischen Werten',
                        'Anwendung auf verschiedene Lebensbereiche',
                        'Entwicklung eines Werte-Kompasses'
                    ],
                    benefits: [
                        'Klarheit über deine Prioritäten',
                        'Bessere Entscheidungsfindung',
                        'Mehr Authentizität im Leben',
                        'Reduzierte innere Konflikte'
                    ],
                    duration: '45-60 Minuten',
                    difficulty: 'Mittel'
                },
                'strengths-finder': {
                    title: 'Stärken-Analyse',
                    icon: 'fas fa-star',
                    description: 'Entdecke deine natürlichen Talente und Stärken. Lerne, wie du sie optimal einsetzen kannst, um deine Ziele zu erreichen und dein Potenzial voll auszuschöpfen.',
                    features: [
                        'Gallup StrengthsFinder Integration',
                        'VIA Character Strengths Test',
                        'Persönlicher Entwicklungsplan',
                        'Stärken-basierte Zielsetzung'
                    ],
                    benefits: [
                        'Bewusstsein für deine Talente',
                        'Fokus auf Stärken statt Schwächen',
                        'Höhere Motivation und Engagement',
                        'Bessere Karriere-Entscheidungen'
                    ],
                    duration: '60-90 Minuten',
                    difficulty: 'Einfach'
                },
                'goal-setting': {
                    title: 'Ziel-Setting',
                    icon: 'fas fa-bullseye',
                    description: 'Setze dir klare, erreichbare Ziele mit der bewährten SMART-Methode und entwickle einen konkreten Aktionsplan für deren Umsetzung.',
                    features: [
                        'SMART-Ziele Formulierung',
                        'Ziel-Hierarchie und Priorisierung',
                        'Aktionsplan-Erstellung',
                        'Fortschritts-Tracking System'
                    ],
                    benefits: [
                        'Klarheit über deine Ziele',
                        'Höhere Erfolgswahrscheinlichkeit',
                        'Bessere Motivation und Fokus',
                        'Messbare Fortschritte'
                    ],
                    duration: '30-45 Minuten',
                    difficulty: 'Einfach'
                },
                'mindfulness': {
                    title: 'Achtsamkeit & Meditation',
                    icon: 'fas fa-leaf',
                    description: 'Entwickle Achtsamkeit und innere Ruhe durch geführte Meditationen und praktische Achtsamkeitsübungen für den Alltag.',
                    features: [
                        'Geführte Meditationen (5-30 Min)',
                        'Achtsamkeitsübungen für den Alltag',
                        'Stress-Reduktions-Techniken',
                        'Atemübungen und Body-Scan'
                    ],
                    benefits: [
                        'Reduzierter Stress und Ängste',
                        'Verbesserte Konzentration',
                        'Bessere emotionale Regulation',
                        'Mehr Gelassenheit im Alltag'
                    ],
                    duration: 'Flexibel (5-30 Min pro Session)',
                    difficulty: 'Einfach'
                },
                'emotional-intelligence': {
                    title: 'Emotionale Intelligenz',
                    icon: 'fas fa-brain',
                    description: 'Verbessere deine emotionale Intelligenz und lerne, Emotionen besser zu verstehen, zu regulieren und in Beziehungen einzusetzen.',
                    features: [
                        'EQ-Assessment und Selbsteinschätzung',
                        'Emotionsregulation-Techniken',
                        'Empathie-Training',
                        'Soziale Kompetenz-Übungen'
                    ],
                    benefits: [
                        'Bessere Selbstwahrnehmung',
                        'Verbesserte Beziehungen',
                        'Höhere Führungskompetenz',
                        'Mehr emotionale Stabilität'
                    ],
                    duration: '90-120 Minuten',
                    difficulty: 'Mittel'
                },
                'habit-building': {
                    title: 'Gewohnheiten aufbauen',
                    icon: 'fas fa-sync-alt',
                    description: 'Lerne, positive Gewohnheiten zu entwickeln und schlechte zu durchbrechen mit bewährten Methoden aus der Verhaltenspsychologie.',
                    features: [
                        'Habit-Stacking Technik',
                        '21-Tage-Challenge System',
                        'Gewohnheits-Tracking',
                        'Umgebungs-Design für Erfolg'
                    ],
                    benefits: [
                        'Konsistente positive Veränderungen',
                        'Automatisierung guter Verhaltensweisen',
                        'Höhere Selbstdisziplin',
                        'Langfristige Lebensverbesserung'
                    ],
                    duration: '30-60 Minuten Setup + tägliche Praxis',
                    difficulty: 'Mittel'
                },
                'communication': {
                    title: 'Kommunikation',
                    icon: 'fas fa-comments',
                    description: 'Verbessere deine Kommunikationsfähigkeiten und lerne, effektiver zu kommunizieren, zuzuhören und Konflikte zu lösen.',
                    features: [
                        'Aktives Zuhören Training',
                        'Nonverbale Kommunikation',
                        'Konfliktlösungs-Strategien',
                        'Präsentations- und Rhetorik-Übungen'
                    ],
                    benefits: [
                        'Bessere Beziehungen',
                        'Höhere Überzeugungskraft',
                        'Weniger Missverständnisse',
                        'Professionellerer Auftritt'
                    ],
                    duration: '60-90 Minuten',
                    difficulty: 'Mittel'
                },
                'time-management': {
                    title: 'Zeitmanagement',
                    icon: 'fas fa-clock',
                    description: 'Optimiere dein Zeitmanagement und lerne, produktiver und effizienter zu arbeiten mit bewährten Techniken und Tools.',
                    features: [
                        'Pomodoro-Technik',
                        'Eisenhower-Matrix',
                        'Priorisierungs-Methoden',
                        'Produktivitäts-Tracking'
                    ],
                    benefits: [
                        'Höhere Produktivität',
                        'Bessere Work-Life-Balance',
                        'Weniger Stress',
                        'Mehr Zeit für wichtige Dinge'
                    ],
                    duration: '45-60 Minuten',
                    difficulty: 'Einfach'
                }
            };
            return methods[methodId] || methods['values-clarification'];
        }

        function startMethod(methodId) {
            // Hier würde die jeweilige Methode gestartet werden
            showNotification(`${getMethodData(methodId).title} wird bald verfügbar sein!`, 'info');
            closeMethodModal();
        }

        function closeMethodModal() {
            const modal = document.querySelector('.method-modal');
            if (modal) {
                document.body.removeChild(modal);
            }
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Ikigai navigation initialized');
            
            // Set start time if not exists
            if (!localStorage.getItem('ikigaiStartTime')) {
                localStorage.setItem('ikigaiStartTime', Date.now().toString());
            }
            
            // Load existing progress
            loadIkigaiProgress();
            
            // Setup reminder system
            setupReminderSystem();
            
            updateIkigaiStep();
        });
    </script>
    
    <!-- Translation Manager -->
    <script src="js/translation-manager.js"></script>
    <script src="js/global-auth-system.js"></script>
</body>
</html>
