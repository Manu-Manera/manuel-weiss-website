#!/bin/bash
# ──────────────────────────────────────────────────────────
# refresh-demo-state-url.sh
# Generiert eine neue 7-Tage-Presigned-URL für das
# tempus-demo-pm.html State-Saving und aktualisiert die HTML-Datei.
#
# Ausführen: ./refresh-demo-state-url.sh
# ──────────────────────────────────────────────────────────

set -e

HTML_FILE="Onboarding Valkeen/onboarding-app/public/tempus-demo-pm.html"
REGION="eu-central-1"
BUCKET="manuel-weiss-website"
KEY="data/tempus-demo-pm-state.json"

echo "🔑 Generiere neue Presigned PUT-URL (7 Tage)..."

NEW_URL=$(python3 -c "
import boto3
from botocore.config import Config
s3 = boto3.client('s3', region_name='${REGION}', config=Config(signature_version='s3v4'))
url = s3.generate_presigned_url(
    'put_object',
    Params={'Bucket': '${BUCKET}', 'Key': '${KEY}', 'ContentType': 'application/json'},
    ExpiresIn=604800
)
print(url)
")

if [ -z "$NEW_URL" ]; then
  echo "❌ Konnte keine URL generieren."
  exit 1
fi

echo "📝 Aktualisiere HTML-Datei..."

# Ersetze die PRESIGNED_PUT_URL in der HTML-Datei
sed -i '' "s|const PRESIGNED_PUT_URL = '[^']*'|const PRESIGNED_PUT_URL = '${NEW_URL}'|g" "${HTML_FILE}"

echo "🚀 Deploye..."
./deploy-aws-website.sh --quick

echo ""
echo "✅ Fertig! URL ist 7 Tage gültig."
echo "   Nächster Refresh: $(date -v+7d '+%d.%m.%Y')"
