// =================== ADMIN PANEL BEWERBUNGSPROFIL INTEGRATION ===================
// Erweitert das Adminpanel um Bewerbungsprofil-Management

class AdminBewerbungsprofilManager {
    constructor() {
        this.profiles = [];
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    async init() {
        console.log('🚀 Admin Bewerbungsprofil Manager wird initialisiert...');
        
        // Auth Status prüfen
        await this.checkAuthStatus();
        
        // Event Listeners setup
        this.setupEventListeners();
        
        // Profile laden falls Admin
        if (this.isAuthenticated && this.isAdmin()) {
            await this.loadAllProfiles();
        }
    }

    async checkAuthStatus() {
        try {
            if (window.realUserAuth && window.realUserAuth.isAuthenticated()) {
                this.currentUser = window.realUserAuth.getCurrentUser();
                this.isAuthenticated = true;
                console.log('✅ Admin User ist authentifiziert:', this.currentUser);
            } else {
                console.log('⚠️ Admin User nicht authentifiziert');
            }
        } catch (error) {
            console.error('❌ Admin Auth-Status-Check fehlgeschlagen:', error);
        }
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    async loadAllProfiles() {
        try {
            console.log('📋 Lade alle Bewerbungsprofile...');
            
            const response = await fetch('/api/applications/profiles', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                this.profiles = result.profiles || [];
                this.renderProfilesTable();
                console.log('✅ Profile erfolgreich geladen:', this.profiles.length);
            } else {
                console.error('❌ Fehler beim Laden der Profile:', response.statusText);
            }
        } catch (error) {
            console.error('❌ API-Fehler beim Laden der Profile:', error);
        }
    }

    renderProfilesTable() {
        const container = document.getElementById('bewerbungsprofile-container');
        if (!container) return;

        container.innerHTML = `
            <div style="
                background: white; border-radius: 16px; padding: 2rem;
                margin: 2rem 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                border: 1px solid #e5e7eb;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="margin: 0; color: #1f2937; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-file-alt" style="color: #3b82f6;"></i>
                        Bewerbungsprofile
                        <span id="profile-count-badge" style="
                            background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem;
                            border-radius: 12px; font-size: 0.875rem; font-weight: 600;
                        ">${this.profiles.length}</span>
                    </h2>
                    
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <button id="refresh-profiles-btn" style="
                            background: #6b7280; color: white; border: none;
                            padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;
                            display: flex; align-items: center; gap: 0.5rem;
                        ">
                            <i class="fas fa-sync"></i> Aktualisieren
                        </button>
                        <button id="export-profiles-btn" style="
                            background: #10b981; color: white; border: none;
                            padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;
                            font-weight: 600; display: flex; align-items: center; gap: 0.5rem;
                        ">
                            <i class="fas fa-download"></i> Export
                        </button>
                    </div>
                </div>
                
                <!-- Profile Stats Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;" id="profile-stats-cards">
                    ${this.getProfileStatsCardsHTML()}
                </div>
                
                <!-- Profiles Table -->
                <div style="
                    background: white; border-radius: 12px; overflow: hidden;
                    border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                ">
                    <div style="
                        background: #f9fafb; padding: 1rem 1.5rem; border-bottom: 1px solid #e5e7eb;
                        display: flex; justify-content: space-between; align-items: center;
                    ">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <input type="checkbox" id="select-all-profiles" style="
                                width: 18px; height: 18px; cursor: pointer;
                            ">
                            <span style="font-weight: 600; color: #374151;">Alle Profile</span>
                        </div>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <select id="profile-sort-field" style="
                                padding: 0.5rem; border: 1px solid #d1d5db;
                                border-radius: 4px; font-size: 0.875rem;
                            ">
                                <option value="createdAt">Nach Erstellung</option>
                                <option value="updatedAt">Nach Aktualisierung</option>
                                <option value="name">Nach Name</option>
                                <option value="email">Nach E-Mail</option>
                                <option value="completeness">Nach Vollständigkeit</option>
                            </select>
                        </div>
                    </div>
                    
                    <div id="profiles-table-container" style="max-height: 600px; overflow-y: auto;">
                        ${this.getProfilesTableHTML()}
                    </div>
                </div>
                
                <!-- Profile Details Modal -->
                <div id="profile-details-modal" style="
                    display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.7); z-index: 10000;
                    align-items: center; justify-content: center; padding: 2rem;
                ">
                    <div style="
                        background: white; border-radius: 16px; padding: 2rem;
                        max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;
                        position: relative;
                    ">
                        <button onclick="window.adminBewerbungsprofilManager.closeModal()" style="
                            position: absolute; top: 1rem; right: 1rem;
                            background: #f3f4f6; border: none; padding: 0.5rem;
                            border-radius: 6px; cursor: pointer;
                        ">
                            <i class="fas fa-times"></i>
                        </button>
                        
                        <div id="profile-details-content">
                            <!-- Profile details will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Event Listeners für die neue UI
        this.setupProfileEventListeners();
    }

    getProfileStatsCardsHTML() {
        const totalProfiles = this.profiles.length;
        const completeProfiles = this.profiles.filter(p => this.calculateCompleteness(p) >= 80).length;
        const recentProfiles = this.profiles.filter(p => {
            const daysSinceUpdate = (Date.now() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceUpdate <= 7;
        }).length;
        const avgCompleteness = totalProfiles > 0 ? 
            Math.round(this.profiles.reduce((sum, p) => sum + this.calculateCompleteness(p), 0) / totalProfiles) : 0;

        return `
            <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 8px; border: 1px solid #0ea5e9;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="color: #0ea5e9; font-size: 2rem;">
                        <i class="fas fa-users"></i>
                    </div>
                    <div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #0c4a6e;">${totalProfiles}</div>
                        <div style="color: #0c4a6e; font-size: 0.875rem;">Gesamt Profile</div>
                    </div>
                </div>
            </div>
            
            <div style="background: #f0fdf4; padding: 1.5rem; border-radius: 8px; border: 1px solid #22c55e;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="color: #22c55e; font-size: 2rem;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #15803d;">${completeProfiles}</div>
                        <div style="color: #15803d; font-size: 0.875rem;">Vollständige Profile</div>
                    </div>
                </div>
            </div>
            
            <div style="background: #fefce8; padding: 1.5rem; border-radius: 8px; border: 1px solid #eab308;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="color: #eab308; font-size: 2rem;">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #a16207;">${recentProfiles}</div>
                        <div style="color: #a16207; font-size: 0.875rem;">Aktuelle Profile</div>
                    </div>
                </div>
            </div>
            
            <div style="background: #f3e8ff; padding: 1.5rem; border-radius: 8px; border: 1px solid #a855f7;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="color: #a855f7; font-size: 2rem;">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #7c3aed;">${avgCompleteness}%</div>
                        <div style="color: #7c3aed; font-size: 0.875rem;">Ø Vollständigkeit</div>
                    </div>
                </div>
            </div>
        `;
    }

    getProfilesTableHTML() {
        if (this.profiles.length === 0) {
            return `
                <div style="text-align: center; padding: 4rem; color: #6b7280;">
                    <i class="fas fa-file-alt" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p style="font-size: 1.1rem; margin: 0;">Keine Bewerbungsprofile gefunden</p>
                </div>
            `;
        }

        return `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                        <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Name</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">E-Mail</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Vollständigkeit</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Letzte Aktualisierung</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Status</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Aktionen</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.profiles.map(profile => this.getProfileRowHTML(profile)).join('')}
                </tbody>
            </table>
        `;
    }

    getProfileRowHTML(profile) {
        const completeness = this.calculateCompleteness(profile);
        const lastUpdate = new Date(profile.updatedAt).toLocaleDateString('de-DE');
        const statusColor = completeness >= 80 ? '#10b981' : completeness >= 60 ? '#f59e0b' : '#ef4444';
        const statusText = completeness >= 80 ? 'Vollständig' : completeness >= 60 ? 'Teilweise' : 'Unvollständig';

        return `
            <tr style="border-bottom: 1px solid #f3f4f6; cursor: pointer;" onclick="window.adminBewerbungsprofilManager.showProfileDetails('${profile.userId}')">
                <td style="padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 2.5rem; height: 2.5rem; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; color: #6b7280;">
                            <i class="fas fa-user"></i>
                        </div>
                        <div>
                            <div style="font-weight: 500; color: #374151;">${profile.name || 'Unbekannt'}</div>
                            <div style="font-size: 0.875rem; color: #6b7280;">${profile.userId}</div>
                        </div>
                    </div>
                </td>
                <td style="padding: 1rem; color: #374151;">${profile.email}</td>
                <td style="padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 4rem; height: 0.5rem; background: #e5e7eb; border-radius: 0.25rem; overflow: hidden;">
                            <div style="width: ${completeness}%; height: 100%; background: ${statusColor}; transition: width 0.3s ease;"></div>
                        </div>
                        <span style="font-size: 0.875rem; font-weight: 500; color: #374151;">${completeness}%</span>
                    </div>
                </td>
                <td style="padding: 1rem; color: #6b7280; font-size: 0.875rem;">${lastUpdate}</td>
                <td style="padding: 1rem;">
                    <span style="
                        padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem;
                        font-weight: 600; background: ${statusColor}20; color: ${statusColor};
                    ">${statusText}</span>
                </td>
                <td style="padding: 1rem;">
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="event.stopPropagation(); window.adminBewerbungsprofilManager.showProfileDetails('${profile.userId}')" style="
                            background: #3b82f6; color: white; border: none;
                            padding: 0.5rem; border-radius: 4px; cursor: pointer;
                        ">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="event.stopPropagation(); window.adminBewerbungsprofilManager.exportProfile('${profile.userId}')" style="
                            background: #10b981; color: white; border: none;
                            padding: 0.5rem; border-radius: 4px; cursor: pointer;
                        ">
                            <i class="fas fa-download"></i>
                        </button>
                        <button onclick="event.stopPropagation(); window.adminBewerbungsprofilManager.deleteProfile('${profile.userId}')" style="
                            background: #ef4444; color: white; border: none;
                            padding: 0.5rem; border-radius: 4px; cursor: pointer;
                        ">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    calculateCompleteness(profile) {
        let score = 0;
        let maxScore = 0;

        // Persönliche Daten (20 Punkte)
        maxScore += 20;
        if (profile.personal?.firstName) score += 5;
        if (profile.personal?.lastName) score += 5;
        if (profile.personal?.email) score += 5;
        if (profile.personal?.location) score += 5;

        // Berufserfahrung (30 Punkte)
        maxScore += 30;
        if (profile.experience && profile.experience.length > 0) {
            score += Math.min(30, profile.experience.length * 10);
        }

        // Ausbildung (20 Punkte)
        maxScore += 20;
        if (profile.education && profile.education.length > 0) {
            score += Math.min(20, profile.education.length * 10);
        }

        // Fähigkeiten (20 Punkte)
        maxScore += 20;
        if (profile.skills?.technical && profile.skills.technical.length > 0) {
            score += Math.min(20, profile.skills.technical.length * 2);
        }

        // Karriereziele (10 Punkte)
        maxScore += 10;
        if (profile.careerGoals?.desiredPosition) score += 5;
        if (profile.careerGoals?.desiredIndustry) score += 5;

        return Math.round((score / maxScore) * 100);
    }

    setupProfileEventListeners() {
        // Refresh Button
        const refreshBtn = document.getElementById('refresh-profiles-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadAllProfiles());
        }

        // Export Button
        const exportBtn = document.getElementById('export-profiles-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportAllProfiles());
        }

        // Select All Checkbox
        const selectAllCheckbox = document.getElementById('select-all-profiles');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('input[type="checkbox"][name="profile-checkbox"]');
                checkboxes.forEach(cb => cb.checked = e.target.checked);
            });
        }
    }

    async showProfileDetails(userId) {
        try {
            const profile = this.profiles.find(p => p.userId === userId);
            if (!profile) return;

            const modal = document.getElementById('profile-details-modal');
            const content = document.getElementById('profile-details-content');
            
            if (modal && content) {
                content.innerHTML = this.getProfileDetailsHTML(profile);
                modal.style.display = 'flex';
            }
        } catch (error) {
            console.error('❌ Fehler beim Anzeigen der Profildetails:', error);
        }
    }

    getProfileDetailsHTML(profile) {
        const completeness = this.calculateCompleteness(profile);
        
        return `
            <h3 style="margin: 0 0 2rem; color: #1f2937;">
                <i class="fas fa-user-circle" style="color: #3b82f6;"></i>
                Profildetails: ${profile.name || 'Unbekannt'}
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                    <h4 style="color: #374151; margin-bottom: 1rem;">📋 Grundinformationen</h4>
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; border: 1px solid #e5e7eb;">
                        <div style="margin-bottom: 0.5rem;"><strong>Name:</strong> ${profile.name || 'Nicht angegeben'}</div>
                        <div style="margin-bottom: 0.5rem;"><strong>E-Mail:</strong> ${profile.email}</div>
                        <div style="margin-bottom: 0.5rem;"><strong>User ID:</strong> ${profile.userId}</div>
                        <div style="margin-bottom: 0.5rem;"><strong>Erstellt:</strong> ${new Date(profile.createdAt).toLocaleDateString('de-DE')}</div>
                        <div><strong>Letzte Aktualisierung:</strong> ${new Date(profile.updatedAt).toLocaleDateString('de-DE')}</div>
                    </div>
                </div>
                
                <div>
                    <h4 style="color: #374151; margin-bottom: 1rem;">📊 Vollständigkeit</h4>
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; border: 1px solid #e5e7eb;">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <div style="width: 6rem; height: 0.75rem; background: #e5e7eb; border-radius: 0.375rem; overflow: hidden;">
                                <div style="width: ${completeness}%; height: 100%; background: ${completeness >= 80 ? '#10b981' : completeness >= 60 ? '#f59e0b' : '#ef4444'}; transition: width 0.3s ease;"></div>
                            </div>
                            <span style="font-size: 1.25rem; font-weight: bold; color: #374151;">${completeness}%</span>
                        </div>
                        <div style="font-size: 0.875rem; color: #6b7280;">
                            ${completeness >= 80 ? 'Profil ist vollständig' : completeness >= 60 ? 'Profil ist größtenteils vollständig' : 'Profil benötigt weitere Informationen'}
                        </div>
                    </div>
                </div>
            </div>
            
            ${profile.personal ? `
            <div style="margin-top: 2rem;">
                <h4 style="color: #374151; margin-bottom: 1rem;">👤 Persönliche Daten</h4>
                <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; border: 1px solid #e5e7eb;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div><strong>Vorname:</strong> ${profile.personal.firstName || 'Nicht angegeben'}</div>
                        <div><strong>Nachname:</strong> ${profile.personal.lastName || 'Nicht angegeben'}</div>
                        <div><strong>Telefon:</strong> ${profile.personal.phone || 'Nicht angegeben'}</div>
                        <div><strong>Standort:</strong> ${profile.personal.location || 'Nicht angegeben'}</div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            ${profile.experience && profile.experience.length > 0 ? `
            <div style="margin-top: 2rem;">
                <h4 style="color: #374151; margin-bottom: 1rem;">💼 Berufserfahrung</h4>
                <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; border: 1px solid #e5e7eb;">
                    ${profile.experience.map(exp => `
                        <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb;">
                            <div style="font-weight: 500; color: #374151;">${exp.position} bei ${exp.company}</div>
                            <div style="font-size: 0.875rem; color: #6b7280;">${exp.startDate} - ${exp.currentJob ? 'Aktuell' : exp.endDate}</div>
                            ${exp.description ? `<div style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">${exp.description}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${profile.skills ? `
            <div style="margin-top: 2rem;">
                <h4 style="color: #374151; margin-bottom: 1rem;">🛠️ Fähigkeiten</h4>
                <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; border: 1px solid #e5e7eb;">
                    ${profile.skills.technical && profile.skills.technical.length > 0 ? `
                        <div style="margin-bottom: 1rem;">
                            <strong>Technische Fähigkeiten:</strong>
                            <div style="margin-top: 0.5rem;">
                                ${profile.skills.technical.map(skill => `
                                    <span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem; margin-right: 0.5rem; margin-bottom: 0.5rem; display: inline-block;">${skill}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}
            
            <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                <button onclick="window.adminBewerbungsprofilManager.exportProfile('${profile.userId}')" style="
                    background: #10b981; color: white; border: none;
                    padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;
                    font-weight: 500;
                ">
                    <i class="fas fa-download"></i> Exportieren
                </button>
                <button onclick="window.adminBewerbungsprofilManager.deleteProfile('${profile.userId}')" style="
                    background: #ef4444; color: white; border: none;
                    padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;
                    font-weight: 500;
                ">
                    <i class="fas fa-trash"></i> Löschen
                </button>
            </div>
        `;
    }

    closeModal() {
        const modal = document.getElementById('profile-details-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async exportProfile(userId) {
        try {
            console.log('📤 Exportiere Profil:', userId);
            
            const response = await fetch(`/api/applications/profile/${userId}/export?format=json`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bewerbungsprofil-${userId}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                console.log('✅ Profil erfolgreich exportiert');
            } else {
                console.error('❌ Export-Fehler:', response.statusText);
            }
        } catch (error) {
            console.error('❌ Export-Fehler:', error);
        }
    }

    async deleteProfile(userId) {
        if (!confirm('Sind Sie sicher, dass Sie dieses Profil löschen möchten?')) {
            return;
        }

        try {
            console.log('🗑️ Lösche Profil:', userId);
            
            const response = await fetch(`/api/applications/profile/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (response.ok) {
                console.log('✅ Profil erfolgreich gelöscht');
                await this.loadAllProfiles(); // Refresh the list
            } else {
                console.error('❌ Lösch-Fehler:', response.statusText);
            }
        } catch (error) {
            console.error('❌ Lösch-Fehler:', error);
        }
    }

    async exportAllProfiles() {
        try {
            console.log('📤 Exportiere alle Profile...');
            
            const profilesData = {
                exportDate: new Date().toISOString(),
                totalProfiles: this.profiles.length,
                profiles: this.profiles
            };

            const blob = new Blob([JSON.stringify(profilesData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bewerbungsprofile-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            console.log('✅ Alle Profile erfolgreich exportiert');
        } catch (error) {
            console.error('❌ Export-Fehler:', error);
        }
    }

    async getAuthToken() {
        try {
            if (window.realUserAuth) {
                return await window.realUserAuth.getAuthToken();
            }
            return null;
        } catch (error) {
            console.error('❌ Auth-Token-Fehler:', error);
            return null;
        }
    }

    setupEventListeners() {
        // Wird von der Hauptklasse aufgerufen
    }
}

// Global Instance
window.adminBewerbungsprofilManager = new AdminBewerbungsprofilManager();

// Integration mit AdminUserManagementUI
if (window.AdminUserManagementUI) {
    // Erweitere die AdminUserManagementUI um Bewerbungsprofil-Sektion
    const originalCreateUserManagementSection = window.AdminUserManagementUI.prototype.createUserManagementSection;
    
    window.AdminUserManagementUI.prototype.createUserManagementSection = function() {
        // Originale Funktion aufrufen
        originalCreateUserManagementSection.call(this);
        
        // Bewerbungsprofil-Sektion hinzufügen
        const container = document.getElementById('admin-content');
        if (container) {
            const bewerbungsprofilSection = document.createElement('div');
            bewerbungsprofilSection.id = 'bewerbungsprofile-container';
            container.appendChild(bewerbungsprofilSection);
            
            // Bewerbungsprofile rendern
            if (window.adminBewerbungsprofilManager.isAdmin()) {
                window.adminBewerbungsprofilManager.renderProfilesTable();
            }
        }
    };
}

console.log('✅ Admin Bewerbungsprofil Manager geladen');






