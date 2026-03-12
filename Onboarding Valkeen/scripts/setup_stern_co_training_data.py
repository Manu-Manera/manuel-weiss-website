#!/usr/bin/env python3
"""
Stern & Co – Training-Daten in Tempus anlegen

Legt Ressourcen, Projekte, Kapazitäten und Assignments an – inkl. Über-/Unterauslastung
für das Net-Availability-Grid-Training (QRG: How to Populate Excel Templates).

Verwendung:
  export TEMPUS_BASE_URL="https://trial5.tempus-resource.com/slot4"
  export TEMPUS_API_KEY="5-844944ec-8c96-433b-bc81-368654cd6228"
  python setup_stern_co_training_data.py

  --capacity-only: Nur Kapazitäten + Assignments setzen (Ressourcen/Projekte müssen existieren)
"""

import json
import os
import sys
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

# ── Konfiguration ───────────────────────────────────────────────────

BASE_URL = os.environ.get("TEMPUS_BASE_URL", "https://trial5.tempus-resource.com/slot4").rstrip("/")
API_KEY = os.environ.get("TEMPUS_API_KEY", "")

# Kapazität: 160h/Monat pro Person (1 FTE ≈ 8h/Tag × 20 Arbeitstage)
HOURS_PER_MONTH = 160

# Stern & Co – Ressourcen (Name, Rolle, ExternalId)
RESOURCES = [
    ("Brad Pitt", "Senior Developer", "stern-brad-pitt"),
    ("Meryl Streep", "Projekt Managerin", "stern-meryl-streep"),
    ("Taylor Swift", "Marketing Specialist", "stern-taylor-swift"),
    ("Dwayne Johnson", "IT Infrastructure", "stern-dwayne-johnson"),
    ("Angela Merkel", "Compliance Officer", "stern-angela-merkel"),
    ("Roger Federer", "DevOps Lead", "stern-roger-federer"),
    ("Heidi Klum", "UX Designerin", "stern-heidi-klum"),
    ("Elon Musk", "Innovation Lead", "stern-elon-musk"),
]

# Stern & Co – Projekte (Name, Start, Ende, ExternalId)
PROJECTS = [
    ("Blockbuster App 2026", "2026-01-01", "2026-12-31", "stern-blockbuster-app-2026"),
    ("Cloud Migration", "2026-02-01", "2026-08-31", "stern-cloud-migration"),
    ("Social Media Relaunch", "2026-03-01", "2026-06-30", "stern-social-media-relaunch"),
    ("Compliance Update Q2", "2026-04-01", "2026-06-30", "stern-compliance-update-q2"),
]

# Projekt-Zeiträume: (Start-Datum, Anzahl Monate) – Allokation nur im Projektzeitraum
PROJECT_PERIODS = {
    "Blockbuster App 2026": ("2026-01-01", 12),  # Jan–Dez
    "Cloud Migration": ("2026-02-01", 7),  # Feb–Aug
    "Social Media Relaunch": ("2026-03-01", 4),  # Mar–Jun
    "Compliance Update Q2": ("2026-04-01", 3),  # Apr–Jun
}

# Assignments für Über-/Unterauslastung (Stunden/Monat pro Projekt)
# Elon Musk: überbucht (240h); Taylor Swift: unterbucht (80h); Rest: ausgeglichen
ASSIGNMENTS = [
    ("Brad Pitt", "Blockbuster App 2026", 160),  # ausgeglichen
    ("Meryl Streep", "Blockbuster App 2026", 160),
    ("Taylor Swift", "Social Media Relaunch", 80),  # unterbucht
    ("Dwayne Johnson", "Cloud Migration", 160),
    ("Angela Merkel", "Compliance Update Q2", 120),  # unterbucht
    ("Roger Federer", "Cloud Migration", 160),
    ("Heidi Klum", "Blockbuster App 2026", 100),  # unterbucht
    ("Elon Musk", "Blockbuster App 2026", 120),  # 120h
    ("Elon Musk", "Cloud Migration", 120),  # +120h = 240h → überbucht
]


def load_env_file():
    """Lädt .env aus dem Script-Verzeichnis, falls vorhanden."""
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, val = line.partition("=")
                key, val = key.strip(), val.strip().strip('"\'')
                if key and key not in os.environ:
                    os.environ[key] = val


def api_request(method: str, path: str, body=None) -> dict | list:
    """Führt einen API-Request aus."""
    url = f"{BASE_URL}/api/sg/v1{path}"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = Request(url, data=data, headers=headers, method=method)
    try:
        with urlopen(req, timeout=30) as r:
            text = r.read().decode("utf-8")
            return json.loads(text) if text else []
    except HTTPError as e:
        text = e.read().decode("utf-8", errors="replace") if e.fp else str(e)
        raise RuntimeError(f"API {e.code}: {text[:500]}")
    except URLError as e:
        raise RuntimeError(f"Verbindung fehlgeschlagen: {e}")


