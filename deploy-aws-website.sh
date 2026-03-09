#!/bin/bash
# Deploy: Static Website zu AWS (S3 + CloudFront).
# Nutzt zentrale Config: config/deploy-aws-website.env und config/deploy-aws-exclude.txt
# Neue Excludes einfach in deploy-aws-exclude.txt eintragen – gilt für alle zukünftigen Deploys.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Konfiguration laden
CONFIG_FILE="config/deploy-aws-website.env"
EXCLUDE_FILE="config/deploy-aws-exclude.txt"

if [ -f "$CONFIG_FILE" ]; then
  set -a
  # shellcheck source=config/deploy-aws-website.env
  source "$CONFIG_FILE"
  set +a
else
  S3_BUCKET="${S3_BUCKET:-manuel-weiss-website}"
  CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-E305V0ATIXMNNG}"
  AWS_REGION="${AWS_REGION:-eu-central-1}"
  SITE_URL="${SITE_URL:-https://manuel-weiss.ch}"
fi

if ! command -v aws &>/dev/null; then
  echo "❌ AWS CLI nicht gefunden."
  exit 1
fi
if ! aws sts get-caller-identity &>/dev/null; then
  echo "❌ AWS nicht angemeldet. Bitte anmelden (z.B. aws configure)."
  exit 1
fi

# Exclude-Argumente aus Datei bauen (eine Zeile = ein --exclude)
EXCLUDE_ARGS=()
if [ -f "$EXCLUDE_FILE" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%%#*}"
    line="$(echo "$line" | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
    [ -z "$line" ] && continue
    EXCLUDE_ARGS+=(--exclude "$line")
  done < "$EXCLUDE_FILE"
else
  # Fallback wenn keine Exclude-Datei
  EXCLUDE_ARGS=(
    --exclude "*.git/*"
    --exclude "node_modules/*"
    --exclude "infrastructure/*"
    --exclude "lambda/*"
    --exclude "netlify/*"
    --exclude ".github/*"
    --exclude "docs/archive/*"
    --exclude "scripts/archive/*"
  )
fi

DRY_RUN=""
DELETE_FLAG=""
QUICK=""
for arg in "$@"; do
  [ "$arg" = "--dry-run" ] && DRY_RUN="--dryrun"
  [ "$arg" = "--cleanup" ] && DELETE_FLAG="--delete"
  [ "$arg" = "--quick" ] && QUICK="1"
done

echo "🚀 Deployen zu ${SITE_URL} (S3: ${S3_BUCKET}, CloudFront: ${CLOUDFRONT_DISTRIBUTION_ID})"
[ -n "$DRY_RUN" ] && echo "   (Dry-Run – es wird nichts hochgeladen)"

# Onboarding-App bauen und nach onboarding/ kopieren (wird deployed, dist/* ist excluded)
if [ -z "$DRY_RUN" ]; then
  if [ -d "Onboarding Valkeen/onboarding-app" ]; then
    echo "📦 Baue Onboarding-App …"
    (cd "Onboarding Valkeen/onboarding-app" && npm run build 2>/dev/null) || true
    if [ -d "Onboarding Valkeen/onboarding-app/dist" ]; then
      rm -rf onboarding
      mkdir -p onboarding
      cp -r "Onboarding Valkeen/onboarding-app/dist/"* onboarding/
      echo "   → onboarding/ aktualisiert"
    fi
  fi
fi
[ -n "$DELETE_FLAG" ] && echo "   (Mit --cleanup: entfernt in S3, was lokal fehlt – kann Minuten dauern)"
[ -n "$QUICK" ] && echo "   (Schnellmodus: nur geänderte Dateien)"

# Schnellmodus: nur per Git geänderte/neue Dateien hochladen (typisch Sekunden)
if [ -n "$QUICK" ] && [ -z "$DRY_RUN" ]; then
  CHANGED=$(git diff --name-only HEAD 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null) || true
  CHANGED=$(echo "$CHANGED" | grep -v '^$' | while read -r f; do
    [[ -z "$f" || ! -f "$f" ]] && continue
    [[ "$f" == *.md || "$f" == *.sh || "$f" == *.yml || "$f" == *.yaml ]] && continue
    [[ "$f" == .* || "$f" == */.git/* || "$f" == *node_modules* || "$f" == *netlify/* ]] && continue
    [[ "$f" == infrastructure/* || "$f" == lambda/* || "$f" == backend/* || "$f" == packages/* ]] && continue
    [[ "$f" == postman/* || "$f" == improvements/* || "$f" == amplify/* || "$f" == api/* ]] && continue
    [[ "$f" == *.env* || "$f" == config/deploy-aws* ]] && continue
    echo "$f"
  done)
  COUNT=$(echo "$CHANGED" | grep -c . 2>/dev/null || echo 0)
  # onboarding/ immer mit hochladen (Build-Output, in .gitignore)
  if [ -d "onboarding" ]; then
    ONBOARDING_FILES=$(find onboarding -type f 2>/dev/null)
    CHANGED=$(echo -e "${CHANGED}\n${ONBOARDING_FILES}" | grep -v '^$' | sort -u)
  fi
  COUNT=$(echo "$CHANGED" | grep -c . 2>/dev/null || echo 0)
  if [ "$COUNT" -eq 0 ]; then
    echo "ℹ️ Keine geänderten Website-Dateien (oder nicht in einem Git-Repo). Nutze normalen Sync ohne --quick."
  else
    echo "📤 Lade $COUNT Datei(en) hoch …"
    echo "$CHANGED" | while read -r f; do [ -n "$f" ] && echo "$f"; done | xargs -P 8 -I {} aws s3 cp "{}" "s3://${S3_BUCKET}/{}" --region "${AWS_REGION}" --only-show-errors
    aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths "/*" --region "${AWS_REGION}" >/dev/null 2>&1
    echo "✅ Schnell-Deploy fertig. In 2–5 Min live: ${SITE_URL}"
    exit 0
  fi
fi

SYNC_LOG=$(mktemp)
trap 'rm -f "$SYNC_LOG"' EXIT

# Ohne --delete: nur Hochladen/Updates. Mit --cleanup: auch Löschen in S3 (langsam).
aws s3 sync . "s3://${S3_BUCKET}" \
  "${EXCLUDE_ARGS[@]}" \
  --region "${AWS_REGION}" \
  --only-show-errors \
  $DRY_RUN \
  $DELETE_FLAG 2>&1 | tee "$SYNC_LOG"
SYNC_EXIT=${PIPESTATUS[0]}
if [ $SYNC_EXIT -ne 0 ]; then
  echo "⚠️ S3 Sync beendet mit Code $SYNC_EXIT. CloudFront-Invalidierung wird trotzdem ausgeführt."
fi

if [ -z "$DRY_RUN" ]; then
  if grep -qE '^(upload|delete):' "$SYNC_LOG"; then
    aws cloudfront create-invalidation \
      --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
      --paths "/*" \
      --region "${AWS_REGION}"
    echo "✅ Deploy abgeschlossen. In 2–5 Min live: ${SITE_URL}"
  else
    echo "✅ Sync fertig – keine Änderungen, CloudFront-Invalidierung übersprungen."
  fi
else
  echo "✅ Dry-Run beendet. Ohne --dry-run wird hochgeladen und invalidiert."
fi
