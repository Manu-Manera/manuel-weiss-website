#!/usr/bin/env python3
"""
Tempus Workflow-Setup: Manuel als Resource Manager & Project Manager

Legt Manuel als Ressource an, verbindet ihn mit Stern & Co Ressourcen (als RM)
und Stern & Co Projekten (als PM). Setzt Custom Fields für den Resource-Request-Workflow.

Verwendung:
  export TEMPUS_BASE_URL="https://trial5.tempus-resource.com/slot4"
  export TEMPUS_API_KEY="<api-key>"
  python setup_tempus_workflows_manuel.py --explore   # Custom Fields, Roles, Resources anzeigen
  python setup_tempus_workflows_manuel.py --setup    # Manuel anlegen und verbinden
"""

import json
import os
import sys
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


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

MANUEL_NAME = "Manuel"
MANUEL_EXT_ID = "valkeen-manuel"

# Stern & Co – für RM/PM-Zuweisung
STERN_CO_RESOURCE_EXT_IDS = [
    "stern-brad-pitt", "stern-meryl-streep", "stern-taylor-swift", "stern-dwayne-johnson",
    "stern-angela-merkel", "stern-roger-federer", "stern-heidi-klum", "stern-elon-musk",
]
STERN_CO_PROJECT_EXT_IDS = [
    "stern-blockbuster-app-2026", "stern-cloud-migration",
    "stern-social-media-relaunch", "stern-compliance-update-q2",
    "stern-innovation-sprint-apr-mai",
]

# Mögliche Custom-Field-Namen (tenant-spezifisch)
CF_RESOURCE_MANAGERS = ["Resource Managers", "ResourceManager", "Resource Manager"]
CF_IS_RESOURCE_MANAGER = ["Is Resource Manager", "IsResourceManager"]
CF_REQUIRE_RM_APPROVAL = ["Require Resource Manager Approval", "RequireResourceManagerApproval"]
CF_PROJECT_MANAGER = ["Project Manager", "ProjectManager", "Project Manager (Resource)"]


def load_env_file():
    _load_env()


def api_request(method: str, path: str, body=None) -> dict | list:
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


def fetch_all(path: str, page_size: int = 200) -> list:
    all_items = []
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


def explore():
    """Custom Fields, Roles, Resources explorieren."""
    print("=" * 60)
    print("Tempus API – Exploration")
    print("=" * 60)
    print(f"Instanz: {BASE_URL}\n")

    # Custom Fields
    print("1. Custom Fields (Resource & Project)")
    cfs = fetch_all("/CustomFields")
    for cf in cfs:
        et = cf.get("entityType", "")
        if et in ("Resource", "Project", "All"):
            print(f"   [{et}] {cf.get('name')} (id={cf.get('id')}) type={cf.get('dataType')}")
    print()

    # Roles
    print("2. Roles (Global Role)")
    roles = fetch_all("/Roles")
    for r in roles:
        print(f"   {r.get('name')} (id={r.get('id')})")
    print()

    # Resources (Manuel, Stern & Co)
    print("3. Ressourcen (Manuel + Stern & Co)")
    resources = fetch_all("/Resources")
    for r in resources:
        name = r.get("name", "")
        ext = r.get("externalId", "")
        if name == MANUEL_NAME or ext in STERN_CO_RESOURCE_EXT_IDS:
            cfv = r.get("customFieldValues") or {}
            print(f"   {name} (id={r.get('id')}, ext={ext})")
            if cfv:
                print(f"      CF: {cfv}")
    print()

    # Projects
    print("4. Projekte (Stern & Co)")
    projects = fetch_all("/Projects")
    for p in projects:
        ext = p.get("externalId", "")
        if ext in STERN_CO_PROJECT_EXT_IDS:
            cfv = p.get("customFieldValues") or {}
            print(f"   {p.get('name')} (id={p.get('id')}, ext={ext})")
            if cfv:
                print(f"      CF: {cfv}")
    print()

    print("Tipp: Nutze diese Infos, um die Custom-Field-Namen in der Instanz zu identifizieren.")
    print("Dann: python setup_tempus_workflows_manuel.py --setup")


def find_cf_by_names(cfs: list, names: list, entity_type: str = "Resource") -> dict | None:
    for cf in cfs:
        if cf.get("entityType") in (entity_type, "All") and cf.get("name") in names:
            return cf
    return None


def get_resource_id(resources: list, name: str = None, ext_id: str = None) -> int | None:
    for r in resources:
        if name and r.get("name") == name:
            return r["id"]
        if ext_id and r.get("externalId") == ext_id:
            return r["id"]
    return None


