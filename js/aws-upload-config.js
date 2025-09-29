// AWS Upload Configuration für Bewerbungsworkflow
const AWS_UPLOAD_CONFIG = {
    // AWS API Gateway Endpoints
    endpoints: {
        // Primary AWS endpoints
        upload: [
            'https://api.manuel-weiss.com/upload',
            'https://manuel-weiss.com/api/upload',
            'https://d1234567890.execute-api.eu-central-1.amazonaws.com/api/upload'
        ],
        download: [
            'https://api.manuel-weiss.com/download',
            'https://manuel-weiss.com/api/download',
            'https://d1234567890.execute-api.eu-central-1.amazonaws.com/api/download'
        ],
        // Fallback endpoints
        fallback: [
            'http://localhost:3001/api/upload',
            '/api/upload'
        ]
    },
    
    // S3 Configuration
    s3: {
        bucket: 'manuel-weiss-documents',
        region: 'eu-central-1',
        maxFileSize: 15 * 1024 * 1024, // 15MB
        allowedTypes: [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ]
    },
    
    // Cognito Configuration
    cognito: {
        userPoolId: 'eu-central-1_XXXXXXXXX',
        userPoolClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
        region: 'eu-central-1'
    },
    
    // Upload Settings
    upload: {
        maxRetries: 3,
        timeout: 30000, // 30 seconds
        chunkSize: 1024 * 1024, // 1MB chunks
        enableProgress: true
    }
};

// AWS Upload Service
class AWSUploadService {
    constructor() {
        this.config = AWS_UPLOAD_CONFIG;
        this.retryCount = 0;
    }
    
    async uploadFile(file, type = 'document', onProgress = null) {
        console.log('🚀 AWS Upload Service: Starting upload for', file.name);
        
        try {
            // Validate file
            this.validateFile(file);
            
            // Convert to base64 for AWS Lambda
            const base64Data = await this.fileToBase64(file);
            
            const uploadData = {
                file: {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: base64Data
                },
                type: type,
                userId: this.getUserId(),
                timestamp: new Date().toISOString()
            };
            
            // Try AWS endpoints first
            for (const endpoint of this.config.endpoints.upload) {
                try {
                    console.log(`🔄 Trying AWS endpoint: ${endpoint}`);
                    
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        body: JSON.stringify(uploadData),
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.getAuthToken()}`
                        }
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        console.log('✅ AWS Upload successful:', result);
                        return {
                            success: true,
                            id: result.id,
                            name: result.name,
                            size: result.size,
                            type: result.type,
                            uploadedAt: result.uploadedAt,
                            storage: 'aws-s3',
                            url: result.url,
                            s3Key: result.s3Key
                        };
                    }
                } catch (error) {
                    console.warn(`⚠️ AWS endpoint failed: ${endpoint}`, error);
                    continue;
                }
            }
            
            // Fallback to local server
            console.log('🔄 Falling back to local server...');
            return await this.uploadToLocalServer(file, type);
            
        } catch (error) {
            console.error('❌ AWS Upload failed:', error);
            throw error;
        }
    }
    
    async uploadToLocalServer(file, type) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('userId', this.getUserId());
        
        for (const endpoint of this.config.endpoints.fallback) {
            try {
                console.log(`🔄 Trying local endpoint: ${endpoint}`);
                
                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${this.getAuthToken()}`
                    }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Local upload successful:', result);
                    return {
                        success: true,
                        id: result.id,
                        name: result.name,
                        size: result.size,
                        type: result.type,
                        uploadedAt: result.uploadedAt,
                        storage: 'local',
                        url: result.url
                    };
                }
            } catch (error) {
                console.warn(`⚠️ Local endpoint failed: ${endpoint}`, error);
                continue;
            }
        }
        
        throw new Error('All upload endpoints failed');
    }
    
    validateFile(file) {
        // Check file size
        if (file.size > this.config.s3.maxFileSize) {
            throw new Error(`File too large. Maximum size: ${this.config.s3.maxFileSize / 1024 / 1024}MB`);
        }
        
        // Check file type
        if (!this.config.s3.allowedTypes.includes(file.type)) {
            throw new Error(`File type not allowed. Allowed types: ${this.config.s3.allowedTypes.join(', ')}`);
        }
    }
    
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64 = reader.result.split(',')[1]; // Remove data:type;base64, prefix
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }
    
    getUserId() {
        // Try to get user from global function
        if (typeof getUser === 'function') {
            const user = getUser();
            return user?.userId || 'anonymous';
        }
        return 'anonymous';
    }
    
    getAuthToken() {
        // Try to get auth token from global function
        if (typeof getUser === 'function') {
            const user = getUser();
            return user?.idToken || '';
        }
        return '';
    }
    
    async downloadFile(fileId) {
        console.log('📥 AWS Download Service: Downloading file', fileId);
        
        try {
            for (const endpoint of this.config.endpoints.download) {
                try {
                    const response = await fetch(`${endpoint}/${fileId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${this.getAuthToken()}`
                        }
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        console.log('✅ AWS Download successful:', result);
                        return result;
                    }
                } catch (error) {
                    console.warn(`⚠️ Download endpoint failed: ${endpoint}`, error);
                    continue;
                }
            }
            
            throw new Error('All download endpoints failed');
        } catch (error) {
            console.error('❌ AWS Download failed:', error);
            throw error;
        }
    }
}

// Global AWS Upload Service instance
window.awsUploadService = new AWSUploadService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AWSUploadService, AWS_UPLOAD_CONFIG };
}