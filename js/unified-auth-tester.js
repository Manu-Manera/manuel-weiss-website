/**
 * UNIFIED AWS AUTH TESTER
 * Browser-basiertes Test-Script für das Auth-System
 * 
 * Verwendung: Öffne Browser-Konsole und führe aus:
 *   window.authTester.runAllTests()
 */

class UnifiedAuthTester {
    constructor() {
        this.testResults = [];
        this.currentTest = null;
    }

    /**
     * Test-Ergebnis protokollieren
     */
    logResult(testName, passed, message = '') {
        const result = {
            test: testName,
            passed,
            message,
            timestamp: new Date().toISOString()
        };
        this.testResults.push(result);
        
        const icon = passed ? '✅' : '❌';
        console.log(`${icon} ${testName}${message ? ': ' + message : ''}`);
        
        return result;
    }

    /**
     * Warte auf Bedingung
     */
    async waitFor(condition, timeout = 5000, interval = 100) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (await condition()) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        return false;
    }

    /**
     * Test 1: System Initialisierung
     */
    async testInitialization() {
        this.currentTest = 'Initialization';
        console.log('\n🧪 Test 1: System Initialisierung');
        
        try {
            // Prüfe ob AWS SDK geladen ist
            const awsLoaded = typeof AWS !== 'undefined';
            this.logResult('AWS SDK geladen', awsLoaded, 
                awsLoaded ? '' : 'AWS SDK konnte nicht geladen werden');
            
            // Prüfe ob Auth-System geladen ist
            const authLoaded = window.awsAuth !== undefined;
            this.logResult('Auth-System geladen', authLoaded,
                authLoaded ? '' : 'Auth-System konnte nicht geladen werden');
            
            // Prüfe ob Auth-System initialisiert ist
            const authInitialized = authLoaded && window.awsAuth.isInitialized;
            this.logResult('Auth-System initialisiert', authInitialized,
                authInitialized ? '' : 'Auth-System ist nicht initialisiert');
            
            // Prüfe ob Modals geladen sind
            const modalsLoaded = window.authModals !== undefined;
            this.logResult('Modal-System geladen', modalsLoaded,
                modalsLoaded ? '' : 'Modal-System konnte nicht geladen werden');
            
            // Prüfe ob Container vorhanden ist
            const containerExists = document.getElementById('authModalsContainer') !== null;
            this.logResult('Modal-Container vorhanden', containerExists,
                containerExists ? '' : 'authModalsContainer nicht gefunden');
            
            return awsLoaded && authLoaded && authInitialized && modalsLoaded && containerExists;
        } catch (error) {
            this.logResult('Initialisierung Test', false, error.message);
            return false;
        }
    }

    /**
     * Test 2: Konfiguration
     */
    async testConfiguration() {
        this.currentTest = 'Configuration';
        console.log('\n🧪 Test 2: Konfiguration');
        
        try {
            if (!window.awsAuth) {
                this.logResult('Konfiguration Test', false, 'Auth-System nicht verfügbar');
                return false;
            }
            
            const config = window.AWS_AUTH_CONFIG;
            const hasConfig = config !== undefined;
            this.logResult('Konfiguration vorhanden', hasConfig);
            
            if (hasConfig) {
                const hasUserPoolId = config.cognito && config.cognito.userPoolId;
                const hasClientId = config.cognito && config.cognito.clientId;
                const hasRegion = config.cognito && config.cognito.region;
                
                this.logResult('User Pool ID konfiguriert', hasUserPoolId,
                    hasUserPoolId ? config.cognito.userPoolId : 'Fehlend');
                this.logResult('Client ID konfiguriert', hasClientId,
                    hasClientId ? config.cognito.clientId : 'Fehlend');
                this.logResult('Region konfiguriert', hasRegion,
                    hasRegion ? config.cognito.region : 'Fehlend');
            }
            
            return hasConfig;
        } catch (error) {
            this.logResult('Konfiguration Test', false, error.message);
            return false;
        }
    }

    /**
     * Test 3: UI-Elemente
     */
    async testUIElements() {
        this.currentTest = 'UI Elements';
        console.log('\n🧪 Test 3: UI-Elemente');
        
        try {
            // Prüfe Login-Buttons
            const loginButtons = document.querySelectorAll('.nav-login-btn, .login-btn, button[onclick*="login"]');
            const hasLoginButtons = loginButtons.length > 0;
            this.logResult('Login-Buttons vorhanden', hasLoginButtons,
                hasLoginButtons ? `${loginButtons.length} gefunden` : 'Keine Login-Buttons gefunden');
            
            // Prüfe Modals
            const loginModal = document.getElementById('loginModal');
            const registerModal = document.getElementById('registerModal');
            const verificationModal = document.getElementById('verificationModal');
            
            this.logResult('Login Modal vorhanden', loginModal !== null);
            this.logResult('Register Modal vorhanden', registerModal !== null);
            this.logResult('Verification Modal vorhanden', verificationModal !== null);
            
            return hasLoginButtons && loginModal && registerModal && verificationModal;
        } catch (error) {
            this.logResult('UI-Elemente Test', false, error.message);
            return false;
        }
    }

    /**
     * Test 4: Modal-Funktionen
     */
    async testModalFunctions() {
        this.currentTest = 'Modal Functions';
        console.log('\n🧪 Test 4: Modal-Funktionen');
        
        try {
            if (!window.authModals) {
                this.logResult('Modal-Funktionen Test', false, 'Modal-System nicht verfügbar');
                return false;
            }
            
            // Test showLogin
            try {
                window.authModals.showLogin();
                await new Promise(resolve => setTimeout(resolve, 100));
                const loginModalVisible = document.getElementById('loginModal')?.style.display === 'flex';
                this.logResult('showLogin() funktioniert', loginModalVisible);
                
                window.authModals.closeModal();
            } catch (error) {
                this.logResult('showLogin()', false, error.message);
            }
            
            // Test showRegister
            try {
                window.authModals.showRegister();
                await new Promise(resolve => setTimeout(resolve, 100));
                const registerModalVisible = document.getElementById('registerModal')?.style.display === 'flex';
                this.logResult('showRegister() funktioniert', registerModalVisible);
                
                window.authModals.closeModal();
            } catch (error) {
                this.logResult('showRegister()', false, error.message);
            }
            
            return true;
        } catch (error) {
            this.logResult('Modal-Funktionen Test', false, error.message);
            return false;
        }
    }

    /**
     * Test 5: Session-Management
     */
    async testSessionManagement() {
        this.currentTest = 'Session Management';
        console.log('\n🧪 Test 5: Session-Management');
        
        try {
            if (!window.awsAuth) {
                this.logResult('Session-Management Test', false, 'Auth-System nicht verfügbar');
                return false;
            }
            
            // Prüfe isLoggedIn
            const isLoggedIn = window.awsAuth.isLoggedIn();
            this.logResult('isLoggedIn() funktioniert', typeof isLoggedIn === 'boolean',
                `Aktuell: ${isLoggedIn ? 'angemeldet' : 'nicht angemeldet'}`);
            
            // Prüfe getCurrentUser
            const currentUser = window.awsAuth.getCurrentUser();
            if (isLoggedIn) {
                this.logResult('getCurrentUser() gibt User zurück', currentUser !== null,
                    currentUser ? `Email: ${currentUser.email}` : 'Kein User zurückgegeben');
            } else {
                this.logResult('getCurrentUser() gibt null zurück (nicht angemeldet)', currentUser === null);
            }
            
            // Prüfe localStorage
            const session = localStorage.getItem(window.AWS_AUTH_CONFIG.token.storageKey);
            if (isLoggedIn) {
                this.logResult('Session in localStorage', session !== null,
                    session ? 'Session vorhanden' : 'Keine Session gefunden');
            } else {
                this.logResult('Keine Session in localStorage (nicht angemeldet)', session === null);
            }
            
            return true;
        } catch (error) {
            this.logResult('Session-Management Test', false, error.message);
            return false;
        }
    }

    /**
     * Test 6: Helper-Funktionen
     */
    async testHelperFunctions() {
        this.currentTest = 'Helper Functions';
        console.log('\n🧪 Test 6: Helper-Funktionen');
        
        try {
            // Prüfe globale Helper-Funktionen
            const hasShowLogin = typeof window.showLogin === 'function';
            const hasShowRegister = typeof window.showRegister === 'function';
            const hasLogout = typeof window.logout === 'function';
            
            this.logResult('showLogin() verfügbar', hasShowLogin);
            this.logResult('showRegister() verfügbar', hasShowRegister);
            this.logResult('logout() verfügbar', hasLogout);
            
            return hasShowLogin && hasShowRegister && hasLogout;
        } catch (error) {
            this.logResult('Helper-Funktionen Test', false, error.message);
            return false;
        }
    }

    /**
     * Test 7: Error-Handling
     */
    async testErrorHandling() {
        this.currentTest = 'Error Handling';
        console.log('\n🧪 Test 7: Error-Handling');
        
        try {
            if (!window.awsAuth) {
                this.logResult('Error-Handling Test', false, 'Auth-System nicht verfügbar');
                return false;
            }
            
            // Test Notification-System
            try {
                window.awsAuth.showNotification('Test-Nachricht', 'info');
                await new Promise(resolve => setTimeout(resolve, 100));
                const notification = document.querySelector('.aws-auth-notification');
                this.logResult('Notification-System funktioniert', notification !== null);
                
                if (notification) {
                    notification.remove();
                }
            } catch (error) {
                this.logResult('Notification-System', false, error.message);
            }
            
            return true;
        } catch (error) {
            this.logResult('Error-Handling Test', false, error.message);
            return false;
        }
    }

    /**
     * Alle Tests ausführen
     */
    async runAllTests() {
        console.log('🚀 Starte Unified Auth System Tests...\n');
        console.log('═══════════════════════════════════════════');
        
        this.testResults = [];
        
        const tests = [
            this.testInitialization.bind(this),
            this.testConfiguration.bind(this),
            this.testUIElements.bind(this),
            this.testModalFunctions.bind(this),
            this.testSessionManagement.bind(this),
            this.testHelperFunctions.bind(this),
            this.testErrorHandling.bind(this)
        ];
        
        const results = [];
        for (const test of tests) {
            try {
                const result = await test();
                results.push(result);
            } catch (error) {
                console.error('❌ Test fehlgeschlagen:', error);
                results.push(false);
            }
        }
        
        // Zusammenfassung
        console.log('\n═══════════════════════════════════════════');
        console.log('📊 TEST-ZUSAMMENFASSUNG\n');
        
        const passed = this.testResults.filter(r => r.passed).length;
        const failed = this.testResults.filter(r => !r.passed).length;
        const total = this.testResults.length;
        
        console.log(`Gesamt: ${total} Tests`);
        console.log(`✅ Bestanden: ${passed}`);
        console.log(`❌ Fehlgeschlagen: ${failed}`);
        console.log(`📈 Erfolgsquote: ${((passed / total) * 100).toFixed(1)}%`);
        
        if (failed > 0) {
            console.log('\n❌ Fehlgeschlagene Tests:');
            this.testResults
                .filter(r => !r.passed)
                .forEach(r => {
                    console.log(`   - ${r.test}: ${r.message || 'Unbekannter Fehler'}`);
                });
        }
        
        // Erstelle Test-Report
        this.testReport = {
            timestamp: new Date().toISOString(),
            total,
            passed,
            failed,
            successRate: (passed / total) * 100,
            results: this.testResults
        };
        
        console.log('\n💾 Test-Report gespeichert in window.authTester.testReport');
        
        return this.testReport;
    }

    /**
     * Interaktiver Test: Registrierung
     */
    async testRegistrationInteractive(email, password, firstName, lastName) {
        console.log('\n🧪 Interaktiver Test: Registrierung');
        console.log(`E-Mail: ${email}`);
        console.log(`Name: ${firstName} ${lastName}`);
        
        if (!window.awsAuth) {
            console.error('❌ Auth-System nicht verfügbar');
            return false;
        }
        
        try {
            const result = await window.awsAuth.registerWithAttributes(
                email, password, firstName, lastName
            );
            
            if (result.success) {
                console.log('✅ Registrierung erfolgreich!');
                console.log('📧 Bitte prüfen Sie Ihr E-Mail-Postfach für den Bestätigungscode.');
                return true;
            } else {
                console.error('❌ Registrierung fehlgeschlagen:', result.error);
                return false;
            }
        } catch (error) {
            console.error('❌ Fehler bei Registrierung:', error);
            return false;
        }
    }

    /**
     * Interaktiver Test: Login
     */
    async testLoginInteractive(email, password) {
        console.log('\n🧪 Interaktiver Test: Login');
        console.log(`E-Mail: ${email}`);
        
        if (!window.awsAuth) {
            console.error('❌ Auth-System nicht verfügbar');
            return false;
        }
        
        try {
            const result = await window.awsAuth.login(email, password);
            
            if (result.success) {
                console.log('✅ Login erfolgreich!');
                console.log('👤 User:', result.user);
                return true;
            } else {
                console.error('❌ Login fehlgeschlagen:', result.error);
                return false;
            }
        } catch (error) {
            console.error('❌ Fehler bei Login:', error);
            return false;
        }
    }

    /**
     * Interaktiver Test: Logout
     */
    async testLogoutInteractive() {
        console.log('\n🧪 Interaktiver Test: Logout');
        
        if (!window.awsAuth) {
            console.error('❌ Auth-System nicht verfügbar');
            return false;
        }
        
        try {
            const result = await window.awsAuth.logout();
            
            if (result.success) {
                console.log('✅ Logout erfolgreich!');
                return true;
            } else {
                console.error('❌ Logout fehlgeschlagen:', result.error);
                return false;
            }
        } catch (error) {
            console.error('❌ Fehler bei Logout:', error);
            return false;
        }
    }
}

// Globale Instanz erstellen
window.authTester = new UnifiedAuthTester();

// Helper für einfache Verwendung
window.testAuth = {
    all: () => window.authTester.runAllTests(),
    register: (email, password, firstName, lastName) => 
        window.authTester.testRegistrationInteractive(email, password, firstName, lastName),
    login: (email, password) => 
        window.authTester.testLoginInteractive(email, password),
    logout: () => window.authTester.testLogoutInteractive(),
    report: () => window.authTester.testReport
};

console.log('✅ Auth Tester geladen!');
console.log('📝 Verfügbare Befehle:');
console.log('   window.authTester.runAllTests() - Alle Tests ausführen');
console.log('   window.testAuth.all() - Kurzform');
console.log('   window.testAuth.register(email, password, firstName, lastName) - Registrierung testen');
console.log('   window.testAuth.login(email, password) - Login testen');
console.log('   window.testAuth.logout() - Logout testen');
console.log('   window.testAuth.report() - Letzten Test-Report anzeigen');

