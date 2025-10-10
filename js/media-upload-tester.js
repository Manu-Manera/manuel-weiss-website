/**
 * 🧪 MEDIA UPLOAD TESTER
 * Spezialisierter Tester für alle Upload-Funktionen
 */

class MediaUploadTester {
    constructor() {
        this.testResults = [];
        this.testFiles = {
            image: null,
            document: null,
            video: null
        };
        
        this.initializeTestFiles();
    }
    
    async initializeTestFiles() {
        console.log('📁 Creating test files...');
        
        // Create test image
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        // Draw test image
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TEST IMAGE', 100, 100);
        ctx.fillText('UPLOAD TEST', 100, 130);
        
        this.testFiles.image = new File([await this.canvasToBlob(canvas)], 'test-image.png', { type: 'image/png' });
        
        // Create test document
        const docContent = 'This is a test document for upload testing.\n\nTest content:\n- Line 1\n- Line 2\n- Line 3';
        this.testFiles.document = new File([docContent], 'test-document.txt', { type: 'text/plain' });
        
        // Create test video (simulated)
        const videoBlob = new Blob(['fake video content'], { type: 'video/mp4' });
        this.testFiles.video = new File([videoBlob], 'test-video.mp4', { type: 'video/mp4' });
        
        console.log('✅ Test files created:', {
            image: this.testFiles.image,
            document: this.testFiles.document,
            video: this.testFiles.video
        });
    }
    
    canvasToBlob(canvas) {
        return new Promise(resolve => canvas.toBlob(resolve));
    }
    
    async runAllUploadTests() {
        console.log('🚀 Starting comprehensive upload tests...');
        this.testResults = [];
        
        // Test different upload systems
        await this.testSmartMediaAPI();
        await this.testUnifiedAWS();
        await this.testDirectAPI();
        await this.testAdminPanelUploads();
        
        this.displayResults();
        return this.testResults;
    }
    
    async testSmartMediaAPI() {
        console.log('📤 Testing Smart Media API...');
        
        if (!window.smartMediaAPI) {
            this.addResult('Smart Media API', 'Not Available', false, 'Smart Media API not loaded');
            return;
        }
        
        const tests = [
            {
                name: 'Smart Media API - Single Image Upload',
                test: () => this.testSmartMediaSingleUpload(this.testFiles.image, 'profile', 'hero')
            },
            {
                name: 'Smart Media API - Bulk Upload',
                test: () => this.testSmartMediaBulkUpload([this.testFiles.image, this.testFiles.document], 'gallery')
            },
            {
                name: 'Smart Media API - Document Upload',
                test: () => this.testSmartMediaSingleUpload(this.testFiles.document, 'documents', 'cv')
            }
        ];
        
        for (const test of tests) {
            await this.runTest(test);
        }
    }
    
    async testUnifiedAWS() {
        console.log('📤 Testing Unified AWS Upload...');
        
        if (!window.unifiedAWS) {
            this.addResult('Unified AWS', 'Not Available', false, 'Unified AWS not loaded');
            return;
        }
        
        const tests = [
            {
                name: 'Unified AWS - Single Image Upload',
                test: () => this.testUnifiedAWSUpload(this.testFiles.image, 'profile', 'hero')
            },
            {
                name: 'Unified AWS - Document Upload',
                test: () => this.testUnifiedAWSUpload(this.testFiles.document, 'documents', 'cv')
            },
            {
                name: 'Unified AWS - Bulk Upload',
                test: () => this.testUnifiedAWSBulkUpload([this.testFiles.image, this.testFiles.document], 'gallery')
            }
        ];
        
        for (const test of tests) {
            await this.runTest(test);
        }
    }
    
    async testDirectAPI() {
        console.log('📤 Testing Direct API Calls...');
        
        const tests = [
            {
                name: 'Direct API - Image Upload',
                test: () => this.testDirectAPIUpload(this.testFiles.image, 'profile', 'hero')
            },
            {
                name: 'Direct API - Document Upload',
                test: () => this.testDirectAPIUpload(this.testFiles.document, 'documents', 'cv')
            },
            {
                name: 'Direct API - Bulk Upload',
                test: () => this.testDirectAPIBulkUpload([this.testFiles.image, this.testFiles.document], 'gallery')
            }
        ];
        
        for (const test of tests) {
            await this.runTest(test);
        }
    }
    
