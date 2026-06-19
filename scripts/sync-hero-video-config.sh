#!/bin/bash
# Sync hero-video-url aus DynamoDB → öffentliche config/hero-video.json auf S3 (Fallback für Startseite).
set -euo pipefail

S3_BUCKET="${S3_BUCKET:-manuel-weiss-website}"
AWS_REGION="${AWS_REGION:-eu-central-1}"
TABLE="${SETTINGS_TABLE:-manuel-weiss-settings}"
KEY="${SETTINGS_KEY:-hero-video-url}"

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

ITEM="$(aws dynamodb get-item \
  --table-name "$TABLE" \
  --key "{\"settingKey\":{\"S\":\"$KEY\"}}" \
  --output json)"

VIDEO_URL="$(echo "$ITEM" | python3 -c "
import json,sys
d=json.load(sys.stdin)
item=d.get('Item') or {}
v=item.get('settingValue',{}).get('S','')
print(v)
")"

UPDATED="$(echo "$ITEM" | python3 -c "
import json,sys
d=json.load(sys.stdin)
item=d.get('Item') or {}
print(item.get('updatedAt',{}).get('S','') or '')
")"

python3 - "$VIDEO_URL" "$UPDATED" > "$TMP" <<'PY'
import json, sys
url, updated = sys.argv[1], sys.argv[2]
print(json.dumps({
    "videoUrl": url or None,
    "updatedAt": updated or None,
}))
PY

aws s3 cp "$TMP" "s3://${S3_BUCKET}/config/hero-video.json" \
  --region "$AWS_REGION" \
  --content-type "application/json" \
  --cache-control "max-age=60"

echo "✓ s3://${S3_BUCKET}/config/hero-video.json"
