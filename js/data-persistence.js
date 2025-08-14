// Data Persistence System für Manuel Weiss Professional Services
class DataPersistence {
    constructor() {
        this.storageKey = 'mwps-website-data';
        this.backupInterval = 30000; // 30 Sekunden
        this.init();
    }

    init() {
        // Automatische Backups starten
        this.startAutoBackup();
        
        // Event-Listener für Änderungen
        window.addEventListener('beforeunload', () => {
            this.saveToLocalStorage();
        });
    }

    // Daten speichern
    async saveData(content) {
        try {
            // Lokaler Speicher
            this.saveToLocalStorage(content);
            
            // Server-Speicher (falls verfügbar)
            await this.saveToServer(content);
            
            // Backup erstellen
            this.createBackup(content);
            
            return true;
        } catch (error) {
            console.error('Fehler beim Speichern der Daten:', error);
            return false;
        }
    }

    // Lokaler Speicher
    saveToLocalStorage(content = null) {
        try {
            const dataToSave = content || this.getCurrentContent();
            if (dataToSave) {
                localStorage.setItem(this.storageKey, JSON.stringify({
                    ...dataToSave,
                    lastSaved: new Date().toISOString(),
                    version: '1.0.0'
                }));
                console.log('Daten im lokalen Speicher gespeichert');
            }
        } catch (error) {
            console.error('Fehler beim Speichern im lokalen Speicher:', error);
        }
    }

