#!/bin/bash

# Standard API Gateway URL - Replace YOUR-API-ID with your actual API Gateway ID
API_URL="https://YOUR-API-ID.execute-api.eu-central-1.amazonaws.com/prod"

echo "🔧 Updating API Gateway URLs in all HTML files..."
echo "📋 Using URL: $API_URL"
echo ""

# List of files to update
files=(
    "index.html"
    "website-services.html"
    "user-profile.html"
    "persoenlichkeitsentwicklung-uebersicht.html"
    "persoenlichkeitsentwicklung.html"
    "ikigai.html"
    "applications/index.html"
    "applications/profile-setup.html"
    "applications/document-upload.html"
    "applications/interview-prep.html"
    "applications/application-generator.html"
    "applications/tracking-dashboard.html"
)

updated=0
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        # Check if file has AWS_CONFIG but no apiBaseUrl
        if grep -q "AWS_CONFIG" "$file" && ! grep -q "apiBaseUrl" "$file"; then
            # Find the region line and add apiBaseUrl after it
            if grep -q "region: 'eu-central-1'" "$file"; then
                # Add apiBaseUrl after region
                sed -i '' "/region: 'eu-central-1'/a\\
            apiBaseUrl: '${API_URL}',\\
            dynamoDB: {\\
                tableName: 'mawps-user-profiles',\\
                region: 'eu-central-1'\\
            },
" "$file"
                echo "✅ Added apiBaseUrl to: $file"
                updated=$((updated + 1))
            fi
        elif grep -q "apiBaseUrl.*api-gateway" "$file"; then
            # Update existing apiBaseUrl
            sed -i '' "s|apiBaseUrl: 'https://api-gateway.execute-api.eu-central-1.amazonaws.com/api'|apiBaseUrl: '${API_URL}'|g" "$file"
            sed -i '' "s|apiBaseUrl: \"https://api-gateway.execute-api.eu-central-1.amazonaws.com/api\"|apiBaseUrl: \"${API_URL}\"|g" "$file"
            echo "✅ Updated apiBaseUrl in: $file"
            updated=$((updated + 1))
        fi
    fi
done

echo ""
echo "🎉 Update complete!"
echo "📊 Updated $updated files"
echo ""
echo "⚠️  IMPORTANT: Replace YOUR-API-ID in this script with your actual API Gateway ID"
echo "   Then run this script again: bash update-all-api-urls.sh"
