#!/usr/bin/env bash
# Kopiert Master-Deck aus Valkeen-Repo und baut DE-Locale neu.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VALKEEN_DECK="${VALKEEN_DECK:-$HOME/Valkeen/docs/horizon_workshop/deck/Tempus_Kickoff_Workshop_Master_deck.json}"
if [[ ! -f "$VALKEEN_DECK" ]]; then
  echo "Deck nicht gefunden: $VALKEEN_DECK"
  exit 1
fi
cp "$VALKEEN_DECK" "$ROOT/src/data/kickoff-deck.json"
python3 "$ROOT/scripts/build-kickoff-de-locale.py"
echo "OK: kickoff-deck.json + kickoff-deck-locale-de.json aktualisiert"
