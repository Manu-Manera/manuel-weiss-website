#!/bin/bash

# Production Deployment Setup for AI Investment System
# This script prepares the system for production deployment

set -e

echo "🚀 Preparing AI Investment System for Production Deployment..."

# 1. Environment Validation
echo "🔍 Validating environment variables..."
required_vars=(
  "AWS_REGION"
  "OPENAI_API_KEY"
  "TWITTER_BEARER_TOKEN"
  "REDDIT_CLIENT_ID"
  "REDDIT_CLIENT_SECRET"
  "NEWS_API_KEY"
)

missing_vars=()
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
  echo "❌ Missing required environment variables:"
  printf '   - %s\n' "${missing_vars[@]}"
  echo "Please set these variables before deployment."
  exit 1
fi

echo "✅ All required environment variables are set"

# 2. Build Common Package
echo "📦 Building common package..."
cd packages/common
npm run build
cd ../..

# 3. Build Lambda Layer
echo "🔧 Building Lambda layer..."
./lambda/build-lambda.sh

# 4. Deploy Infrastructure
echo "🏗️ Deploying AWS infrastructure..."
cd infrastructure
npm install
npm run build
cdk deploy --all --require-approval never
cd ..

# 5. Deploy Lambda Functions
echo "⚡ Deploying Lambda functions..."
LAMBDA_FUNCTIONS=(
  "ingestion-social"
  "ingestion-news"
  "scoring"
  "orchestrator"
  "decision"
  "streaming"
  "observability"
  "backtesting"
)

for func in "${LAMBDA_FUNCTIONS[@]}"; do
  echo "   - Deploying lambda/$func..."
  cd lambda/$func
  npm install --production
  zip -r function.zip .
  aws lambda update-function-code \
    --function-name "ai-investment-$func" \
    --zip-file fileb://function.zip
  rm function.zip
  cd ../..
done

# 6. Configure API Gateway
echo "🌐 Configuring API Gateway..."
aws apigateway put-rest-api \
  --rest-api-id $(aws apigateway get-rest-apis --query 'items[?name==`ai-investment-api`].id' --output text) \
  --body file://api/openapi.yaml

# 7. Set up monitoring
echo "📊 Setting up monitoring..."
aws cloudwatch put-metric-alarm \
  --alarm-name "ai-investment-error-rate" \
  --alarm-description "High error rate in AI Investment System" \
  --metric-name "Errors" \
  --namespace "AWS/Lambda" \
  --statistic "Sum" \
  --period 300 \
  --threshold 5 \
  --comparison-operator "GreaterThanThreshold" \
  --evaluation-periods 2

# 8. Security hardening
echo "🔒 Applying security hardening..."
# Enable encryption at rest
aws dynamodb update-table \
  --table-name ai-investment-signals \
  --sse-specification Enabled=true

# Enable versioning on S3 buckets
aws s3api put-bucket-versioning \
  --bucket ai-investment-data \
  --versioning-configuration Status=Enabled

# 9. Performance optimization
echo "⚡ Optimizing performance..."
# Set up auto-scaling for DynamoDB
aws application-autoscaling register-scalable-target \
  --service-namespace dynamodb \
  --resource-id table/ai-investment-signals \
  --scalable-dimension dynamodb:table:WriteCapacityUnits \
  --min-capacity 5 \
  --max-capacity 100

# 10. Backup configuration
echo "💾 Setting up backups..."
aws dynamodb create-backup \
  --table-name ai-investment-signals \
  --backup-name "ai-investment-backup-$(date +%Y%m%d)"

# 11. Health checks
echo "🏥 Setting up health checks..."
aws route53 create-health-check \
  --caller-reference "ai-investment-health-$(date +%s)" \
  --health-check-config Type=HTTPS,ResourcePath=/health,Port=443

echo "✅ Production deployment setup completed!"
echo ""
echo "📋 Deployment Summary:"
echo "   - Infrastructure: Deployed"
echo "   - Lambda Functions: Deployed"
echo "   - API Gateway: Configured"
echo "   - Monitoring: Enabled"
echo "   - Security: Hardened"
echo "   - Performance: Optimized"
echo "   - Backups: Configured"
echo "   - Health Checks: Enabled"
echo ""
echo "🎉 AI Investment System is ready for production!"
