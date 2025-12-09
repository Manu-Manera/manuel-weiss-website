/**
 * BEWERBUNGSMANAGER - CORE JAVASCRIPT
 * Hauptfunktionalitäten für das Bewerbungsmanager-System
 */

class ApplicationsCore {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.awsProfileAPI = null;
        this.userProgressTracker = null;
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Applications Core...');
        
        // Warten auf Auth-System
        await this.waitForAuth();
        
        // Warten auf AWS APIs
        await this.waitForAWSAPIs();
        
        // Load profile data from AWS
        await this.loadProfileDataFromAWS();
        
        // Event Listeners setup
        this.setupEventListeners();
        
        // UI Updates
        this.updateUI();
        
        this.isInitialized = true;
        console.log('✅ Applications Core initialized');
    }

    async waitForAuth() {
        return new Promise((resolve) => {
            const checkAuth = () => {
                if (window.realUserAuth && window.realUserAuth.isInitialized) {
                    this.currentUser = window.realUserAuth.getCurrentUser();
                    resolve();
                } else {
                    setTimeout(checkAuth, 100);
                }
            };
            checkAuth();
        });
    }
    
    async waitForAWSAPIs() {
        return new Promise((resolve) => {
            const checkAPIs = async () => {
                if (window.awsProfileAPI && window.userProgressTracker) {
                    this.awsProfileAPI = window.awsProfileAPI;
                    this.userProgressTracker = window.userProgressTracker;
                    if (this.userProgressTracker && !this.userProgressTracker.isInitialized) {
                        try {
                            await this.userProgressTracker.init();
                        } catch (error) {
                            console.error('❌ Failed to initialize progress tracker:', error);
                        }
                    }
                    resolve();
                } else {
                    setTimeout(checkAPIs, 100);
                }
            };
            checkAPIs();
        });
    }

    setupEventListeners() {
        // Navigation smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Feature card hover effects
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });

        // Floating cards animation
        this.animateFloatingCards();
    }

    animateFloatingCards() {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            const delay = index * 2;
            card.style.animationDelay = `${delay}s`;
        });
    }

    updateUI() {
        // Update user-specific content if logged in
        if (this.currentUser) {
            this.updateUserSpecificContent();
        }
    }

    updateUserSpecificContent() {
        // Update navigation with user info
        const userNameElement = document.getElementById('userName');
        const userAvatarImg = document.getElementById('userAvatarImg');
        
        if (userNameElement) {
            userNameElement.textContent = this.currentUser.name || 'Benutzer';
        }
        
        if (userAvatarImg && this.currentUser.avatar) {
            userAvatarImg.src = this.currentUser.avatar;
        }
    }

    // Navigation helper
    navigateToPage(page) {
        window.location.href = page;
    }

    // Progress tracking
    async trackProgress(step, data) {
        if (!this.currentUser) return;

        const progressData = {
            step: step,
            data: data,
            timestamp: new Date().toISOString()
        };

        // Save to AWS via userProgressTracker
        if (this.userProgressTracker) {
            await this.ensureProgressTracker();
            await this.userProgressTracker.updateProgress('bewerbungsmanager', step, progressData);
        }
        
        // Lokale Speicherung entfernt - alles wird über UserProgressTracker in AWS gespeichert
        console.log(`📊 Progress tracked: Step ${step}`, progressData);
    }

    // Application data management
    async saveApplicationData(data) {
        if (!this.currentUser) return;

        const applicationData = {
            ...data,
            userId: this.currentUser.id,
            createdAt: new Date().toISOString(),
            id: 'app_' + Date.now()
        };

        // Save to AWS
        if (this.userProgressTracker) {
            await this.ensureProgressTracker();
            await this.userProgressTracker.updateProgress('bewerbungsmanager', 'application-data', applicationData);
        }

        // Lokale Speicherung entfernt - alles wird über UserProgressTracker in AWS gespeichert
        console.log('✅ Application data saved to AWS:', applicationData);
        return applicationData;
    }

    async ensureProgressTracker() {
        if (!this.userProgressTracker) return;
        if (!this.userProgressTracker.isInitialized) {
            try {
                await this.userProgressTracker.init();
            } catch (error) {
                console.error('❌ Progress tracker init failed:', error);
            }
        }
    }

    async getApplicationData() {
        if (!this.currentUser || !this.awsProfileAPI) return [];

        try {
            const profile = await this.awsProfileAPI.loadProfile();
            return profile?.applications || [];
        } catch (error) {
            console.error('❌ Error loading application data from AWS:', error);
            return [];
        }
    }

    // Profile data management - NUR AWS SPEICHERUNG
    async saveProfileData(data) {
        if (!this.currentUser) {
            throw new Error('Benutzer nicht angemeldet');
        }

        if (!this.awsProfileAPI) {
            throw new Error('AWS Profile API nicht verfügbar');
        }

        const profileData = {
            ...data,
            userId: this.currentUser.id,
            updatedAt: new Date().toISOString()
        };

        // Save to AWS (PRIMARY STORAGE - keine lokale Speicherung)
        try {
            await this.awsProfileAPI.saveProfile(profileData);
            console.log('✅ Profile data saved to AWS:', profileData);
            return profileData;
        } catch (error) {
            console.error('❌ Error saving profile to AWS:', error);
            throw error;
        }
    }

    async loadProfileDataFromAWS() {
        if (!this.currentUser || !this.awsProfileAPI) return null;

        try {
            const awsProfile = await this.awsProfileAPI.loadProfile();
            if (awsProfile) {
                console.log('✅ Profile loaded from AWS');
                return awsProfile;
            }
        } catch (error) {
            console.error('❌ Error loading profile from AWS:', error);
            throw error;
        }

        return null;
    }

    async getProfileData() {
        // Lade immer von AWS
        return await this.loadProfileDataFromAWS();
    }

    // Document management
    saveDocumentData(data) {
        if (!this.currentUser) return;

        const documentData = {
            ...data,
            userId: this.currentUser.id,
            uploadedAt: new Date().toISOString()
        };

        // Save to localStorage
        const key = `documents_${this.currentUser.id}`;
        const documents = JSON.parse(localStorage.getItem(key) || '[]');
        documents.push(documentData);
        localStorage.setItem(key, JSON.stringify(documents));

        console.log('📄 Document data saved:', documentData);
        return documentData;
    }

    getDocumentData() {
        if (!this.currentUser) return [];

        const key = `documents_${this.currentUser.id}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    // Analytics and reporting
    getAnalyticsData() {
        const applications = this.getApplicationData();
        const profile = this.getProfileData();
        
        const analytics = {
            totalApplications: applications.length,
            applicationsThisMonth: applications.filter(app => {
                const appDate = new Date(app.createdAt);
                const now = new Date();
                return appDate.getMonth() === now.getMonth() && 
                       appDate.getFullYear() === now.getFullYear();
            }).length,
            successRate: this.calculateSuccessRate(applications),
            averageResponseTime: this.calculateAverageResponseTime(applications),
            topIndustries: this.getTopIndustries(applications),
            profileCompleteness: this.calculateProfileCompleteness(profile)
        };

        return analytics;
    }

    calculateSuccessRate(applications) {
        if (applications.length === 0) return 0;
        
        const successful = applications.filter(app => 
            app.status === 'offer' || app.status === 'interview'
        ).length;
        
        return Math.round((successful / applications.length) * 100);
    }

    calculateAverageResponseTime(applications) {
        const responded = applications.filter(app => 
            app.responseDate && app.appliedDate
        );
        
        if (responded.length === 0) return 0;
        
        const totalDays = responded.reduce((sum, app) => {
            const applied = new Date(app.appliedDate);
            const responded = new Date(app.responseDate);
            return sum + (responded - applied) / (1000 * 60 * 60 * 24);
        }, 0);
        
        return Math.round(totalDays / responded.length);
    }

    getTopIndustries(applications) {
        const industries = {};
        applications.forEach(app => {
            if (app.industry) {
                industries[app.industry] = (industries[app.industry] || 0) + 1;
            }
        });
        
        return Object.entries(industries)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([industry, count]) => ({ industry, count }));
    }

    calculateProfileCompleteness(profile) {
        if (!profile) return 0;
        
        const requiredFields = [
            'name', 'email', 'phone', 'location',
            'experience', 'education', 'skills'
        ];
        
        const completedFields = requiredFields.filter(field => 
            profile[field] && profile[field].toString().trim() !== ''
        ).length;
        
        return Math.round((completedFields / requiredFields.length) * 100);
    }

    // Utility functions
    formatDate(date) {
        return new Date(date).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }

    // Error handling
    handleError(error, context = '') {
        console.error(`❌ Error in ${context}:`, error);
        
        // Show user-friendly error message
        this.showNotification(
            'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
            'error'
        );
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Loading states
    showLoading(element, text = 'Lädt...') {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element) {
            element.classList.add('loading');
            element.innerHTML = `
                <div class="spinner"></div>
                <span>${text}</span>
            `;
        }
    }

    hideLoading(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element) {
            element.classList.remove('loading');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.applicationsCore = new ApplicationsCore();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApplicationsCore;
}

