/**
 * 🧪 UPLOAD/DOWNLOAD TESTER
 * Spezialisierter Tester für alle Upload/Download-Funktionen
 */

class UploadDownloadTester {
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
        // Create test image
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TEST IMAGE', 100, 100);
        
        this.testFiles.image = new File([await this.canvasToBlob(canvas)], 'test-image.png', { type: 'image/png' });
        
        // Create test document
        const docContent = 'This is a test document for API testing.';
        this.testFiles.document = new File([docContent], 'test-document.txt', { type: 'text/plain' });
        
        console.log('✅ Test files created');
    }
    
    canvasToBlob(canvas) {
        return new Promise(resolve => canvas.toBlob(resolve));
    }
    
    async runUploadTests() {
        console.log('📤 Testing Upload Functions...');
        
        const tests = [
            {
                name: 'Single Image Upload',
                test: () => this.testSingleUpload(this.testFiles.image, 'profile', 'hero'),
                category: 'upload'
            },
            {
                name: 'Single Document Upload', 
                test: () => this.testSingleUpload(this.testFiles.document, 'documents', 'cv'),
                category: 'upload'
            },
            {
                name: 'Bulk Upload',
                test: () => this.testBulkUpload([this.testFiles.image, this.testFiles.document], 'gallery'),
                category: 'upload'
            },
            {
                name: 'Chunked Upload',
                test: () => this.testChunkedUpload(this.testFiles.image),
                category: 'upload'
            },
            {
                name: 'AWS S3 Upload',
                test: () => this.testAWSUpload(this.testFiles.image),
                category: 'upload'
            }
        ];
        
        for (const test of tests) {
            await this.runTest(test);
        }
    }
    
    async runDownloadTests() {
        console.log('📥 Testing Download Functions...');
        
        const tests = [
            {
                name: 'Download by ID',
                test: () => this.testDownloadById('test-file-id'),
                category: 'download'
            },
            {
                name: 'Download Thumbnail',
                test: () => this.testDownloadThumbnail('test-file-id'),
                category: 'download'
            },
            {
                name: 'Bulk Download',
                test: () => this.testBulkDownload(['id1', 'id2']),
                category: 'download'
            },
            {
                name: 'Stream Download',
                test: () => this.testStreamDownload('test-file-id'),
                category: 'download'
            }
        ];
        
        for (const test of tests) {
            await this.runTest(test);
        }
    }
    
    async testSingleUpload(file, category, subcategory) {
        try {
            // Test with Smart Media API
            if (window.smartMediaAPI) {
                const result = await window.smartMediaAPI.uploadFile(file, {
                    category,
                    subcategory,
                    tags: ['test', 'api-test']
                });
                return { success: true, data: result };
            }
            
            // Test with Unified AWS Upload
            if (window.unifiedAWS) {
                const result = await window.unifiedAWS.uploadMedia([file], {
                    category,
                    subcategory
                });
                return { success: true, data: result };
            }
            
            // Fallback: Direct API call
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', category);
            formData.append('subcategory', subcategory);
            
            const response = await fetch('/api/v1/media/upload', {
                method: 'POST',
                body: formData
            });
            
            return {
                success: response.ok,
                data: response.ok ? await response.json() : await response.text()
            };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async testBulkUpload(files, category) {
        try {
            if (window.smartMediaAPI) {
                const result = await window.smartMediaAPI.uploadBulk(files, {
                    category,
                    onProgress: (progress) => console.log(`Upload progress: ${progress}%`)
                });
                return { success: true, data: result };
            }
            
            if (window.unifiedAWS) {
                const result = await window.unifiedAWS.uploadMedia(files, { category });
                return { success: true, data: result };
            }
            
            return { success: false, error: 'No upload system available' };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async testChunkedUpload(file) {
        try {
            const response = await fetch('/api/v1/media/upload/chunked', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                    category: 'test'
                })
            });
            
            return {
                success: response.ok,
                data: response.ok ? await response.json() : await response.text()
            };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async testAWSUpload(file) {
        try {
            if (window.unifiedAWS) {
                const result = await window.unifiedAWS.uploadMedia([file], {
                    category: 'test',
                    subcategory: 'aws-test'
                });
                return { success: true, data: result };
            }
            
            return { success: false, error: 'AWS upload system not available' };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async testDownloadById(fileId) {
        try {
            const response = await fetch(`/api/v1/media/download/${fileId}`);
            return {
                success: response.ok,
                data: response.ok ? 'Download successful' : await response.text()
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async testDownloadThumbnail(fileId) {
        try {
            const response = await fetch(`/api/v1/media/download/thumbnail/${fileId}`);
            return {
                success: response.ok,
                data: response.ok ? 'Thumbnail download successful' : await response.text()
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async testBulkDownload(fileIds) {
        try {
            const response = await fetch('/api/v1/media/download/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileIds })
            });
            
            return {
                success: response.ok,
                data: response.ok ? await response.json() : await response.text()
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async testStreamDownload(fileId) {
        try {
            const response = await fetch(`/api/v1/media/download/stream/${fileId}`);
            return {
                success: response.ok,
                data: response.ok ? 'Stream download successful' : await response.text()
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async runTest(test) {
        try {
            const result = await test.test();
            this.testResults.push({
                name: test.name,
                category: test.category,
                success: result.success,
                data: result.data,
                error: result.error
            });
            
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${test.name}: ${result.success ? 'PASSED' : 'FAILED'}`);
            
        } catch (error) {
            this.testResults.push({
                name: test.name,
                category: test.category,
                success: false,
                error: error.message
            });
            console.log(`💥 ${test.name}: ERROR - ${error.message}`);
        }
    }
    
    async runAllTests() {
        console.log('🚀 Starting Upload/Download Tests...');
        this.testResults = [];
        
        await this.runUploadTests();
        await this.runDownloadTests();
        
        this.displayResults();
        return this.testResults;
    }
    
    displayResults() {
        const passed = this.testResults.filter(r => r.success).length;
        const failed = this.testResults.filter(r => !r.success).length;
        const total = this.testResults.length;
        const successRate = ((passed / total) * 100).toFixed(1);
        
        console.log(`\n📊 UPLOAD/DOWNLOAD TEST RESULTS:`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Total: ${total}`);
        console.log(`📊 Success Rate: ${successRate}%`);
        
        // Create visual results
        this.createVisualResults(passed, failed, total, successRate);
    }
    
    createVisualResults(passed, failed, total, successRate) {
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'upload-download-test-results';
        resultsDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 500px;
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
                <h2 style="margin: 0; color: #333; font-size: 1.5rem;">🧪 Upload/Download Test Results</h2>
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
                            <div style="font-size: 0.8rem; color: #666; margin-bottom: 2px;">Category: ${result.category}</div>
                            ${!result.success && result.error ? `<div style="font-size: 0.8rem; color: #ef4444;">Error: ${result.error}</div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="window.uploadDownloadTester.runAllTests()" style="background: #6366f1; color: white; border: none; border-radius: 6px; padding: 10px 20px; cursor: pointer; font-weight: 500;">
                    🔄 Run Tests Again
                </button>
            </div>
        `;
        
        document.body.appendChild(resultsDiv);
    }
}

// Global instance
window.uploadDownloadTester = new UploadDownloadTester();

console.log('🧪 Upload/Download Tester ready');

