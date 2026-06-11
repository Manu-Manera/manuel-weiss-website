#!/bin/bash
# Deploy: Static Website zu AWS (S3 + CloudFront).
# Nutzt zentrale Config: config/deploy-aws-website.env und config/deploy-aws-exclude.txt
#
# Modi (siehe auch docs/DEPLOY.md):
#   ./deploy-aws-website.sh                   → Schnell-Deploy (default)
#                                                Lädt nur per Git geänderte Website-Dateien hoch.
#                                                Onboarding-App wird NUR neu gebaut, wenn sich
#                                                der Quellcode geändert hat (Smart-Build-Detection).
#   ./deploy-aws-website.sh --skip-build      → Wie oben, aber Onboarding-Build IMMER überspringen.
#                                                (Maximal schnell für reine Website-Änderungen.)
#   ./deploy-aws-website.sh --force-build     → Onboarding-App neu bauen, auch ohne Quelländerungen.
#   ./deploy-aws-website.sh --full            → Kompletter S3-Sync (alle Dateien vergleichen).
#   ./deploy-aws-website.sh --cleanup         → S3 von lokal nicht mehr existierenden Dateien säubern.
#   ./deploy-aws-website.sh --dry-run         → Nichts hochladen, nur anzeigen, was geschehen würde.

set -o pipefail

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
fi

S3_BUCKET="${S3_BUCKET:-manuel-weiss-website}"
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-E305V0ATIXMNNG}"
AWS_REGION="${AWS_REGION:-eu-central-1}"
SITE_URL="${SITE_URL:-https://manuel-weiss.ch}"
PARALLEL_UPLOADS="${PARALLEL_UPLOADS:-16}"

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
  EXCLUDE_ARGS=(
    --exclude "*.git/*"
    --exclude "node_modules/*"
    --exclude "infrastructure/*"
    --exclude "lambda/*"
    --exclude ".github/*"
    --exclude "docs/archive/*"
    --exclude "scripts/archive/*"
  )
fi

# Argumente parsen
DRY_RUN=""
DELETE_FLAG=""
QUICK="1"
FULL=""
SKIP_BUILD=""
FORCE_BUILD=""
for arg in "$@"; do
  case "$arg" in
    --dry-run)     DRY_RUN="--dryrun" ;;
    --cleanup)     DELETE_FLAG="--delete" ;;
    --quick)       QUICK="1" ;;
    --full)        FULL="1"; QUICK="" ;;
    --skip-build)  SKIP_BUILD="1" ;;
    --force-build) FORCE_BUILD="1" ;;
    --help|-h)
      grep -E '^# (\./deploy|  )' "$0" | sed 's/^# //'
      exit 0
      ;;
  esac
done

START_TS=$(date +%s)
echo "🚀 Deployen zu ${SITE_URL} (S3: ${S3_BUCKET}, CloudFront: ${CLOUDFRONT_DISTRIBUTION_ID})"
[ -n "$DRY_RUN" ] && echo "   (Dry-Run – es wird nichts hochgeladen)"

# ─────────────────────────────────────────────────────────────
# Smart-Build-Detection: Onboarding-App nur bauen wenn nötig
# ─────────────────────────────────────────────────────────────
ONBOARDING_SRC="Onboarding Valkeen/onboarding-app"
ONBOARDING_DIST="onboarding"
BUILD_HASH_FILE=".deploy-cache/onboarding-build.hash"

