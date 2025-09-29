// AWS Configuration for Manuel Weiss Website
const AWS_CONFIG = {
    // AWS Region
    region: 'eu-central-1',
    
    // API Gateway Endpoints
    api: {
        baseUrl: 'https://api.manuel-weiss.com',
        upload: '/upload',
        download: '/download',
        users: '/users'
    },
    
    // Cognito Configuration
    cognito: {
        userPoolId: 'eu-central-1_XXXXXXXXX', // Will be updated after deployment
        userPoolClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // Will be updated after deployment
        region: 'eu-central-1'
    },
    
    // S3 Configuration
    s3: {
        bucket: 'manuel-weiss-documents',
        region: 'eu-central-1'
    },
    
    // DynamoDB Configuration
    dynamodb: {
        documentsTable: 'manuel-weiss-documents',
        usersTable: 'manuel-weiss-users',
        region: 'eu-central-1'
    }
};

// AWS SDK Configuration
const AWS_SDK_CONFIG = {
    region: AWS_CONFIG.region,
    credentials: {
        // Will be configured via Cognito Identity Pool
        identityPoolId: 'eu-central-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'
    }
};

// Initialize AWS SDK
if (typeof AWS !== 'undefined') {
    AWS.config.update(AWS_SDK_CONFIG);
}

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AWS_CONFIG, AWS_SDK_CONFIG };
}
