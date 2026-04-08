# Tempus Workflow-Setup – Plan & Umsetzung

## Ziel
Workflows im Tempus-Tool umsetzen inkl. Rollen, Status – und **Manuel** als Resource Manager sowie Project Manager verbinden.

---

## 1. Tempus-Workflow-Architektur (Analyse)

### 1.1 Resource Request Workflow (eingebaut)
Der Resource-Request-Workflow ist in Tempus fest integriert:

| Status | Bedeutung |
|--------|-----------|
| **Pending** | Anfrage wartet auf Bearbeitung durch RM |
| **Approved** | RM hat genehmigt |
| **Rejected** | RM hat abgelehnt |
| **Fulfilled** | Ressource zugewiesen |

**Ablauf:** PM erstellt Request → RM erhält Benachrichtigung → RM Approve/Replace/Reject/Delegate

### 1.2 Projekt-Phase (Projekt-Workflow)
Tempus hat ein Standard-Feld **Phase** für Projekte:
- Planning, Execution, etc.
- Konfigurierbar je nach Tenant

### 1.3 Rollen & Attribute

| Konzept | Typ | Beschreibung |
|---------|-----|--------------|
| **Global Role** | System-Rolle | Administrator, Project Manager, Resource Manager – Zugriff auf Tiles |
| **Resource Managers** | Custom Field (Resource) | Welche Ressource(n) managen diese Resource? |
| **Is Resource Manager** | Custom Field (Resource) | Ja/Nein – ist diese Resource ein RM? |
| **Require Resource Manager Approval** | Custom Field (Resource) | Muss RM für Assignments genehmigen? |
| **Project Manager** | Custom Field (Projekt) | Wer ist PM für dieses Projekt? |

**Hinweis:** Die genauen Custom-Field-Namen variieren je nach Tenant (z.B. "SHS IT Attributes" im Training).

---

## 2. Umsetzungsplan

### Phase 1: API-Exploration
- [x] Bestehende Scripts analysieren (setup_stern_co_training_data.py, link_admin_times)
- [ ] Custom Fields der Trial-Instanz abrufen
- [ ] Roles abrufen
- [ ] Prüfen, ob Manuel existiert

### Phase 2: Manuel als Resource & RM/PM
- [ ] Manuel als Resource anlegen (falls nicht vorhanden)
- [ ] Manuel als Resource Manager für Stern & Co Ressourcen zuweisen
- [ ] Manuel als Project Manager für Stern & Co Projekte zuweisen
- [ ] Is Resource Manager = true für Manuel
- [ ] Require Resource Manager Approval für Stern & Co Ressourcen

### Phase 3: Projekt-Status & Phase
- [ ] Phase für Projekte setzen (Planning, Execution)
- [ ] Custom Fields für Projekt-Status (falls vorhanden)

### Phase 4: Manuelle Schritte (Admin-UI)
- [ ] Workflow-Konfiguration in General Settings prüfen
- [ ] Resource Request Workflow-Einstellungen
- [ ] Benachrichtigungen (Subscriptions) für Manuel

---

## 3. API-Endpunkte (Supergrid)

| Methode | Endpoint | Verwendung |
|---------|----------|------------|
| GET | /Resources | Alle Ressourcen |
| POST | /Resources | Ressource anlegen |
| PUT | /Resources | Ressource aktualisieren |
| PUT | /Resources/CustomFieldValues | Custom Field Werte setzen |
| GET | /Projects | Alle Projekte |
| PUT | /Projects/CustomFieldValues | Projekt Custom Fields |
| GET | /CustomFields | Alle Custom Fields |
| GET | /Roles | Alle Rollen |

---

## 4. Verwendung des Setup-Scripts

```bash
cd "Onboarding Valkeen/scripts"
export TEMPUS_BASE_URL="https://trial5.tempus-resource.com/slot4"
export TEMPUS_API_KEY="dein-api-key"

# 1. Exploration: Custom Fields, Roles, Resources anzeigen
python setup_tempus_workflows_manuel.py --explore

# 2. Manuel anlegen und als RM/PM verbinden
python setup_tempus_workflows_manuel.py --setup
```

---

## 5. Manuelle Schritte (falls API nicht ausreicht)

1. **Tempus Admin → Resource Management**
   - Manuel suchen oder anlegen
   - Attributes & Identity → Resource Managers: Manuel (für Stern & Co Ressourcen)
   - Is Resource Manager: Ja
   - Require Resource Manager Approval: Ja

2. **Tempus Admin → Project Management**
   - Pro Stern & Co Projekt: Project Manager = Manuel

3. **Tempus Admin → General Settings**
   - Workflow-Einstellungen prüfen
   - Resource Request Workflow aktiv

4. **Manuel einloggen**
   - Subscriptions: Resource Request → Submitted aktivieren
   - "My resources" sollte Stern & Co zeigen

---

## 6. Excel-Alternative (Resource Managers)

Falls die API Custom Fields nicht unterstützt oder die Instanz andere Feldnamen nutzt:

1. **Stern_Co_Resources.xlsx** erweitern:
   - Spalte "Is Resource Manager": TRUE für Manuel
   - Spalte "Resource Managers": "Manuel" für alle Stern & Co Ressourcen
2. Excel Data Sync → Resources importieren (Update)

Oder manuell in Tempus:
- Resource Management → jede Stern & Co Ressource öffnen
- Attributes & Identity → Resource Managers = Manuel

---

## 7. Referenzen
- [Tempus Resource Manager Training](Tempus_Resource_Manager_Training_Komplett.html)
- [Stern & Co Setup](STERN_CO_TRAINING_SETUP.md)
- [Quick Reference Cards](../Quick_Reference_Cards.md)
