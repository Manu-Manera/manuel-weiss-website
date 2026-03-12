#!/usr/bin/env python3
"""
Stern & Co – Excel-Import-Templates für Tempus (QRG: How to Populate Excel Templates)

Erzeugt Resources- und Assignments-Excel-Dateien für den Tempus Excel Data Sync.
Kapazität 160h/Monat, Über-/Unterauslastung für Net-Availability-Training.

Benötigt: pip install openpyxl
Verwendung: python generate_stern_co_excel_import.py
Output: docs/Stern_Co_Resources.xlsx, docs/Stern_Co_Assignments.xlsx
"""

from pathlib import Path

try:
    import openpyxl
    from openpyxl.styles import Font
except ImportError:
    print("Bitte installieren: pip install openpyxl")
    exit(1)

OUT_DIR = Path(__file__).parent.parent / "docs"

# Kapazität 160h/Monat, Über-/Unterauslastung
RESOURCES = [
    ("Brad Pitt", "stern-brad-pitt"),
    ("Meryl Streep", "stern-meryl-streep"),
    ("Taylor Swift", "stern-taylor-swift"),
    ("Dwayne Johnson", "stern-dwayne-johnson"),
    ("Angela Merkel", "stern-angela-merkel"),
    ("Roger Federer", "stern-roger-federer"),
    ("Heidi Klum", "stern-heidi-klum"),
    ("Elon Musk", "stern-elon-musk"),
]

# Manuel als Resource Manager (für Workflow-Setup)
MANUEL_EXT_ID = "valkeen-manuel"

# (Resource, Projekt, Task, h/Monat) – Task "Generic" = Projekt-Level
ASSIGNMENTS = [
    ("Brad Pitt", "Blockbuster App 2026", "Generic", 160),
    ("Meryl Streep", "Blockbuster App 2026", "Generic", 160),
    ("Taylor Swift", "Social Media Relaunch", "Generic", 80),  # unterbucht
    ("Dwayne Johnson", "Cloud Migration", "Generic", 160),
    ("Angela Merkel", "Compliance Update Q2", "Generic", 120),  # unterbucht
    ("Roger Federer", "Cloud Migration", "Generic", 160),
    ("Heidi Klum", "Blockbuster App 2026", "Generic", 100),  # unterbucht
    ("Elon Musk", "Blockbuster App 2026", "Generic", 120),
    ("Elon Musk", "Cloud Migration", "Generic", 120),  # überbucht (240h)
]

# Monats-Spalten 2026 (Tempus-Format: YYYY-MM-DD 00:00:00)
MONTH_HEADERS = [
    "2026-01-01 00:00:00", "2026-02-01 00:00:00", "2026-03-01 00:00:00", "2026-04-01 00:00:00",
    "2026-05-01 00:00:00", "2026-06-01 00:00:00", "2026-07-01 00:00:00", "2026-08-01 00:00:00",
    "2026-09-01 00:00:00", "2026-10-01 00:00:00", "2026-11-01 00:00:00", "2026-12-01 00:00:00",
]

# Projekt-Zeiträume: nur Monate im Projekt befüllt (Rest 0)
PROJECT_MONTHS = {
    "Blockbuster App 2026": list(range(12)),  # Jan–Dez (0–11)
    "Cloud Migration": list(range(1, 8)),  # Feb–Aug (1–7)
    "Social Media Relaunch": list(range(2, 6)),  # Mar–Jun (2–5)
    "Compliance Update Q2": list(range(3, 6)),  # Apr–Jun (3–5)
}


def create_resources_excel():
    """Step 2 Resources – Tempus Excel Template Format."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Resources"

    # Header wie Step 2 Resources_Instructions
    headers = [
        "Resource ID", "API External Id", "Resource Name", "Billing Rate", "Demand Planning",
        "Capacity Aggregation", "Capacity Unit", "Import Behavior", "Is Team Resource",
        "Team Start Date", "Team End Date", "Is Enabled", "Login", "Enable SSO", "E-Mail",
        "Global Role", "Security Group", "Is Timesheet User", "Is Timesheet Approver",
        "Timesheet Approver", "Is Resource Manager", "Resource Managers", "Department",
        "Hired On", "Leadership"
    ] + MONTH_HEADERS
    ws.append(headers)
    ws.row_dimensions[1].font = Font(bold=True)

    for name, ext_id in RESOURCES:
        # Is Resource Manager=FALSE, Resource Managers=Manuel (Manuel managed alle)
        row = [
            "", ext_id, name, 0, "FALSE", "MONTH", "Hours", "", "FALSE", "", "", "TRUE",
            "", "", "", "", "", "FALSE", "", "", "FALSE", "Manuel", "", "", "", ""
        ] + [160] * 12  # 160h/Monat Kapazität
        ws.append(row)

    # Manuel als zusätzliche Ressource (RM & PM)
    manuel_row = [
        "", MANUEL_EXT_ID, "Manuel", 0, "FALSE", "MONTH", "Hours", "", "FALSE", "", "", "TRUE",
        "", "", "", "", "", "FALSE", "", "", "TRUE", "", "", "", "", ""  # Is Resource Manager=TRUE
    ] + [160] * 12
    ws.append(manuel_row)

    out = OUT_DIR / "Stern_Co_Resources.xlsx"
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    wb.save(out)
    print(f"  ✓ {out}")


def create_assignments_excel():
    """Step 4 Assignments – Tempus Excel Template Format."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Assignments"

    headers = [
        "Project", "Project API External Id", "Resource", "Resource API External Id", "Task",
        "Data Input", "Plan Type", "Allocation Type", "Time Period", "Import Behavior",
        "Id", "Action", "Project Allocation", "Priority", "Complete"
    ] + MONTH_HEADERS
    ws.append(headers)
    ws.row_dimensions[1].font = Font(bold=True)

    res_ext = {r[0]: r[1] for r in RESOURCES}
    proj_ext = {
        "Blockbuster App 2026": "stern-blockbuster-app-2026",
        "Cloud Migration": "stern-cloud-migration",
        "Social Media Relaunch": "stern-social-media-relaunch",
        "Compliance Update Q2": "stern-compliance-update-q2",
    }

    for res_name, proj_name, task, hours in ASSIGNMENTS:
        active_months = PROJECT_MONTHS.get(proj_name, list(range(12)))
        allocs = [hours if m in active_months else 0 for m in range(12)]
        row = [
            proj_name, proj_ext.get(proj_name, ""), res_name, res_ext.get(res_name, ""),
            task, "Hours", "Planned", "Planned", "Month", "", "", "", "", "", ""
        ] + allocs
        ws.append(row)

    out = OUT_DIR / "Stern_Co_Assignments.xlsx"
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    wb.save(out)
    print(f"  ✓ {out}")


def main():
    print("Stern & Co – Excel-Import-Templates erzeugen")
    print("=" * 50)
    create_resources_excel()
    create_assignments_excel()
    print()
    print("Import in Tempus: Excel Data Sync → Resources, dann Assignments")
    print("(Projekte müssen zuerst existieren – ggf. setup_stern_co_training_data.py ohne --capacity-only)")


if __name__ == "__main__":
    main()
