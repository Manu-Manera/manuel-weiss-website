// AWS Configuration for Production
window.AWS_CONFIG = {
    // Cognito User Pool Configuration
    userPoolId: 'eu-central-1_XXXXXXXXX', // TODO: Replace with actual User Pool ID
    clientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // TODO: Replace with actual Client ID
    region: 'eu-central-1',
    
    // S3 Configuration for file uploads
    s3: {
        bucket: 'mawps-user-files',
        region: 'eu-central-1'
    },
    
    // DynamoDB Configuration for user data
    dynamodb: {
        tableName: 'mawps-user-profiles',
        region: 'eu-central-1'
    },
    
    // API Gateway Configuration
    apiGateway: {
        baseUrl: 'https://api.mawps.netlify.app',
        endpoints: {
            userProfile: '/user/profile',
            userProgress: '/user/progress',
            userSettings: '/user/settings'
        }
    }
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