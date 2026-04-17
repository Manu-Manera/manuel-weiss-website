#!/bin/bash
# ──────────────────────────────────────────────────────────
# refresh-mailer-state-url.sh
# Erzeugt eine neue Presigned-PUT-URL (max. 7 Tage – AWS-Obergrenze für SigV4)
# für den Login-Mailer-State (tempus-mailer-state.json) in S3 und schreibt
# sie in den Frontend-Service.
#
# Ausführen:  ./refresh-mailer-state-url.sh
# Warum:      Solange `lambda:CreateFunction` im Konto geblockt ist, läuft das
#             Speichern der Mailer-Templates direkt per Presigned-PUT in S3
#             (wie beim Demo-Skript). Alle 7 Tage neu generieren.
#
# Hinweis: sed darf hier NICHT genutzt werden – Presigned-URLs enthalten "&".
# ──────────────────────────────────────────────────────────

set -e

SERVICE_FILE="Onboarding Valkeen/onboarding-app/src/services/tempusMailerService.js"
REGION="eu-central-1"
BUCKET="manuel-weiss-website"
KEY="data/tempus-mailer-state.json"

echo "🔑 Generiere neue Presigned PUT-URL (ExpiresIn=604800, 7 Tage)..."

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

echo "📝 Aktualisiere Service-Datei (Python, nicht sed)..."

export SERVICE_FILE
python3 << 'PY'
import os
from pathlib import Path

url = os.environ["NEW_URL"]
safe = url.replace("\\", "\\\\").replace("'", "\\'")
path = Path(os.environ["SERVICE_FILE"])
text = path.read_text(encoding="utf-8")

marker = "const MAILER_STATE_PUT_URL = '"
i = text.find(marker)
if i < 0:
    raise SystemExit("Marker 'MAILER_STATE_PUT_URL' nicht in Service-Datei gefunden")
j = text.find("';", i + len(marker))
if j < 0:
    raise SystemExit("Schließende Anführungszeichen nicht gefunden")

new_text = text[: i + len(marker)] + safe + text[j:]
path.write_text(new_text, encoding="utf-8")
print("OK: URL geschrieben.")
PY

echo "🚀 Deploye..."
./deploy-aws-website.sh --quick

echo ""
echo "✅ Fertig! URL ist 7 Tage gültig."
echo "   Nächster Refresh: $(date -v+7d '+%d.%m.%Y' 2>/dev/null || date -d '+7 days' '+%d.%m.%Y' 2>/dev/null)"
