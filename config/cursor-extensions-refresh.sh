#!/usr/bin/env bash
# Cursor-Extensions: Alle deinstallieren und neu installieren (ein Skript für den kompletten Ablauf).
# Wichtig: In Terminal.app oder iTerm ausführen (nicht im Cursor-Terminal), sonst bricht das Skript beim Neustart ab.
# Nutzung: ./config/cursor-extensions-refresh.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Schritt 1: Extensions deinstallieren ==="
bash "./cursor-extensions-uninstall.sh"

echo ""
echo "=== Schritt 2: Cursor neu starten ==="
if [[ "$(uname)" == "Darwin" ]]; then
  echo "Cursor wird beendet und in 5 Sekunden wieder geöffnet …"
  osascript -e 'quit app "Cursor"' 2>/dev/null || true
  sleep 5
  open -a "Cursor"
  echo "Warte 15 Sekunden, bis Cursor hochgefahren ist …"
  sleep 15
else
  echo "Bitte Cursor jetzt vollständig beenden und neu starten."
  echo "Drücke Enter, wenn Cursor wieder läuft."
  read -r
fi

echo ""
echo "=== Schritt 3: Extensions wieder installieren ==="
bash "./cursor-extensions-reinstall.sh"

echo ""
echo "Fertig. Extensions wurden neu eingerichtet."
