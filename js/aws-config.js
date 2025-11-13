// AWS Configuration for Production
window.AWS_CONFIG = {
    // Cognito User Pool Configuration
    userPoolId: 'eu-central-1_8gP4gLK9r', // ✅ Live User Pool ID
    clientId: '7kc5tt6a23fgh53d60vkefm812', // ✅ Live Client ID
    region: 'eu-central-1',
    
    // Domain Configuration
    domain: {
        name: 'manuel-weiss.ch',
        email: 'mail@manuel-weiss.ch',
        region: 'eu-central-1'
    },
    
    // S3 Configuration for file uploads
    s3: {
        bucket: 'mawps-user-files-1760106396',
        region: 'eu-central-1'
    },
    
    // DynamoDB Configuration for user data
    dynamodb: {
        tableName: 'mawps-user-profiles',
        region: 'eu-central-1'
    },
    
    // API Gateway Configuration
    apiGateway: {
        baseUrl: 'https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod',
        endpoints: {
            userProfile: '/user/profile',
            userProgress: '/user/progress',
            userSettings: '/user/settings'
        }
    },
    
    // API Base URL (für Kompatibilität)
    apiBaseUrl: 'https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod'
};

// Initialize AWS with configuration
if (typeof AWS !== 'undefined') {
    AWS.config.update({
        region: window.AWS_CONFIG.region
    });
    
    // Configure Cognito
    window.AWS_COGNITO_CONFIG = {
        UserPoolId: window.AWS_CONFIG.userPoolId,
        ClientId: window.AWS_CONFIG.clientId
    };
    
    console.log('✅ AWS Configuration loaded');
} else {
    console.warn('⚠️ AWS SDK not loaded yet');
}
