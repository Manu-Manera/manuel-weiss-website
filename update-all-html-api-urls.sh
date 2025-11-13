#!/bin/bash

# Comprehensive script to update API Gateway URL in ALL HTML files
# This script:
# 1. Finds all HTML files (excluding build, node_modules, .git)
# 2. Checks if they have AWS_CONFIG
# 3. Adds or updates apiBaseUrl consistently
# 4. Creates a backup before making changes

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="https://YOUR-API-ID.execute-api.eu-central-1.amazonaws.com/prod"
BACKUP_DIR="./backup-html-$(date +%Y%m%d-%H%M%S)"
CREATE_BACKUP=true

# Standard AWS_CONFIG structure
AWS_CONFIG_TEMPLATE="window.AWS_CONFIG = {
            region: 'eu-central-1',
            userPoolId: 'eu-central-1_8gP4gLK9r',
            clientId: '7kc5tt6a23fgh53d60vkefm812',
            apiBaseUrl: '${API_URL}',
            dynamoDB: {
                tableName: 'mawps-user-profiles',
                region: 'eu-central-1'
            }
        };"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  HTML API Gateway URL Update Script${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "📋 Configuration:"
echo -e "   API URL: ${YELLOW}${API_URL}${NC}"
echo -e "   Backup: ${CREATE_BACKUP}${NC}"
echo ""

# Check if API URL is still placeholder
if [[ "$API_URL" == *"YOUR-API-ID"* ]]; then
    echo -e "${YELLOW}⚠️  WARNING: API URL contains placeholder 'YOUR-API-ID'${NC}"
    echo -e "${YELLOW}   Please update API_URL in this script before running!${NC}"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Create backup directory
if [ "$CREATE_BACKUP" = true ]; then
    echo -e "${BLUE}📦 Creating backup directory: ${BACKUP_DIR}${NC}"
    mkdir -p "$BACKUP_DIR"
fi

# Find all HTML files (excluding build, node_modules, .git, and other build directories)
echo -e "${BLUE}🔍 Finding all HTML files...${NC}"
HTML_FILES=$(find . -name "*.html" -type f \
    ! -path "./build/*" \
    ! -path "./node_modules/*" \
    ! -path "./.git/*" \
    ! -path "./cdk.out/*" \
    ! -path "./.next/*" \
    ! -path "./dist/*" \
    ! -path "./.cache/*" \
    | sort)

TOTAL_FILES=$(echo "$HTML_FILES" | wc -l | tr -d ' ')
echo -e "${GREEN}✅ Found ${TOTAL_FILES} HTML files${NC}"
echo ""

# Statistics
FILES_WITH_AWS_CONFIG=0
FILES_UPDATED=0
FILES_ADDED_CONFIG=0
FILES_SKIPPED=0
FILES_ERROR=0

# Process each file
echo -e "${BLUE}🔄 Processing files...${NC}"
echo ""

for file in $HTML_FILES; do
    # Skip if file doesn't exist (shouldn't happen, but safety check)
    [ ! -f "$file" ] && continue
    
    # Create backup
    if [ "$CREATE_BACKUP" = true ]; then
        mkdir -p "$BACKUP_DIR/$(dirname "$file")"
        cp "$file" "$BACKUP_DIR/$file" 2>/dev/null || true
    fi
    
    HAS_AWS_CONFIG=false
    HAS_API_BASE_URL=false
    USES_AUTH=false
    
    # Check if file has AWS_CONFIG
    if grep -q "window\.AWS_CONFIG\|AWS_CONFIG\s*=" "$file"; then
        HAS_AWS_CONFIG=true
        FILES_WITH_AWS_CONFIG=$((FILES_WITH_AWS_CONFIG + 1))
    fi
    
    # Check if file has apiBaseUrl
    if grep -q "apiBaseUrl" "$file"; then
        HAS_API_BASE_URL=true
    fi
    
    # Check if file uses auth system
    if grep -q "real-user-auth-system\|working-auth-system\|auth\.js" "$file"; then
        USES_AUTH=true
    fi
    
    # Process file based on its state
    if [ "$HAS_AWS_CONFIG" = true ]; then
        # File has AWS_CONFIG - update or add apiBaseUrl
        if [ "$HAS_API_BASE_URL" = false ]; then
            # Add apiBaseUrl after region
            if grep -q "region: 'eu-central-1'" "$file"; then
                # Use sed to add apiBaseUrl after region line
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    # macOS
                    sed -i '' "/region: 'eu-central-1'/a\\
            apiBaseUrl: '${API_URL}',\\
            dynamoDB: {\\
                tableName: 'mawps-user-profiles',\\
                region: 'eu-central-1'\\
            },
