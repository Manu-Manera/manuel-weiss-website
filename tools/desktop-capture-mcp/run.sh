#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -x .venv/bin/python ]]; then
  echo "desktop-capture-mcp: .venv fehlt. Siehe README (python3 -m venv .venv && pip install -r requirements.txt)." >&2
  exit 1
fi
exec .venv/bin/python server.py
