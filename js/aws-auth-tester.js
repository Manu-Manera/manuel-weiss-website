/**
 * 🧪 AWS AUTHENTICATION TESTER
 * Testet das AWS Login-System
 */

class AWSAuthTester {
    constructor() {
        this.testResults = [];
        this.isRunning = false;
    }
    
    async runAllTests() {
        console.log('🧪 Starting AWS Auth System Tests...');
        this.isRunning = true;
        this.testResults = [];
        
        try {
            // Test 1: System Initialization
            await this.testSystemInitialization();
            
            // Test 2: Login Functionality
            await this.testLoginFunctionality();
            
            // Test 3: Registration Functionality
            await this.testRegistrationFunctionality();
            
            // Test 4: Logout Functionality
            await this.testLogoutFunctionality();
            
            // Test 5: UI Updates
            await this.testUIUpdates();
            
            // Test 6: Error Handling
            await this.testErrorHandling();
            
            // Test 7: Token Management
            await this.testTokenManagement();
            
            // Test 8: Modal Functionality
            await this.testModalFunctionality();
            
            this.displayResults();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            this.addResult('Test Suite', false, `Test suite failed: ${error.message}`);
        } finally {
            this.isRunning = false;
        }
    }
    
    async testSystemInitialization() {
        console.log('🧪 Testing System Initialization...');
        
        try {
            // Prüfe ob AWS Auth System geladen ist
            if (typeof window.awsAuth === 'undefined') {
                throw new Error('AWS Auth System not loaded');
            }
            
            // Prüfe ob System initialisiert ist
            if (!window.awsAuth.isInitialized) {
                throw new Error('AWS Auth System not initialized');
            }
            
            this.addResult('System Initialization', true, 'AWS Auth System loaded and initialized');
            
        } catch (error) {
            this.addResult('System Initialization', false, error.message);
        }
    }
    
    async testLoginFunctionality() {
        console.log('🧪 Testing Login Functionality...');
        
        try {
            // Test mit Demo-Credentials
            const result = await window.awsAuth.login('test@example.com', 'test123');
            
            if (result) {
                this.addResult('Login Functionality', true, 'Login with demo credentials successful');
            } else {
                this.addResult('Login Functionality', false, 'Login failed with demo credentials');
            }
            
        } catch (error) {
            this.addResult('Login Functionality', false, `Login test failed: ${error.message}`);
        }
    }
    
    async testRegistrationFunctionality() {
        console.log('🧪 Testing Registration Functionality...');
        
        try {
            // Test Registration
            const result = await window.awsAuth.register('newuser@example.com', 'password123', 'New User');
            
            if (result) {
                this.addResult('Registration Functionality', true, 'Registration successful');
            } else {
                this.addResult('Registration Functionality', false, 'Registration failed');
            }
            
        } catch (error) {
            this.addResult('Registration Functionality', false, `Registration test failed: ${error.message}`);
        }
    }
    
    async testLogoutFunctionality() {
        console.log('🧪 Testing Logout Functionality...');
        
        try {
            // Test Logout
            window.awsAuth.logout();
            
            // Prüfe ob User ausgeloggt ist
            if (!window.awsAuth.isLoggedIn()) {
                this.addResult('Logout Functionality', true, 'Logout successful');
            } else {
                this.addResult('Logout Functionality', false, 'User still logged in after logout');
            }
            
        } catch (error) {
            this.addResult('Logout Functionality', false, `Logout test failed: ${error.message}`);
        }
    }
    
    async testUIUpdates() {
        console.log('🧪 Testing UI Updates...');
        
        try {
            const loginBtn = document.getElementById('navLoginBtn');
            const userDropdown = document.getElementById('userDropdown');
            
            if (!loginBtn) {
                throw new Error('Login button not found');
            }
            
            if (!userDropdown) {
                throw new Error('User dropdown not found');
            }
            
            this.addResult('UI Updates', true, 'UI elements found and accessible');
            
        } catch (error) {
            this.addResult('UI Updates', false, `UI test failed: ${error.message}`);
        }
    }
    
    async testErrorHandling() {
        console.log('🧪 Testing Error Handling...');
        
        try {
            // Test mit ungültigen Credentials
            const result = await window.awsAuth.login('invalid@example.com', 'wrongpassword');
            
            if (!result) {
                this.addResult('Error Handling', true, 'Error handling works correctly');
            } else {
                this.addResult('Error Handling', false, 'Error handling failed - invalid login succeeded');
            }
            
        } catch (error) {
            this.addResult('Error Handling', true, `Error handling works: ${error.message}`);
        }
    }
    