def create_resources() -> dict[str, int]:
    """Erstellt die Stern & Co Ressourcen. Gibt Mapping name -> id zurück."""
    created = {}
    for name, role, ext_id in RESOURCES:
        payload = {
            "name": name,
            "externalId": ext_id,
            "isEnabled": True,
            "updateGlobalRole": False,
            "updateDefaultRate": False,
            "updateAdvancedRate": False,
            "updateSecurityGroup": False,
            "isTimesheetUser": False,
            "isTeamResource": False,
        }
        res = api_request("POST", "/Resources", [payload])
        if isinstance(res, list) and len(res) > 0:
            rid = res[0]
            created[name] = rid
            print(f"  ✓ Ressource: {name} (ID {rid})")
        else:
            print(f"  ✗ Ressource: {name} – unerwartete Antwort: {res}")
    return created


def create_projects() -> dict[str, int]:
    """Erstellt die Stern & Co Projekte. Gibt Mapping name -> id zurück."""
    created = {}
    for name, start, end, ext_id in PROJECTS:
        payload = {
            "name": name,
            "externalId": ext_id,
            "updateSecurityGroup": False,
            "updateProjectDates": True,
            "startDate": f"{start}T00:00:00Z",
            "endDate": f"{end}T23:59:59Z",
        }
        res = api_request("POST", "/Projects", [payload])
        if isinstance(res, list) and len(res) > 0:
            pid = res[0]
            created[name] = pid
            print(f"  ✓ Projekt: {name} (ID {pid})")
        else:
            print(f"  ✗ Projekt: {name} – unerwartete Antwort: {res}")
    return created


def get_resources_by_external_ids() -> dict[str, dict]:
    """Gibt Ressourcen nach externalId zurück. {ext_id: {id, name, ...}}."""
    ext_ids = [r[2] for r in RESOURCES]
    data = api_request("GET", f"/Resources?externalIds={','.join(ext_ids)}")
    items = data.get("items", data if isinstance(data, list) else [])
    return {r["externalId"]: r for r in items if r.get("externalId")}


def get_projects_by_external_ids() -> dict[str, dict]:
    """Gibt Projekte nach externalId zurück."""
    ext_ids = [p[3] for p in PROJECTS]
    data = api_request("GET", f"/Projects?externalIds={','.join(ext_ids)}")
    items = data.get("items", data if isinstance(data, list) else [])
    return {p["externalId"]: p for p in items if p.get("externalId")}


def get_tasks(project_ids: list[int]) -> list[dict]:
    """Holt Tasks für die gegebenen Projekte. Jedes Projekt hat mind. einen Generic-Task."""
    if not project_ids:
        return []
    ids = ",".join(str(p) for p in project_ids)
    data = api_request("GET", f"/Tasks?projectIds={ids}&page=1&pageSize=500")
    items = data.get("items", []) if isinstance(data, dict) else []
    return items


def set_resource_capacities(resources: dict[str, dict]) -> None:
    """Setzt Kapazität 160h/Monat für alle Ressourcen (Jan–Dez 2026)."""
    # 12 Monate, 160h/Monat pro Person (QRG: Capacity Aggregation MONTH, Unit Hours)
    months = [160.0] * 12
    start = "2026-01-01T00:00:00Z"

    for ext_id, _ in [(r[2], r) for r in RESOURCES]:
        if ext_id not in resources:
            continue
        rid = resources[ext_id]["id"]
        name = resources[ext_id].get("name", ext_id)
        # CapacityEdit: baseCapacityHours (8h/Tag), demandPlanning, startDate, values
        payload = [{
            "resourceIds": [rid],
            "capacity": {
                "demandPlanning": False,
                "baseCapacityHours": 8,
                "startDate": start,
                "values": months,
            },
        }]
        try:
            api_request(
                "PUT",
                "/Resources/Capacities?dominantUnit=time&timeUnit=month&compressed=false&merge=false",
                payload,
            )
            print(f"  ✓ Kapazität: {name} (160h/Monat)")
        except Exception as e:
            print(f"  ✗ Kapazität {name}: {e}")
            print(f"    → Fallback: Excel-Import nutzen: python generate_stern_co_excel_import.py")


