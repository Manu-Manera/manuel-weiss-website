// Global API Configuration for Manuel Weiss Multi-User System
// Zentralisierte Konfiguration für alle Frontend-Module

// AWS Configuration
const AWS_CONFIG = {
    region: 'eu-central-1',
    cognito: {
        userPoolId: 'eu-central-1_8gP4gLK9r',
        clientId: '7kc5tt6a23fgh53d60vkefm812',
        domain: 'manuel-weiss-userfiles-auth-038333965110.auth.eu-central-1.amazoncognito.com',
        region: 'eu-central-1'
    },
    s3: {
        bucket: 'manuel-weiss-userfiles-files-038333965110',
        region: 'eu-central-1'
    },
    dynamodb: {
        tableName: 'manuel-weiss-userfiles-documents',
        region: 'eu-central-1'
    }
};

// API Endpoints - Diese werden vom Deployment-Skript aktualisiert
const API_CONFIG = {
    // Default für lokale Entwicklung
    baseUrl: '/api',
    
    // Diese Werte werden vom deploy-aws.sh Skript mit echten URLs ersetzt
    endpoints: {
        // User Management
        adminUsers: '/admin/users',
        adminAnalytics: '/admin/analytics',
        adminUserActivity: '/admin/user-activity',
        adminSystemHealth: '/admin/system-health',
        adminBulkActions: '/admin/bulk-actions',
        
        // Document Management
        uploadUrl: '/upload-url',
        docs: '/docs',
        downloadUrl: '/download-url',
        
        // User Profile
        userProfile: '/user-profile',
        userProgress: '/user-profile/progress'
    }
};

// Login/Logout URLs - werden ebenfalls vom Deployment-Skript aktualisiert
const AUTH_CONFIG = {
    loginUrl: `https://${AWS_CONFIG.cognito.domain}/login?client_id=${AWS_CONFIG.cognito.clientId}&response_type=code&scope=email+openid+profile&redirect_uri=https%3A//manuel-weiss.com/`,
    logoutUrl: `https://${AWS_CONFIG.cognito.domain}/logout?client_id=${AWS_CONFIG.cognito.clientId}&logout_uri=https%3A//manuel-weiss.com`
};

// Global verfügbar machen
window.AWS_CONFIG = AWS_CONFIG;
window.API_CONFIG = API_CONFIG;
window.AUTH_CONFIG = AUTH_CONFIG;

// Für Rückwärtskompatibilität
window.API_BASE = API_CONFIG.baseUrl;

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AWS_CONFIG, API_CONFIG, AUTH_CONFIG };
}

console.log('🔧 Global API Configuration loaded:', {
    baseUrl: API_CONFIG.baseUrl,
    cognitoPool: AWS_CONFIG.cognito.userPoolId,
    s3Bucket: AWS_CONFIG.s3.bucket
});
