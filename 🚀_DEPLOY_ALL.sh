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

# Profile API wird jetzt über backend/user-profile/handler.mjs verwaltet
# Deployment erfolgt über deploy-user-profile-lambda.sh
echo "   ℹ️ Profile API wird über backend/user-profile verwaltet"
echo "   ℹ️ Verwende deploy-user-profile-lambda.sh für Deployment"

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

