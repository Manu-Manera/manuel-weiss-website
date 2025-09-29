#!/bin/bash

# AWS Deployment Script für Manuel Weiss Website
echo "🚀 Starting AWS Deployment for Manuel Weiss Website..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI first."
    exit 1
fi

# Check if CDK is installed
if ! command -v cdk &> /dev/null; then
    echo "❌ AWS CDK not found. Installing..."
    npm install -g aws-cdk
fi

# Set AWS region
export AWS_DEFAULT_REGION=eu-central-1

# Create CDK app directory
mkdir -p cdk-app
cd cdk-app

# Initialize CDK app if not exists
if [ ! -f "package.json" ]; then
    echo "📦 Initializing CDK app..."
    cdk init app --language typescript
fi

# Copy infrastructure code
echo "📋 Copying infrastructure code..."
cp ../aws-infrastructure-cdk.ts lib/manuel-weiss-website-stack.ts

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install Lambda dependencies
echo "📦 Installing Lambda dependencies..."
cd ../lambda/upload && npm install
cd ../download && npm install
cd ../user-management && npm install
cd ../..

# Bootstrap CDK (if not already bootstrapped)
echo "🔧 Bootstrapping CDK..."
cdk bootstrap

# Deploy the stack
echo "🚀 Deploying AWS infrastructure..."
cdk deploy --require-approval never

# Get outputs
echo "📊 Getting deployment outputs..."
aws cloudformation describe-stacks \
    --stack-name ManuelWeissWebsiteStack \
    --query 'Stacks[0].Outputs' \
    --output table

echo "✅ AWS Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update your frontend to use the new API endpoints"
echo "2. Configure Cognito User Pool for authentication"
echo "3. Test the upload/download functionality"
echo "4. Monitor the AWS resources in the console"