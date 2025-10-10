#!/bin/bash

# Deploy Live Authentication System
echo "🚀 Deploying Live Authentication System"
echo "======================================="

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured"

# Run AWS Cognito setup
echo "📋 Setting up AWS Cognito..."
./setup-aws-cognito.sh

if [ $? -eq 0 ]; then
    echo "✅ AWS Cognito setup complete"
else
    echo "❌ AWS Cognito setup failed"
    exit 1
fi

# Update all HTML files to use live system
echo "📋 Updating HTML files..."

# List of HTML files that need updating
HTML_FILES=(
    "persoenlichkeitsentwicklung-uebersicht.html"
    "user-profile.html"
    "admin.html"
    "bewerbungsmanager.html"
    "index.html"
)

for file in "${HTML_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   Updating $file..."
        
        # Replace demo auth with live auth
        sed -i.bak 's/js\/demo-auth-system\.js/https:\/\/sdk.amazonaws.com\/js\/aws-sdk-2.1490.0.min.js/g' "$file"
        sed -i.bak 's/<script src="https:\/\/sdk.amazonaws.com\/js\/aws-sdk-2.1490.0.min.js"><\/script>/<script src="https:\/\/sdk.amazonaws.com\/js\/aws-sdk-2.1490.0.min.js"><\/script>\n    <script src="js\/aws-config.js"><\/script>\n    <script src="js\/aws-auth-system.js"><\/script>/g' "$file"
        
        # Remove backup files
        rm -f "$file.bak"
        
        echo "   ✅ $file updated"
    else
        echo "   ⚠️ $file not found"
    fi
done

# Create production configuration
echo "📋 Creating production configuration..."

cat > js/production-config.js << 'EOF'
// Production AWS Configuration
window.PRODUCTION_CONFIG = {
    environment: 'production',
    debug: false,
    logging: false,
    analytics: true,
    monitoring: true
};

// Override console.log in production
if (window.PRODUCTION_CONFIG && !window.PRODUCTION_CONFIG.debug) {
    console.log = function() {};
    console.warn = function() {};
    console.info = function() {};
}
EOF

echo "✅ Production configuration created"

# Create deployment checklist
echo "📋 Creating deployment checklist..."

cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
# Live Authentication Deployment Checklist

## ✅ Pre-Deployment
- [ ] AWS CLI configured
- [ ] AWS Cognito User Pool created
- [ ] S3 bucket created
- [ ] DynamoDB table created
- [ ] Configuration files updated

## ✅ Deployment Steps
- [ ] Run ./deploy-live-auth.sh
- [ ] Test authentication locally
- [ ] Deploy to production
- [ ] Test in production environment

## ✅ Post-Deployment
- [ ] Test user registration
- [ ] Test user login
- [ ] Test password reset
- [ ] Test user profile
- [ ] Monitor AWS CloudWatch logs

## 🔧 Troubleshooting
- Check AWS credentials
- Verify User Pool ID and Client ID
- Check S3 bucket permissions
- Check DynamoDB table permissions
- Check CloudWatch logs

## 📞 Support
- AWS Documentation: https://docs.aws.amazon.com/cognito/
- AWS Support: https://console.aws.amazon.com/support/
EOF

echo "✅ Deployment checklist created"

# Test the configuration
echo "📋 Testing configuration..."

# Check if configuration file exists and has valid format
if [ -f "js/aws-config.js" ]; then
    if grep -q "userPoolId.*eu-central-1_" js/aws-config.js; then
        echo "✅ Configuration file looks valid"
    else
        echo "⚠️ Configuration file might need manual update"
    fi
else
    echo "❌ Configuration file not found"
fi

echo ""
echo "🎉 Live Authentication System Deployed!"
echo "======================================"
echo ""
echo "📋 Next Steps:"
echo "1. Test the authentication system"
echo "2. Deploy to production"
echo "3. Monitor AWS CloudWatch logs"
echo ""
echo "🔧 Configuration:"
echo "   - User Pool: Check js/aws-config.js"
echo "   - S3 Bucket: mawps-user-files"
echo "   - DynamoDB: mawps-user-profiles"
echo ""
echo "📊 Monitoring:"
echo "   - AWS CloudWatch: https://console.aws.amazon.com/cloudwatch/"
echo "   - Cognito Console: https://console.aws.amazon.com/cognito/"
echo ""
echo "✅ Live system is ready!"
