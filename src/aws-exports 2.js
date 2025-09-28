// AWS Amplify Configuration for Manuel Weiss Multi-User System
// Auto-generated during deployment - contains all AWS service configurations

const awsmobile = {
    "aws_project_region": "eu-central-1",
    "aws_cognito_identity_pool_id": "eu-central-1:YOUR_IDENTITY_POOL_ID",
    "aws_cognito_region": "eu-central-1", 
    "aws_user_pools_id": "eu-central-1_8gP4gLK9r",
    "aws_user_pools_web_client_id": "7kc5tt6a23fgh53d60vkefm812",
    "oauth": {
        "domain": "manuel-weiss-userfiles-auth-038333965110.auth.eu-central-1.amazoncognito.com",
        "scope": [
            "phone",
            "email",
            "openid", 
            "profile",
            "aws.cognito.signin.user.admin"
        ],
        "redirectSignIn": "https://manuel-weiss.com/",
        "redirectSignOut": "https://manuel-weiss.com/",
        "responseType": "code"
    },
    "federationTarget": "COGNITO_USER_POOLS",
    "aws_cognito_username_attributes": [
        "EMAIL"
    ],
    "aws_cognito_social_providers": [],
    "aws_cognito_signup_attributes": [
        "EMAIL"
    ],
    "aws_cognito_mfa_configuration": "OFF",
    "aws_cognito_mfa_types": [
        "SMS"
    ],
    "aws_cognito_password_protection_settings": {
        "passwordPolicyMinLength": 8,
        "passwordPolicyCharacters": [
            "REQUIRES_LOWERCASE",
            "REQUIRES_UPPERCASE", 
            "REQUIRES_NUMBERS"
        ]
    },
    "aws_cognito_verification_mechanisms": [
        "EMAIL"
    ],
    "aws_user_files_s3_bucket": "manuel-weiss-userfiles-files-038333965110",
    "aws_user_files_s3_bucket_region": "eu-central-1",
    "aws_appsync_graphqlEndpoint": "https://YOUR_API_ID.execute-api.eu-central-1.amazonaws.com/prod",
    "aws_appsync_region": "eu-central-1",
    "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS",
    
    // Custom configuration for Manuel Weiss system
    "custom": {
        "apiEndpoint": "https://YOUR_API_ID.execute-api.eu-central-1.amazonaws.com/prod",
        "endpoints": {
            "userProfile": "/user-profile",
            "progress": "/user-profile/progress", 
            "documents": "/documents",
            "methodResults": "/method-results",
            "applications": "/applications",
            "aiServices": "/ai-services",
            "admin": "/admin/analytics"
        },
        "features": {
            "progressTracking": true,
            "documentManagement": true,
            "multiUser": true,
            "achievementSystem": true,
            "adminPanel": true,
            "personalityDevelopment": true
        },
        "systemInfo": {
            "totalPages": 67,
            "totalModules": 62,
            "totalMethods": 35,
            "version": "2.0.0-multiuser"
        }
    }
};

export default awsmobile;
