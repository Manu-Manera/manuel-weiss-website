# Tempus Resource - Support Knowledge Base

> Sammlung von häufigen Kundenanfragen, Lösungen und Best Practices aus dem Support

---

## Inhaltsverzeichnis

1. [Resource Management](#resource-management)
   - [Bulk Resource Capacities Update](#bulk-resource-capacities-update)
2. [Settings & Configuration](#settings--configuration)
   - [Capacity Threshold Setting](#capacity-threshold-setting)
3. [Screenshots](#screenshots-referenz)

---

## Resource Management

### Bulk Resource Capacities Update

**Datum:** 22.05.2026  
**Quelle:** Aayushi (Valkeen) → Kunde (Miriama)  
**Anwendungsfall:** Massenaktualisierung von Ressourcen-Kapazitäten (z.B. Kapazität von 300+ Ressourcen bis Dezember 2029 verlängern)

#### Problem
> "Most of our resources currently have their capacity defined only until December 2026. Is there a way to perform a mass update to extend their capacity until December 2029? Our resource base is over 300 people."

#### Lösung

**Schritt 1: Ressourcen auswählen**
- Im **Resource Management Grid** die gewünschten Ressourcen über die Checkboxen links auswählen
- Mehrfachauswahl möglich

**Schritt 2: Bulk Capacities öffnen**
- Sobald Ressourcen ausgewählt sind, erscheint der **"Bulk Capacities"** Button oben im Grid
- Auf "Bulk Capacities" klicken

**Schritt 3: Kapazitäten bearbeiten**
- Im Bulk Capacities Grid folgende Parameter einstellen:
  - **Capacity End Date** aktualisieren (z.B. auf Dezember 2029)
  - **Time Granularity** wählen: Day / Week / Month
  - **Capacity Unit** wählen: Hours / FTE
- Änderungen direkt im Grid vornehmen

**Schritt 4: Datumsbereich verstehen**
> ⚠️ **Wichtig:** Der Datumsbereich oben im Grid kann zwei Funktionen haben:
> 1. Start-/Enddatum definieren, ab/bis wann die ausgewählten Ressourcen Kapazität haben
> 2. Zeitraum definieren, in dem die Kapazitätswerte aktualisiert werden sollen
>
> Falls der ausgewählte Zeitraum innerhalb des bestehenden Kapazitätszeitraums einer Ressource liegt, werden deren Start-/Enddaten **nicht** verändert.

**Schritt 5: Speichern**
- Oben im Grid auf **"Save"** klicken, um alle Änderungen zu übernehmen

#### Screenshots

| Schritt | Screenshot |
|---------|------------|
| Ressourcen auswählen | `screenshots/support/bulk_capacities_01_select.png` |
| Bulk Capacities Button | `screenshots/support/bulk_capacities_02_button.png` |
| Grid bearbeiten | `screenshots/support/bulk_capacities_03_grid.png` |
| Save Button | `screenshots/support/bulk_capacities_04_save.png` |

#### Verwandte Themen
- Resource Profile bearbeiten
- Capacity Planning
- Net Availability

---

## Settings & Configuration

### Capacity Threshold Setting

**Datum:** 22.05.2026  
**Quelle:** Aayushi (Valkeen) → Kunde (Miriama)  
**Anwendungsfall:** Capacity Threshold Setting wurde unerwartet deaktiviert

#### Problem
> "My colleague recently noticed that the Capacity threshold setting was disabled. I went ahead and re-enabled it, but I'm curious if you might know why it reverted back to being disabled after some time."

#### Mögliche Ursache
- **Prod > Dev Restore Process:** Falls die Einstellung ursprünglich nur im Dev-Environment aktiviert war, könnte sie durch den regelmäßigen Restore-Prozess (Prod → Dev) überschrieben worden sein
- **Audit Log prüfen:** Im Audit Log kann nachvollzogen werden, ob/wann die Einstellung geändert wurde

#### Lösung
1. Einstellung erneut aktivieren
2. Im **Audit Log** prüfen, wer/wann die Änderung vorgenommen hat
3. Falls Dev-Environment betroffen: Nach jedem Restore prüfen, ob Einstellungen zurückgesetzt wurden

#### Hinweis
> Einstellungen im Dev-Environment werden bei einem Prod → Dev Restore typischerweise überschrieben. Kritische Settings sollten nach jedem Restore verifiziert werden.

---

## Screenshots-Referenz

Screenshots für diese Knowledge Base werden gespeichert unter:
```
Onboarding Valkeen/docs/screenshots/support/
```

### Benötigte Screenshots (TODO)
- [ ] `bulk_capacities_01_select.png` - Ressourcenauswahl im RM Grid
- [ ] `bulk_capacities_02_button.png` - Bulk Capacities Button sichtbar
- [ ] `bulk_capacities_03_grid.png` - Bulk Capacities Grid mit Bearbeitungsoptionen
- [ ] `bulk_capacities_04_save.png` - Save Button im Bulk Capacities Grid

---

## Beitragen

Neue Support-Fälle hinzufügen:
1. Kategorie identifizieren (oder neue erstellen)
2. Problem und Lösung dokumentieren
3. Screenshots hinzufügen (falls vorhanden)
4. Datum und Quelle angeben

---

*Knowledge Base erstellt: 22.05.2026*  
*Letzte Aktualisierung: 22.05.2026*
