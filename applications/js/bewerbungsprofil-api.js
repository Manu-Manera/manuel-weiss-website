// =================== BEWERBUNGSPROFIL API INTEGRATION ===================
// Vollständige API-Integration mit AWS Cognito und DynamoDB

class BewerbungsprofilAPI {
    constructor() {
        this.baseURL = '/api/applications';
        this.authManager = null;
        this.init();
    }

    async init() {
        console.log('🚀 Bewerbungsprofil API wird initialisiert...');
        
        // Auth Manager prüfen
        if (window.realUserAuth) {
            this.authManager = window.realUserAuth;
        }
        
        console.log('✅ Bewerbungsprofil API bereit');
    }

    /**
     * Bewerbungsprofil erstellen oder aktualisieren
     */
    async saveProfile(profileData) {
        try {
            console.log('💾 Speichere Bewerbungsprofil:', profileData);
            
            const response = await fetch(`${this.baseURL}/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({
                    ...profileData,
                    timestamp: new Date().toISOString(),
                    version: 1
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Profil erfolgreich gespeichert:', result);
                return {
                    success: true,
                    profile: result,
                    message: 'Profil erfolgreich gespeichert'
                };
            } else {
                const error = await response.json();
                console.error('❌ Profil-Speicher-Fehler:', error);
                return {
                    success: false,
                    error: error.message || 'Profil konnte nicht gespeichert werden'
                };
            }
        } catch (error) {
            console.error('❌ API-Fehler beim Speichern:', error);
            return {
                success: false,
                error: 'Netzwerkfehler beim Speichern des Profils'
            };
        }
    }

    /**
     * Bewerbungsprofil abrufen
     */
    async getProfile(userId) {
        try {
            console.log('📋 Lade Bewerbungsprofil für User:', userId);
            
            const response = await fetch(`${this.baseURL}/profile/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (response.ok) {
                const profile = await response.json();
                console.log('✅ Profil erfolgreich geladen:', profile);
                return {
                    success: true,
                    profile: profile
                };
            } else if (response.status === 404) {
                console.log('ℹ️ Kein Profil gefunden für User:', userId);
                return {
                    success: false,
                    error: 'Kein Profil gefunden'
                };
            } else {
                const error = await response.json();
                console.error('❌ Profil-Lade-Fehler:', error);
                return {
                    success: false,
                    error: error.message || 'Profil konnte nicht geladen werden'
                };
            }
        } catch (error) {
            console.error('❌ API-Fehler beim Laden:', error);
            return {
                success: false,
                error: 'Netzwerkfehler beim Laden des Profils'
            };
        }
    }

    /**
     * Bewerbungsprofil aktualisieren
     */
    async updateProfile(userId, updateData) {
        try {
            console.log('🔄 Aktualisiere Bewerbungsprofil für User:', userId);
            
            const response = await fetch(`${this.baseURL}/profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({
                    ...updateData,
                    updatedAt: new Date().toISOString()
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Profil erfolgreich aktualisiert:', result);
                return {
                    success: true,
                    profile: result,
                    message: 'Profil erfolgreich aktualisiert'
                };
            } else {
                const error = await response.json();
                console.error('❌ Profil-Update-Fehler:', error);
                return {
                    success: false,
                    error: error.message || 'Profil konnte nicht aktualisiert werden'
                };
            }
        } catch (error) {
            console.error('❌ API-Fehler beim Update:', error);
            return {
                success: false,
                error: 'Netzwerkfehler beim Aktualisieren des Profils'
            };
        }
    }

    /**
     * Bewerbungsprofil löschen
     */
    async deleteProfile(userId) {
        try {
            console.log('🗑️ Lösche Bewerbungsprofil für User:', userId);
            
            const response = await fetch(`${this.baseURL}/profile/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (response.ok) {
                console.log('✅ Profil erfolgreich gelöscht');
                return {
                    success: true,
                    message: 'Profil erfolgreich gelöscht'
                };
            } else {
                const error = await response.json();
                console.error('❌ Profil-Lösch-Fehler:', error);
                return {
                    success: false,
                    error: error.message || 'Profil konnte nicht gelöscht werden'
                };
            }
        } catch (error) {
            console.error('❌ API-Fehler beim Löschen:', error);
            return {
                success: false,
                error: 'Netzwerkfehler beim Löschen des Profils'
            };
        }
    }

    /**
     * Alle Bewerbungsprofile abrufen (Admin)
     */
    async getAllProfiles(filters = {}) {
        try {
            console.log('📋 Lade alle Bewerbungsprofile (Admin)');
            
            const queryParams = new URLSearchParams(filters);
            const response = await fetch(`${this.baseURL}/profiles?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Alle Profile erfolgreich geladen:', result);
                return {
                    success: true,
                    profiles: result.profiles || [],
                    total: result.total || 0
                };
            } else {
                const error = await response.json();
                console.error('❌ Profile-Lade-Fehler:', error);
                return {
                    success: false,
                    error: error.message || 'Profile konnten nicht geladen werden'
                };
            }
        } catch (error) {
            console.error('❌ API-Fehler beim Laden aller Profile:', error);
            return {
                success: false,
                error: 'Netzwerkfehler beim Laden der Profile'
            };
        }
    }

    /**
     * Bewerbungsstatistiken abrufen
     */
    async getProfileStats(userId) {
        try {
            console.log('📊 Lade Bewerbungsstatistiken für User:', userId);
            
            const response = await fetch(`${this.baseURL}/profile/${userId}/stats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (response.ok) {
                const stats = await response.json();
                console.log('✅ Statistiken erfolgreich geladen:', stats);
                return {
                    success: true,
                    stats: stats
                };
            } else {
                const error = await response.json();
                console.error('❌ Statistiken-Lade-Fehler:', error);
                return {
                    success: false,
                    error: error.message || 'Statistiken konnten nicht geladen werden'
                };
            }
        } catch (error) {
            console.error('❌ API-Fehler beim Laden der Statistiken:', error);
            return {
                success: false,
                error: 'Netzwerkfehler beim Laden der Statistiken'
            };
        }
    }

    /**
     * Profil-Export generieren
     */
    async exportProfile(userId, format = 'json') {
        try {
            console.log('📤 Exportiere Profil für User:', userId, 'Format:', format);
            
            const response = await fetch(`${this.baseURL}/profile/${userId}/export?format=${format}`, {
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
                a.download = `bewerbungsprofil-${userId}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                console.log('✅ Profil erfolgreich exportiert');
                return {
                    success: true,
                    message: 'Profil erfolgreich exportiert'
                };
            } else {
                const error = await response.json();
                console.error('❌ Export-Fehler:', error);
                return {
                    success: false,
                    error: error.message || 'Profil konnte nicht exportiert werden'
                };
            }
        } catch (error) {
            console.error('❌ API-Fehler beim Export:', error);
            return {
                success: false,
                error: 'Netzwerkfehler beim Exportieren des Profils'
            };
        }
    }

    /**
     * Auth Token abrufen
     */
    async getAuthToken() {
        try {
            if (this.authManager && this.authManager.isAuthenticated()) {
                return await this.authManager.getAuthToken();
            }
            return null;
        } catch (error) {
            console.error('❌ Auth-Token-Fehler:', error);
            return null;
        }
    }

    /**
     * Offline-Fallback für lokale Speicherung
     */
    async saveProfileOffline(profileData) {
        try {
            const key = `bewerbungsprofil_${profileData.userId}`;
            localStorage.setItem(key, JSON.stringify({
                ...profileData,
                savedOffline: true,
                offlineTimestamp: new Date().toISOString()
            }));
            
            console.log('💾 Profil offline gespeichert:', key);
            return {
                success: true,
                message: 'Profil offline gespeichert'
            };
        } catch (error) {
            console.error('❌ Offline-Speicher-Fehler:', error);
            return {
                success: false,
                error: 'Profil konnte nicht offline gespeichert werden'
            };
        }
    }

    /**
     * Offline-Daten synchronisieren
     */
    async syncOfflineData() {
        try {
            console.log('🔄 Synchronisiere Offline-Daten...');
            
            const offlineKeys = Object.keys(localStorage).filter(key => key.startsWith('bewerbungsprofil_'));
            let syncedCount = 0;
            
            for (const key of offlineKeys) {
                try {
                    const offlineData = JSON.parse(localStorage.getItem(key));
                    if (offlineData.savedOffline) {
                        const result = await this.saveProfile(offlineData);
                        if (result.success) {
                            localStorage.removeItem(key);
                            syncedCount++;
                        }
                    }
                } catch (error) {
                    console.error('❌ Sync-Fehler für Key:', key, error);
                }
            }
            
            console.log(`✅ ${syncedCount} Offline-Datensätze synchronisiert`);
            return {
                success: true,
                syncedCount: syncedCount,
                message: `${syncedCount} Datensätze synchronisiert`
            };
        } catch (error) {
            console.error('❌ Sync-Fehler:', error);
            return {
                success: false,
                error: 'Synchronisation fehlgeschlagen'
            };
        }
    }
}

// Global Instance
window.bewerbungsprofilAPI = new BewerbungsprofilAPI();

// Integration mit BewerbungsprofilManager
if (window.bewerbungsprofilManager) {
    // Erweitere den Manager um API-Funktionalität
    window.bewerbungsprofilManager.api = window.bewerbungsprofilAPI;
    
    // Überschreibe die saveProfile Methode
    const originalSaveProfile = window.bewerbungsprofilManager.saveProfile;
    window.bewerbungsprofilManager.saveProfile = async function(profileData) {
        try {
            // Versuche Online-Speicherung
            const result = await window.bewerbungsprofilAPI.saveProfile(profileData);
            
            if (result.success) {
                return result;
            } else {
                // Fallback zu Offline-Speicherung
                console.log('⚠️ Online-Speicherung fehlgeschlagen, speichere offline');
                const offlineResult = await window.bewerbungsprofilAPI.saveProfileOffline(profileData);
                return {
                    success: true,
                    message: 'Profil offline gespeichert (wird später synchronisiert)',
                    offline: true
                };
            }
        } catch (error) {
            console.error('❌ Speicher-Fehler:', error);
            return {
                success: false,
                error: 'Profil konnte nicht gespeichert werden'
            };
        }
    };
}

console.log('✅ Bewerbungsprofil API Integration geladen');






















