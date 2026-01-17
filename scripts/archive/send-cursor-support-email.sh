#!/bin/bash
# Sendet die Beschwerde-E-Mail an Cursor Support über AWS SES

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📧 Sende Beschwerde-E-Mail an Cursor Support über AWS SES...${NC}"
echo ""

# Configuration
REGION="eu-central-1"
FROM_EMAIL="weiss-manuel@gmx.de"  # Verifizierte SES E-Mail-Adresse
TO_EMAIL="support@cursor.sh"
SUBJECT="KRITISCHE BESCHWERDE - Unzureichende AI-Leistung verursacht massive Frustration und gesundheitliche Belastung"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI nicht gefunden${NC}"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS Credentials nicht konfiguriert${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS Credentials OK${NC}"
echo ""

# Read email content from markdown file
EMAIL_FILE="$SCRIPT_DIR/CURSOR_SUPPORT_BESCHWERDE.md"

if [ ! -f "$EMAIL_FILE" ]; then
    echo -e "${RED}❌ E-Mail-Datei nicht gefunden: $EMAIL_FILE${NC}"
    exit 1
fi

# Extract email body (skip frontmatter and convert markdown to plain text)
EMAIL_BODY=$(cat "$EMAIL_FILE" | \
    sed 's/\*\*//g' | \
    sed 's/^---$//' | \
    sed 's/^\[Ihr Name\]/Manuel Weiss/' | \
    sed "s/^\[Ihre E-Mail-Adresse\]/weiss-manuel@gmx.de/" | \
    sed 's/^\[Ihre Kundennummer, falls vorhanden\]//' | \
    sed "s/\$(date '+%Y-%m-%d')/$(date '+%Y-%m-%d')/" | \
    grep -v '^$' | \
    tail -n +10)

# Create temporary email file
TEMP_EMAIL=$(mktemp)
cat > "$TEMP_EMAIL" <<EOF
From: $FROM_EMAIL
To: $TO_EMAIL
Subject: $SUBJECT
Content-Type: text/plain; charset=UTF-8

$EMAIL_BODY
EOF

echo -e "${BLUE}📝 E-Mail-Inhalt:${NC}"
echo "   Von: $FROM_EMAIL"
echo "   An: $TO_EMAIL"
echo "   Betreff: $SUBJECT"
echo "   Größe: $(wc -c < "$TEMP_EMAIL") bytes"
echo ""

# Check if FROM_EMAIL is verified in SES
echo "🔍 Prüfe SES-Verifizierung für $FROM_EMAIL..."
VERIFICATION_STATUS=$(aws ses get-identity-verification-attributes \
    --identities "$FROM_EMAIL" \
    --region "$REGION" \
    --query "VerificationAttributes.\`$FROM_EMAIL\`.VerificationStatus" \
    --output text 2>/dev/null || echo "Unknown")

if [ "$VERIFICATION_STATUS" = "Success" ]; then
    echo -e "${GREEN}✅ E-Mail-Adresse ist in SES verifiziert${NC}"
else
    echo -e "${YELLOW}⚠️  E-Mail-Adresse Status: $VERIFICATION_STATUS${NC}"
    echo "   Versuche trotzdem zu senden..."
fi

# Check SES sending quota
echo ""
echo "🔍 Prüfe SES Sending Quota..."
QUOTA=$(aws ses get-send-quota --region "$REGION" --query "Max24HourSend" --output text 2>/dev/null || echo "0")
SENT=$(aws ses get-send-statistics --region "$REGION" --query "SendDataPoints[-1].Sent" --output text 2>/dev/null || echo "0")

if [ "$QUOTA" != "0" ]; then
    echo "   Quota: $QUOTA E-Mails/24h"
    echo "   Bereits gesendet: $SENT E-Mails"
else
    echo -e "${YELLOW}⚠️  SES könnte im Sandbox-Modus sein${NC}"
    echo "   Sie können nur an verifizierte E-Mail-Adressen senden"
fi

echo ""
echo -e "${BLUE}📤 Sende E-Mail...${NC}"

# Send email using AWS SES
RESULT=$(aws ses send-email \
    --region "$REGION" \
    --source "$FROM_EMAIL" \
    --destination "ToAddresses=$TO_EMAIL" \
    --message "Subject={Data=$SUBJECT,Charset=UTF-8},Body={Text={Data=$EMAIL_BODY,Charset=UTF-8}}" \
    --output json 2>&1)

if [ $? -eq 0 ]; then
    MESSAGE_ID=$(echo "$RESULT" | grep -o '"MessageId":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ E-Mail erfolgreich gesendet!${NC}"
    echo "   Message ID: $MESSAGE_ID"
    echo ""
    echo -e "${GREEN}✅ Die Beschwerde wurde an support@cursor.sh gesendet.${NC}"
else
    echo -e "${RED}❌ Fehler beim Senden der E-Mail:${NC}"
    echo "$RESULT"
    echo ""
    echo -e "${YELLOW}💡 Mögliche Lösungen:${NC}"
    echo "   1. Stellen Sie sicher, dass $FROM_EMAIL in SES verifiziert ist"
    echo "   2. Prüfen Sie, ob SES aus dem Sandbox-Modus ist"
    echo "   3. Prüfen Sie die AWS IAM-Berechtigungen für SES"
    exit 1
fi

# Cleanup
rm -f "$TEMP_EMAIL"

echo ""
echo -e "${GREEN}✅ Fertig!${NC}"

