#!/usr/bin/env bash
# Erzeugt public/tempus-demo.html aus team-resources (parametrisierte Custom-Demo-Hülle)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/Onboarding Valkeen/onboarding-app/public/tempus-demo-team-resources.html"
OUT="$ROOT/Onboarding Valkeen/onboarding-app/public/tempus-demo.html"

cp "$SRC" "$OUT"

# IDs & Keys
sed -i '' \
  -e 's/team-resources-editable-intro/custom-editable-intro/g' \
  -e 's/team-resources-training-agenda/custom-training-agenda/g' \
  -e 's/team-resources-scenes-page/custom-scenes-page/g' \
  -e 's/team-resources-scene-/custom-scene-/g' \
  -e 's/team-resources-empty-scene-template/custom-empty-scene-template/g' \
  -e "s|const STORAGE_KEY = 'tempus-demo-team-resources-v1';|const DEMO_SLUG = (new URLSearchParams(location.search).get('demo') || '').toLowerCase();\nif (!/^[a-z0-9][a-z0-9-]{0,48}$/.test(DEMO_SLUG)) {\n  document.addEventListener('DOMContentLoaded', () => {\n    document.body.innerHTML = '<p style=\"padding:2rem;font-family:Inter,sans-serif\">Demo-ID fehlt oder ungültig. URL: <code>?demo=ihr-slug</code></p>';\n  });\n}\nconst STORAGE_KEY = 'tempus-demo-custom-' + DEMO_SLUG + '-v1';|" \
  -e 's|/demo-script/team-resources|/demo-script/custom/" + DEMO_SLUG|g' \
  -e 's/toggleRmVersionsPanel/toggleDemoVersionsPanel/g' \
  -e 's/edit-versions-btn-label-rm/edit-versions-btn-label-demo/g' \
  -e 's/RM_STATE_SCHEMA_VERSION/CUSTOM_STATE_SCHEMA_VERSION/g' \
  -e 's/__tempusRmLastPersisted/__tempusCustomLastPersisted/g' \
  -e 's/rmLang/demoLang/g' \
  "$OUT"

# Fix API URL line — sed may break template; patch manually if needed
perl -i -pe "s|const DEMO_SCRIPT_API_URL = \`\$\{WEBSITE_API_BASE\}/demo-script/custom/\" \+ DEMO_SLUG;|const DEMO_SCRIPT_API_URL = \`\${WEBSITE_API_BASE}/demo-script/custom/\${DEMO_SLUG}\`;|" "$OUT" 2>/dev/null || true

echo "✅ $OUT"
