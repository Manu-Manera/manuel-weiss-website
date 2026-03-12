# Stern & Co – Training-Setup mit Kapazitäten & Über-/Unterauslastung

Use Case für das Tempus Resource Manager Training (Net Availability Grid, Kapazitätsplanung).

## Über-/Unterauslastung im Use Case

| Ressource      | Kapazität | Allokation              | Status        |
|----------------|-----------|-------------------------|---------------|
| Elon Musk      | 160h/Monat| 240h in Apr–Mai (Blockbuster+Innovation Sprint)| **Überbucht** (rot) |
| Taylor Swift   | 160h/Monat| 80h (Social Media)      | Unterbucht (grün) |
| Angela Merkel  | 160h/Monat| 120h (Compliance)       | Unterbucht (grün) |
| Heidi Klum     | 160h/Monat| 100h (Blockbuster)      | Unterbucht (grün) |
| Brad Pitt, Meryl Streep, Dwayne Johnson, Roger Federer | 160h | 160h | Ausgeglichen |

## Setup-Optionen

### Option 1: API-Script (Ressourcen + Projekte + Assignments)

```bash
cd "Onboarding Valkeen/scripts"

# Credentials: .env im Script-Ordner ODER export
# .env: TEMPUS_BASE_URL=..., TEMPUS_API_KEY=...

# Vollständig: Ressourcen, Projekte, Assignments
python setup_stern_co_training_data.py

# Nur Kapazitäten + Assignments (wenn Ressourcen/Projekte schon existieren)
python setup_stern_co_training_data.py --capacity-only
```

**Hinweis:** Die Kapazitäts-API kann je nach Tempus-Konfiguration fehlschlagen. In dem Fall Option 2 nutzen. Bei 401 „Token abgelaufen“: Neuen API-Key in Tempus erstellen und in `.env` eintragen.

### Option 2: Excel-Import (QRG: How to Populate Excel Templates)

```bash
cd "Onboarding Valkeen/scripts"
pip install openpyxl  # falls nötig
python generate_stern_co_excel_import.py
```

Erzeugt in `docs/`:
- **Stern_Co_Resources.xlsx** – Ressourcen mit Kapazität 160h/Monat
- **Stern_Co_Assignments.xlsx** – Assignments mit Über-/Unterauslastung

**Import in Tempus:**
1. Projekte müssen existieren (z.B. via `setup_stern_co_training_data.py` ohne `--capacity-only`)
2. Excel Data Sync → Resources importieren
3. Excel Data Sync → Assignments importieren

## Workflow-Setup: Manuel als RM & PM

Für den Resource-Request-Workflow (Pending → Approve/Reject) muss Manuel als Resource Manager und Project Manager verbunden werden:

```bash
# Option 1: API-Script
python setup_tempus_workflows_manuel.py --explore   # Zuerst Custom Fields prüfen
python setup_tempus_workflows_manuel.py --setup     # Manuel anlegen & verbinden

# Option 2: Excel enthält bereits Resource Managers=Manuel
# generate_stern_co_excel_import.py erzeugt Resources mit Manuel als RM
```

Details: [TEMPUS_WORKFLOW_SETUP_PLAN.md](TEMPUS_WORKFLOW_SETUP_PLAN.md)

---

## Net Availability Grid prüfen

1. Tempus öffnen → Resource Management
2. Net Availability (oben rechts)
3. Zeitraum z.B. April–Mai 2026 wählen (Elon überbucht)
4. **Elon Musk** sollte in April–Mai rot (überbucht), **Taylor Swift** etc. grün (unterbucht) erscheinen
