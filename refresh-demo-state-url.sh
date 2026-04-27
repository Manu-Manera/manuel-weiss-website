#!/bin/bash
# ──────────────────────────────────────────────────────────
# refresh-demo-state-url.sh
# Generiert eine neue Presigned-URL (max. 7 Tage — AWS-Obergrenze für SigV4)
# für tempus-demo-pm.html: Presigned-PUT-Fallback, wenn POST /v1/demo-script (Lambda) nicht geht.
# Sobald Lambda wieder läuft, ist keine Erneuerung nötig; Presigned max. 7 Tage (AWS-Limit).
#
# Ausführen: ./refresh-demo-state-url.sh
# S3-CORS (Browser-PUT): aws s3api put-bucket-cors --bucket manuel-weiss-website
#   --region eu-central-1 --cors-configuration file://config/s3-cors-manuel-weiss-website.json
#
# Hinweis: sed darf hier NICHT genutzt werden — Presigned-URLs enthalten
# "&" (Query-String). In sed-Ersetzungen bedeutet "&" das komplette Match
# und zerstört die Zeile (JS-Syntaxfehler → z.B. Sprachumschalter tot).
# ──────────────────────────────────────────────────────────

set -e

HTML_FILE="Onboarding Valkeen/onboarding-app/public/tempus-demo-pm.html"
REGION="eu-central-1"
BUCKET="manuel-weiss-website"
KEY="data/tempus-demo-pm-state.json"

echo "🔑 Generiere neue Presigned PUT-URL (max. 7 Tage, ExpiresIn=604800)..."

export NEW_URL
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

echo "📝 Aktualisiere HTML-Datei (Python, nicht sed)..."

export HTML_FILE
python3 << 'PY'
import os
from pathlib import Path

url = os.environ["NEW_URL"]
safe = url.replace("\\", "\\\\").replace("'", "\\'")
path = Path(os.environ["HTML_FILE"])
lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
out = []
replaced = False
for line in lines:
    if line.startswith("const PRESIGNED_PUT_URL = ") and not replaced:
        out.append(f"const PRESIGNED_PUT_URL = '{safe}';\n")
        replaced = True
    else:
        out.append(line)
if not replaced:
    raise SystemExit("Keine Zeile const PRESIGNED_PUT_URL = … gefunden")
path.write_text("".join(out), encoding="utf-8")
PY

echo "🚀 Deploye..."
./deploy-aws-website.sh --quick

echo ""
echo "✅ Fertig! URL ist 7 Tage gültig."
echo "   Nächster Refresh: $(date -v+7d '+%d.%m.%Y')"
