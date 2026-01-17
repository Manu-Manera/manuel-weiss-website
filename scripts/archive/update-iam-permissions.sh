#!/bin/bash

# Script zum Aktualisieren der IAM-Berechtigungen für manu-ses-smtp-user
# Fügt fehlende Berechtigungen für S3 (manuel-weiss-public-media) und DynamoDB (mawps-user-profiles) hinzu

set -e

echo "🔐 IAM-Berechtigungen aktualisieren"
echo "===================================="
echo ""

USER_NAME="manu-ses-smtp-user"
POLICY_NAME="ManuelWeissCompleteAccessPolicy"
POLICY_FILE="iam-policy-complete.json"

# Prüfe ob AWS CLI verfügbar ist
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI nicht gefunden!"
    echo "Installiere mit: brew install awscli"
    exit 1
fi

echo "✅ AWS CLI gefunden"
echo ""

# Prüfe ob Policy-Datei existiert
if [ ! -f "$POLICY_FILE" ]; then
    echo "❌ Policy-Datei nicht gefunden: $POLICY_FILE"
    exit 1
fi

echo "📋 Erstelle/aktualisiere IAM Policy..."
echo ""

# Prüfe ob Policy bereits existiert
POLICY_ARN=$(aws iam list-policies --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text 2>/dev/null || echo "")

if [ -z "$POLICY_ARN" ]; then
    echo "📝 Erstelle neue Policy: $POLICY_NAME"
    POLICY_ARN=$(aws iam create-policy \
        --policy-name "$POLICY_NAME" \
        --policy-document "file://$POLICY_FILE" \
        --query 'Policy.Arn' \
        --output text)
    echo "✅ Policy erstellt: $POLICY_ARN"
else
    echo "📝 Policy existiert bereits: $POLICY_ARN"
    echo "🔄 Aktualisiere Policy-Version..."
    
    # Erstelle neue Policy-Version
    aws iam create-policy-version \
        --policy-arn "$POLICY_ARN" \
        --policy-document "file://$POLICY_FILE" \
        --set-as-default > /dev/null
    
    echo "✅ Policy aktualisiert"
fi

echo ""
echo "🔗 Weise Policy dem User zu..."
echo ""

# Entferne alte Policies (falls vorhanden)
echo "🧹 Entferne alte Policies..."
aws iam list-attached-user-policies --user-name "$USER_NAME" --query 'AttachedPolicies[].PolicyArn' --output text | while read policy_arn; do
    if [ ! -z "$policy_arn" ]; then
        echo "   Entferne: $policy_arn"
        aws iam detach-user-policy --user-name "$USER_NAME" --policy-arn "$policy_arn" 2>/dev/null || true
    fi
done

# Weise neue Policy zu
aws iam attach-user-policy \
    --user-name "$USER_NAME" \
    --policy-arn "$POLICY_ARN"

echo "✅ Policy dem User zugewiesen"
echo ""
echo "📋 Zusammenfassung:"
echo "   User: $USER_NAME"
echo "   Policy: $POLICY_NAME"
echo "   ARN: $POLICY_ARN"
echo ""
echo "✅ Berechtigungen aktualisiert!"
echo ""
echo "Die neuen Berechtigungen umfassen:"
echo "   ✅ S3: manuel-weiss-hero-videos"
echo "   ✅ S3: manuel-weiss-public-media (NEU für Profilbilder)"
echo "   ✅ DynamoDB: manuel-weiss-settings"
echo "   ✅ DynamoDB: mawps-user-profiles (NEU für Profilbild-URLs)"
echo "   ✅ DynamoDB: snowflake-highscores"
echo "   ✅ SES: E-Mail-Versand"
echo ""
