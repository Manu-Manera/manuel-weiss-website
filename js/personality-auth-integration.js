/**
 * Personality Development Auth Integration
 * Integrates authentication and progress tracking for personality development pages
 */

class PersonalityAuthIntegration {
    constructor() {
        this.currentPageId = null;
        this.currentMethod = null;
        this.pageType = 'method';
        this.isInitialized = false;
    }

    /**
     * Initialize the integration
     */
    async init(pageId, methodName = null, pageType = 'method') {
        if (this.isInitialized) return;
        
        this.currentPageId = pageId || this.extractPageId();
        this.currentMethod = methodName || this.extractMethodName();
        this.pageType = pageType;
        
        // Wait for auth system to be ready
        await this.waitForAuth();
        
        // Check if user is authenticated
        if (!window.realUserAuth || !window.realUserAuth.isLoggedIn || !window.realUserAuth.isLoggedIn()) {
            this.showLoginPrompt();
            return false;
        }
        
        // Initialize progress tracking
        if (window.userProgressTracker) {
            await window.userProgressTracker.init();
            window.userProgressTracker.trackPageVisit(this.currentPageId, this.pageType);
        }
        
        // Update UI with user info
        this.updateUIForAuthenticatedUser();
        
        // Restore any saved progress
        await this.restoreProgress();
        
        this.isInitialized = true;
        console.log('Personality auth integration initialized for:', this.currentPageId);
        return true;
    }

    /**
     * Wait for auth system to be ready
     */
    async waitForAuth() {
        let attempts = 0;
        while ((!window.realUserAuth || !window.realUserAuth.initialized) && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.realUserAuth || !window.realUserAuth.initialized) {
            console.error('Auth system not available after timeout');
            throw new Error('Auth system not available');
        }
    }

    /**
     * Extract page ID from URL or page content
     */
    extractPageId() {
        // Try to get from URL path
        const path = window.location.pathname;
        const match = path.match(/\/methods\/([^\/]+)/);
        if (match) {
            return match[1];
        }
        
        // Try to get from page title or data attribute
        const pageTitle = document.querySelector('[data-page-id]');
        if (pageTitle) {
            return pageTitle.getAttribute('data-page-id');
        }
        
        // Use cleaned path as fallback
        return path.replace(/^\/|\.html$/g, '').replace(/\//g, '-');
    }

    /**
     * Extract method name from page
     */
    extractMethodName() {
        // Try to get from data attribute
        const methodEl = document.querySelector('[data-method-name]');
        if (methodEl) {
            return methodEl.getAttribute('data-method-name');
        }
        
        // Try to get from heading
        const h1 = document.querySelector('h1');
        if (h1) {
            return h1.textContent.trim();
        }
        
        return this.currentPageId;
    }

    /**
     * Show login prompt for unauthenticated users
     */
    showLoginPrompt() {
        const promptHTML = `
            <div class="auth-prompt-overlay" id="authPromptOverlay">
                <div class="auth-prompt-card">
                    <div class="auth-prompt-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h3 class="auth-prompt-title">Anmeldung erforderlich</h3>
                    <p class="auth-prompt-message">
                        Melde dich an, um deinen Fortschritt zu speichern und auf alle Funktionen zuzugreifen.
                    </p>
                    <div class="auth-prompt-benefits">
                        <div class="benefit-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Fortschritt wird automatisch gespeichert</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Zugriff von allen Geräten</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Persönliche Auswertungen</span>
                        </div>
                    </div>
                    <div class="auth-prompt-actions">
                        <button class="btn btn-primary" onclick="window.realUserAuth.showLoginModal()">
                            <i class="fas fa-sign-in-alt"></i> Anmelden
                        </button>
                        <button class="btn btn-secondary" onclick="window.realUserAuth.showRegisterModal()">
                            <i class="fas fa-user-plus"></i> Registrieren
                        </button>
                    </div>
                    <button class="auth-prompt-close" onclick="document.getElementById('authPromptOverlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add styles if not already present
        if (!document.querySelector('#authPromptStyles')) {
            const styles = `
                <style id="authPromptStyles">
                    .auth-prompt-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.8);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 10000;
                        animation: fadeIn 0.3s ease;
                    }
                    
