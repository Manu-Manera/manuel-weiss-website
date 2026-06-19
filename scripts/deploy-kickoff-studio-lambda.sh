#!/usr/bin/env bash
# Deploy website-kickoff-studio-api — index.js muss im ZIP-Root liegen.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/lambda/kickoff-studio-api"
ZIP="$ROOT/lambda/kickoff-studio-api.zip"

cd "$DIR"
npm install --omit=dev
cd "$DIR"
rm -f "$ZIP"
zip -qr "$ZIP" index.js package.json node_modules

aws lambda update-function-code \
  --function-name website-kickoff-studio-api \
  --zip-file "fileb://$ZIP" \
  --region eu-central-1

echo "✅ kickoff-studio-api deployed ($(du -h "$ZIP" | cut -f1))"
