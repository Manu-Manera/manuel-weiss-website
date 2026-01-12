/**
 * AWS Journal API - Tagebuch und Aktivitäts-Tracking
 */
class AWSJournalAPI {
    constructor() {
        this.apiBaseUrl = window.AWS_CONFIG?.apiBaseUrl;
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.apiBaseUrl) {
            this.isInitialized = true;
            console.log('✅ AWS Journal API initialized');
        } else {
            console.warn('⚠️ AWS_CONFIG.apiBaseUrl not found for Journal API. Retrying...');
            setTimeout(() => this.init(), 500);
        }
    }

    async getAuthHeaders() {
        if (!window.realUserAuth || !window.realUserAuth.isLoggedIn()) {
            throw new Error('User not authenticated for Journal API');
        }
        const session = JSON.parse(localStorage.getItem('aws_auth_session'));
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.idToken}`
        };
    }

    /**
     * Alle Journal-Einträge laden
     * @param {Object} filters - Optional: { from, to, type }
     */
    async getEntries(filters = {}) {
        if (!this.isInitialized) await new Promise(resolve => setTimeout(resolve, 100));
        try {
            const headers = await this.getAuthHeaders();
            const queryParams = new URLSearchParams(filters).toString();
            const url = `${this.apiBaseUrl}/journal${queryParams ? '?' + queryParams : ''}`;
            
            const response = await fetch(url, { headers });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching journal entries:', error);
            throw error;
        }
    }

    /**
     * Einträge für ein bestimmtes Datum laden
     * @param {string} date - Datum im Format YYYY-MM-DD
     */
    async getEntriesByDate(date) {
        if (!this.isInitialized) await new Promise(resolve => setTimeout(resolve, 100));
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/journal/${date}`, { headers });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching journal entries for date:', error);
            throw error;
        }
    }

    /**
     * Neuen Journal-Eintrag erstellen
     * @param {Object} entry - { type, title, content, date, tags, mood, energy, trainingData }
     */
    async createEntry(entry) {
        if (!this.isInitialized) await new Promise(resolve => setTimeout(resolve, 100));
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/journal`, {
                method: 'POST',
                headers,
                body: JSON.stringify(entry)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error creating journal entry:', error);
            throw error;
        }
    }

    /**
     * Journal-Eintrag aktualisieren
     * @param {string} entryId - ID des Eintrags
     * @param {Object} updates - Aktualisierte Felder
     */
    async updateEntry(entryId, updates) {
        if (!this.isInitialized) await new Promise(resolve => setTimeout(resolve, 100));
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/journal/${entryId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(updates)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error updating journal entry:', error);
            throw error;
        }
    }

    /**
     * Journal-Eintrag löschen
     * @param {string} entryId - ID des Eintrags
     */
    async deleteEntry(entryId) {
        if (!this.isInitialized) await new Promise(resolve => setTimeout(resolve, 100));
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/journal/${entryId}`, {
                method: 'DELETE',
                headers
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error deleting journal entry:', error);
            throw error;
        }
    }

    /**
     * Aktivität automatisch tracken
     * @param {Object} activity - { activityType, title, description, tags, metadata }
     */
    async trackActivity(activity) {
        if (!this.isInitialized) await new Promise(resolve => setTimeout(resolve, 100));
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/journal/activity`, {
                method: 'POST',
                headers,
                body: JSON.stringify(activity)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error tracking activity:', error);
            // Don't throw - auto-tracking shouldn't break user experience
            return null;
        }
    }

    // === HILFSMETHODEN ===

    /**
     * Quick-Entry: Journal-Eintrag
     */
    async addJournalNote(title, content, mood = null) {
        return this.createEntry({
            type: 'journal',
            title,
            content,
            mood,
            date: new Date().toISOString()
        });
    }

    /**
     * Quick-Entry: Training
     */
    async addTrainingEntry(title, trainingData) {
        return this.createEntry({
            type: 'training',
            title,
            content: trainingData.notes || '',
            trainingData,
            date: new Date().toISOString(),
            tags: ['training', trainingData.type || 'workout']
        });
    }

    /**
     * Mood tracken
     */
    async addMoodEntry(mood, energy = null, note = '') {
        return this.createEntry({
            type: 'mood',
            title: 'Stimmung',
            content: note,
            mood,
            energy,
            date: new Date().toISOString()
        });
    }

    /**
     * Heatmap-Daten für Kalenderansicht generieren
     * @param {number} days - Anzahl der Tage (default: 365)
     */
    async getHeatmapData(days = 365) {
        const entries = await this.getEntries({
            from: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
        });
        
        const heatmap = {};
        entries.entries.forEach(entry => {
            const date = entry.date.split('T')[0];
            if (!heatmap[date]) {
                heatmap[date] = { count: 0, types: [], hasJournal: false, hasTraining: false };
            }
            heatmap[date].count++;
            if (!heatmap[date].types.includes(entry.type)) {
                heatmap[date].types.push(entry.type);
            }
            if (entry.type === 'journal') heatmap[date].hasJournal = true;
            if (entry.type === 'training') heatmap[date].hasTraining = true;
        });
        
        return heatmap;
    }
}

// Global verfügbar machen
window.awsJournalAPI = new AWSJournalAPI();