def create_assignments(
    resources: dict[str, dict],
    projects: dict[str, dict],
    tasks: list[dict],
) -> None:
    """Erstellt Assignments für Über-/Unterauslastung (Stunden/Monat)."""
    # Projekt-ID -> Task-ID (erster/Generic Task)
    project_to_task: dict[int, int] = {}
    for t in tasks:
        pid = t.get("projectId")
        if pid and pid not in project_to_task:
            project_to_task[pid] = t["id"]

    ext_to_resource = {r["externalId"]: r for r in resources.values()}
    ext_to_project = {p["externalId"]: p for p in projects.values()}

    for res_name, proj_name, hours in ASSIGNMENTS:
        res_ext = next((r[2] for r in RESOURCES if r[0] == res_name), None)
        proj_ext = next((p[3] for p in PROJECTS if p[0] == proj_name), None)
        if not res_ext or not proj_ext or res_ext not in ext_to_resource or proj_ext not in ext_to_project:
            continue
        rid = ext_to_resource[res_ext]["id"]
        pid = ext_to_project[proj_ext]["id"]
        if pid not in project_to_task:
            print(f"  ✗ Kein Task für {proj_name}: übersprungen")
            continue
        tid = project_to_task[pid]
        start_str, num_months = PROJECT_PERIODS.get(proj_name, ("2026-01-01", 12))
        start_date = f"{start_str}T00:00:00Z"
        allocs = [hours] * num_months
        payload = [{
            "taskId": tid,
            "resourceId": rid,
            "plannedStartDate": start_date,
            "plannedAllocations": allocs,
        }]
        try:
            api_request(
                "POST",
                "/Assignments?dominantUnit=time&dataUnit=time&timeUnit=month&compressed=false&withLock=true",
                payload,
            )
            print(f"  ✓ Assignment: {res_name} → {proj_name} ({hours}h/Monat)")
        except Exception as e:
            print(f"  ✗ Assignment {res_name}→{proj_name}: {e}")


def main():
    load_env_file()

    capacity_only = "--capacity-only" in sys.argv

    if not API_KEY:
        print("Fehler: TEMPUS_API_KEY nicht gesetzt.")
        print("  export TEMPUS_API_KEY='5-844944ec-8c96-433b-bc81-368654cd6228'")
        print("  oder .env im Script-Ordner anlegen")
        sys.exit(1)

    print("=" * 60)
    print("Stern & Co – Training-Daten in Tempus anlegen")
    print("=" * 60)
    print(f"Instanz: {BASE_URL}")
    if capacity_only:
        print("Modus: Nur Kapazitäten + Assignments")
    print()

    resources_map: dict[str, int] = {}
    projects_map: dict[str, int] = {}
    resources_by_ext: dict[str, dict] = {}
    projects_by_ext: dict[str, dict] = {}

    if capacity_only:
        # Bestehende Ressourcen/Projekte per externalId laden
        print("1. Bestehende Ressourcen laden …")
        resources_by_ext = get_resources_by_external_ids()
        if not resources_by_ext:
            print("  Keine Stern & Co Ressourcen gefunden. Zuerst ohne --capacity-only ausführen.")
            sys.exit(1)
        resources_map = {r["name"]: r["id"] for r in resources_by_ext.values()}
        print(f"  {len(resources_map)} Ressourcen gefunden")
        print()

        print("2. Bestehende Projekte laden …")
        projects_by_ext = get_projects_by_external_ids()
        if not projects_by_ext:
            print("  Keine Stern & Co Projekte gefunden. Zuerst ohne --capacity-only ausführen.")
            sys.exit(1)
        projects_map = {p["name"]: p["id"] for p in projects_by_ext.values()}
        print(f"  {len(projects_map)} Projekte gefunden")
        print()
    else:
        # Ressourcen und Projekte neu anlegen
        print("1. Ressourcen anlegen …")
        resources_map = create_resources()
        if not resources_map:
            print("Keine Ressourcen erstellt. Abbruch.")
            sys.exit(1)
        resources_by_ext = {
            ext_id: {"id": resources_map[name], "name": name, "externalId": ext_id}
            for name, _, ext_id in RESOURCES if name in resources_map
        }
        print()

        print("2. Projekte anlegen …")
        projects_map = create_projects()
        if not projects_map:
            print("Keine Projekte erstellt. Abbruch.")
            sys.exit(1)
        projects_by_ext = {
            ext_id: {"id": projects_map[name], "name": name, "externalId": ext_id}
            for name, _, _, ext_id in PROJECTS if name in projects_map
        }
        print()

    # 3. Kapazitäten setzen
    print("3. Kapazitäten setzen (160h/Monat) …")
    set_resource_capacities(resources_by_ext)
    print()

    # 4. Tasks holen und Assignments anlegen
    project_ids = [p["id"] for p in projects_by_ext.values()]
    tasks = get_tasks(project_ids)
    print("4. Assignments anlegen (Über-/Unterauslastung) …")
    create_assignments(resources_by_ext, projects_by_ext, tasks)
    print()

    # 5. Zusammenfassung
    print("=" * 60)
    print("Fertig!")
    print()
    print("Use Case Über-/Unterauslastung:")
    print("  • Elon Musk: überbucht (240h bei 160h Kapazität) → rot im Net Availability Grid")
    print("  • Taylor Swift, Angela Merkel, Heidi Klum: unterbucht → grün")
    print("  • Brad Pitt, Meryl Streep, Dwayne Johnson, Roger Federer: ausgeglichen")
    print()
    print("Öffne Tempus → Resource Management → Net Availability:")
    print(f"  {BASE_URL.replace('/api/sg/v1', '')}")


if __name__ == "__main__":
    main()
