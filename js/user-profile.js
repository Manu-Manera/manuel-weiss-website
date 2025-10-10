// User Profile JavaScript
class UserProfile {
    constructor() {
        this.currentTab = 'personal';
        this.profileData = this.loadProfileData();
        this.progressData = this.loadProgressData();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProfileData();
        this.updateProgressDisplay();
        this.updateStats();
        this.checkAuthStatus();
    }

    checkAuthStatus() {
        // Check if user is authenticated with AWS
        if (window.awsAuth && window.awsAuth.isLoggedIn()) {
            const currentUser = window.awsAuth.getCurrentUser();
            if (currentUser) {
                this.updateUserInfoFromAuth(currentUser);
            }
        } else {
            // Redirect to login if not authenticated
            this.redirectToLogin();
        }
    }

    updateUserInfoFromAuth(user) {
        // Update profile with authenticated user data
        if (user.email) {
            const emailInput = document.getElementById('email');
            if (emailInput && !emailInput.value) {
                emailInput.value = user.email;
            }
        }
        
        // Update display name
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = user.firstName ? `${user.firstName} ${user.lastName}` : 'User';
        }
        
        const userEmailEl = document.getElementById('userEmail');
        if (userEmailEl) {
            userEmailEl.textContent = user.email;
        }
    }

    redirectToLogin() {
        // Show notification and redirect to login
        this.showNotification('Bitte melden Sie sich an, um Ihr Profil zu verwalten', 'info');
        setTimeout(() => {
            window.location.href = 'persoenlichkeitsentwicklung-uebersicht.html';
        }, 2000);
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Form inputs
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('change', () => {
                this.saveProfileData();
            });
        });

        // Avatar upload
        const avatarUpload = document.querySelector('.avatar-upload');
        if (avatarUpload) {
            avatarUpload.addEventListener('click', () => {
                this.uploadAvatar();
            });
        }

        // Save button
        const saveBtn = document.querySelector('.btn-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveProfile();
            });
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Update progress display if switching to progress tab
        if (tabName === 'progress') {
            this.updateProgressDisplay();
        }
    }

    loadProfileData() {
        const defaultData = {
            firstName: 'Manuel',
            lastName: 'Weiss',
            email: 'manuel.weiss@example.com',
            phone: '',
            birthDate: '',
            location: '',
            profession: '',
            company: '',
            experience: '',
            industry: '',
            goals: '',
            interests: '',
            emailNotifications: true,
            weeklySummary: true,
            reminders: false,
            theme: 'light',
            language: 'de',
            dataSharing: false
        };

        const savedData = localStorage.getItem('userProfile');
        if (savedData) {
            return { ...defaultData, ...JSON.parse(savedData) };
        }

        return defaultData;
    }

    loadProgressData() {
        const defaultProgress = {
            completedMethods: 5,
            totalMethods: 29,
            categories: {
                'Selbstfindung': { completed: 3, total: 5 },
                'Entwicklung': { completed: 2, total: 8 },
                'Beziehungen': { completed: 0, total: 6 },
                'Karriere': { completed: 3, total: 4 }
            },
            recentActivity: [
                { method: 'Werte-Klärung', status: 'completed', date: 'vor 2 Tagen' },
                { method: 'Ikigai-Methode', status: 'completed', date: 'vor 1 Woche' },
                { method: 'Emotionale Intelligenz', status: 'started', date: 'vor 3 Tagen' }
            ],
            achievements: [
                { id: 'first-method', name: 'Erste Schritte', description: 'Erste Methode abgeschlossen', earned: true, date: 'vor 2 Tagen' },
                { id: 'values-explorer', name: 'Werte-Entdecker', description: 'Werte-Klärung abgeschlossen', earned: true, date: 'vor 2 Tagen' },
                { id: 'streak-master', name: 'Streak-Master', description: '7 Tage in Folge aktiv', earned: false, progress: '3/7 Tage' },
                { id: 'development-expert', name: 'Entwicklungs-Experte', description: '10 Methoden abgeschlossen', earned: false, progress: '5/10 Methoden' }
            ]
        };

        const savedProgress = localStorage.getItem('userProgress');
        if (savedProgress) {
            return { ...defaultProgress, ...JSON.parse(savedProgress) };
        }

        return defaultProgress;
    }

    updateStats() {
        const stats = {
            completedMethods: this.progressData.completedMethods,
            totalProgress: Math.round((this.progressData.completedMethods / this.progressData.totalMethods) * 100),
            streakDays: 3 // This would be calculated from actual data
        };

        // Update stat displays
        const completedEl = document.getElementById('completedMethods');
        const progressEl = document.getElementById('totalProgress');
        const streakEl = document.getElementById('streakDays');

        if (completedEl) completedEl.textContent = stats.completedMethods;
        if (progressEl) progressEl.textContent = stats.totalProgress + '%';
        if (streakEl) streakEl.textContent = stats.streakDays;
    }

    updateProgressDisplay() {
        // Update overall progress
        const overallProgress = Math.round((this.progressData.completedMethods / this.progressData.totalMethods) * 100);
        
        const overallProgressEl = document.getElementById('overallProgress');
        const overallProgressNumberEl = document.getElementById('overallProgressNumber');
        
        if (overallProgressEl) overallProgressEl.textContent = overallProgress + '%';
        if (overallProgressNumberEl) overallProgressNumberEl.textContent = this.progressData.completedMethods;

        // Update progress ring
        this.updateProgressRing(overallProgress);

        // Update category progress
        this.updateCategoryProgress();

        // Update recent activity
        this.updateRecentActivity();
    }

    updateProgressRing(percentage) {
        const circle = document.querySelector('.progress-ring-fill');
        if (circle) {
            const circumference = 2 * Math.PI * 54; // radius = 54
            const offset = circumference - (percentage / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }
    }

    updateCategoryProgress() {
        const categories = this.progressData.categories;
        
        Object.keys(categories).forEach(categoryKey => {
            const category = categories[categoryKey];
            const percentage = Math.round((category.completed / category.total) * 100);
            
            // Find the corresponding category card
            const categoryCards = document.querySelectorAll('.category-card');
            categoryCards.forEach(card => {
                const categoryName = card.querySelector('h4').textContent;
                if (categoryName === categoryKey) {
                    const progressFill = card.querySelector('.progress-fill');
                    const progressText = card.querySelector('.progress-text');
                    
                    if (progressFill) {
                        progressFill.style.width = percentage + '%';
                    }
                    if (progressText) {
                        progressText.textContent = `${category.completed}/${category.total} abgeschlossen`;
                    }
                }
            });
        });
    }

    updateRecentActivity() {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;

        activityList.innerHTML = '';

        this.progressData.recentActivity.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            const iconClass = activity.status === 'completed' ? 'fas fa-check-circle' : 'fas fa-play-circle';
            const iconColor = activity.status === 'completed' ? 'var(--success-color)' : 'var(--primary-color)';
            
            activityItem.innerHTML = `
                <div class="activity-icon" style="background: ${iconColor}">
                    <i class="${iconClass}"></i>
                </div>
                <div class="activity-content">
                    <h5>${activity.method} ${activity.status === 'completed' ? 'abgeschlossen' : 'gestartet'}</h5>
                    <p>${activity.date}</p>
            </div>
        `;
        
            activityList.appendChild(activityItem);
        });
    }

    saveProfileData() {
        const formData = {
            firstName: document.getElementById('firstName')?.value || '',
            lastName: document.getElementById('lastName')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            birthDate: document.getElementById('birthDate')?.value || '',
            location: document.getElementById('location')?.value || '',
            profession: document.getElementById('profession')?.value || '',
            company: document.getElementById('company')?.value || '',
            experience: document.getElementById('experience')?.value || '',
            industry: document.getElementById('industry')?.value || '',
            goals: document.getElementById('goals')?.value || '',
            interests: document.getElementById('interests')?.value || '',
            emailNotifications: document.getElementById('emailNotifications')?.checked || false,
            weeklySummary: document.getElementById('weeklySummary')?.checked || false,
            reminders: document.getElementById('reminders')?.checked || false,
            theme: document.getElementById('theme')?.value || 'light',
            language: document.getElementById('language')?.value || 'de',
            dataSharing: document.getElementById('dataSharing')?.checked || false
        };

        this.profileData = { ...this.profileData, ...formData };
        localStorage.setItem('userProfile', JSON.stringify(this.profileData));
    }

    saveProfile() {
        this.saveProfileData();
        this.showNotification('Profil erfolgreich gespeichert!', 'success');
    }

    uploadAvatar() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                    const img = document.getElementById('profileImage');
                    if (img) {
                        img.src = e.target.result;
                    }
                    this.showNotification('Profilbild erfolgreich hochgeladen!', 'success');
            };
            reader.readAsDataURL(file);
            }
        };
        input.click();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--primary-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.userProfile = new UserProfile();
});

// Global functions for HTML onclick handlers
function saveProfile() {
    if (window.userProfile) {
        window.userProfile.saveProfile();
    }
}

function uploadAvatar() {
    if (window.userProfile) {
        window.userProfile.uploadAvatar();
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);