// =================== BEWERBUNGS-WORKFLOW STEP 1 ===================
// Profil erstellen und validieren

window.generateStep1 = function() {
    return `
        <div class="step-content">
            <div class="step-header">
                <h2 style="margin: 0 0 1rem; color: #1f2937; display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas fa-user-circle" style="color: #3b82f6; font-size: 2rem;"></i>
                    Schritt 1: Bewerbungsprofil erstellen
                </h2>
                <p style="color: #6b7280; font-size: 1.1rem; margin: 0;">
                    Erstellen Sie Ihr persönliches Profil für optimale Bewerbungsautomatisierung
                </p>
            </div>

            <div class="profile-form-container" style="background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <form id="workflowProfileForm">
                    <!-- Persönliche Daten -->
                    <div class="form-section" style="margin-bottom: 2rem;">
                        <h3 style="color: #374151; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-user" style="color: #10b981;"></i>
                            Persönliche Daten
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Vorname *</label>
                                <input type="text" id="wfFirstName" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Nachname *</label>
                                <input type="text" id="wfLastName" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;">
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">E-Mail *</label>
                                <input type="email" id="wfEmail" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Telefon</label>
                                <input type="tel" id="wfPhone" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;">
                            </div>
                        </div>
                    </div>

                    <!-- Berufserfahrung -->
                    <div class="form-section" style="margin-bottom: 2rem;">
                        <h3 style="color: #374151; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-briefcase" style="color: #f59e0b;"></i>
                            Aktuelle Position
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Position *</label>
                                <input type="text" id="wfCurrentPosition" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;" placeholder="z.B. Softwareentwickler">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Unternehmen *</label>
                                <input type="text" id="wfCurrentCompany" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;" placeholder="z.B. Tech Corp GmbH">
                            </div>
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Berufserfahrung (Jahre)</label>
                            <select id="wfExperienceYears" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;">
                                <option value="">Bitte wählen...</option>
                                <option value="0-1">0-1 Jahre</option>
                                <option value="1-3">1-3 Jahre</option>
                                <option value="3-5">3-5 Jahre</option>
                                <option value="5-10">5-10 Jahre</option>
                                <option value="10+">10+ Jahre</option>
                            </select>
                        </div>
                    </div>

                    <!-- Fähigkeiten -->
                    <div class="form-section" style="margin-bottom: 2rem;">
                        <h3 style="color: #374151; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-cogs" style="color: #8b5cf6;"></i>
                            Hauptfähigkeiten
                        </h3>
                        
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Technische Fähigkeiten</label>
                            <input type="text" id="wfTechnicalSkills" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;" placeholder="z.B. JavaScript, Python, React, Node.js">
                            <small style="color: #6b7280; font-size: 0.875rem;">Trennen Sie Fähigkeiten mit Kommas</small>
                        </div>
                    </div>

                    <!-- Karriereziele -->
                    <div class="form-section" style="margin-bottom: 2rem;">
                        <h3 style="color: #374151; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-target" style="color: #ef4444;"></i>
                            Karriereziele
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Gewünschte Position</label>
                                <input type="text" id="wfDesiredPosition" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;" placeholder="z.B. Senior Developer">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Bevorzugte Branche</label>
                                <select id="wfDesiredIndustry" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;">
                                    <option value="">Bitte wählen...</option>
                                    <option value="it">IT & Software</option>
                                    <option value="finance">Finanzwesen</option>
                                    <option value="healthcare">Gesundheitswesen</option>
                                    <option value="education">Bildung</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="consulting">Beratung</option>
                                    <option value="manufacturing">Produktion</option>
                                    <option value="retail">Einzelhandel</option>
                                    <option value="other">Sonstige</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Auth Status -->
                    <div id="authStatusSection" style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; border: 1px solid #e5e7eb;">
                        <div id="authStatusContent">
                            <!-- Wird dynamisch gefüllt -->
                        </div>
                    </div>

                    <!-- Actions -->
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 2rem; border-top: 1px solid #e5e7eb;">
                        <button type="button" onclick="closeSmartWorkflow()" style="
                            background: #6b7280; color: white; border: none;
                            padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;
                            font-weight: 500;
                        ">
                            <i class="fas fa-times"></i> Abbrechen
                        </button>
                        
                        <button type="submit" style="
                            background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none;
                            padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer;
                            font-weight: 600; font-size: 1rem;
                        ">
                            <i class="fas fa-arrow-right"></i> Weiter zu Schritt 2
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

// Step 1 Event Handler
window.handleStep1Submit = function(formData) {
    console.log('📋 Step 1 Daten:', formData);
    
    // Daten in globales Workflow-Objekt speichern
    window.bewerbungData.profile = {
        personal: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone
        },
        currentPosition: {
            position: formData.currentPosition,
            company: formData.currentCompany,
            experienceYears: formData.experienceYears
        },
        skills: {
            technical: formData.technicalSkills ? formData.technicalSkills.split(',').map(s => s.trim()) : []
        },
        careerGoals: {
            desiredPosition: formData.desiredPosition,
            desiredIndustry: formData.desiredIndustry
        }
    };
    
    console.log('✅ Step 1 Daten gespeichert');
    return true;
};

// Step 1 Initialisierung
window.initStep1 = function() {
    console.log('🚀 Step 1 wird initialisiert...');
    
    // Auth Status prüfen und anzeigen
    updateAuthStatus();
    
    // Form Event Listener
    const form = document.getElementById('workflowProfileForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                firstName: document.getElementById('wfFirstName')?.value,
                lastName: document.getElementById('wfLastName')?.value,
                email: document.getElementById('wfEmail')?.value,
                phone: document.getElementById('wfPhone')?.value,
                currentPosition: document.getElementById('wfCurrentPosition')?.value,
                currentCompany: document.getElementById('wfCurrentCompany')?.value,
                experienceYears: document.getElementById('wfExperienceYears')?.value,
                technicalSkills: document.getElementById('wfTechnicalSkills')?.value,
                desiredPosition: document.getElementById('wfDesiredPosition')?.value,
                desiredIndustry: document.getElementById('wfDesiredIndustry')?.value
            };
            
            // Validierung
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.currentPosition || !formData.currentCompany) {
                alert('❌ Bitte füllen Sie alle Pflichtfelder aus.');
                return;
            }
            
            // Daten verarbeiten
            if (window.handleStep1Submit(formData)) {
                // Weiter zu Schritt 2
                nextWorkflowStep(2);
            }
        });
    }
};

function updateAuthStatus() {
    const authStatusContent = document.getElementById('authStatusContent');
    if (!authStatusContent) return;
    
    // Prüfe Auth Status
    if (window.realUserAuth && window.realUserAuth.isAuthenticated()) {
        const user = window.realUserAuth.getCurrentUser();
        authStatusContent.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="color: #10b981; font-size: 1.5rem;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div>
                    <h4 style="margin: 0; color: #374151;">Angemeldet als: ${user.name || user.email}</h4>
                    <p style="margin: 0.25rem 0 0; color: #6b7280; font-size: 0.875rem;">
                        Ihr Profil wird automatisch mit Ihrem Account verknüpft
                    </p>
                </div>
            </div>
        `;
    } else {
        authStatusContent.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="color: #f59e0b; font-size: 1.5rem;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div>
                    <h4 style="margin: 0; color: #374151;">Nicht angemeldet</h4>
                    <p style="margin: 0.25rem 0 0; color: #6b7280; font-size: 0.875rem;">
                        <button onclick="window.realUserAuth.showLoginModal()" style="
                            background: #3b82f6; color: white; border: none;
                            padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;
                            font-size: 0.875rem;
                        ">
                            <i class="fas fa-sign-in-alt"></i> Anmelden
                        </button>
                        für automatisches Speichern
                    </p>
                </div>
            </div>
        `;
    }
}

// Auto-initialize Step 1
if (window.bewerbungData && window.bewerbungData.currentStep === 1) {
    setTimeout(() => {
        initStep1();
    }, 100);
}

console.log('✅ Step 1 Modul geladen');










