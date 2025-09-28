// Admin Connection Test - Diagnose für AWS API-Verbindung
// Hilft bei der Diagnose von Verbindungsproblemen nach AWS-Umstellung

class AdminConnectionTest {
    constructor() {
        this.testResults = {};
        this.init();
    }
    
    async init() {
        console.log('🔍 Admin Connection Test starting...');
        
        // Warten auf API-Konfiguration
        await this.waitForApiConfig();
        
        // Tests ausführen
        await this.runAllTests();
        
        // Ergebnisse anzeigen
        this.showResults();
    }
    
    async waitForApiConfig() {
        let attempts = 0;
        while (!window.API_CONFIG && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }
    
    async runAllTests() {
        this.testResults = {
            apiConfig: this.testApiConfig(),
            awsConfig: this.testAwsConfig(),
            authentication: await this.testAuthentication(),
            apiEndpoints: await this.testApiEndpoints(),
            userManagement: await this.testUserManagement()
        };
    }
    
    testApiConfig() {
        const config = window.API_CONFIG;
        return {
            present: !!config,
            baseUrl: config?.baseUrl,
            hasEndpoints: !!config?.endpoints,
            status: config ? 'OK' : 'FEHLER - Nicht geladen'
        };
    }
    
    testAwsConfig() {
        const config = window.AWS_CONFIG;
        return {
            present: !!config,
            cognito: config?.cognito,
            s3: config?.s3,
            status: config ? 'OK' : 'FEHLER - Nicht geladen'
        };
    }
    
    async testAuthentication() {
        try {
            const globalAuth = window.GlobalAuth;
            const isAuthenticated = globalAuth?.isAuthenticated();
            const currentUser = globalAuth?.getCurrentUser();
            
            return {
                globalAuthPresent: !!globalAuth,
                isAuthenticated: !!isAuthenticated,
                hasUser: !!currentUser,
                hasIdToken: !!currentUser?.idToken,
                status: isAuthenticated ? 'OK' : 'WARNUNG - Nicht eingeloggt'
            };
        } catch (error) {
            return {
                status: 'FEHLER - ' + error.message,
                error: error.message
            };
        }
    }
    
    async testApiEndpoints() {
        const baseUrl = window.API_CONFIG?.baseUrl || '/api';
        const tests = [];
        
        // Test verschiedene Endpoints
        const endpoints = [
            '/admin/users',
            '/admin/analytics', 
            '/admin/system-health'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(baseUrl + endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${window.GlobalAuth?.getCurrentUser()?.idToken || 'test-token'}`
                    }
                });
                
                tests.push({
                    endpoint,
                    status: response.status,
                    ok: response.ok,
                    result: response.ok ? 'OK' : `FEHLER - ${response.status}`
                });
            } catch (error) {
                tests.push({
                    endpoint,
                    status: 'NETWORK_ERROR',
                    ok: false,
                    result: 'FEHLER - ' + error.message,
                    error: error.message
                });
            }
        }
        
        return {
            baseUrl,
            tests,
            allWorking: tests.every(t => t.ok),
            status: tests.every(t => t.ok) ? 'OK' : 'FEHLER - Mindestens ein Endpoint nicht erreichbar'
        };
    }
    
    async testUserManagement() {
        try {
            const userManagement = window.AdminUserManagementUI;
            return {
                classAvailable: !!userManagement,
                status: userManagement ? 'OK' : 'FEHLER - Klasse nicht geladen'
            };
        } catch (error) {
            return {
                status: 'FEHLER - ' + error.message,
                error: error.message
            };
        }
    }
    
    showResults() {
        console.log('📊 ===== ADMIN CONNECTION TEST RESULTS =====');
        console.log('');
        
        // API-Konfiguration
        const apiConfig = this.testResults.apiConfig;
        console.log('🔧 API-Konfiguration:', apiConfig.status);
        if (apiConfig.present) {
            console.log('   Base URL:', apiConfig.baseUrl);
            console.log('   Endpoints definiert:', apiConfig.hasEndpoints ? 'Ja' : 'Nein');
        }
        
        // AWS-Konfiguration
        const awsConfig = this.testResults.awsConfig;
        console.log('☁️ AWS-Konfiguration:', awsConfig.status);
        if (awsConfig.present) {
            console.log('   Cognito Pool ID:', awsConfig.cognito?.userPoolId);
            console.log('   S3 Bucket:', awsConfig.s3?.bucket);
        }
        
        // Authentifizierung
        const auth = this.testResults.authentication;
        console.log('🔐 Authentifizierung:', auth.status);
        console.log('   GlobalAuth vorhanden:', auth.globalAuthPresent ? 'Ja' : 'Nein');
        console.log('   Eingeloggt:', auth.isAuthenticated ? 'Ja' : 'Nein');
        console.log('   ID Token vorhanden:', auth.hasIdToken ? 'Ja' : 'Nein');
        
        // API-Endpoints
        const endpoints = this.testResults.apiEndpoints;
        console.log('🌐 API-Endpoints:', endpoints.status);
        console.log('   Base URL:', endpoints.baseUrl);
        endpoints.tests.forEach(test => {
            console.log(`   ${test.endpoint}: ${test.result}`);
        });
        
        // User Management
        const userMgmt = this.testResults.userManagement;
        console.log('👥 User Management:', userMgmt.status);
        
        console.log('');
        console.log('📋 ===== DIAGNOSE =====');
        
        if (!apiConfig.present) {
            console.log('❌ KRITISCH: API_CONFIG nicht geladen - js/api-config.js fehlt');
        }
        
        if (!awsConfig.present) {
            console.log('❌ KRITISCH: AWS_CONFIG nicht geladen - js/api-config.js Problem');
        }
        
        if (!auth.isAuthenticated) {
            console.log('⚠️ WARNUNG: Nicht eingeloggt - User Management funktioniert nur für Admins');
        }
        
        if (!endpoints.allWorking) {
            console.log('❌ KRITISCH: API-Endpoints nicht erreichbar - AWS-Deployment prüfen');
            console.log('   Mögliche Ursachen:');
            console.log('   - AWS Lambda Functions nicht deployed');
            console.log('   - API Gateway nicht korrekt konfiguriert');
            console.log('   - CORS-Probleme');
            console.log('   - Falsche API-URL in Konfiguration');
        }
        
        if (!userMgmt.classAvailable) {
            console.log('❌ FEHLER: AdminUserManagementUI-Klasse nicht verfügbar');
        }
        
        console.log('');
        console.log('🔧 LÖSUNGSVORSCHLÄGE:');
        console.log('1. deploy-aws.sh Script ausführen, um Konfiguration zu aktualisieren');
        console.log('2. Browser-Cache leeren und Seite neu laden');
        console.log('3. AWS CloudFormation Stack-Status prüfen');
        console.log('4. Browser-Entwicklertools auf Netzwerk-Fehler prüfen');
        
        // Test-Button für Admin Panel hinzufügen
        this.addTestButtonToAdmin();
    }
    
    addTestButtonToAdmin() {
        // Suche nach einem Admin-Container und füge Test-Button hinzu
        const adminContainer = document.querySelector('.admin-section, .admin-container, #admin-dashboard');
        if (adminContainer) {
            const testButton = document.createElement('button');
            testButton.textContent = '🔍 API-Verbindungstest';
            testButton.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                background: #4f46e5;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `;
            
            testButton.onclick = () => {
                this.runAllTests().then(() => this.showResults());
            };
            
            document.body.appendChild(testButton);
        }
    }
}

// Auto-Start wenn DOM bereit ist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => new AdminConnectionTest(), 2000);
    });
} else {
    setTimeout(() => new AdminConnectionTest(), 2000);
}

// Global verfügbar machen für manuellen Test
window.AdminConnectionTest = AdminConnectionTest;
