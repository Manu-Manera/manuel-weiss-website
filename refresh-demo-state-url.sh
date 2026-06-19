#!/bin/bash
# Erneuert Presigned PUT-URLs (max. 7 Tage) für Demo-State + PM-Media.
# Schreibt nach config/*.json (gitignored) — nicht in HTML (keine AKIA-IDs im Git).
#
# Ausführen: ./refresh-demo-state-url.sh
# Voraussetzung: aws/boto3 mit S3-Presign-Rechten (z. B. aws configure)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

REGION="eu-central-1"
BUCKET="manuel-weiss-website"
FALLBACK_JSON="config/demo-presigned-fallback.json"
MEDIA_JSON="config/tempus-demo-pm-media-slots.json"

presign_put() {
  local key="$1"
  local content_type="${2:-application/json}"
  python3 -c "
import boto3
from botocore.config import Config
s3 = boto3.client('s3', region_name='${REGION}', config=Config(signature_version='s3v4'))
print(s3.generate_presigned_url(
    'put_object',
    Params={'Bucket': '${BUCKET}', 'Key': '${key}', 'ContentType': '${content_type}'},
    ExpiresIn=604800,
))
"
}

echo "🔑 Generiere Presigned URLs…"
PM_URL=$(presign_put "data/tempus-demo-pm-state.json")
RM_URL=$(presign_put "data/tempus-demo-rm-state.json")
BPAFG_URL=$(presign_put "data/tempus-demo-bpafg-state.json")
TEAM_URL=$(presign_put "data/tempus-demo-team-resources-state.json")

export PM_URL RM_URL BPAFG_URL TEAM_URL FALLBACK_JSON
python3 << 'PY'
import json, os
from pathlib import Path
data = {
    "pm": os.environ["PM_URL"],
    "rm": os.environ["RM_URL"],
    "bpafg": os.environ["BPAFG_URL"],
    "team-resources": os.environ["TEAM_URL"],
}
path = Path(os.environ["FALLBACK_JSON"])
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
print(f"✓ {path}")
PY

echo "🔑 PM Media Slots…"
export MEDIA_JSON BUCKET REGION
python3 << 'PY'
import json, os
from pathlib import Path
import boto3
from botocore.config import Config

region = os.environ["REGION"]
bucket = os.environ["BUCKET"]
s3 = boto3.client("s3", region_name=region, config=Config(signature_version="s3v4"))
slots = {}
for i in range(1, 11):
    key = f"img-{i:02d}"
    s3_key = f"media/tempus-demo-pm/{key}.jpg"
    slots[key] = s3.generate_presigned_url(
        "put_object",
        Params={"Bucket": bucket, "Key": s3_key, "ContentType": "image/jpeg"},
        ExpiresIn=604800,
    )
for i in range(1, 6):
    key = f"vid-{i:02d}"
    s3_key = f"media/tempus-demo-pm/{key}.mp4"
    slots[key] = s3.generate_presigned_url(
        "put_object",
        Params={"Bucket": bucket, "Key": s3_key, "ContentType": "video/mp4"},
        ExpiresIn=604800,
    )
path = Path(os.environ["MEDIA_JSON"])
path.write_text(json.dumps(slots, indent=2) + "\n", encoding="utf-8")
print(f"✓ {path} ({len(slots)} slots)")
PY

echo "📤 Upload Config nach S3…"
aws s3 cp "$FALLBACK_JSON" "s3://${BUCKET}/config/demo-presigned-fallback.json" \
  --region "$REGION" --content-type "application/json" --cache-control "max-age=300"
aws s3 cp "$MEDIA_JSON" "s3://${BUCKET}/config/tempus-demo-pm-media-slots.json" \
  --region "$REGION" --content-type "application/json" --cache-control "max-age=300"

echo "🚀 Deploye HTML (ohne eingebettete Keys)…"
./deploy-aws-website.sh --quick

echo ""
echo "✅ Fertig. URLs gültig ~7 Tage — erneut ausführen vor Ablauf."
echo "   Config liegt lokal in config/ (gitignored) und auf S3 unter /config/…"
