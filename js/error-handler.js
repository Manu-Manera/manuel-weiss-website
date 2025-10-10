// 🚨 COMPREHENSIVE ERROR HANDLER
// Zentrale Fehlerbehandlung für alle Auth-Probleme

class AuthErrorHandler {
    constructor() {
        this.errorCount = 0;
        this.maxErrors = 5;
        this.errorHistory = [];
        
        this.setupGlobalErrorHandling();
        this.setupAuthErrorHandling();
    }
    
    setupGlobalErrorHandling() {
        // Globale JavaScript-Fehler
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error, event.filename, event.lineno);
        });
        
        // Unhandled Promise Rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handlePromiseRejection(event.reason);
        });
        
        // Network-Fehler
        this.setupNetworkErrorHandling();
    }
    
    setupAuthErrorHandling() {
        // Auth-spezifische Fehler
        this.authErrorPatterns = {
            // Cognito-Fehler
            'UserNotFoundException': 'Benutzer nicht gefunden',
            'NotAuthorizedException': 'Ungültige Anmeldedaten',
            'InvalidPasswordException': 'Ungültiges Passwort',
            'UserNotConfirmedException': 'E-Mail nicht bestätigt',
            'UsernameExistsException': 'E-Mail bereits registriert',
            'CodeMismatchException': 'Ungültiger Bestätigungscode',
            'ExpiredCodeException': 'Bestätigungscode abgelaufen',
            'LimitExceededException': 'Zu viele Anfragen',
            'TooManyRequestsException': 'Rate Limit erreicht',
            
            // CORS-Fehler
            'CORS': 'CORS-Fehler: Domain nicht konfiguriert',
            'Access-Control-Allow-Origin': 'CORS-Header fehlt',
            
            // Network-Fehler
            'NetworkError': 'Netzwerk-Fehler',
            'Failed to fetch': 'Verbindung fehlgeschlagen',
            'timeout': 'Zeitüberschreitung',
            
            // Token-Fehler
            'Token expired': 'Token abgelaufen',
            'Invalid token': 'Ungültiger Token',
            'Token not found': 'Token nicht gefunden',
            
            // AWS SDK-Fehler
            'AWS SDK': 'AWS SDK-Fehler',
            'CognitoIdentityServiceProvider': 'Cognito-Service-Fehler',
            'UnauthorizedOperation': 'Nicht autorisiert',
            'AccessDenied': 'Zugriff verweigert'
        };
    }
    
    setupNetworkErrorHandling() {
        // Fetch-Interceptor für Network-Fehler
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                
                if (!response.ok) {
                    this.handleNetworkError(response.status, response.statusText, args[0]);
                }
                
                return response;
            } catch (error) {
                this.handleNetworkError(null, error.message, args[0]);
                throw error;
            }
        };
    }
    
    handleGlobalError(error, filename, lineno) {
        console.error('🚨 Global Error:', error);
        
        const errorInfo = {
            type: 'Global Error',
            message: error.message || 'Unknown error',
            filename: filename,
            lineno: lineno,
            timestamp: new Date().toISOString(),
            stack: error.stack
        };
        
        this.logError(errorInfo);
        this.showUserFriendlyError(error);
    }
    
    handlePromiseRejection(reason) {
        console.error('🚨 Unhandled Promise Rejection:', reason);
        
        const errorInfo = {
            type: 'Promise Rejection',
            message: reason.message || reason.toString(),
            timestamp: new Date().toISOString(),
            stack: reason.stack
        };
        
        this.logError(errorInfo);
        this.showUserFriendlyError(reason);
    }
    
    handleNetworkError(status, statusText, url) {
        console.error('🚨 Network Error:', status, statusText, url);
        
        const errorInfo = {
            type: 'Network Error',
            status: status,
            statusText: statusText,
            url: url,
            timestamp: new Date().toISOString()
        };
        
        this.logError(errorInfo);
        
        let userMessage = 'Netzwerk-Fehler aufgetreten';
        
        if (status === 401) {
            userMessage = 'Nicht autorisiert - Bitte erneut anmelden';
        } else if (status === 403) {
            userMessage = 'Zugriff verweigert';
        } else if (status === 404) {
            userMessage = 'Service nicht gefunden';
        } else if (status === 500) {
            userMessage = 'Server-Fehler';
        } else if (status === 0) {
            userMessage = 'Verbindung fehlgeschlagen - Bitte Internetverbindung prüfen';
        }
        
        this.showNotification(userMessage, 'error');
    }
    
    handleAuthError(error, context = '') {
        console.error('🚨 Auth Error:', error, context);
        
        const errorInfo = {
            type: 'Auth Error',
            message: error.message || error.toString(),
            code: error.code,
            context: context,
            timestamp: new Date().toISOString(),
            stack: error.stack
        };
        
        this.logError(errorInfo);
        
        // Benutzerfreundliche Fehlermeldung
        const userMessage = this.getUserFriendlyMessage(error);
        this.showNotification(userMessage, 'error');
        
        // Spezielle Behandlung für bestimmte Fehler
        this.handleSpecialAuthErrors(error);
    }
    
    getUserFriendlyMessage(error) {
        const message = error.message || error.toString();
        
        // Pattern-Matching für bekannte Fehler
        for (const [pattern, friendlyMessage] of Object.entries(this.authErrorPatterns)) {
            if (message.includes(pattern) || (error.code && error.code.includes(pattern))) {
                return friendlyMessage;
            }
        }
        
        // Fallback-Nachrichten
        if (message.includes('CORS')) {
            return 'CORS-Fehler: Bitte Domain in AWS Cognito konfigurieren';
        } else if (message.includes('Network')) {
            return 'Netzwerk-Fehler: Bitte Internetverbindung prüfen';
        } else if (message.includes('Token')) {
            return 'Token-Fehler: Bitte erneut anmelden';
        } else if (message.includes('AWS')) {
            return 'AWS-Service-Fehler: Bitte später erneut versuchen';
        }
        
        return 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
    }
    
    handleSpecialAuthErrors(error) {
        // Spezielle Behandlung für bestimmte Auth-Fehler
        
        if (error.code === 'UserNotConfirmedException') {
            // E-Mail-Bestätigung erforderlich
            this.showConfirmationModal();
        } else if (error.code === 'NotAuthorizedException') {
            // Falsche Anmeldedaten
            this.showLoginRetryModal();
        } else if (error.code === 'TooManyRequestsException') {
            // Rate Limit erreicht
            this.showRateLimitModal();
        } else if (error.message.includes('CORS')) {
            // CORS-Problem
            this.showCORSModal();
        }
    }
    
    showConfirmationModal() {
        const modal = document.createElement('div');
        modal.className = 'error-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>📧 E-Mail-Bestätigung erforderlich</h3>
                    </div>
                    <div class="modal-body">
                        <p>Ihre E-Mail-Adresse wurde noch nicht bestätigt.</p>
                        <p>Bitte prüfen Sie Ihr E-Mail-Postfach und klicken Sie auf den Bestätigungslink.</p>
                        <button onclick="this.closest('.error-modal').remove()" class="btn-primary">
                            Verstanden
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.addModalStyles();
        document.body.appendChild(modal);
    }
    
    showLoginRetryModal() {
        const modal = document.createElement('div');
        modal.className = 'error-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>🔐 Anmeldung fehlgeschlagen</h3>
                    </div>
                    <div class="modal-body">
                        <p>Ungültige Anmeldedaten oder E-Mail nicht bestätigt.</p>
                        <p>Bitte prüfen Sie Ihre Eingaben oder registrieren Sie sich neu.</p>
                        <div class="modal-actions">
                            <button onclick="window.location.reload()" class="btn-primary">
                                Erneut versuchen
                            </button>
                            <button onclick="this.closest('.error-modal').remove()" class="btn-secondary">
                                Schließen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.addModalStyles();
        document.body.appendChild(modal);
    }
    
    showRateLimitModal() {
        const modal = document.createElement('div');
        modal.className = 'error-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>⏰ Zu viele Anfragen</h3>
                    </div>
                    <div class="modal-body">
                        <p>Sie haben zu viele Anmeldeversuche unternommen.</p>
                        <p>Bitte warten Sie 5 Minuten und versuchen Sie es dann erneut.</p>
                        <button onclick="this.closest('.error-modal').remove()" class="btn-primary">
                            Verstanden
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.addModalStyles();
        document.body.appendChild(modal);
    }
    
    showCORSModal() {
        const modal = document.createElement('div');
        modal.className = 'error-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>🌐 CORS-Fehler</h3>
                    </div>
                    <div class="modal-body">
                        <p>CORS-Fehler: Domain nicht in AWS Cognito konfiguriert.</p>
                        <p>Bitte kontaktieren Sie den Administrator.</p>
                        <button onclick="this.closest('.error-modal').remove()" class="btn-primary">
                            Verstanden
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.addModalStyles();
        document.body.appendChild(modal);
    }
    
    showUserFriendlyError(error) {
        const message = this.getUserFriendlyMessage(error);
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type = 'info') {
        // Entferne bestehende Notifications
        document.querySelectorAll('.error-notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `error-notification error-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="notification-close">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove nach 8 Sekunden
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 8000);
    }
    
    logError(errorInfo) {
        this.errorHistory.push(errorInfo);
        this.errorCount++;
        
        // Nur die letzten 10 Fehler behalten
        if (this.errorHistory.length > 10) {
            this.errorHistory.shift();
        }
        
        // Console-Logging
        console.group('🚨 Error Details');
        console.error('Type:', errorInfo.type);
        console.error('Message:', errorInfo.message);
        console.error('Timestamp:', errorInfo.timestamp);
        if (errorInfo.stack) {
            console.error('Stack:', errorInfo.stack);
        }
        console.groupEnd();
        
        // Error-Count-Limit
        if (this.errorCount >= this.maxErrors) {
            console.error('🚨 Too many errors, stopping error handling');
            this.showNotification('Zu viele Fehler aufgetreten. Bitte Seite neu laden.', 'error');
        }
    }
    
    addModalStyles() {
        if (document.getElementById('error-modal-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'error-modal-styles';
        style.textContent = `
            .error-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .modal-content {
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                max-width: 500px;
                width: 100%;
                animation: modalSlideIn 0.3s ease-out;
            }
            
            .modal-header {
                padding: 20px 24px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .modal-header h3 {
                margin: 0;
                color: #1f2937;
                font-size: 1.25rem;
            }
            
            .modal-body {
                padding: 24px;
            }
            
            .modal-actions {
                display: flex;
                gap: 12px;
                margin-top: 16px;
            }
            
            .btn-primary, .btn-secondary {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
            }
            
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .error-notification-content {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                margin-left: auto;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Public API
    getErrorHistory() {
        return this.errorHistory;
    }
    
    getErrorCount() {
        return this.errorCount;
    }
    
    clearErrorHistory() {
        this.errorHistory = [];
        this.errorCount = 0;
    }
}

// Initialize Error Handler
window.authErrorHandler = new AuthErrorHandler();

// Export für andere Module
window.handleAuthError = (error, context) => {
    window.authErrorHandler.handleAuthError(error, context);
};
