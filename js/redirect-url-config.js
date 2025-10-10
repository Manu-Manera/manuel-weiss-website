// 🔧 REDIRECT URL CONFIGURATION
// Zentrale Konfiguration für alle Redirect URLs

window.REDIRECT_URL_CONFIG = {
    cognito: {
        userPoolId: 'eu-central-1_8gP4gLK9r',
        clientId: '7kc5tt6a23fgh53d60vkefm812',
        region: 'eu-central-1',
        domain: 'manuel-weiss-userfiles-auth-038333965110.auth.eu-central-1.amazoncognito.com'
    },
    
    // Dynamische URL-Generierung
    getBaseUrl() {
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
            return 'http://localhost:8000';
        } else if (window.location.hostname.includes('netlify.app')) {
            return 'https://mawps.netlify.app';
        } else {
            return window.location.origin;
        }
    },
    
    getRedirectUrl(page = '') {
        const baseUrl = this.getBaseUrl();
        return page ? `${baseUrl}/${page}` : baseUrl;
    },
    
    // OAuth URLs
    getLoginUrl() {
        const baseUrl = this.getBaseUrl();
        return `https://${this.cognito.domain}/login?client_id=${this.cognito.clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${encodeURIComponent(baseUrl)}`;
    },
    
    getLogoutUrl() {
        const baseUrl = this.getBaseUrl();
        return `https://${this.cognito.domain}/logout?client_id=${this.cognito.clientId}&logout_uri=${encodeURIComponent(baseUrl)}`;
    }
};

// Globale Funktionen für Kompatibilität
window.getBaseUrl = () => window.REDIRECT_URL_CONFIG.getBaseUrl();
window.getRedirectUrl = (page) => window.REDIRECT_URL_CONFIG.getRedirectUrl(page);
window.getLoginUrl = () => window.REDIRECT_URL_CONFIG.getLoginUrl();
window.getLogoutUrl = () => window.REDIRECT_URL_CONFIG.getLogoutUrl();

console.log('✅ Redirect URL Configuration loaded');
