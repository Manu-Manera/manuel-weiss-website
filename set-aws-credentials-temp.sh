#!/bin/bash
# Temporäre AWS Credentials für diese Shell-Session setzen
# Diese werden NICHT in ~/.aws/credentials gespeichert, nur für diese Session

echo "🔐 AWS Credentials für diese Session setzen"
echo ""
echo "Bitte gib deine neuen AWS Access Keys ein:"
echo ""

read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -sp "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
echo ""

# Setze als Environment Variables für diese Session
export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_DEFAULT_REGION=eu-central-1

echo ""
echo "✅ Credentials gesetzt für diese Shell-Session"
echo "   (Nur für diese Terminal-Session, nicht persistent)"
echo ""
echo "Teste die Credentials..."
aws sts get-caller-identity

echo ""
echo "💡 Diese Credentials sind nur für diese Shell-Session aktiv."
echo "   Um sie dauerhaft zu setzen, verwende: aws configure"
