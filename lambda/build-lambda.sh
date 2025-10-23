#!/bin/bash

# Build script for Lambda functions
# Compiles TypeScript and packages for deployment

echo "🚀 Building Lambda functions..."

# Set environment
export NODE_ENV="production"
export AWS_REGION="eu-central-1"

# Function to build a Lambda function
build_lambda() {
  local function_name=$1
  local function_dir="lambda/$function_name"
  
  echo "📦 Building $function_name..."
  
  if [ ! -d "$function_dir" ]; then
    echo "❌ Function directory not found: $function_dir"
    return 1
  fi
  
  cd "$function_dir"
  
  # Install dependencies
  if [ -f "package.json" ]; then
    echo "📥 Installing dependencies for $function_name..."
    npm install --production
  fi
  
  # Compile TypeScript if tsconfig.json exists
  if [ -f "tsconfig.json" ]; then
    echo "🔨 Compiling TypeScript for $function_name..."
    npx tsc
  fi
  
  # Create deployment package
  echo "📦 Creating deployment package for $function_name..."
  zip -r "../${function_name}.zip" . -x "*.ts" "*.map" "node_modules/.cache/*" "*.log"
  
  cd - > /dev/null
  echo "✅ $function_name built successfully"
}

# Build all Lambda functions
echo "🔨 Building all Lambda functions..."

# List of Lambda functions to build
functions=(
  "ingestion-social"
  "ingestion-news"
  "scoring"
  "orchestrator"
  "decision"
  "streaming"
  "observability"
  "backtesting"
)

# Build each function
for func in "${functions[@]}"; do
  build_lambda "$func"
done

# Build common layer
echo "📚 Building common layer..."
cd lambda/layers/common
npm install --production
zip -r "../common-layer.zip" . -x "*.ts" "*.map" "node_modules/.cache/*" "*.log"
cd - > /dev/null

echo "✅ All Lambda functions built successfully!"
echo "📦 Deployment packages created:"
ls -la lambda/*.zip
ls -la lambda/common-layer.zip

echo ""
echo "🚀 Ready for deployment!"
echo "   Use 'aws lambda update-function-code' to deploy individual functions"
echo "   Use 'aws lambda publish-layer-version' to deploy the common layer"