" "$file"
                else
                    # Linux
                    sed -i "/region: 'eu-central-1'/a\\            apiBaseUrl: '${API_URL}',\\            dynamoDB: {\\                tableName: 'mawps-user-profiles',\\                region: 'eu-central-1'\\            }," "$file"
                fi
                echo -e "  ${GREEN}✅${NC} Added apiBaseUrl to: $file"
                FILES_UPDATED=$((FILES_UPDATED + 1))
            fi
        else
            # Update existing apiBaseUrl
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s|apiBaseUrl: 'https://[^']*'|apiBaseUrl: '${API_URL}'|g" "$file"
                sed -i '' 's|apiBaseUrl: "https://[^"]*"|apiBaseUrl: "'"${API_URL}"'"|g' "$file"
            else
                # Linux
                sed -i "s|apiBaseUrl: 'https://[^']*'|apiBaseUrl: '${API_URL}'|g" "$file"
                sed -i 's|apiBaseUrl: "https://[^"]*"|apiBaseUrl: "'"${API_URL}"'"|g' "$file"
            fi
            echo -e "  ${GREEN}✅${NC} Updated apiBaseUrl in: $file"
            FILES_UPDATED=$((FILES_UPDATED + 1))
        fi
    elif [ "$USES_AUTH" = true ]; then
        # File uses auth but no AWS_CONFIG - add it before auth script
        if grep -q "real-user-auth-system.js\|working-auth-system.js" "$file"; then
            # Find the script tag with auth system
            AUTH_SCRIPT_LINE=$(grep -n "real-user-auth-system.js\|working-auth-system.js" "$file" | head -1 | cut -d: -f1)
            if [ -n "$AUTH_SCRIPT_LINE" ]; then
                # Insert AWS_CONFIG before the auth script
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    # macOS
                    sed -i '' "${AUTH_SCRIPT_LINE}i\\
    <!-- AWS Configuration -->\\
    <script>\\
        ${AWS_CONFIG_TEMPLATE}\\
    </script>\\
" "$file"
                else
                    # Linux
                    sed -i "${AUTH_SCRIPT_LINE}i\    <!-- AWS Configuration -->\n    <script>\n        ${AWS_CONFIG_TEMPLATE}\n    </script>\n" "$file"
                fi
                echo -e "  ${GREEN}✅${NC} Added AWS_CONFIG to: $file"
                FILES_ADDED_CONFIG=$((FILES_ADDED_CONFIG + 1))
            fi
        fi
    else
        # File doesn't need AWS_CONFIG
        FILES_SKIPPED=$((FILES_SKIPPED + 1))
    fi
done

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "  Total files processed: ${TOTAL_FILES}"
echo -e "  Files with AWS_CONFIG: ${FILES_WITH_AWS_CONFIG}"
echo -e "  ${GREEN}Files updated: ${FILES_UPDATED}${NC}"
echo -e "  ${GREEN}Files added config: ${FILES_ADDED_CONFIG}${NC}"
echo -e "  Files skipped: ${FILES_SKIPPED}"
if [ "$CREATE_BACKUP" = true ]; then
    echo -e "  ${BLUE}Backup location: ${BACKUP_DIR}${NC}"
fi
echo ""

if [ "$FILES_UPDATED" -gt 0 ] || [ "$FILES_ADDED_CONFIG" -gt 0 ]; then
    echo -e "${GREEN}✅ Update completed successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  No files were updated${NC}"
fi

echo ""
echo -e "${YELLOW}⚠️  Remember: Replace YOUR-API-ID with your actual API Gateway ID${NC}"
echo -e "   Then run this script again to apply the real URL."
echo ""

