#!/bin/bash

# Manuel Weiss Professional Services - Deployment Script
echo "🚀 Starte Deployment für Manuel Weiss Professional Services..."

# Farben für bessere Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktionen
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 ist nicht installiert.${NC}"
        return 1
    fi
    return 0
}

# Überprüfe notwendige Tools
echo -e "${BLUE}🔍 Überprüfe Installationen...${NC}"

if ! check_command "npm"; then
    echo -e "${RED}❌ Node.js/npm ist nicht installiert.${NC}"
    echo "Bitte installiere Node.js von https://nodejs.org/"
    exit 1
fi

# Deployment-Optionen
echo -e "${BLUE}📋 Wähle deine Deployment-Option:${NC}"
echo "1) Netlify (empfohlen)"
echo "2) GitHub Pages"
echo "3) Lokaler Server (für Tests)"

read -p "Wähle eine Option (1-3): " choice

case $choice in
    1)
        echo -e "${BLUE}🚀 Deploye auf Netlify...${NC}"
        echo -e "${YELLOW}📋 Anleitung für Netlify:${NC}"
        echo "1. Gehe zu https://netlify.com"
        echo "2. Erstelle ein Konto oder melde dich an"
        echo "3. Ziehe deinen Projektordner auf die Netlify-Oberfläche"
        echo "4. Deine Website wird automatisch deployed!"
        echo ""
        echo -e "${GREEN}✅ Netlify-Konfiguration ist bereits erstellt (netlify.toml)${NC}"
        ;;
        
    2)
        echo -e "${BLUE}🚀 Deploye auf GitHub Pages...${NC}"
        echo -e "${YELLOW}📋 Anleitung für GitHub Pages:${NC}"
        echo "1. Pushe deinen Code zu GitHub"
        echo "2. Gehe zu Repository Settings > Pages"
        echo "3. Wähle 'Deploy from a branch'"
        echo "4. Wähle 'main' oder 'master' Branch"
        echo "5. Deine Website wird unter https://username.github.io/repository verfügbar sein"
        ;;
        
    3)
        echo -e "${BLUE}🚀 Starte lokalen Server...${NC}"
        echo -e "${GREEN}🌐 Server läuft auf http://localhost:8000${NC}"
        echo "Drücke Ctrl+C zum Beenden"
        python3 -m http.server 8000
        ;;
        
    *)
        echo -e "${RED}❌ Ungültige Option${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ Deployment-Prozess abgeschlossen!${NC}"
