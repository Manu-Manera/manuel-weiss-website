#!/usr/bin/env python3
"""
Verknüpft Admin Time Types (Bayern, Österreich) mit den Ressourcen Manuel, Marc, Aayushi
per Tempus API. Schreibt die Feiertagsdaten direkt in die Kapazität (2026).

Verwendung:
  export TEMPUS_API_URL="https://trial5.tempus-resource.com/slot4"
  export TEMPUS_API_TOKEN="Bearer <token>"
  python scripts/link_admin_times_to_resources_api.py
"""

from datetime import datetime, timedelta
import json
import os
import sys
import urllib.error
import urllib.request

RESOURCE_NAMES = ["Manuel", "Marc", "Aayushi"]
YEAR = 2026

# Bayern: DE_NATIONAL + Bayern-spezifisch (aus generate_admin_times_feiertage.py)
BAYERN_HOLIDAYS = [
    "2026-01-01", "2026-01-06", "2026-04-03", "2026-04-06", "2026-05-01",
    "2026-05-14", "2026-05-25", "2026-06-04", "2026-08-15", "2026-10-03",
    "2026-11-01", "2026-12-25", "2026-12-26",
]

# Österreich: gesetzliche Feiertage 2026 bundesweit (feiertage-oesterreich.at)
# St. Josef (19.3.) nur regional – hier weggelassen
AT_HOLIDAYS = [
    "2026-01-01", "2026-01-06",  # Neujahr, Hl. Drei Könige
    "2026-04-03", "2026-04-06",  # Karfreitag, Ostermontag
    "2026-05-01", "2026-05-14", "2026-05-25",  # Staatsfeiertag, Himmelfahrt, Pfingstmontag
    "2026-06-04",  # Fronleichnam
    "2026-08-15",  # Mariä Himmelfahrt
    "2026-10-26",  # Nationalfeiertag
    "2026-11-01",  # Allerheiligen
    "2026-12-08", "2026-12-25", "2026-12-26",  # Mariä Empfängnis, Christtag, Stefanitag
]


def build_weekday_values(holiday_dates: set, use_hours: bool = False) -> list:
    """Werte an Feiertagen: 8 (Stunden) oder 1 (FTE), sonst 0. Nur Werktage."""
    start = datetime(YEAR, 1, 1)
    end = datetime(YEAR, 12, 31)
    values = []
    d = start
    while d <= end:
        if d.weekday() < 5:  # Nur Mo–Fr
            dt_str = d.strftime("%Y-%m-%d")
            values.append(8 if (dt_str in holiday_dates and use_hours) else (1 if dt_str in holiday_dates else 0))
        d += timedelta(days=1)
    return values


def build_base_capacity():
    """8h / 1 FTE pro Werktag. Nur Werktage (Mo–Fr)."""
    start = datetime(YEAR, 1, 1)
    end = datetime(YEAR, 12, 31)
    hours, fte = [], []
    d = start
    while d <= end:
        if d.weekday() < 5:
            hours.append(8)
            fte.append(1)
        d += timedelta(days=1)
    return hours, fte


def api_request(url: str, headers: dict, method: str = "GET", data: bytes = None, parse_json: bool = True):
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=60) as resp:
        body = resp.read().decode()
        return json.loads(body) if parse_json and body.strip() else None


def main() -> None:
    base_url = os.environ.get("TEMPUS_API_URL", "").rstrip("/")
    token = os.environ.get("TEMPUS_API_TOKEN", "")

    if not base_url or not token:
        print("Fehler: TEMPUS_API_URL und TEMPUS_API_TOKEN müssen gesetzt sein.")
        sys.exit(1)

    if not token.lower().startswith("bearer "):
        token = f"Bearer {token}"

    headers = {"Authorization": token, "Content-Type": "application/json"}

    # 1. Public Holidays Austria anlegen (falls nicht vorhanden)
    admin_url = f"{base_url}/api/sg/v1/AdminTimes"
    try:
        existing_admin = api_request(admin_url, headers)
    except Exception as e:
        print(f"Fehler Admin Times: {e}")
        sys.exit(1)

    admin_by_name = {a["name"]: a["id"] for a in existing_admin if a.get("name")}
    if "Public Holidays Austria" not in admin_by_name:
        try:
            created = api_request(
                admin_url, headers, "POST",
                json.dumps([{"id": 0, "name": "Public Holidays Austria"}]).encode(),
            )
            new_id = created[0] if isinstance(created, list) else created
            admin_by_name["Public Holidays Austria"] = new_id["id"] if isinstance(new_id, dict) else new_id
            print("Public Holidays Austria angelegt.")
        except urllib.error.HTTPError as e:
            print(f"Fehler beim Anlegen: {e.read().decode()}")
            sys.exit(1)

    bayern_id = admin_by_name.get("Public Holidays Bayern")
    austria_id = admin_by_name.get("Public Holidays Austria")
    if not bayern_id or not austria_id:
        print(f"Fehler: Bayern-ID={bayern_id}, Austria-ID={austria_id}")
        sys.exit(1)

    # 2. Ressourcen-IDs holen (page=1 erforderlich wenn keine ids angegeben)
    resources_url = f"{base_url}/api/sg/v1/Resources?page=1&pageSize=100"
    try:
        resp = api_request(resources_url, headers)
    except urllib.error.HTTPError as e:
        print(f"Fehler Resources {e.code}: {e.read().decode()}")
        sys.exit(1)
    except Exception as e:
        print(f"Fehler Resources: {e}")
        sys.exit(1)

    resources = resp.get("items", resp) if isinstance(resp, dict) else resp
    name_to_id = {r["name"]: r["id"] for r in resources if isinstance(r, dict) and r.get("name")}
    resource_ids = []
    for name in RESOURCE_NAMES:
        if name in name_to_id:
            resource_ids.append(name_to_id[name])
        else:
            print(f"Warnung: Ressource '{name}' nicht gefunden.")

    if not resource_ids:
        print("Keine Ressourcen gefunden.")
        sys.exit(1)

    # 3. Feiertagsdaten bauen
    bayern_dates = set(BAYERN_HOLIDAYS)
    at_dates = set(AT_HOLIDAYS)
    bayern_values = build_weekday_values(bayern_dates, use_hours=True)
    at_values = build_weekday_values(at_dates, use_hours=True)
    base_hours, base_fte = build_base_capacity()

    # 4. Kapazität aktualisieren (merge=true). Time = Stunden (dominante Einheit in Tempus)
    capacity_url = (
        f"{base_url}/api/sg/v1/Resources/Capacities"
        "?adminTimeUnit=Time&compressed=false&timeUnit=Day&merge=true"
    )
    payload = [
        {
            "resourceIds": resource_ids,
            "capacity": {
                "startDate": f"{YEAR}-01-01T00:00:00Z",
                "endDate": f"{YEAR}-12-31T23:59:59Z",
                "demandPlanning": False,
                "baseCapacityHours": base_hours,
                "baseCapacityFte": base_fte,
                "adminTimes": [
                    {"id": bayern_id, "hoursData": bayern_values},
                    {"id": austria_id, "hoursData": at_values},
                ],
            },
        }
    ]

    try:
        api_request(capacity_url, headers, "PUT", json.dumps(payload).encode(), parse_json=False)
        print(f"Erfolgreich: Bayern + Österreich für {', '.join(RESOURCE_NAMES)} verknüpft (Jahr {YEAR}).")
    except urllib.error.HTTPError as e:
        print(f"API-Fehler {e.code}: {e.read().decode()}")
        sys.exit(1)


if __name__ == "__main__":
    main()