                    .auth-prompt-card {
                        background: white;
                        border-radius: 12px;
                        padding: 40px;
                        max-width: 500px;
                        width: 90%;
                        position: relative;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                        animation: slideUp 0.3s ease;
                    }
                    
                    .auth-prompt-icon {
                        width: 80px;
                        height: 80px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 20px;
                    }
                    
                    .auth-prompt-icon i {
                        font-size: 36px;
                        color: white;
                    }
                    
                    .auth-prompt-title {
                        text-align: center;
                        font-size: 24px;
                        font-weight: 600;
                        color: #1a202c;
                        margin-bottom: 10px;
                    }
                    
                    .auth-prompt-message {
                        text-align: center;
                        color: #718096;
                        margin-bottom: 30px;
                        line-height: 1.6;
                    }
                    
                    .auth-prompt-benefits {
                        background: #f7fafc;
                        border-radius: 8px;
                        padding: 20px;
                        margin-bottom: 30px;
                    }
                    
                    .benefit-item {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        margin-bottom: 12px;
                        color: #4a5568;
                    }
                    
                    .benefit-item:last-child {
                        margin-bottom: 0;
                    }
                    
                    .benefit-item i {
                        color: #48bb78;
                        font-size: 18px;
                    }
                    
                    .auth-prompt-actions {
                        display: flex;
                        gap: 12px;
                    }
                    
                    .auth-prompt-actions button {
                        flex: 1;
                        padding: 12px 20px;
                        border-radius: 6px;
                        font-weight: 500;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        transition: all 0.2s ease;
                        cursor: pointer;
                        border: none;
                    }
                    
                    .auth-prompt-actions .btn-primary {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                    }
                    
