#!/bin/bash
# 🚀 AUTOMATISCHES DEPLOYMENT - Frontend & Backend
# Deployt alle Änderungen automatisch

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 STARTE KOMPLETTES DEPLOYMENT...${NC}"
echo ""

# 1. Frontend: Git Status prüfen
echo -e "${BLUE}📦 Frontend Deployment...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo "   Änderungen gefunden - committe und pushe..."
    git add -A
    git commit -m "Auto-deploy: $(date +%Y-%m-%d_%H-%M-%S)" || echo -e "${YELLOW}⚠️ Keine Änderungen zum Committen${NC}"
    git push origin main || echo -e "${YELLOW}⚠️ Push fehlgeschlagen - bitte manuell über GitHub Desktop pushen${NC}"
    echo -e "${GREEN}✅ Frontend wird über Netlify deployed (2-3 Min)${NC}"
else
    echo -e "${YELLOW}ℹ️ Keine Frontend-Änderungen${NC}"
fi
echo ""

# 2. Backend: Lambda Function Update
echo -e "${BLUE}☁️ Backend Deployment...${NC}"

# Prüfe ob AWS CLI verfügbar ist
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI nicht gefunden. Backend-Deployment übersprungen.${NC}"
    echo ""
    echo -e "${GREEN}🎉 Frontend-Deployment abgeschlossen!${NC}"
    exit 0
fi

# Prüfe AWS Credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS Credentials nicht konfiguriert. Backend-Deployment übersprungen.${NC}"
    echo ""
    echo -e "${GREEN}🎉 Frontend-Deployment abgeschlossen!${NC}"
    exit 0
fi

cd lambda/profile-api

# Dependencies installieren
echo "   📥 Installiere Dependencies..."
npm install --production --silent 2>&1 | grep -E "(added|removed|up to date)" || true

# Package erstellen
echo "   📦 Erstelle Deployment Package..."
rm -f ../profile-api-update.zip
zip -r ../profile-api-update.zip . -x "*.git*" "node_modules/.cache/*" "*.zip" > /dev/null 2>&1

# Lambda Function updaten
echo "   ☁️ Update Lambda Function..."
LAMBDA_NAME="manuel-weiss-profile-media-PresignFunction-JE5AxO7R2uYd"

if aws lambda get-function --function-name "$LAMBDA_NAME" --region eu-central-1 &> /dev/null; then
    aws lambda update-function-code \
        --function-name "$LAMBDA_NAME" \
        --zip-file fileb://../profile-api-update.zip \
        --region eu-central-1 \
        --output json > /dev/null
    
    echo -e "${GREEN}   ✅ Lambda Function deployed!${NC}"
else
    echo -e "${YELLOW}   ⚠️ Lambda Function nicht gefunden: $LAMBDA_NAME${NC}"
    echo "   ℹ️ Verwende deploy-aws-backend.sh für vollständiges Deployment"
fi

# Cleanup
rm -f ../profile-api-update.zip

cd ../..

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT ABGESCHLOSSEN!${NC}"
echo ""
echo "Frontend: https://mawps.netlify.app (wird in 2-3 Min live sein)"
echo "Backend: https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod"
echo ""
echo -e "${BLUE}📋 Nächste Schritte:${NC}"
echo "1. Warten Sie 2-3 Minuten bis Netlify deployed hat"
echo "2. Testen Sie: https://mawps.netlify.app/admin#hero-about"
echo "3. Laden Sie ein Profilbild hoch und prüfen Sie die Console"

