#!/bin/bash
# Deploy Website API Stack (nur manuel-weiss-website-api)
# Unabhängig vom AI Investment System

set -e

echo "🚀 Deploying Website API Stack..."

cd "$(dirname "$0")/infrastructure"

# Installiere Dependencies für neue Lambda Functions
echo "📦 Installing Lambda dependencies..."
for lambda in ../lambda/user-data ../lambda/snowflake-highscores ../lambda/hero-video; do
  if [ -f "$lambda/package.json" ] && [ ! -d "$lambda/node_modules" ]; then
    echo "  Installing: $lambda"
    (cd "$lambda" && npm install --quiet)
  fi
done

# TypeScript kompilieren
echo "📝 Compiling TypeScript..."
npx tsc --noEmit

# CDK Synth nur für Website API Stack
echo "🔧 Synthesizing CDK..."
npx cdk synth manuel-weiss-website-api --quiet

# Deploy nur Website API Stack
echo "🚀 Deploying to AWS..."
npx cdk deploy manuel-weiss-website-api --require-approval never

# API URL ausgeben
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the API URL from above"
echo "2. Update js/aws-app-config.js:"
echo "   - Set USE_AWS_API = true"
echo "   - Set API_BASE to the URL"
echo "3. Test the endpoints"
