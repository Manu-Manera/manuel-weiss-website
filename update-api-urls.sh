#!/bin/bash

# Script to update API Gateway URL in all HTML files
# Replace placeholder with actual API Gateway URL

# Standard API Gateway URL structure
# Replace YOUR-API-ID with your actual API Gateway ID
API_GATEWAY_URL="https://YOUR-API-ID.execute-api.eu-central-1.amazonaws.com/prod"

# Alternative: If you have a custom domain
# API_GATEWAY_URL="https://api.manuel-weiss.ch"

echo "🔧 Updating API Gateway URLs in HTML files..."
echo "📋 Using URL: $API_GATEWAY_URL"
echo ""

# Find all HTML files with AWS_CONFIG
files=$(grep -l "AWS_CONFIG\|apiBaseUrl" *.html 2>/dev/null)
files="$files $(find applications -name "*.html" -exec grep -l "AWS_CONFIG\|apiBaseUrl" {} \; 2>/dev/null)"
files="$files $(find methods -name "*.html" -exec grep -l "AWS_CONFIG\|apiBaseUrl" {} \; 2>/dev/null)"

# Count files
file_count=$(echo "$files" | wc -w | tr -d ' ')
echo "📁 Found $file_count files to update"
echo ""

# Update each file
updated=0
for file in $files; do
    if [ -f "$file" ]; then
        # Check if file contains apiBaseUrl
        if grep -q "apiBaseUrl" "$file"; then
            # Update the URL
            # Pattern 1: apiBaseUrl: 'https://api-gateway.execute-api.eu-central-1.amazonaws.com/api'
            sed -i '' "s|apiBaseUrl: 'https://api-gateway.execute-api.eu-central-1.amazonaws.com/api'|apiBaseUrl: '${API_GATEWAY_URL}'|g" "$file"
            
            # Pattern 2: apiBaseUrl: "https://api-gateway.execute-api.eu-central-1.amazonaws.com/api"
            sed -i '' "s|apiBaseUrl: \"https://api-gateway.execute-api.eu-central-1.amazonaws.com/api\"|apiBaseUrl: \"${API_GATEWAY_URL}\"|g" "$file"
            
            # Pattern 3: apiBaseUrl: 'https://YOUR-API-ID.execute-api.eu-central-1.amazonaws.com/prod'
            sed -i '' "s|apiBaseUrl: 'https://YOUR-API-ID.execute-api.eu-central-1.amazonaws.com/prod'|apiBaseUrl: '${API_GATEWAY_URL}'|g" "$file"
            
            echo "✅ Updated: $file"
            updated=$((updated + 1))
        fi
    fi
done

echo ""
echo "🎉 Update complete!"
echo "📊 Updated $updated files"
echo ""
echo "⚠️  IMPORTANT: Please replace YOUR-API-ID in this script with your actual API Gateway ID"
echo "   Then run this script again, or manually update the URL in each file."
echo ""
echo "💡 To find your API Gateway URL:"
echo "   1. Go to AWS Console → API Gateway"
echo "   2. Select your API"
echo "   3. Copy the Invoke URL"
echo "   4. Update API_GATEWAY_URL in this script"