                    .auth-prompt-actions .btn-primary:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                    }
                    
                    .auth-prompt-actions .btn-secondary {
                        background: #e2e8f0;
                        color: #4a5568;
                    }
                    
                    .auth-prompt-actions .btn-secondary:hover {
                        background: #cbd5e0;
                    }
                    
                    .auth-prompt-close {
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        background: none;
                        border: none;
                        font-size: 20px;
                        color: #a0aec0;
                        cursor: pointer;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 4px;
                        transition: all 0.2s ease;
                    }
                    
                    .auth-prompt-close:hover {
                        background: #f7fafc;
                        color: #4a5568;
                    }
                    
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    
                    @keyframes slideUp {
                        from {
                            transform: translateY(20px);
                            opacity: 0;
                        }
                        to {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }
        
        // Add prompt to page
        document.body.insertAdjacentHTML('beforeend', promptHTML);
        
        // Listen for successful login
        window.addEventListener('authStateChanged', (e) => {
            if (e.detail && e.detail.isAuthenticated) {
                const overlay = document.getElementById('authPromptOverlay');
                if (overlay) {
                    overlay.remove();
                }
                // Re-initialize after login
                this.init(this.currentPageId, this.currentMethod, this.pageType);
            }
        });
    }

    /**
     * Update UI for authenticated user
     */
    updateUIForAuthenticatedUser() {
        const user = window.realUserAuth.getUser();
        if (!user) return;
        
        // Add user info badge
        const userBadge = document.querySelector('.user-progress-badge');
        if (userBadge) {
            userBadge.innerHTML = `
                <div class="user-info">
                    <i class="fas fa-user-circle"></i>
                    <span>${user.name || user.email}</span>
                </div>
                <div class="progress-sync">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Fortschritt wird gespeichert</span>
                </div>
            `;
        }
        
        // Show any hidden authenticated-only content
        document.querySelectorAll('.auth-required').forEach(el => {
            el.style.display = 'block';
        });
        
        // Hide any login prompts
        document.querySelectorAll('.login-prompt').forEach(el => {
            el.style.display = 'none';
        });
    }

    /**
     * Restore saved progress for the current page
     */
    async restoreProgress() {
        if (!window.userProgressTracker) return;
        
        const progress = window.userProgressTracker.getPageProgress(this.currentPageId);
        if (!progress || !progress.formData) return;
        
        console.log('Restoring progress for', this.currentPageId, progress);
        
        // Restore form fields
        Object.keys(progress.formData).forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (field) {
                if (field.type === 'checkbox' || field.type === 'radio') {
                    field.checked = progress.formData[fieldName];
                } else {
                    field.value = progress.formData[fieldName];
                }
            }
        });
        
        // Restore step progress for workflows
        if (progress.steps) {
            Object.keys(progress.steps).forEach(stepId => {
                const stepEl = document.querySelector(`[data-step="${stepId}"]`);
                if (stepEl) {
                    stepEl.classList.add('completed');
                }
            });
        }
        
        // Show restore notification
        this.showNotification('Dein Fortschritt wurde wiederhergestellt', 'success');
    }

    /**
     * Save form data automatically
     */
    setupAutoSave() {
        const forms = document.querySelectorAll('form[data-auto-save="true"]');
        forms.forEach(form => {
            form.addEventListener('change', (e) => {
                this.saveFormData(form);
            });
            
            // Also save on input for text fields (debounced)
            let saveTimeout;
            form.addEventListener('input', (e) => {
                if (e.target.type === 'text' || e.target.type === 'textarea') {
                    clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(() => {
                        this.saveFormData(form);
                    }, 1000);
                }
            });
        });
    }

    /**
     * Save form data
     */
    saveFormData(form) {
        if (!window.userProgressTracker || !window.realUserAuth.isLoggedIn || !window.realUserAuth.isLoggedIn()) return;
        
        const formData = {};
        const fields = form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            if (field.name) {
                if (field.type === 'checkbox' || field.type === 'radio') {
                    if (field.checked) {
                        formData[field.name] = field.value;
                    }
                } else {
                    formData[field.name] = field.value;
                }
            }
        });
        
        window.userProgressTracker.trackFormData(this.currentPageId, formData);
        console.log('Form data saved:', formData);
    }

    /**
     * Track workflow step completion
     */
    completeStep(stepId, totalSteps) {
        if (!window.userProgressTracker || !window.realUserAuth.isLoggedIn || !window.realUserAuth.isLoggedIn()) return;
        
        window.userProgressTracker.trackStepCompletion(this.currentPageId, stepId, totalSteps);
        this.showNotification('Schritt abgeschlossen und gespeichert', 'success');
    }

    /**
     * Track test completion
     */
    completeTest(results) {
        if (!window.userProgressTracker || !window.realUserAuth.isLoggedIn || !window.realUserAuth.isLoggedIn()) return;
        
        window.userProgressTracker.trackTestResult(this.currentPageId, results);
        this.showNotification('Test abgeschlossen und gespeichert', 'success');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `progress-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles if not present
        if (!document.querySelector('#progressNotificationStyles')) {
            const styles = `
                <style id="progressNotificationStyles">
                    .progress-notification {
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        background: white;
                        padding: 16px 24px;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        animation: slideIn 0.3s ease;
                        z-index: 9999;
                    }
                    
                    .progress-notification.success {
                        border-left: 4px solid #48bb78;
                    }
                    
                    .progress-notification.success i {
                        color: #48bb78;
                    }
                    
                    .progress-notification.info {
                        border-left: 4px solid #4299e1;
                    }
                    
                    .progress-notification.info i {
                        color: #4299e1;
                    }
                    
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
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Get progress summary for display
     */
    getProgressSummary() {
        if (!window.userProgressTracker) return null;
        
        const pageProgress = window.userProgressTracker.getPageProgress(this.currentPageId);
        const overallProgress = window.userProgressTracker.getOverallProgress();
        
        return {
            page: pageProgress,
            overall: overallProgress
        };
    }
}

// Create global instance
window.personalityAuthIntegration = new PersonalityAuthIntegration();

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if page has personality development content
    if (document.querySelector('[data-personality-method]') || 
        document.querySelector('.personality-content') ||
        window.location.pathname.includes('/methods/')) {
        
        // Initialize with auto-detected values
        window.personalityAuthIntegration.init();
        window.personalityAuthIntegration.setupAutoSave();
    }
});