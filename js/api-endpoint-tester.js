/**
 * 🧪 API ENDPOINT TESTER
 * Umfassender Test aller API-Endpunkte für Upload/Download von Medien
 */

class APIEndpointTester {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
        
        this.config = {
            baseUrl: 'https://api.manuel-weiss.com',
            testFile: null,
            authToken: null
        };
        
        this.initializeTestFile();
    }
    
    /**
     * 📁 TEST FILE PREPARATION
     */
    
    async initializeTestFile() {
        // Create a test file for upload testing
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        // Create a simple test image
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TEST', 50, 50);
        
        // Convert to blob
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                this.testFile = new File([blob], 'test-image.png', { type: 'image/png' });
                console.log('✅ Test file created:', this.testFile);
                resolve();
            });
        });
    }
    
    /**
     * 🔐 AUTHENTICATION SETUP
     */
    
    async setupAuthentication() {
        // Try to get auth token from localStorage
        this.config.authToken = localStorage.getItem('authToken') || localStorage.getItem('openai_api_key');
        
        if (!this.config.authToken) {
            console.warn('⚠️ No auth token found, using mock token for testing');
            this.config.authToken = 'mock-token-for-testing';
        }
        
        console.log('🔐 Authentication setup:', this.config.authToken ? 'Token found' : 'No token');
    }
    
    /**
     * 🧪 CORE TESTING FUNCTIONS
     */
    
    async runAllTests() {
        console.log('🚀 Starting comprehensive API endpoint testing...');
        
        await this.setupAuthentication();
        
        // Test categories
        const testCategories = [
            'media-upload',
            'media-download', 
            'media-list',
            'media-delete',
            'media-analytics',
            'ai-analysis',
            'bulk-operations',
            'system-health'
        ];
        
        for (const category of testCategories) {
            await this.testCategory(category);
        }
        
        this.displayResults();
        return this.testResults;
    }
    
    async testCategory(category) {
        console.log(`\n📋 Testing category: ${category}`);
        
        switch (category) {
            case 'media-upload':
                await this.testMediaUpload();
                break;
            case 'media-download':
                await this.testMediaDownload();
                break;
            case 'media-list':
                await this.testMediaList();
                break;
            case 'media-delete':
                await this.testMediaDelete();
                break;
            case 'media-analytics':
                await this.testMediaAnalytics();
                break;
            case 'ai-analysis':
                await this.testAIAnalysis();
                break;
            case 'bulk-operations':
                await this.testBulkOperations();
                break;
            case 'system-health':
                await this.testSystemHealth();
                break;
        }
    }
    
    /**
     * 📤 MEDIA UPLOAD TESTS
     */
    
    async testMediaUpload() {
        const tests = [
            {
                name: 'Single File Upload',
                endpoint: '/api/v1/media/upload',
                method: 'POST',
                test: async () => {
                    const formData = new FormData();
                    formData.append('file', this.testFile);
                    formData.append('category', 'test');
                    formData.append('subcategory', 'upload-test');
                    
                    const response = await fetch(`${this.config.baseUrl}/api/v1/media/upload`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.config.authToken}`
                        },
                        body: formData
                    });
                    
                    return {
                        status: response.status,
                        ok: response.ok,
                        data: response.ok ? await response.json() : await response.text()
                    };
                }
            },
            {
                name: 'Bulk File Upload',
                endpoint: '/api/v1/media/bulk-upload',
                method: 'POST',
                test: async () => {
                    const formData = new FormData();
                    formData.append('files', this.testFile);
                    formData.append('files', this.testFile);
                    formData.append('category', 'test');
                    
                    const response = await fetch(`${this.config.baseUrl}/api/v1/media/bulk-upload`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.config.authToken}`
                        },
                        body: formData
                    });
                    
                    return {
                        status: response.status,
                        ok: response.ok,
                        data: response.ok ? await response.json() : await response.text()
                    };
                }
            },
            {
                name: 'Chunked Upload',
                endpoint: '/api/v1/media/upload/chunked',
                method: 'POST',
                test: async () => {
                    const response = await fetch(`${this.config.baseUrl}/api/v1/media/upload/chunked`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.config.authToken}`
                        },
                        body: JSON.stringify({
                            fileName: this.testFile.name,
                            fileSize: this.testFile.size,
                            fileType: this.testFile.type,
                            category: 'test'
                        })
                    });
                    
                    return {
                        status: response.status,
                        ok: response.ok,
                        data: response.ok ? await response.json() : await response.text()
                    };
                }
            }
        ];
        
        for (const test of tests) {
            await this.runTest(test);
        }
    }
    
    /**
     * 📥 MEDIA DOWNLOAD TESTS
     */
    
    async testMediaDownload() {
        const tests = [
            {
                name: 'Download by ID',
                endpoint: '/api/v1/media/download/{fileId}',
                method: 'GET',
                test: async () => {
                    // First, try to get a file ID from the list
                    const listResponse = await fetch(`${this.config.baseUrl}/api/v1/media/list?limit=1`, {
                        headers: {
                            'Authorization': `Bearer ${this.config.authToken}`
                        }
                    });
                    
                    if (!listResponse.ok) {
                        return {
                            status: listResponse.status,
                            ok: false,
                            data: 'Could not get file list for download test'
                        };
                    }
                    
                    const listData = await listResponse.json();
                    if (!listData.files || listData.files.length === 0) {
                        return {
                            status: 404,
                            ok: false,
                            data: 'No files available for download test'
                        };
                    }
                    
                    const fileId = listData.files[0].id;
                    const response = await fetch(`${this.config.baseUrl}/api/v1/media/download/${fileId}`, {
                        headers: {
                            'Authorization': `Bearer ${this.config.authToken}`
                        }
                    });
                    
                    return {
                        status: response.status,
                        ok: response.ok,
                        data: response.ok ? 'File download successful' : await response.text()
                    };
                }
            },
            {
                name: 'Thumbnail Download',
                endpoint: '/api/v1/media/download/thumbnail/{fileId}',
                method: 'GET',
                test: async () => {
                    const response = await fetch(`${this.config.baseUrl}/api/v1/media/download/thumbnail/test-id`, {
                        headers: {
                            'Authorization': `Bearer ${this.config.authToken}`
                        }
                    });
                    
                    return {
                        status: response.status,
                        ok: response.ok,
                        data: response.ok ? 'Thumbnail download successful' : await response.text()
                    };
                }
            }
        ];
        
        for (const test of tests) {
            await this.runTest(test);
        }
    }
    
    /**
     * 📋 MEDIA LIST TESTS
     */
    
    async testMediaList() {
        const tests = [
            {
                name: 'List All Media',
                endpoint: '/api/v1/media/list',
                method: 'GET',
                test: async () => {
                    const response = await fetch(`${this.config.baseUrl}/api/v1/media/list`, {
                        headers: {
                            'Authorization': `Bearer ${this.config.authToken}`
                        }
                    });
                    
                    return {
                        status: response.status,
                        ok: response.ok,
                        data: response.ok ? await response.json() : await response.text()
                    };
                }
            },
            {
                name: 'List with Filters',
                endpoint: '/api/v1/media/list?category=test',
                method: 'GET',
                test: async () => {
                    const response = await fetch(`${this.config.baseUrl}/api/v1/media/list?category=test&limit=10`, {
                        headers: {
                            'Authorization': `Bearer ${this.config.authToken}`
                        }
                    });
                    
                    return {
                        status: response.status,
                        ok: response.ok,
                        data: response.ok ? await response.json() : await response.text()
                    };
                }
            },
            {
                name: 'Search Media',
                endpoint: '/api/v1/media/search',
                method: 'GET',
                test: async () => {
                    const response = await fetch(`${this.config.baseUrl}/api/v1/media/search?query=test`, {
                        headers: {
                            'Authorization': `Bearer ${this.config.authToken}`
                        }
                    });
                    
                    return {
                        status: response.status,
                        ok: response.ok,
                        data: response.ok ? await response.json() : await response.text()
                    };
                }
            }
        ];
        
        for (const test of tests) {
            await this.runTest(test);
        }
    }
    
    /**
     * 🗑️ MEDIA DELETE TESTS
     */
    
    async testMediaDelete() {
        const tests = [
            {
                name: 'Delete by ID',
                endpoint: '/api/v1/media/delete/{fileId}',
                method: 'DELETE',
                test: async () => {
                    const response = await fetch(`${this.config.baseUrl}/api/v1/media/delete/test-file-id`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${this.config.authToken}`
                        }
                    });
                    
                    return {
                        status: response.status,
                        ok: response.ok,
                        data: response.ok ? await response.json() : await response.text()
                    };
                }
            },
            {
                name: 'Bulk Delete',
                endpoint: '/api/v1/media/bulk-delete',
                method: 'POST',
                test: async () => {
                    const response = await fetch(`${this.config.baseUrl}/api/v1/media/bulk-delete`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.config.authToken}`
                        },
                        body: JSON.stringify({
                            fileIds: ['test-id-1', 'test-id-2']
                        })
                    });
                    
                    return {
                        status: response.status,
                        ok: response.ok,
                        data: response.ok ? await response.json() : await response.text()
                    };
                }
            }
        ];
        
        for (const test of tests) {
            await this.runTest(test);
        }
    }
    
    /**
     * 📊 MEDIA ANALYTICS TESTS
     */
    
    async testMediaAnalytics() {
        const tests = [
            {
                name: 'Get Analytics',
                endpoint: '/api/v1/media/analytics',
                method: 'GET',
                test: async () => {
                    const response = await fetch(`${this.config.baseUrl}/api/v1/media/analytics?range=30d`, {
                        headers: {
                            'Authorization': `Bearer ${this.config.authToken}`
                        }
                    });
                    
                    return {
                        status: response.status,
                        ok: response.ok,
                        data: response.ok ? await response.json() : await response.text()
                    };
                }
            },
            {
                name: 'Get Usage Stats',
                endpoint: '/api/v1/media/usage',
                method: 'GET',
                test: async () => {
                    const response = await fetch(`${this.config.baseUrl}/api/v1/media/usage`, {
                        headers: {
                            'Authorization': `Bearer ${this.config.authToken}`
                        }
                    });
                    
                    return {
                        status: response.status,
                        ok: response.ok,
                        data: response.ok ? await response.json() : await response.text()
                    };
                }
            }
        ];
        
        for (const test of tests) {
            await this.runTest(test);
        }
    }
    
    /**
     * 🤖 AI ANALYSIS TESTS
     */
    
    async testAIAnalysis() {
        const tests = [
            {
                name: 'AI Content Analysis',
                endpoint: '/api/v1/media/ai/analyze',
                method: 'POST',
                test: async () => {
                    const response = await fetch(`${this.config.baseUrl}/api/v1/media/ai/analyze`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.config.authToken}`
                        },
                        body: JSON.stringify({
                            fileId: 'test-file-id',
                            analysisType: 'content'
                        })
                    });
                    
                    return {
                        status: response.status,
                        ok: response.ok,
                        data: response.ok ? await response.json() : await response.text()
                    };
                }
            },
            {
                name: 'AI Search',
                endpoint: '/api/v1/media/ai/search',
                method: 'GET',
                test: async () => {
                    const response = await fetch(`${this.config.baseUrl}/api/v1/media/ai/search?query=test`, {
                        headers: {
                            'Authorization': `Bearer ${this.config.authToken}`
                        }
                    });
                    
                    return {
                        status: response.status,
                        ok: response.ok,
                        data: response.ok ? await response.json() : await response.text()
                    };
                }
            }
        ];
        
        for (const test of tests) {
            await this.runTest(test);
        }
    }
    
    /**
     * 📦 BULK OPERATIONS TESTS
     */
    
    async testBulkOperations() {
        const tests = [
            {
                name: 'Bulk Compress',
                endpoint: '/api/v1/media/compress',
                method: 'POST',
                test: async () => {
                    const response = await fetch(`${this.config.baseUrl}/api/v1/media/compress`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.config.authToken}`
                        },
                        body: JSON.stringify({
                            fileIds: ['test-id-1', 'test-id-2'],
                            quality: 80
                        })
                    });
                    
                    return {
                        status: response.status,
                        ok: response.ok,
                        data: response.ok ? await response.json() : await response.text()
                    };
                }
            },
            {
                name: 'Generate Thumbnails',
                endpoint: '/api/v1/media/thumbnails',
                method: 'POST',
                test: async () => {
                    const response = await fetch(`${this.config.baseUrl}/api/v1/media/thumbnails`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.config.authToken}`
                        },
                        body: JSON.stringify({
                            fileId: 'test-file-id',
                            sizes: ['small', 'medium', 'large']
                        })
                    });
                    
                    return {
                        status: response.status,
                        ok: response.ok,
                        data: response.ok ? await response.json() : await response.text()
                    };
                }
            }
        ];
        
        for (const test of tests) {
            await this.runTest(test);
        }
    }
    
    /**
     * 🔧 SYSTEM HEALTH TESTS
     */
    
    async testSystemHealth() {
        const tests = [
            {
                name: 'System Health Check',
                endpoint: '/api/v1/system/health',
                method: 'GET',
                test: async () => {
                    const response = await fetch(`${this.config.baseUrl}/api/v1/system/health`);
                    
                    return {
                        status: response.status,
                        ok: response.ok,
                        data: response.ok ? await response.json() : await response.text()
                    };
                }
            },
            {
                name: 'Media Health Check',
                endpoint: '/api/v1/media/health',
                method: 'GET',
                test: async () => {
                    const response = await fetch(`${this.config.baseUrl}/api/v1/media/health`);
                    
                    return {
                        status: response.status,
                        ok: response.ok,
                        data: response.ok ? await response.json() : await response.text()
                    };
                }
            }
        ];
        
        for (const test of tests) {
            await this.runTest(test);
        }
    }
    
    /**
     * 🧪 INDIVIDUAL TEST RUNNER
     */
    
    async runTest(test) {
        this.testResults.total++;
        
        try {
            console.log(`🧪 Testing: ${test.name}`);
            const result = await test.test();
            
            if (result.ok) {
                this.testResults.passed++;
                console.log(`✅ ${test.name}: PASSED`);
                this.testResults.details.push({
                    name: test.name,
                    endpoint: test.endpoint,
                    method: test.method,
                    status: 'PASSED',
                    response: result
                });
            } else {
                this.testResults.failed++;
                console.log(`❌ ${test.name}: FAILED (${result.status})`);
                this.testResults.details.push({
                    name: test.name,
                    endpoint: test.endpoint,
                    method: test.method,
                    status: 'FAILED',
                    error: result.data,
                    statusCode: result.status
                });
            }
        } catch (error) {
            this.testResults.failed++;
            console.log(`💥 ${test.name}: ERROR - ${error.message}`);
            this.testResults.details.push({
                name: test.name,
                endpoint: test.endpoint,
                method: test.method,
                status: 'ERROR',
                error: error.message
            });
        }
    }
    
    /**
     * 📊 RESULTS DISPLAY
     */
    
    displayResults() {
        console.log('\n📊 API TEST RESULTS:');
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log(`📈 Total: ${this.testResults.total}`);
        console.log(`📊 Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
        
        // Display detailed results
        console.log('\n📋 DETAILED RESULTS:');
        this.testResults.details.forEach((detail, index) => {
            const status = detail.status === 'PASSED' ? '✅' : '❌';
            console.log(`${status} ${index + 1}. ${detail.name} (${detail.method} ${detail.endpoint})`);
            if (detail.status !== 'PASSED') {
                console.log(`   Error: ${detail.error || detail.statusCode}`);
            }
        });
        
        // Create visual results in DOM
        this.createResultsDisplay();
    }
    
    createResultsDisplay() {
        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'api-test-results';
        resultsContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
        const statusColor = successRate >= 80 ? '#22c55e' : successRate >= 60 ? '#f59e0b' : '#ef4444';
        
        resultsContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #333;">🧪 API Test Results</h3>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 10px; background: #f0f9ff; border-radius: 6px;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #22c55e;">${this.testResults.passed}</div>
                    <div style="font-size: 0.9rem; color: #666;">Passed</div>
                </div>
                <div style="text-align: center; padding: 10px; background: #fef3f2; border-radius: 6px;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #ef4444;">${this.testResults.failed}</div>
                    <div style="font-size: 0.9rem; color: #666;">Failed</div>
                </div>
                <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #6366f1;">${this.testResults.total}</div>
                    <div style="font-size: 0.9rem; color: #666;">Total</div>
                </div>
            </div>
            
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 2rem; font-weight: bold; color: ${statusColor};">${successRate}%</div>
                <div style="font-size: 0.9rem; color: #666;">Success Rate</div>
            </div>
            
            <div style="max-height: 300px; overflow-y: auto;">
                ${this.testResults.details.map((detail, index) => `
                    <div style="display: flex; align-items: center; padding: 8px; border-bottom: 1px solid #eee;">
                        <span style="margin-right: 10px; font-size: 1.2rem;">
                            ${detail.status === 'PASSED' ? '✅' : '❌'}
                        </span>
                        <div style="flex: 1;">
                            <div style="font-weight: 500; color: #333;">${detail.name}</div>
                            <div style="font-size: 0.8rem; color: #666;">${detail.method} ${detail.endpoint}</div>
                            ${detail.status !== 'PASSED' ? `<div style="font-size: 0.8rem; color: #ef4444;">${detail.error || detail.statusCode}</div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        document.body.appendChild(resultsContainer);
    }
}

// Global instance
window.apiTester = new APIEndpointTester();

// Auto-run tests when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧪 API Endpoint Tester loaded');
    
    // Add test button to admin panel if available
    if (document.getElementById('media')) {
        const testButton = document.createElement('button');
        testButton.innerHTML = '🧪 Test API Endpoints';
        testButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #6366f1;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 20px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        `;
        testButton.onclick = () => window.apiTester.runAllTests();
        document.body.appendChild(testButton);
    }
});

console.log('🧪 API Endpoint Tester ready');

