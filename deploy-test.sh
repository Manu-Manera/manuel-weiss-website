#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Deploy to Test Environment
# ═══════════════════════════════════════════════════════════════════════════
# 
# Usage: ./deploy-test.sh "Commit message"
#
# This script:
# 1. Commits all changes to main
# 2. Syncs main to the test branch
# 3. Pushes to test branch → triggers Netlify deploy
#
# Preview URL: https://test--manuel-weiss.netlify.app
# ═══════════════════════════════════════════════════════════════════════════

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

MESSAGE="${1:-Auto-deploy to test}"

echo -e "${BLUE}🚀 Deploying to test environment...${NC}"

# Ensure we're on main
git checkout main

# Add and commit changes
git add -A
git commit -m "$MESSAGE" || echo "Nothing to commit"

# Push to main (won't trigger production deploy)
git push origin main

# Sync to test branch
git checkout test
git merge main -m "Sync from main: $MESSAGE"
git push origin test

# Back to main
git checkout main

echo -e "${GREEN}✅ Deployed to test!${NC}"
echo -e "${GREEN}🔗 Preview: https://test--manuel-weiss.netlify.app${NC}"
