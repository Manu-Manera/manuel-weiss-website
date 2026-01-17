#!/bin/bash
# Deploy Contact Email API Lambda Function

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

REGION="eu-central-1"
FUNCTION_NAME="mawps-contact-email-api"
ROLE_NAME="mawps-lambda-execution-role"

echo "🚀 Deploye Contact Email API Lambda..."

# Go to Lambda directory
cd lambda/contact-email-api

# Install dependencies
echo "📦 Installiere Dependencies..."
if [ ! -f "package.json" ]; then
    echo "❌ package.json nicht gefunden!"
    exit 1
fi

npm install --production --silent 2>&1 | grep -E "(added|removed|up to date)" || true

# Create deployment package
echo "📦 Erstelle Deployment Package..."
rm -f ../../contact-email-api.zip
zip -r ../../contact-email-api.zip . -x "*.git*" "node_modules/.cache/*" "*.zip" "*.log" > /dev/null 2>&1

# Get IAM role
echo "🔍 Prüfe IAM Role..."
ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text 2>/dev/null || echo "")

if [ -z "$ROLE_ARN" ]; then
    echo "   ⚠️  IAM Role $ROLE_NAME nicht gefunden - erstelle sie..."
    
    # Create trust policy
    cat > /tmp/trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
    
    aws iam create-role \
        --role-name "$ROLE_NAME" \
        --assume-role-policy-document file:///tmp/trust-policy.json \
        --output json > /dev/null
    
    # Attach basic Lambda execution policy
    aws iam attach-role-policy \
        --role-name "$ROLE_NAME" \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    # Attach SES policy for sending emails
    cat > /tmp/ses-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
EOF
    
    aws iam put-role-policy \
        --role-name "$ROLE_NAME" \
        --policy-name mawps-ses-policy \
        --policy-document file:///tmp/ses-policy.json
    
    ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)
    
    echo "   ✅ IAM Role erstellt"
    echo "   ⏳ Warte 10 Sekunden für Role Propagation..."
    sleep 10
else
    echo "   ✅ IAM Role gefunden: $ROLE_ARN"
fi

# Check if function exists
echo "🔍 Prüfe Lambda Function..."
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &> /dev/null; then
    echo "   ✅ Function existiert - Update..."
    
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file fileb://../../contact-email-api.zip \
        --region "$REGION" \
        --output json > /dev/null
    
    # Update environment variables
    aws lambda update-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --environment "Variables={AWS_REGION=$REGION,FROM_EMAIL=mail@manuel-weiss.ch,TO_EMAIL=info@manuel-weiss.ch}" \
        --region "$REGION" \
        --output json > /dev/null
    
    echo "   ✅ Lambda Function updated!"
else
    echo "   ⚠️  Function existiert nicht - erstelle sie..."
    
    aws lambda create-function \
        --function-name "$FUNCTION_NAME" \
        --runtime nodejs20.x \
        --role "$ROLE_ARN" \
        --handler index.handler \
        --zip-file fileb://../../contact-email-api.zip \
        --environment "Variables={AWS_REGION=$REGION,FROM_EMAIL=mail@manuel-weiss.ch,TO_EMAIL=info@manuel-weiss.ch}" \
        --timeout 30 \
        --memory-size 256 \
        --region "$REGION" \
        --output json > /dev/null
    
    echo "   ✅ Lambda Function erstellt!"
fi

# Cleanup
rm -f /tmp/trust-policy.json /tmp/ses-policy.json

echo ""
echo "✅ Contact Email API Lambda erfolgreich deployed!"
echo "📧 E-Mails werden an: info@manuel-weiss.ch gesendet"

