#!/bin/bash

# Skript zum Einrichten von DNS Records für Netlify Custom Domain
# Verwendet Route53 Hosted Zone für manuel-weiss.ch

HOSTED_ZONE_ID="Z02760862I1VK88B8J0ED"
DOMAIN="manuel-weiss.ch"

echo "🌐 Netlify Custom Domain DNS Setup für $DOMAIN"
echo "================================================"
echo ""

# Prüfe ob AWS CLI verfügbar ist
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI ist nicht installiert. Bitte installiere es zuerst."
    exit 1
fi

# Prüfe ob jq verfügbar ist
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq ist nicht installiert. Installiere es mit: brew install jq"
    echo "   Das Skript funktioniert auch ohne jq, aber die Ausgabe ist weniger schön."
fi

echo "📋 Bitte gib die DNS-Records ein, die Netlify dir angezeigt hat:"
echo ""

# Frage nach A Record (IPv4)
read -p "IPv4 Adresse (A Record) für $DOMAIN (z.B. 75.2.60.5): " IPV4_ADDRESS
if [ -z "$IPV4_ADDRESS" ]; then
    echo "❌ IPv4 Adresse ist erforderlich"
    exit 1
fi

# Frage nach AAAA Record (IPv6, optional)
read -p "IPv6 Adresse (AAAA Record) für $DOMAIN (optional, Enter zum Überspringen): " IPV6_ADDRESS

# Frage nach www CNAME
read -p "Netlify Load Balancer DNS für www.$DOMAIN (z.B. mawps.netlify.app, Enter zum Überspringen): " WWW_CNAME

echo ""
echo "🔍 Prüfe aktuelle DNS Records..."
echo ""

# Prüfe ob A Record bereits existiert
EXISTING_A=$(aws route53 list-resource-record-sets --hosted-zone-id $HOSTED_ZONE_ID --query "ResourceRecordSets[?Name=='$DOMAIN.' && Type=='A']" --output json 2>/dev/null)

if [ "$EXISTING_A" != "[]" ] && [ -n "$EXISTING_A" ]; then
    echo "⚠️  A Record für $DOMAIN existiert bereits:"
    echo "$EXISTING_A" | jq -r '.[0].ResourceRecords[0].Value' 2>/dev/null || echo "$EXISTING_A"
    read -p "Möchtest du ihn überschreiben? (j/n): " OVERWRITE_A
    if [ "$OVERWRITE_A" != "j" ] && [ "$OVERWRITE_A" != "J" ]; then
        echo "❌ Abgebrochen"
        exit 1
    fi
fi

# Erstelle Change Batch für Route53
CHANGE_BATCH="{"

# A Record (IPv4)
CHANGE_BATCH="$CHANGE_BATCH
  \"Changes\": [
    {
      \"Action\": \"UPSERT\",
      \"ResourceRecordSet\": {
        \"Name\": \"$DOMAIN.\",
        \"Type\": \"A\",
        \"TTL\": 300,
        \"ResourceRecords\": [
          {
            \"Value\": \"$IPV4_ADDRESS\"
          }
        ]
      }
    }"

# AAAA Record (IPv6, falls angegeben)
if [ -n "$IPV6_ADDRESS" ]; then
    CHANGE_BATCH="$CHANGE_BATCH,
    {
      \"Action\": \"UPSERT\",
      \"ResourceRecordSet\": {
        \"Name\": \"$DOMAIN.\",
        \"Type\": \"AAAA\",
        \"TTL\": 300,
        \"ResourceRecords\": [
          {
            \"Value\": \"$IPV6_ADDRESS\"
          }
        ]
      }
    }"
fi

# CNAME für www (falls angegeben)
if [ -n "$WWW_CNAME" ]; then
    # Stelle sicher, dass CNAME mit Punkt endet
    if [[ ! "$WWW_CNAME" =~ \.$ ]]; then
        WWW_CNAME="$WWW_CNAME."
    fi
    
    CHANGE_BATCH="$CHANGE_BATCH,
    {
      \"Action\": \"UPSERT\",
      \"ResourceRecordSet\": {
        \"Name\": \"www.$DOMAIN.\",
        \"Type\": \"CNAME\",
        \"TTL\": 300,
        \"ResourceRecords\": [
          {
            \"Value\": \"$WWW_CNAME\"
          }
        ]
      }
    }"
fi

CHANGE_BATCH="$CHANGE_BATCH
  ]
}"

echo ""
echo "📤 Erstelle DNS Records in Route53..."
echo ""

# Erstelle Change Batch File
CHANGE_BATCH_FILE=$(mktemp)
echo "$CHANGE_BATCH" > "$CHANGE_BATCH_FILE"

# Führe Change aus
CHANGE_ID=$(aws route53 change-resource-record-sets \
    --hosted-zone-id $HOSTED_ZONE_ID \
    --change-batch file://"$CHANGE_BATCH_FILE" \
    --query 'ChangeInfo.Id' \
    --output text 2>&1)

if [ $? -eq 0 ] && [ -n "$CHANGE_ID" ]; then
    echo "✅ DNS Records erfolgreich erstellt!"
    echo ""
    echo "📋 Change ID: $CHANGE_ID"
    echo ""
    echo "⏳ DNS-Propagation kann 5-15 Minuten dauern"
    echo "🔍 Prüfe Status mit: aws route53 get-change --id $CHANGE_ID"
    echo ""
    echo "🌐 Prüfe öffentliche DNS-Auflösung:"
    echo "   dig A $DOMAIN +short"
    if [ -n "$WWW_CNAME" ]; then
        echo "   dig CNAME www.$DOMAIN +short"
    fi
    echo ""
    echo "💡 Nächste Schritte:"
    echo "   1. Gehe zu Netlify Dashboard → Domain management"
    echo "   2. Warte 1-2 Minuten, bis Netlify die DNS-Records erkennt"
    echo "   3. Netlify stellt automatisch ein SSL-Zertifikat aus"
    echo "   4. Die Domain sollte dann über HTTPS erreichbar sein"
else
    echo "❌ Fehler beim Erstellen der DNS Records:"
    echo "$CHANGE_ID"
    exit 1
fi

# Aufräumen
rm -f "$CHANGE_BATCH_FILE"

