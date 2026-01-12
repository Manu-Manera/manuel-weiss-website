/**
 * AWS Applications API Client
 * Handles job applications data synchronization with AWS
 */

class AWSApplicationsAPI {
    constructor() {
        this.isInitialized = false;
        this.apiBaseUrl = null;
        this.cache = null;
        this.cacheExpiry = null;
        this.CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (shorter for frequently changing data)
        
        this.init();
    }

    async init() {
        try {
            if (!window.AWS_CONFIG?.apiBaseUrl) {
                console.log('⏳ Applications API waiting for AWS_CONFIG...');
                setTimeout(() => this.init(), 100);
                return;
            }

            this.apiBaseUrl = window.AWS_CONFIG.apiBaseUrl;
            this.isInitialized = true;
            console.log('✅ AWS Applications API initialized');
        } catch (error) {
            console.error('❌ AWS Applications API initialization failed:', error);
        }
    }

    async waitForInit() {
        const maxWait = 5000;
        const startTime = Date.now();
        
        while (!this.isInitialized && Date.now() - startTime < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!this.isInitialized) {
            throw new Error('AWS Applications API initialization timeout');
        }
    }

    async getAuthHeaders() {
        const sessionStr = localStorage.getItem('aws_auth_session');
        if (!sessionStr) {
            throw new Error('Not authenticated');
        }
        
        const session = JSON.parse(sessionStr);
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.idToken}`
        };
    }

    /**
     * Load all applications from AWS
     */
    async loadApplications() {
        if (!this.isInitialized) await this.waitForInit();

        // Check cache
        if (this.cache && this.cacheExpiry > Date.now()) {
            return this.cache;
        }

        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/applications`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            // Update cache
            this.cache = data;
            this.cacheExpiry = Date.now() + this.CACHE_DURATION;
            
