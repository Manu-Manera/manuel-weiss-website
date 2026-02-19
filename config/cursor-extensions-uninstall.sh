#!/usr/bin/env bash
# Entfernt alle Cursor-Extensions aus der Backup-Liste.
# Danach: Cursor neu starten, dann cursor-extensions-reinstall.sh ausführen.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIST="$SCRIPT_DIR/cursor-extensions-backup.txt"

while IFS= read -r id || [[ -n "$id" ]]; do
  id="${id%%#*}"
  id="${id// /}"
  [[ -z "$id" ]] && continue
  echo "Deinstalliere: $id"
  cursor --uninstall-extension "$id" 2>/dev/null || true
done < "$LIST"

echo "Fertig. Bitte Cursor neu starten, dann ./cursor-extensions-reinstall.sh ausführen."