    // Daten vom lokalen Speicher laden
    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                console.log('Daten vom lokalen Speicher geladen');
                return parsedData;
            }
        } catch (error) {
            console.error('Fehler beim Laden vom lokalen Speicher:', error);
        }
        return null;
    }

    // Server-Speicher (simuliert)
    async saveToServer(content) {
        try {
            // In der echten Implementierung würde hier ein API-Call gemacht
            // Für jetzt simulieren wir es
            
            // Prüfen ob wir online sind
            if (navigator.onLine) {
                // Simuliere API-Call
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Optional: Daten in eine JSON-Datei schreiben
                this.downloadDataFile(content);
                
                console.log('Daten erfolgreich zum Server gesendet');
                return true;
            } else {
                console.log('Offline - Daten werden nur lokal gespeichert');
                return false;
            }
        } catch (error) {
            console.error('Fehler beim Speichern auf dem Server:', error);
            return false;
        }
    }

    // Backup erstellen
    createBackup(content) {
        try {
            const backupData = {
                ...content,
                backupDate: new Date().toISOString(),
                backupType: 'auto'
            };

            const backupKey = `${this.storageKey}-backup-${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify(backupData));
            
            // Alte Backups aufräumen (max. 5 behalten)
            this.cleanupOldBackups();
            
            console.log('Backup erstellt');
        } catch (error) {
            console.error('Fehler beim Erstellen des Backups:', error);
        }
    }

    // Alte Backups aufräumen
    cleanupOldBackups() {
        try {
            const keys = Object.keys(localStorage);
            const backupKeys = keys.filter(key => key.startsWith(`${this.storageKey}-backup-`));
            
            if (backupKeys.length > 5) {
                // Sortiere nach Datum und entferne die ältesten
                backupKeys.sort((a, b) => {
                    const dateA = parseInt(a.split('-').pop());
                    const dateB = parseInt(b.split('-').pop());
                    return dateA - dateB;
                });
                
                // Entferne die ältesten Backups
                const keysToRemove = backupKeys.slice(0, backupKeys.length - 5);
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                console.log(`${keysToRemove.length} alte Backups entfernt`);
            }
        } catch (error) {
            console.error('Fehler beim Aufräumen der Backups:', error);
        }
    }

    // Daten als Datei herunterladen
    downloadDataFile(content) {
        try {
            const dataToDownload = {
                ...content,
                exportDate: new Date().toISOString(),
                exportSource: 'MWPS Admin Panel'
            };

            const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mwps-data-${new Date().toISOString().split('T')[0]}.json`;
            
            // Versteckten Download starten
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Fehler beim Herunterladen der Daten:', error);
        }
    }

    // Daten importieren
    async importData(file) {
        try {
            const text = await file.text();
            const importedData = JSON.parse(text);
            
            // Validierung der importierten Daten
            if (this.validateData(importedData)) {
                // Daten im lokalen Speicher speichern
                localStorage.setItem(this.storageKey, JSON.stringify({
                    ...importedData,
                    lastImported: new Date().toISOString(),
                    version: '1.0.0'
                }));
                
                console.log('Daten erfolgreich importiert');
                return importedData;
            } else {
                throw new Error('Ungültige Datenstruktur');
            }
        } catch (error) {
            console.error('Fehler beim Importieren der Daten:', error);
            throw error;
        }
    }

    // Daten validieren
    validateData(data) {
        // Einfache Validierung - prüfe ob wichtige Felder vorhanden sind
        const requiredFields = ['hero', 'services', 'rentals'];
        
        return requiredFields.every(field => {
            return data[field] && typeof data[field] === 'object';
        });
    }

    // Aktuelle Inhalte abrufen
    getCurrentContent() {
        // Versuche vom Content Manager zu bekommen
        if (window.contentManager && window.contentManager.content) {
            return window.contentManager.content;
        }
        
        // Fallback: vom lokalen Speicher
        return this.loadFromLocalStorage();
    }

    // Daten zurücksetzen
    resetData() {
        try {
            // Alle lokalen Daten löschen
            const keys = Object.keys(localStorage);
            const mwpsKeys = keys.filter(key => key.startsWith(this.storageKey));
            mwpsKeys.forEach(key => localStorage.removeItem(key));
            
            console.log('Alle lokalen Daten zurückgesetzt');
            return true;
        } catch (error) {
            console.error('Fehler beim Zurücksetzen der Daten:', error);
            return false;
        }
    }

    // Daten exportieren
    exportData(content = null) {
        const dataToExport = content || this.getCurrentContent();
        if (dataToExport) {
            this.downloadDataFile(dataToExport);
            return true;
        }
        return false;
    }

    // Automatische Backups starten
    startAutoBackup() {
        setInterval(() => {
            const currentContent = this.getCurrentContent();
            if (currentContent) {
                this.createBackup(currentContent);
            }
        }, this.backupInterval);
    }

    // Backup wiederherstellen
    restoreFromBackup(backupKey) {
        try {
            const backupData = localStorage.getItem(backupKey);
            if (backupData) {
                const parsedBackup = JSON.parse(backupData);
                
                // Backup als aktuelle Daten setzen
                localStorage.setItem(this.storageKey, JSON.stringify({
                    ...parsedBackup,
                    restoredFrom: backupKey,
                    restoredAt: new Date().toISOString()
                }));
                
                console.log('Backup erfolgreich wiederhergestellt');
                return parsedBackup;
            }
        } catch (error) {
            console.error('Fehler beim Wiederherstellen des Backups:', error);
        }
        return null;
    }

    // Verfügbare Backups auflisten
    getAvailableBackups() {
        try {
            const keys = Object.keys(localStorage);
            const backupKeys = keys.filter(key => key.startsWith(`${this.storageKey}-backup-`));
            
            return backupKeys.map(key => {
                try {
                    const backupData = JSON.parse(localStorage.getItem(key));
                    return {
                        key,
                        date: backupData.backupDate || 'Unbekannt',
                        type: backupData.backupType || 'manuell',
                        size: JSON.stringify(backupData).length
                    };
                } catch (error) {
                    return { key, date: 'Fehler', type: 'unbekannt', size: 0 };
                }
            }).sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Fehler beim Auflisten der Backups:', error);
            return [];
        }
    }

    // Daten-Integrität prüfen
    checkDataIntegrity() {
        try {
            const currentData = this.getCurrentContent();
            if (!currentData) {
                return { valid: false, errors: ['Keine Daten gefunden'] };
            }

            const errors = [];
            
            // Prüfe Hero-Bereich
            if (!currentData.hero || !currentData.hero.name) {
                errors.push('Hero-Bereich unvollständig');
            }
            
            // Prüfe Services
            if (!currentData.services || !Array.isArray(currentData.services)) {
                errors.push('Services-Bereich unvollständig');
            }
            
            // Prüfe Rentals
            if (!currentData.rentals || !Array.isArray(currentData.rentals)) {
                errors.push('Rentals-Bereich unvollständig');
            }

            return {
                valid: errors.length === 0,
                errors,
                dataSize: JSON.stringify(currentData).length,
                lastUpdated: currentData.lastUpdated || 'Unbekannt'
            };
        } catch (error) {
            return { valid: false, errors: [error.message] };
        }
    }
}

// Globale Instanz erstellen
let dataPersistence;

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    dataPersistence = new DataPersistence();
});

// Export für andere Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataPersistence;
}
