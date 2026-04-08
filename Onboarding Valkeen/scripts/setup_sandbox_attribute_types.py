#!/usr/bin/env python3
"""
Tempus Sandbox: Custom Field *Definitionen* anlegen (Attributtypen, keine Werte)

Was das Skript tut
------------------
POST /api/sg/v1/CustomFields — legt nur die **Schema-Typen** an, die ihr später in
Admin → Attribute Management bzw. auf Entitäten seht. Es setzt **keine** Werte auf
Projekten, Meilensteinen oder Ressourcen.

Abgrenzung (wichtig)
--------------------
- **Native Meilensteine** (Tempus-Milestone-Objekte mit Datum, Abhängigkeiten) sind
  ein eigenes Objekt — dieses Skript ersetzt sie nicht. Die Felder auf *Project*
  dienen der **PM-Steuerung** („nächster Geschäfts-Meilenstein“, Status).
- **Milestone-Entität**: Eigene Custom Fields hier beschreiben den *Charakter* eines
  angelegten Meilensteins (Gate vs. Release …), nicht das Datum (das liefert Tempus).
- **Finanzen**: Grobe **Zielgrößen auf Projektebene** (Budget, Marge %) — nicht die
  zeitliche **Financials**-/Cost-Planung (eigenes Datenmodul). Für Demos reicht oft
  Budget + eine Kennzahl; Details bleiben im Financials-Bereich.

Voraussetzung: API-Key mit Berechtigung zum Anlegen von Custom Fields.

  export TEMPUS_BASE_URL="https://trial5.tempus-resource.com/slot4"
  export TEMPUS_API_KEY="<key>"
  cd "Onboarding Valkeen/scripts"
  python setup_sandbox_attribute_types.py           # anlegen (überspringt Duplikate)
  python setup_sandbox_attribute_types.py --dry-run # nur anzeigen
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def _load_env():
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, val = line.partition("=")
                key, val = key.strip(), val.strip().strip('"\'')
                if key and key not in os.environ:
                    os.environ[key] = val


_load_env()

BASE_URL = os.environ.get("TEMPUS_BASE_URL", "https://trial5.tempus-resource.com/slot4").rstrip("/")
API_KEY = os.environ.get("TEMPUS_API_KEY", "")


def api_request(method: str, path: str, body=None) -> dict | list:
    url = f"{BASE_URL}/api/sg/v1{path}"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = Request(url, data=data, headers=headers, method=method)
    try:
        with urlopen(req, timeout=60) as r:
            text = r.read().decode("utf-8")
            return json.loads(text) if text else []
    except HTTPError as e:
        text = e.read().decode("utf-8", errors="replace") if e.fp else str(e)
        raise RuntimeError(f"API {e.code}: {text[:1200]}")
    except URLError as e:
        raise RuntimeError(f"Verbindung fehlgeschlagen: {e}")


def fetch_all(path: str, page_size: int = 500) -> list:
    all_items: list = []
    page = 1
    while True:
        sep = "&" if "?" in path else "?"
        data = api_request("GET", f"{path}{sep}page={page}&pageSize={page_size}")
        items = data.get("items", data) if isinstance(data, dict) else (data if isinstance(data, list) else [])
        if not isinstance(items, list):
            items = []
        all_items.extend(items)
        if len(items) < page_size:
            break
        page += 1
    return all_items


def _enum(*labels: str) -> list[dict]:
    return [{"enumMemberId": -(i + 1), "name": n} for i, n in enumerate(labels)]


def custom_field_definitions() -> list[dict]:
    """
    Payload wie tempus-excel-mapper (POST /CustomFields): id null, dataType aus Supergrid.
    Namen mit Präfix «Sandbox –» um Kollisionen mit mandantenspezifischen Sets zu vermeiden.
    """
    base = {
        "id": None,
        "isRequired": False,
        "isReadOnly": False,
        "isUnique": False,
        "isRichText": False,
    }

    # ── Project: Steuerung Lieferung & Finanzziele (Portfolio/PM-Ebene) ──
    project_defs: list[dict] = [
        {
            **base,
            "name": "Sandbox – Nächster Liefer-Meilenstein",
            "entityType": "Project",
            "dataType": "date",
        },
        {
            **base,
            "name": "Sandbox – Liefer-Meilenstein-Status",
            "entityType": "Project",
            "dataType": "Enum",
            "enumMembers": _enum(
                "Nicht geplant",
                "Geplant",
                "Im Zeitplan",
                "Risiko / Verzug",
                "Erreicht",
            ),
        },
        {
            **base,
            "name": "Sandbox – Finanzziel Budget",
            "entityType": "Project",
            "dataType": "currency",
        },
        {
            **base,
            "name": "Sandbox – Finanzziel Marge %",
            "entityType": "Project",
            "dataType": "double",
        },
        {
            **base,
            "name": "Sandbox – Business-Case Status",
            "entityType": "Project",
            "dataType": "Enum",
            "enumMembers": _enum(
                "Entwurf",
                "In Freigabe",
                "Freigegeben",
                "Überprüfung / Audit",
            ),
        },
    ]

    # ── Milestone: Klassifikation nativer Meilensteine (kein Ersatz für Datum/Links) ──
    milestone_defs: list[dict] = [
        {
            **base,
            "name": "Sandbox – Meilenstein-Art",
            "entityType": "Milestone",
            "dataType": "Enum",
            "enumMembers": _enum(
                "Gate / Entscheid",
                "Release",
                "Go-Live",
                "Review / QA",
                "Sonstiges",
            ),
        },
        {
            **base,
            "name": "Sandbox – Business-Relevanz",
            "entityType": "Milestone",
            "dataType": "Enum",
            "enumMembers": _enum(
                "Niedrig",
                "Mittel",
                "Hoch",
                "Kritisch",
            ),
        },
    ]

    return project_defs + milestone_defs


def existing_keys(custom_fields: list) -> set[tuple[str, str]]:
    """(entityType lower, name lower) für Duplikat-Check."""
    out: set[tuple[str, str]] = set()
    for cf in custom_fields:
        et = (cf.get("entityType") or "").strip().lower()
        name = (cf.get("name") or "").strip().lower()
        if et and name:
            out.add((et, name))
    return out


def main() -> None:
    dry = "--dry-run" in sys.argv
    if not API_KEY and not dry:
        print("Fehler: TEMPUS_API_KEY nicht gesetzt.")
        print("  export TEMPUS_API_KEY='<key>'")
        sys.exit(1)

    defs = custom_field_definitions()
    print(f"Instanz: {BASE_URL}")
    print(f"Geplante neue Attributtypen: {len(defs)}\n")

    if dry:
        for d in defs:
            em = d.get("enumMembers")
            extra = f" ({len(em)} Ausprägungen)" if em else ""
            print(f"  [{d['entityType']}] {d['name']}: {d['dataType']}{extra}")
        print("\nDry-run — kein API-Aufruf.")
        return

    existing = existing_keys(fetch_all("/CustomFields"))
    to_create = []
    for d in defs:
        key = (d["entityType"].lower(), d["name"].lower())
        if key in existing:
            print(f"  (überspringe, existiert) [{d['entityType']}] {d['name']}")
        else:
            to_create.append(d)

    if not to_create:
        print("\nAlle Definitionen sind bereits angelegt.")
        return

    print(f"\nLege {len(to_create)} Attributtyp(en) an …")
    try:
        # API erwartet laut Excel-Mapper ein Array von Definitionen
        api_request("POST", "/CustomFields", to_create)
    except RuntimeError as e:
        print(f"\nFehler: {e}")
        print(
            "\nHinweis: Fehlt die Berechtigung oder unterstützt die Instanz "
            "POST /CustomFields nicht, legen Sie die Felder in Tempus unter "
            "Admin → Attribute Management manuell an (gleiche Namen/Typen wie oben)."
        )
        sys.exit(1)

    print("  ✓ POST /CustomFields erfolgreich")
    for d in to_create:
        print(f"     [{d['entityType']}] {d['name']}")
    print("\nFertig. Werte auf Projekten/Meilensteinen setzen Sie separat in der UI oder per Import.")


if __name__ == "__main__":
    main()
