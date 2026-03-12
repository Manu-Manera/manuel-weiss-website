#!/usr/bin/env python3
"""
Legt alle Admin Time Types (Feiertagskalender) für CH-Kantone und DE-Bundesländer
per Tempus API an. Die Kalender müssen existieren, bevor die Excel-Dateien importiert werden.

Verwendung:
  export TEMPUS_API_URL="https://trial5.tempus-resource.com/slot4"
  export TEMPUS_API_TOKEN="<dein Bearer Token>"
  python scripts/create_admin_time_types_api.py

Token: In Tempus einloggen, Browser DevTools > Network > beliebige API-Anfrage > Header "Authorization"
"""

import json
import os
import sys
import urllib.error
import urllib.request

# Admin-Time-Namen wie in generate_admin_times_feiertage.py (Excel-Import)
CH_KANTONE = [
    "Aargau", "Appenzell Ausserrhoden", "Appenzell Innerrhoden", "Basel-Landschaft",
    "Basel-Stadt", "Bern", "Freiburg", "Genf", "Glarus", "Graubünden", "Jura",
    "Luzern", "Neuenburg", "Nidwalden", "Obwalden", "Schaffhausen", "Schwyz",
    "Solothurn", "St. Gallen", "Tessin", "Thurgau", "Uri", "Waadt", "Wallis",
    "Zug", "Zürich",
]
DE_BUNDESLAENDER = [
    "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg",
    "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein-Westfalen",
    "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein",
    "Thüringen",
]
AT_NAME = "Austria"  # Public Holidays Austria


def get_admin_type_name(region: str, is_ch: bool) -> str:
    """Name wie in Excel: 'Public Holidays Zurich' für Zürich, sonst 'Public Holidays {Region}'."""
    if is_ch and region == "Zürich":
        return "Public Holidays Zurich"
    return f"Public Holidays {region}"


def main() -> None:
    base_url = os.environ.get("TEMPUS_API_URL", "").rstrip("/")
    token = os.environ.get("TEMPUS_API_TOKEN", "")

    if not base_url or not token:
        print("Fehler: TEMPUS_API_URL und TEMPUS_API_TOKEN müssen gesetzt sein.")
        print()
        print("Beispiel:")
        print('  export TEMPUS_API_URL="https://trial5.tempus-resource.com/slot4"')
        print('  export TEMPUS_API_TOKEN="Bearer <dein-token>"')
        print()
        print("Token: Tempus öffnen, DevTools > Network > API-Request > Header Authorization kopieren")
        sys.exit(1)

    if not token.lower().startswith("bearer "):
        token = f"Bearer {token}"

    api_url = f"{base_url}/api/sg/v1/AdminTimes"
    headers = {
        "Authorization": token,
        "Content-Type": "application/json",
    }

    # Bestehende Admin Times laden
    try:
        req = urllib.request.Request(api_url, headers=headers, method="GET")
        with urllib.request.urlopen(req, timeout=30) as resp:
            existing = json.loads(resp.read().decode())
    except Exception as e:
        print(f"Fehler beim Laden der Admin Times: {e}")
        sys.exit(1)

    existing_names = {a["name"] for a in existing if a.get("name")}

    # Zu erstellende Namen sammeln
    to_create = []
    for kanton in CH_KANTONE:
        name = get_admin_type_name(kanton, is_ch=True)
        if name not in existing_names:
            to_create.append({"id": 0, "name": name})
            existing_names.add(name)

    for land in DE_BUNDESLAENDER:
        name = get_admin_type_name(land, is_ch=False)
        if name not in existing_names:
            to_create.append({"id": 0, "name": name})
            existing_names.add(name)

    if f"Public Holidays {AT_NAME}" not in existing_names:
        to_create.append({"id": 0, "name": f"Public Holidays {AT_NAME}"})
        existing_names.add(f"Public Holidays {AT_NAME}")

    if not to_create:
        print("Alle Admin Time Types existieren bereits. Nichts zu tun.")
        return

    print(f"Erstelle {len(to_create)} Admin Time Types...")
    for item in to_create:
        print(f"  - {item['name']}")

    # API erlaubt max 5000 pro Request
    try:
        data = json.dumps(to_create).encode("utf-8")
        req = urllib.request.Request(api_url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read().decode())
        print(f"\nErfolgreich erstellt. Antwort: {len(result)} Einträge.")
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ""
        print(f"API-Fehler {e.code}: {body}")
        sys.exit(1)
    except Exception as e:
        print(f"Fehler: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
