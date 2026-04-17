#!/usr/bin/env bash
# Baut eine verteilbare Mac-App (TempusLoginMailer.app) + ZIP.
# Keine Installation nötig: Empfänger zieht die .app aus dem ZIP nach /Applications
# (oder auf den Schreibtisch) und doppelklickt.

set -euo pipefail

cd "$(dirname "$0")"

echo "=========================================="
echo "  Tempus Login Mailer  –  macOS-Build"
echo "=========================================="
echo

if ! command -v python3 >/dev/null 2>&1; then
    echo "FEHLER: python3 wurde nicht gefunden. Bitte Python 3.10+ installieren (python.org)."
    exit 1
fi

VENV_DIR=".venv-build"
PYTHON="${PYTHON:-python3}"

echo "[1/4] Isoliertes Build-Environment in $VENV_DIR vorbereiten…"
if [ ! -d "$VENV_DIR" ]; then
    "$PYTHON" -m venv "$VENV_DIR"
fi
# ab hier laufen alle pip-Aufrufe innerhalb des venv
PYTHON="$VENV_DIR/bin/python"
"$PYTHON" -m pip install --upgrade pip >/dev/null
"$PYTHON" -m pip install -r requirements.txt
"$PYTHON" -m pip install pyinstaller

echo
echo "[2/4] Alte Build-Artefakte entfernen…"
rm -rf build dist "TempusLoginMailer-mac.zip"

echo
echo "[3/4] PyInstaller läuft (das dauert 1–2 Minuten)…"
"$PYTHON" -m PyInstaller --noconfirm TempusLoginMailer.spec

APP_PATH="dist/TempusLoginMailer.app"
if [ ! -d "$APP_PATH" ]; then
    echo "FEHLER: $APP_PATH wurde nicht erzeugt."
    exit 2
fi

echo
echo "[4/4] App quarantäne-frei signieren (ad-hoc) und verpacken…"
# Ad-hoc-Signatur: macOS-Sicherheit klappt auf einem Kollegen-Mac zuverlässiger,
# wenn die App überhaupt signiert ist. Keine Gebühren, keine Apple-ID nötig.
codesign --force --deep --sign - "$APP_PATH" || true

# Staging-Ordner mit App + Anleitung → ZIP (beides nebeneinander im Archiv).
STAGE="dist/_mac_release"
rm -rf "$STAGE"
mkdir -p "$STAGE"
cp -R "$APP_PATH" "$STAGE/"
cp DISTRIBUTE_README.md "$STAGE/ANLEITUNG.md" 2>/dev/null || true
# ditto erhält Codesign/Rechte besser als `zip`.
(cd "$STAGE" && ditto -c -k --sequesterRsrc . "../../TempusLoginMailer-mac.zip")

echo
echo "=========================================="
echo "  Fertig!"
echo "  App:  $APP_PATH"
echo "  ZIP:  $(pwd)/TempusLoginMailer-mac.zip"
echo "=========================================="
echo
echo "Verteilen:"
echo "  1. TempusLoginMailer-mac.zip an den Kollegen senden"
echo "  2. Empfänger: ZIP doppelklicken -> TempusLoginMailer.app auf den Schreibtisch"
echo "     oder in /Applications ziehen und starten"
echo
echo "Hinweis (macOS Gatekeeper):"
echo "  Beim ersten Start eventuell Rechtsklick -> Öffnen anklicken"
echo "  (die App ist ad-hoc signiert, Apple wertet sie als 'unbekannter Entwickler')."