    async testAdminPanelUploads() {
        console.log('📤 Testing Admin Panel Uploads...');
        
        const tests = [
            {
                name: 'Admin Panel - Profile Image Upload',
                test: () => this.testAdminPanelUpload('profile', 'hero')
            },
            {
                name: 'Admin Panel - Document Upload',
                test: () => this.testAdminPanelUpload('documents', 'cv')
            },
            {
                name: 'Admin Panel - Service Image Upload',
                test: () => this.testAdminPanelUpload('services', 'images')
            }
        ];
        
        for (const test of tests) {
            await this.runTest(test);
        }
    }
    
    // Smart Media API Tests
    async testSmartMediaSingleUpload(file, category, subcategory) {
        try {
            const result = await window.smartMediaAPI.uploadFile(file, {
                category,
                subcategory,
                tags: ['test', 'upload-test'],
                onProgress: (progress) => console.log(`Upload progress: ${progress}%`),
                onComplete: (result) => console.log('Upload completed:', result),
                onError: (error) => console.error('Upload error:', error)
            });
            
            return {
                success: true,
                data: result,
                message: 'Smart Media API upload successful'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Smart Media API upload failed'
            };
        }
    }
    
    async testSmartMediaBulkUpload(files, category) {
        try {
            const result = await window.smartMediaAPI.uploadBulk(files, {
                category,
                onProgress: (progress) => console.log(`Bulk upload progress: ${progress}%`)
            });
            
            return {
                success: true,
                data: result,
                message: 'Smart Media API bulk upload successful'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Smart Media API bulk upload failed'
            };
        }
    }
    
    // Unified AWS Tests
    async testUnifiedAWSUpload(file, category, subcategory) {
        try {
            const result = await window.unifiedAWS.uploadMedia([file], {
                category,
                subcategory
            });
            
            return {
                success: true,
                data: result,
                message: 'Unified AWS upload successful'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Unified AWS upload failed'
            };
        }
    }
    
    async testUnifiedAWSBulkUpload(files, category) {
        try {
            const result = await window.unifiedAWS.uploadMedia(files, {
                category
            });
            
            return {
                success: true,
                data: result,
                message: 'Unified AWS bulk upload successful'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Unified AWS bulk upload failed'
            };
        }
    }
    
    // Direct API Tests
    async testDirectAPIUpload(file, category, subcategory) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', category);
            formData.append('subcategory', subcategory);
            
