#!/bin/bash
# ──────────────────────────────────────────────────────────
# refresh-demo-state-url.sh
# Erneuert Presigned PUT-URLs (max. 7 Tage) für PM- und RM-Demo-State in S3.
# Fallback, wenn POST /v1/demo-script bzw. …/rm (Lambda) nicht erreichbar ist.
#
# Ausführen: ./refresh-demo-state-url.sh
#
# S3-CORS: aws s3api put-bucket-cors --bucket manuel-weiss-website
#   --region eu-central-1 --cors-configuration file://config/s3-cors-manuel-weiss-website.json
#
# sed nicht verwenden — Presigned-URLs enthalten "&".
# ──────────────────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

REGION="eu-central-1"
BUCKET="manuel-weiss-website"

presign_and_patch() {
  local HTML_FILE="$1"
  local KEY="$2"
  echo "🔑 Presigned PUT: ${KEY} → ${HTML_FILE}"

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
    echo "❌ Konnte keine URL generieren für ${KEY}"
    exit 1
  fi

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
    raise SystemExit(f"Keine Zeile const PRESIGNED_PUT_URL in {path}")
path.write_text("".join(out), encoding="utf-8")
PY
}

presign_and_patch "Onboarding Valkeen/onboarding-app/public/tempus-demo-pm.html" "data/tempus-demo-pm-state.json"
presign_and_patch "Onboarding Valkeen/onboarding-app/public/tempus-demo-rm.html" "data/tempus-demo-rm-state.json"

echo "🚀 Deploye..."
./deploy-aws-website.sh --quick

echo ""
echo "✅ Fertig! Beide URLs sind 7 Tage gültig."
echo "   Nächster Refresh: $(date -v+7d '+%d.%m.%Y' 2>/dev/null || date -d '+7 days' '+%d.%m.%Y' 2>/dev/null || echo '+7 Tage')"
