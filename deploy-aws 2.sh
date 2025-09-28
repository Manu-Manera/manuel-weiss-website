#!/bin/bash

# AWS Deployment Script für Multi-User File System
# Dieses Skript automatisiert das komplette AWS Setup

set -e  # Exit bei Fehlern

echo "🚀 Starting AWS Multi-User System Deployment..."

# Konfiguration
PROJECT_NAME="manuel-weiss-userfiles"
DOMAIN_NAME="manuel-weiss.com"
REGION="eu-central-1"
ALLOWED_ORIGINS="https://manuel-weiss.com,http://localhost:8000"

# Prüfe AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI ist nicht installiert. Bitte installieren Sie es zuerst."
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Prüfe AWS-Credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS-Credentials sind nicht konfiguriert."
    echo "   Führen Sie 'aws configure' aus oder setzen Sie Umgebungsvariablen."
    exit 1
fi

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✅ AWS Account ID: $AWS_ACCOUNT_ID"

# 1. CloudFormation Stack deployen
echo "📦 Deploying CloudFormation Stack..."
aws cloudformation deploy \
    --template-file aws-infrastructure.yaml \
    --stack-name "${PROJECT_NAME}-stack" \
    --parameter-overrides \
        ProjectName="$PROJECT_NAME" \
        DomainName="$DOMAIN_NAME" \
        AllowedOrigins="$ALLOWED_ORIGINS" \
    --capabilities CAPABILITY_NAMED_IAM \
    --region "$REGION"

if [ $? -eq 0 ]; then
    echo "✅ CloudFormation Stack deployed successfully"
else
    echo "❌ CloudFormation deployment failed"
    exit 1
fi

# 2. Lambda-Funktionen mit echtem Code aktualisieren
echo "📝 Updating Lambda functions with actual code..."

# Hole Stack Outputs
UPLOAD_URL_FUNCTION=$(aws cloudformation describe-stacks \
    --stack-name "${PROJECT_NAME}-stack" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='UploadUrlFunctionName'].OutputValue" \
    --output text)

DOCS_FUNCTION=$(aws cloudformation describe-stacks \
    --stack-name "${PROJECT_NAME}-stack" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='DocsFunctionName'].OutputValue" \
    --output text)

# Temporäre Verzeichnisse für Lambda-Pakete
TEMP_DIR=$(mktemp -d)
UPLOAD_DIR="$TEMP_DIR/upload-url"
DOCS_DIR="$TEMP_DIR/docs"

mkdir -p "$UPLOAD_DIR" "$DOCS_DIR"

# Upload-URL Lambda vorbereiten
echo "📁 Preparing upload-url Lambda package..."
cp backend/upload-url/handler.mjs "$UPLOAD_DIR/"
cp backend/package.json "$UPLOAD_DIR/"

cd "$UPLOAD_DIR"
npm install --production
zip -r ../upload-url.zip .
cd - > /dev/null

# Docs Lambda vorbereiten  
echo "📁 Preparing docs Lambda package..."
cp backend/docs/handler.mjs "$DOCS_DIR/"
cp backend/package.json "$DOCS_DIR/"

cd "$DOCS_DIR"
npm install --production
zip -r ../docs.zip .
cd - > /dev/null

# Lambda-Funktionen aktualisieren
echo "🔄 Updating Lambda functions..."
aws lambda update-function-code \
    --function-name "$UPLOAD_URL_FUNCTION" \
    --zip-file "fileb://$TEMP_DIR/upload-url.zip" \
    --region "$REGION"

aws lambda update-function-code \
    --function-name "$DOCS_FUNCTION" \
    --zip-file "fileb://$TEMP_DIR/docs.zip" \
    --region "$REGION"

# Temporäre Dateien löschen
rm -rf "$TEMP_DIR"

# 3. Stack-Informationen abrufen und anzeigen
echo "📋 Retrieving deployment information..."

API_URL=$(aws cloudformation describe-stacks \
    --stack-name "${PROJECT_NAME}-stack" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue" \
    --output text)

COGNITO_URL=$(aws cloudformation describe-stacks \
    --stack-name "${PROJECT_NAME}-stack" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='CognitoHostedUIUrl'].OutputValue" \
    --output text)

USER_POOL_ID=$(aws cloudformation describe-stacks \
    --stack-name "${PROJECT_NAME}-stack" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='CognitoUserPoolId'].OutputValue" \
    --output text)

CLIENT_ID=$(aws cloudformation describe-stacks \
    --stack-name "${PROJECT_NAME}-stack" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='CognitoUserPoolClientId'].OutputValue" \
    --output text)

# 4. Frontend-Konfiguration aktualisieren
echo "🔧 Updating frontend configuration..."

# Login/Logout URLs generieren
LOGIN_URL="${COGNITO_URL}/login?client_id=${CLIENT_ID}&response_type=code&scope=email+openid+profile&redirect_uri=https%3A//${DOMAIN_NAME}/bewerbung.html"
LOGOUT_URL="${COGNITO_URL}/logout?client_id=${CLIENT_ID}&logout_uri=https%3A//${DOMAIN_NAME}"

# API Base URL in docs.js aktualisieren
sed -i.bak "s|const API_BASE = '/api';|const API_BASE = '${API_URL}';|" js/docs.js

# Login URLs in bewerbung.html aktualisieren
sed -i.bak "s|const LOGIN_URL  = 'https://YOUR_DOMAIN.auth.eu-central-1.amazoncognito.com/login?...';|const LOGIN_URL  = '${LOGIN_URL}';|" bewerbung.html
sed -i.bak "s|const LOGOUT_URL = 'https://YOUR_DOMAIN.auth.eu-central-1.amazoncognito.com/logout?...';|const LOGOUT_URL = '${LOGOUT_URL}';|" bewerbung.html

# Backup-Dateien löschen
rm -f js/docs.js.bak bewerbung.html.bak

echo ""
echo "🎉 ===== DEPLOYMENT SUCCESSFUL ===== 🎉"
echo ""
echo "📊 System Information:"
echo "   API Gateway URL: $API_URL"
echo "   Cognito Hosted UI: $COGNITO_URL"
echo "   User Pool ID: $USER_POOL_ID"
echo "   Client ID: $CLIENT_ID"
echo ""
echo "🔗 URLs:"
echo "   Login URL: $LOGIN_URL"
echo "   Logout URL: $LOGOUT_URL"
echo ""
echo "✅ Next Steps:"
echo "   1. Commit und push your updated frontend files"
echo "   2. Deploy your website (Netlify/Amplify/etc.)"
echo "   3. Test the system by opening bewerbung.html"
echo "   4. Create a test user via Cognito console or sign-up flow"
echo ""
echo "🔍 Testing:"
echo "   - Open: https://${DOMAIN_NAME}/bewerbung.html"
echo "   - Open: https://${DOMAIN_NAME}/health.html"
echo "   - Check browser console for API responses"
echo ""
echo "🛠️ Troubleshooting:"
echo "   - Check CloudWatch Logs for Lambda errors"
echo "   - Verify CORS settings if browser blocks requests"
echo "   - Ensure your domain SSL certificate is valid"
echo ""