needs_onboarding_build() {
  [ ! -d "$ONBOARDING_SRC" ] && return 1            # keine App vorhanden
  [ ! -d "$ONBOARDING_DIST" ] && return 0           # noch nie gebaut
  [ ! -f "$BUILD_HASH_FILE" ] && return 0           # kein Cache-Eintrag
  local current
  current=$(find "$ONBOARDING_SRC/src" "$ONBOARDING_SRC/index.html" "$ONBOARDING_SRC/package.json" "$ONBOARDING_SRC/vite.config.js" "$ONBOARDING_SRC/vite.config.ts" 2>/dev/null \
    -type f \( -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' -o -name '*.css' -o -name '*.html' -o -name '*.json' \) \
    -exec shasum -a 1 {} + 2>/dev/null | shasum -a 1 | awk '{print $1}')
  local cached
  cached=$(cat "$BUILD_HASH_FILE" 2>/dev/null)
  [ "$current" != "$cached" ]
}

write_build_hash() {
  mkdir -p "$(dirname "$BUILD_HASH_FILE")"
  find "$ONBOARDING_SRC/src" "$ONBOARDING_SRC/public" "$ONBOARDING_SRC/index.html" "$ONBOARDING_SRC/package.json" "$ONBOARDING_SRC/vite.config.js" "$ONBOARDING_SRC/vite.config.ts" 2>/dev/null \
    -type f \( -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' -o -name '*.css' -o -name '*.html' -o -name '*.json' \) \
    -exec shasum -a 1 {} + 2>/dev/null | shasum -a 1 | awk '{print $1}' > "$BUILD_HASH_FILE"
}

DID_BUILD=""
if [ -z "$DRY_RUN" ] && [ -z "$SKIP_BUILD" ]; then
  if [ -n "$FORCE_BUILD" ] || needs_onboarding_build; then
    if [ -d "$ONBOARDING_SRC" ]; then
      echo "📦 Baue Onboarding-App …"
      BUILD_START=$(date +%s)
      if ! (cd "$ONBOARDING_SRC" && npm run build); then
        echo "❌ Onboarding-Build fehlgeschlagen — Deploy abgebrochen."
        echo "   (Kein Upload. Das bisherige Live-Bundle bleibt unverändert.)"
        exit 1
      fi
      if [ -d "$ONBOARDING_SRC/dist" ]; then
        rm -rf "$ONBOARDING_DIST"
        mkdir -p "$ONBOARDING_DIST"
        cp -r "$ONBOARDING_SRC/dist/"* "$ONBOARDING_DIST/"
        write_build_hash
        DID_BUILD="1"
        echo "   → onboarding/ aktualisiert ($(( $(date +%s) - BUILD_START ))s)"
      else
        echo "❌ Build lief, aber kein dist/ erzeugt — Deploy abgebrochen."
        exit 1
      fi
    fi
  else
    echo "⏭️ Onboarding-App: Quellcode unverändert → Build übersprungen"
  fi
elif [ -n "$SKIP_BUILD" ]; then
  echo "⏭️ Onboarding-Build übersprungen (--skip-build)"
fi

[ -n "$DELETE_FLAG" ] && echo "   (Mit --cleanup: entfernt in S3, was lokal fehlt – kann Minuten dauern)"
[ -n "$QUICK" ] && echo "   (Schnellmodus: nur geänderte Dateien)"
[ -n "$FULL" ] && echo "   (Vollsync: alle Dateien vergleichen – kann 2-5 Min dauern)"

# ─────────────────────────────────────────────────────────────
# Schnellmodus: nur geänderte Dateien hochladen, parallel
# ─────────────────────────────────────────────────────────────
upload_one() {
  local f="$1"
  if [[ "$f" == *.html ]]; then
    aws s3 cp "$f" "s3://${S3_BUCKET}/$f" --region "${AWS_REGION}" --cache-control "max-age=60" --only-show-errors
  elif [[ "$f" == onboarding/assets/* ]]; then
    aws s3 cp "$f" "s3://${S3_BUCKET}/$f" --region "${AWS_REGION}" --cache-control "max-age=31536000, immutable" --only-show-errors
  else
    aws s3 cp "$f" "s3://${S3_BUCKET}/$f" --region "${AWS_REGION}" --only-show-errors
  fi
}
export -f upload_one
export S3_BUCKET AWS_REGION

if [ -n "$QUICK" ] && [ -z "$DRY_RUN" ]; then
  LAST_DEPLOY_FILE=".deploy-cache/last-deploy-commit"
  LAST_DEPLOY_COMMIT=""
  if [ -f "$LAST_DEPLOY_FILE" ]; then
    LAST_DEPLOY_COMMIT="$(tr -d '[:space:]' < "$LAST_DEPLOY_FILE")"
  fi

  # Uncommittete Änderungen (Working Tree + Staging)
  UNCOMMITTED=$(git diff --name-only HEAD 2>/dev/null; git diff --name-only --cached HEAD 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null) || true

  # Committete Änderungen seit letztem erfolgreichen Deploy (wichtig nach git commit + push!)
  SINCE_LAST=""
  if [ -n "$LAST_DEPLOY_COMMIT" ] && git cat-file -e "${LAST_DEPLOY_COMMIT}^{commit}" 2>/dev/null; then
    SINCE_LAST=$(git diff --name-only "${LAST_DEPLOY_COMMIT}" HEAD 2>/dev/null) || true
  fi

  CHANGED=$(printf "%s\n%s\n" "$UNCOMMITTED" "$SINCE_LAST" | grep -v '^$' | sort -u)
  CHANGED=$(echo "$CHANGED" | grep -v '^$' | while read -r f; do
    [[ -z "$f" || ! -f "$f" ]] && continue
    # Doku/Skripte – nicht für die Website
    [[ "$f" == *.md || "$f" == *.sh || "$f" == *.yml || "$f" == *.yaml ]] && continue
    [[ "$f" == *.docx || "$f" == *.pdf || "$f" == *.xlsx || "$f" == *.pptx ]] && continue
    [[ "$f" == *.py ]] && continue
    # Hidden/Build/Lock
    [[ "$f" == .* || "$f" == */.git/* || "$f" == *node_modules* ]] && continue
    [[ "$f" == */dist/* || "$f" == */build/* ]] && continue
    [[ "$f" == package-lock.json || "$f" == */package-lock.json ]] && continue
    # Backend-/Infra-/Quellcode (gehört nicht ins S3)
    [[ "$f" == infrastructure/* || "$f" == lambda/* || "$f" == backend/* || "$f" == packages/* ]] && continue
    [[ "$f" == postman/* || "$f" == improvements/* || "$f" == amplify/* || "$f" == api/* ]] && continue
    [[ "$f" == "Onboarding Valkeen/docs/"* ]] && continue
    [[ "$f" == "Onboarding Valkeen/onboarding-app/"* ]] && continue
    [[ "$f" == *.env* || "$f" == config/deploy-aws* ]] && continue
    echo "$f"
  done)

  # Onboarding-Dateien nur mitnehmen wenn frisch gebaut wurde
  if [ -n "$DID_BUILD" ] && [ -d "onboarding" ]; then
    ONBOARDING_FILES=$(find onboarding -type f 2>/dev/null)
    CHANGED=$(printf "%s\n%s\n" "$CHANGED" "$ONBOARDING_FILES" | grep -v '^$' | sort -u)
  fi

  COUNT=$(echo "$CHANGED" | grep -c . 2>/dev/null || echo 0)
  if [ "$COUNT" -eq 0 ]; then
    echo "ℹ️ Keine geänderten Dateien zum Hochladen."
    echo "✅ Fertig in $(( $(date +%s) - START_TS ))s."
    exit 0
  fi

  echo "📤 Lade $COUNT Datei(en) parallel hoch (${PARALLEL_UPLOADS} gleichzeitig) …"
  UPLOAD_START=$(date +%s)
  echo "$CHANGED" | xargs -I{} -P "$PARALLEL_UPLOADS" bash -c 'upload_one "$@"' _ {}
  echo "   ✓ Upload fertig ($(( $(date +%s) - UPLOAD_START ))s)"

  # Cache invalidieren: HTML + Admin-Sections + JS/CSS
  if [ -n "$DID_BUILD" ]; then
    aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
      --paths "/onboarding/*" "/*.html" "/admin/*" "/js/*" "/css/*" --region "${AWS_REGION}" >/dev/null 2>&1
  else
    aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
      --paths "/*.html" "/admin/*" "/js/*" "/css/*" "/sw.js" --region "${AWS_REGION}" >/dev/null 2>&1
  fi

  # Deploy-Marker setzen (für „committed but not deployed“-Erkennung beim nächsten Lauf)
  mkdir -p "$(dirname "$LAST_DEPLOY_FILE")"
  git rev-parse HEAD > "$LAST_DEPLOY_FILE"
  if [ -x "scripts/sync-hero-video-config.sh" ]; then
    echo "🎬 Sync Hero-Video-Config (DynamoDB → S3) …"
    bash scripts/sync-hero-video-config.sh || echo "⚠️ Hero-Video-Config-Sync übersprungen"
    aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
      --paths "/config/hero-video.json" --region "${AWS_REGION}" >/dev/null 2>&1 || true
  fi
  echo "✅ Schnell-Deploy fertig in $(( $(date +%s) - START_TS ))s. In 2–5 Min live: ${SITE_URL}"
  exit 0
fi

# ─────────────────────────────────────────────────────────────
# Vollsync (--full)
# ─────────────────────────────────────────────────────────────
SYNC_LOG=$(mktemp)
trap 'rm -f "$SYNC_LOG"' EXIT

echo "📤 S3 Sync läuft …"
aws s3 sync . "s3://${S3_BUCKET}" \
  "${EXCLUDE_ARGS[@]}" \
  --region "${AWS_REGION}" \
  $DRY_RUN \
  $DELETE_FLAG 2>&1 | tee "$SYNC_LOG"
SYNC_EXIT=${PIPESTATUS[0]}
if [ $SYNC_EXIT -ne 0 ]; then
  echo "⚠️ S3 Sync beendet mit Code $SYNC_EXIT. CloudFront-Invalidierung wird trotzdem ausgeführt."
fi

if [ -z "$DRY_RUN" ]; then
  if grep -qE '^(upload|delete):' "$SYNC_LOG"; then
    if [ -x "scripts/sync-hero-video-config.sh" ]; then
      bash scripts/sync-hero-video-config.sh || true
    fi
    aws cloudfront create-invalidation \
      --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
      --paths "/onboarding/*" "/*.html" "/index.html" "/config/hero-video.json" \
      --region "${AWS_REGION}" >/dev/null 2>&1
    echo "✅ Deploy abgeschlossen in $(( $(date +%s) - START_TS ))s. In 2–5 Min live: ${SITE_URL}"
  else
    echo "✅ Sync fertig – keine Änderungen, CloudFront-Invalidierung übersprungen ($(( $(date +%s) - START_TS ))s)."
  fi
else
  echo "✅ Dry-Run beendet."
fi