            console.log('✅ Applications loaded from AWS');
            return data;
        } catch (error) {
            console.error('❌ Failed to load applications:', error);
            throw error;
        }
    }

    /**
     * Create a new application
     */
    async createApplication(applicationData) {
        if (!this.isInitialized) await this.waitForInit();

        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/applications`, {
                method: 'POST',
                headers,
                body: JSON.stringify(applicationData)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            // Invalidate cache
            this.cache = null;
            
            // Check achievements
            if (window.awsAchievementsAPI) {
                const stats = await this.getStats();
                await window.awsAchievementsAPI.checkAndUnlockAchievements('applications', stats);
            }
            
            console.log('✅ Application created in AWS');
            return data;
        } catch (error) {
            console.error('❌ Failed to create application:', error);
            throw error;
        }
    }

    /**
     * Update an existing application
     */
    async updateApplication(applicationId, updateData) {
        if (!this.isInitialized) await this.waitForInit();

        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/applications/${applicationId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            // Invalidate cache
            this.cache = null;
            
            // Check achievements for status changes
            if (updateData.status && window.awsAchievementsAPI) {
                const stats = await this.getStats();
                await window.awsAchievementsAPI.checkAndUnlockAchievements('applications', stats);
            }
            
            console.log('✅ Application updated in AWS');
            return data;
        } catch (error) {
            console.error('❌ Failed to update application:', error);
            throw error;
        }
    }

    /**
     * Delete an application
     */
    async deleteApplication(applicationId) {
        if (!this.isInitialized) await this.waitForInit();

        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/applications/${applicationId}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            // Invalidate cache
            this.cache = null;
            
            console.log('✅ Application deleted from AWS');
            return { success: true };
        } catch (error) {
            console.error('❌ Failed to delete application:', error);
            throw error;
        }
    }

    /**
     * Get application statistics
     */
    async getStats() {
        const data = await this.loadApplications();
        return data.stats || {
            total: 0,
            pending: 0,
            interview: 0,
            offer: 0,
            rejected: 0,
            accepted: 0,
            successRate: 0
        };
    }

    /**
     * Get applications by status
     */
    async getByStatus(status) {
        const data = await this.loadApplications();
        return (data.applications || []).filter(a => 
            a.status.toLowerCase() === status.toLowerCase()
        );
    }

    /**
     * Get recent applications (last 30 days)
     */
    async getRecent(days = 30) {
        const data = await this.loadApplications();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return (data.applications || []).filter(a => 
            new Date(a.appliedDate) >= cutoffDate
        );
    }

    /**
     * Search applications
     */
    async search(query) {
        const data = await this.loadApplications();
        const lowerQuery = query.toLowerCase();
        
        return (data.applications || []).filter(a => 
            a.company.toLowerCase().includes(lowerQuery) ||
            a.position.toLowerCase().includes(lowerQuery) ||
            a.location?.toLowerCase().includes(lowerQuery) ||
            a.notes?.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Update application status (convenience method)
     */
    async updateStatus(applicationId, newStatus, note = '') {
        return this.updateApplication(applicationId, {
            status: newStatus,
            statusNote: note
        });
    }

    /**
     * Add contact to application
     */
    async addContact(applicationId, contact) {
        const data = await this.loadApplications();
        const application = (data.applications || []).find(a => a.id === applicationId);
        
        if (!application) {
            throw new Error('Application not found');
        }
        
        const contacts = [...(application.contacts || []), contact];
        return this.updateApplication(applicationId, { contacts });
    }

    /**
     * Add document to application
     */
    async addDocument(applicationId, document) {
        const data = await this.loadApplications();
        const application = (data.applications || []).find(a => a.id === applicationId);
        
        if (!application) {
            throw new Error('Application not found');
        }
        
        const documents = [...(application.documents || []), document];
        return this.updateApplication(applicationId, { documents });
    }

    /**
     * Get application timeline
     */
    async getTimeline(applicationId) {
        const data = await this.loadApplications();
        const application = (data.applications || []).find(a => a.id === applicationId);
        
        if (!application) {
            return [];
        }
        
        return application.timeline || [];
    }

    /**
     * Calculate success metrics
     */
    async getMetrics() {
        const data = await this.loadApplications();
        const applications = data.applications || [];
        
        // Calculate response rate
        const responded = applications.filter(a => 
            !['pending', 'withdrawn'].includes(a.status.toLowerCase())
        ).length;
        
        // Calculate interview rate
        const interviewRate = applications.length > 0 
            ? Math.round((data.stats.interview / applications.length) * 100) 
            : 0;
        
        // Calculate offer rate from interviews
        const offerRate = data.stats.interview > 0 
            ? Math.round((data.stats.offer / data.stats.interview) * 100) 
            : 0;
        
        // Average time to response
        const withResponse = applications.filter(a => a.timeline && a.timeline.length > 1);
        let avgResponseDays = 0;
        if (withResponse.length > 0) {
            const totalDays = withResponse.reduce((sum, a) => {
                const applied = new Date(a.appliedDate);
                const firstResponse = new Date(a.timeline[1]?.date);
                return sum + Math.floor((firstResponse - applied) / (1000 * 60 * 60 * 24));
            }, 0);
            avgResponseDays = Math.round(totalDays / withResponse.length);
        }
        
        return {
            totalApplications: applications.length,
            responseRate: applications.length > 0 ? Math.round((responded / applications.length) * 100) : 0,
            interviewRate,
            offerRate,
            avgResponseDays,
            successRate: data.stats.successRate || 0
        };
    }

    /**
     * Export applications as JSON
     */
    async exportData() {
        const data = await this.loadApplications();
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import applications from JSON
     */
    async importData(jsonData) {
        const imported = JSON.parse(jsonData);
        if (!imported.applications || !Array.isArray(imported.applications)) {
            throw new Error('Invalid import data format');
        }
        
        // Create each application
        for (const app of imported.applications) {
            await this.createApplication(app);
        }
        
        return { imported: imported.applications.length };
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache = null;
        this.cacheExpiry = null;
    }
}

// Global instance
window.awsApplicationsAPI = new AWSApplicationsAPI();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AWSApplicationsAPI;
}