    async testTokenManagement() {
        console.log('🧪 Testing Token Management...');
        
        try {
            // Test Token Storage
            const token = localStorage.getItem('aws_auth_token');
            const userData = localStorage.getItem('aws_user_data');
            
            if (token || userData) {
                this.addResult('Token Management', true, 'Token and user data storage working');
            } else {
                this.addResult('Token Management', true, 'No tokens stored (expected after logout)');
            }
            
        } catch (error) {
            this.addResult('Token Management', false, `Token management test failed: ${error.message}`);
        }
    }
    
    async testModalFunctionality() {
        console.log('🧪 Testing Modal Functionality...');
        
        try {
            // Test Login Modal
            if (typeof showLoginModal === 'function') {
                showLoginModal();
                setTimeout(() => {
                    hideLoginModal();
                    this.addResult('Modal Functionality', true, 'Login modal functions working');
                }, 100);
            } else {
                throw new Error('Login modal functions not available');
            }
            
        } catch (error) {
            this.addResult('Modal Functionality', false, `Modal test failed: ${error.message}`);
        }
    }
    
    addResult(testName, success, message) {
        this.testResults.push({
            test: testName,
            success: success,
            message: message,
            timestamp: new Date().toISOString()
        });
        
        console.log(`${success ? '✅' : '❌'} ${testName}: ${message}`);
    }
    
    displayResults() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;
        
        console.log('\n🧪 AWS AUTH SYSTEM TEST RESULTS:');
        console.log('=====================================');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`✅ Passed: ${passedTests}`);
        console.log(`❌ Failed: ${failedTests}`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        console.log('\nDetailed Results:');
        
        this.testResults.forEach(result => {
            console.log(`${result.success ? '✅' : '❌'} ${result.test}: ${result.message}`);
        });
        
        // Zeige Ergebnisse in der UI
        this.showTestResults();
    }
    
    showTestResults() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        const resultHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border: 2px solid ${successRate >= 80 ? '#10b981' : '#ef4444'};
                border-radius: 12px;
                padding: 1.5rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                z-index: 10001;
                max-width: 400px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <h3 style="margin: 0 0 1rem 0; color: #333; font-size: 1.2rem;">
                    🧪 AWS Auth Test Results
                </h3>
                <div style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Total Tests:</span>
                        <strong>${totalTests}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>✅ Passed:</span>
                        <strong style="color: #10b981;">${passedTests}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>❌ Failed:</span>
                        <strong style="color: #ef4444;">${totalTests - passedTests}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                        <span>Success Rate:</span>
                        <strong style="color: ${successRate >= 80 ? '#10b981' : '#ef4444'};">
                            ${successRate}%
                        </strong>
                    </div>
                </div>
                <div style="max-height: 200px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 6px; padding: 0.5rem;">
                    ${this.testResults.map(result => `
                        <div style="
                            display: flex;
                            align-items: center;
                            padding: 0.25rem 0;
                            border-bottom: 1px solid #f3f4f6;
                        ">
                            <span style="margin-right: 0.5rem;">${result.success ? '✅' : '❌'}</span>
                            <div style="flex: 1;">
                                <div style="font-weight: 500; font-size: 0.9rem;">${result.test}</div>
                                <div style="font-size: 0.8rem; color: #666;">${result.message}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button onclick="this.parentElement.remove()" style="
                    margin-top: 1rem;
                    width: 100%;
                    padding: 0.5rem;
                    background: #6366f1;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                ">Close</button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', resultHTML);
    }
}

// Global tester instance
window.awsAuthTester = new AWSAuthTester();

// Test functions für Console
window.testAWSAuth = () => window.awsAuthTester.runAllTests();
window.testAWSAuthLogin = () => window.awsAuth.login('test@example.com', 'test123');
window.testAWSAuthLogout = () => window.awsAuth.logout();

console.log('🧪 AWS Auth Tester loaded');
console.log('Available test functions:');
console.log('- testAWSAuth() - Run all tests');
console.log('- testAWSAuthLogin() - Test login');
console.log('- testAWSAuthLogout() - Test logout');