def setup():
    """Manuel anlegen und als RM/PM verbinden."""
    load_env_file()
    if not API_KEY:
        print("Fehler: TEMPUS_API_KEY nicht gesetzt.")
        sys.exit(1)

    print("=" * 60)
    print("Tempus Workflow-Setup: Manuel als RM & PM")
    print("=" * 60)
    print(f"Instanz: {BASE_URL}\n")

    # 1. Daten laden
    print("1. Daten laden …")
    cfs = fetch_all("/CustomFields")
    resources = fetch_all("/Resources")
    projects = fetch_all("/Projects")
    roles = fetch_all("/Roles")

    manuel_id = get_resource_id(resources, name=MANUEL_NAME)
    if not manuel_id:
        print(f"   Manuel nicht gefunden. Lege Ressource an …")
        payload = [{
            "name": MANUEL_NAME,
            "externalId": MANUEL_EXT_ID,
            "isEnabled": True,
            "updateGlobalRole": False,
            "updateDefaultRate": False,
            "updateSecurityGroup": False,
        }]
        res = api_request("POST", "/Resources", payload)
        if isinstance(res, list) and res:
            manuel_id = res[0] if isinstance(res[0], int) else res[0].get("id")
            print(f"   ✓ Manuel angelegt (id={manuel_id})")
        else:
            print(f"   ✗ Fehler beim Anlegen: {res}")
            sys.exit(1)
    else:
        print(f"   ✓ Manuel gefunden (id={manuel_id})")

    # 2. Resource Manager Custom Field für Stern & Co Ressourcen
    cf_rm = find_cf_by_names(cfs, CF_RESOURCE_MANAGERS, "Resource")
    cf_is_rm = find_cf_by_names(cfs, CF_IS_RESOURCE_MANAGER, "Resource")
    cf_req_approval = find_cf_by_names(cfs, CF_REQUIRE_RM_APPROVAL, "Resource")

    resource_ids = []
    for ext_id in STERN_CO_RESOURCE_EXT_IDS:
        rid = get_resource_id(resources, ext_id=ext_id)
        if rid:
            resource_ids.append(rid)

    if resource_ids and (cf_rm or cf_is_rm or cf_req_approval):
        print("\n2. Resource Manager Attribute setzen …")
        values_payload = []
        # Tempus API: { value, customFieldId, entityIds }
        if cf_rm:
            values_payload.append({
                "value": manuel_id,  # Resource-Referenz als ID
                "customFieldId": cf_rm["id"],
                "entityIds": resource_ids,
                "assignmentIds": None,
            })
        if cf_req_approval:
            values_payload.append({
                "value": True,
                "customFieldId": cf_req_approval["id"],
                "entityIds": resource_ids,
                "assignmentIds": None,
            })
        if values_payload:
            try:
                api_request("PUT", "/Resources/CustomFieldValues", values_payload)
                print(f"   ✓ {len(values_payload)} Custom Field Werte gesetzt")
            except Exception as e:
                print(f"   ✗ Fehler: {e}")
                print("   → Resource Managers erwartet ggf. Namen statt ID – prüfe dataType mit --explore")
    else:
        if not resource_ids:
            print("\n2. Keine Stern & Co Ressourcen gefunden. Zuerst setup_stern_co_training_data.py ausführen.")
        else:
            print("\n2. Keine passenden Resource-Custom-Fields gefunden.")
            print("   → Custom Fields in der Instanz prüfen (--explore)")

    # 3. Is Resource Manager für Manuel
    if cf_is_rm:
        print("\n3. Manuel als Resource Manager markieren …")
        try:
            api_request("PUT", "/Resources/CustomFieldValues", [{
                "value": True,
                "customFieldId": cf_is_rm["id"],
                "entityIds": [manuel_id],
                "assignmentIds": None,
            }])
            print("   ✓ Is Resource Manager = true")
        except Exception as e:
            print(f"   ✗ {e}")

    # 4. Project Manager für Stern & Co Projekte
    cf_pm = find_cf_by_names(cfs, CF_PROJECT_MANAGER, "Project")
    project_ids = []
    for ext_id in STERN_CO_PROJECT_EXT_IDS:
        for p in projects:
            if p.get("externalId") == ext_id:
                project_ids.append(p["id"])
                break

    if project_ids and cf_pm:
        print("\n4. Project Manager für Stern & Co Projekte setzen …")
        values_payload = [{
            "value": manuel_id,
            "customFieldId": cf_pm["id"],
            "entityIds": project_ids,
            "assignmentIds": None,
        }]
        try:
            api_request("PUT", "/Projects/CustomFieldValues", values_payload)
            print(f"   ✓ {len(project_ids)} Projekte: Project Manager = Manuel")
        except Exception as e:
            print(f"   ✗ {e}")
    else:
        if not project_ids:
            print("\n4. Keine Stern & Co Projekte gefunden.")
        else:
            print("\n4. Kein Project-Manager-Custom-Field gefunden.")

    # 5. Global Role (falls API unterstützt)
    pm_role = next((r for r in roles if "project" in r.get("name", "").lower() and "manager" in r.get("name", "").lower()), None)
    rm_role = next((r for r in roles if "resource" in r.get("name", "").lower() and "manager" in r.get("name", "").lower()), None)
    if pm_role or rm_role:
        print("\n5. Global Role prüfen …")
        print("   Hinweis: Global Role wird ggf. nur über Admin-UI gesetzt.")
        print("   Manuel sollte sowohl PM- als auch RM-Berechtigung haben.")

    print("\n" + "=" * 60)
    print("Fertig!")
    print()
    print("Nächste Schritte (manuell in Tempus):")
    print("  1. Als Manuel einloggen")
    print("  2. Subscriptions → Resource Request → Submitted aktivieren")
    print("  3. Resource Management → Quick Filter «My resources»")
    print("  4. Resource Requests prüfen (sollte Pending-Anfragen zeigen)")
    print()
    print("Falls Custom Fields fehlen: Admin → Attribute Management prüfen.")
    print("Dokumentation: docs/TEMPUS_WORKFLOW_SETUP_PLAN.md")


def main():
    load_env_file()
    if not API_KEY:
        print("Fehler: TEMPUS_API_KEY nicht gesetzt.")
        print("  export TEMPUS_API_KEY='<dein-key>'")
        sys.exit(1)

    if "--explore" in sys.argv:
        explore()
    elif "--setup" in sys.argv:
        setup()
    else:
        print("Verwendung:")
        print("  python setup_tempus_workflows_manuel.py --explore   # API explorieren")
        print("  python setup_tempus_workflows_manuel.py --setup      # Manuel anlegen & verbinden")
        sys.exit(1)


if __name__ == "__main__":
    main()
