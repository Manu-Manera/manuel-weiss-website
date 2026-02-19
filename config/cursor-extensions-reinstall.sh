#!/usr/bin/env bash
# Installiert alle Extensions aus cursor-extensions-backup.txt neu.
# Nach dem Ausführen: Cursor ggf. einmal neu starten.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIST="$SCRIPT_DIR/cursor-extensions-backup.txt"

while IFS= read -r id || [[ -n "$id" ]]; do
  id="${id%%#*}"
  id="${id// /}"
  [[ -z "$id" ]] && continue
  echo "Installiere: $id"
  cursor --install-extension "$id" 2>/dev/null || true
done < "$LIST"

echo "Fertig. Extensions sind wieder eingerichtet."