            const response = await fetch('/api/v1/media/upload', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    data: data,
                    message: 'Direct API upload successful'
                };
            } else {
                const errorText = await response.text();
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${errorText}`,
                    message: 'Direct API upload failed'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Direct API upload failed - Network error'
            };
        }
    }
    
    async testDirectAPIBulkUpload(files, category) {
        try {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));
            formData.append('category', category);
            
            const response = await fetch('/api/v1/media/bulk-upload', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    data: data,
                    message: 'Direct API bulk upload successful'
                };
            } else {
                const errorText = await response.text();
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${errorText}`,
                    message: 'Direct API bulk upload failed'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Direct API bulk upload failed - Network error'
            };
        }
    }
    
    // Admin Panel Tests
    async testAdminPanelUpload(category, subcategory) {
        try {
            // Simulate admin panel upload by finding upload inputs
            const uploadInputs = document.querySelectorAll(`input[data-category="${category}"]`);
            
            if (uploadInputs.length === 0) {
                return {
                    success: false,
                    error: 'No upload input found for category',
                    message: `No upload input found for ${category}/${subcategory}`
                };
            }
            
            const input = uploadInputs[0];
            const file = this.testFiles.image;
            
            // Simulate file selection
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            input.files = dataTransfer.files;
            
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
            
            return {
                success: true,
                data: { input: input.id, file: file.name },
                message: 'Admin panel upload simulation successful'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Admin panel upload simulation failed'
            };
        }
    }
    
    async runTest(test) {
        try {
            console.log(`🧪 Testing: ${test.name}`);
            const result = await test.test();
            
            this.addResult(
                test.name,
                result.success ? 'PASSED' : 'FAILED',
                result.success,
                result.message,
                result.data,
                result.error
            );
            
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${test.name}: ${result.success ? 'PASSED' : 'FAILED'}`);
            
        } catch (error) {
            this.addResult(
                test.name,
                'ERROR',
                false,
                'Test execution failed',
                null,
                error.message
            );
            console.log(`💥 ${test.name}: ERROR - ${error.message}`);
        }
    }
    
    addResult(name, status, success, message, data = null, error = null) {
        this.testResults.push({
            name,
            status,
            success,
            message,
            data,
            error,
            timestamp: new Date().toISOString()
        });
    }
    
    displayResults() {
        const passed = this.testResults.filter(r => r.success).length;
        const failed = this.testResults.filter(r => !r.success).length;
        const total = this.testResults.length;
        const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
        
        console.log(`\n📊 MEDIA UPLOAD TEST RESULTS:`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Total: ${total}`);
        console.log(`📊 Success Rate: ${successRate}%`);
        
        // Display detailed results
        console.log('\n📋 DETAILED RESULTS:');
        this.testResults.forEach((result, index) => {
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${index + 1}. ${result.name} - ${result.status}`);
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }
            if (result.data) {
                console.log(`   Data: ${JSON.stringify(result.data, null, 2)}`);
            }
        });
        
        // Create visual results
        this.createVisualResults(passed, failed, total, successRate);
    }
    
    createVisualResults(passed, failed, total, successRate) {
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'media-upload-test-results';
        resultsDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            background: white;
            border: 1px solid #ddd;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            z-index: 10001;
            padding: 24px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        const statusColor = successRate >= 80 ? '#22c55e' : successRate >= 60 ? '#f59e0b' : '#ef4444';
        
        resultsDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 style="margin: 0; color: #333; font-size: 1.5rem;">🧪 Media Upload Test Results</h2>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">×</button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
                <div style="text-align: center; padding: 16px; background: #f0f9ff; border-radius: 8px;">
                    <div style="font-size: 2rem; font-weight: bold; color: #22c55e;">${passed}</div>
                    <div style="font-size: 0.9rem; color: #666; margin-top: 4px;">Passed</div>
                </div>
                <div style="text-align: center; padding: 16px; background: #fef3f2; border-radius: 8px;">
                    <div style="font-size: 2rem; font-weight: bold; color: #ef4444;">${failed}</div>
                    <div style="font-size: 0.9rem; color: #666; margin-top: 4px;">Failed</div>
                </div>
                <div style="text-align: center; padding: 16px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 2rem; font-weight: bold; color: #6366f1;">${total}</div>
                    <div style="font-size: 0.9rem; color: #666; margin-top: 4px;">Total</div>
                </div>
                <div style="text-align: center; padding: 16px; background: #f0fdf4; border-radius: 8px;">
                    <div style="font-size: 2rem; font-weight: bold; color: ${statusColor};">${successRate}%</div>
                    <div style="font-size: 0.9rem; color: #666; margin-top: 4px;">Success</div>
                </div>
            </div>
            
            <div style="max-height: 400px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px;">
                ${this.testResults.map((result, index) => `
                    <div style="display: flex; align-items: center; padding: 12px; border-bottom: 1px solid #f3f4f6;">
                        <span style="margin-right: 12px; font-size: 1.2rem;">
                            ${result.success ? '✅' : '❌'}
                        </span>
                        <div style="flex: 1;">
                            <div style="font-weight: 500; color: #333; margin-bottom: 4px;">${result.name}</div>
                            <div style="font-size: 0.8rem; color: #666; margin-bottom: 2px;">${result.message}</div>
                            ${result.error ? `<div style="font-size: 0.8rem; color: #ef4444;">Error: ${result.error}</div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="window.mediaUploadTester.runAllUploadTests()" style="background: #6366f1; color: white; border: none; border-radius: 6px; padding: 10px 20px; cursor: pointer; font-weight: 500;">
                    🔄 Run Tests Again
                </button>
            </div>
        `;
        
        document.body.appendChild(resultsDiv);
    }
}

// Global instance
window.mediaUploadTester = new MediaUploadTester();

// Auto-run tests when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧪 Media Upload Tester loaded');
    
    // Add test button if in admin panel
    if (document.getElementById('media') || window.location.pathname.includes('admin')) {
        const testButton = document.createElement('button');
        testButton.innerHTML = '🧪 Test Media Upload';
        testButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 20px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        `;
        testButton.onclick = () => window.mediaUploadTester.runAllUploadTests();
        document.body.appendChild(testButton);
    }
});

console.log('🧪 Media Upload Tester ready');
