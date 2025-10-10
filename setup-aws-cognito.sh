#!/bin/bash

# AWS Cognito Live Setup Script
echo "🚀 AWS Cognito Live Setup"
echo "========================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI first."
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured"

# Create Cognito User Pool
echo "📋 Creating Cognito User Pool..."

USER_POOL_ID=$(aws cognito-idp create-user-pool \
    --pool-name "mawps-user-pool" \
    --policies '{
        "PasswordPolicy": {
            "MinimumLength": 8,
            "RequireUppercase": true,
            "RequireLowercase": true,
            "RequireNumbers": true,
            "RequireSymbols": false
        }
    }' \
    --auto-verified-attributes email \
    --username-attributes email \
    --schema '[
        {
            "Name": "email",
            "AttributeDataType": "String",
            "Required": true,
            "Mutable": true
        },
        {
            "Name": "given_name",
            "AttributeDataType": "String",
            "Required": true,
            "Mutable": true
        },
        {
            "Name": "family_name",
            "AttributeDataType": "String",
            "Required": true,
            "Mutable": true
        }
    ]' \
    --query 'UserPool.Id' \
    --output text)

if [ $? -eq 0 ]; then
    echo "✅ User Pool created: $USER_POOL_ID"
else
    echo "❌ Failed to create User Pool"
    exit 1
fi

# Create App Client
echo "📋 Creating App Client..."

CLIENT_ID=$(aws cognito-idp create-user-pool-client \
    --user-pool-id "$USER_POOL_ID" \
    --client-name "mawps-web-client" \
    --no-generate-secret \
    --explicit-auth-flows USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
    --query 'UserPoolClient.ClientId' \
    --output text)

if [ $? -eq 0 ]; then
    echo "✅ App Client created: $CLIENT_ID"
else
    echo "❌ Failed to create App Client"
    exit 1
fi

# Create Domain
echo "📋 Creating Cognito Domain..."

DOMAIN_NAME="mawps-auth-$(date +%s)"
aws cognito-idp create-user-pool-domain \
    --domain "$DOMAIN_NAME" \
    --user-pool-id "$USER_POOL_ID"

if [ $? -eq 0 ]; then
    echo "✅ Domain created: $DOMAIN_NAME"
else
    echo "❌ Failed to create Domain"
    exit 1
fi

# Update configuration file
echo "📋 Updating configuration..."

# Create backup
cp js/aws-config.js js/aws-config.js.backup

# Update with real credentials
cat > js/aws-config.js << EOF
// AWS Configuration for Production
window.AWS_CONFIG = {
    // Cognito User Pool Configuration
    userPoolId: '$USER_POOL_ID',
    clientId: '$CLIENT_ID',
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
EOF

echo "✅ Configuration updated"

# Create S3 bucket for user files
echo "📋 Creating S3 bucket..."

aws s3 mb s3://mawps-user-files --region eu-central-1

if [ $? -eq 0 ]; then
    echo "✅ S3 bucket created"
else
    echo "⚠️ S3 bucket might already exist"
fi

# Create DynamoDB table
echo "📋 Creating DynamoDB table..."

aws dynamodb create-table \
    --table-name mawps-user-profiles \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
    --key-schema \
        AttributeName=userId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region eu-central-1

if [ $? -eq 0 ]; then
    echo "✅ DynamoDB table created"
else
    echo "⚠️ DynamoDB table might already exist"
fi

echo ""
echo "🎉 AWS Cognito Live Setup Complete!"
echo "=================================="
echo "User Pool ID: $USER_POOL_ID"
echo "Client ID: $CLIENT_ID"
echo "Domain: $DOMAIN_NAME"
echo ""
echo "📋 Next Steps:"
echo "1. Update HTML files to use AWS SDK instead of demo"
echo "2. Test the authentication system"
echo "3. Deploy to production"
echo ""
echo "🔧 To switch to AWS SDK, update HTML files:"
echo "   Replace: <script src=\"js/demo-auth-system.js\"></script>"
echo "   With:    <script src=\"https://sdk.amazonaws.com/js/aws-sdk-2.1490.0.min.js\"></script>"
echo "            <script src=\"js/aws-config.js\"></script>"
echo "            <script src=\"js/aws-auth-system.js\"></script>"
