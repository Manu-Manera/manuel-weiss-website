#!/usr/bin/env python3
"""Build kickoff-deck-locale-de.json from inline German copy (Master deck EN source)."""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "src/data/kickoff-deck-locale-de.json"

META = {
    "title": "Tempus Resource — Implementierung",
    "subtitle": "Interaktiver Kick-off-Workshop · {{customer}}\nValkeen · Theorie & Live-Fragen — abwechselnd in diesem Deck",
    "gamma_title": "Tempus Resource Implementierung — Kick-off Workshop",
    "gamma_audience": "Kunden-Steering, PMO, IT, Finance, Ressourcenmanagement",
}

CLOSING = {
    "headline": "Danke — starker Kick-off!",
    "subline": "Valkeen · ProSymmetry · {{customer}}",
    "bullets": [
        "Wir verteilen dieses Deck mit euren ausgefüllten Antworten",
        "Fragen? · {{consultant_contact}}",
    ],
}

SLIDES = {
    "agenda": {
        "headline": "Agenda",
        "subline": "Kontext-Folien + Workshop-Folien — wir wechseln durchgängig",
        "bullets": [
            "Kontext: Partnerschaft, Phasen, Tempus-Fähigkeiten, Zusammenarbeit",
            "Workshop: Antworten live erfassen (→) und Tabellen",
            "Integrations-Block zuletzt — nur wenn ERP/Schnittstellen im Scope",
            "Abschluss: Entscheidungen, nächste Schritte, Parking Lot",
        ],
    },
    "workshop-rules": {
        "headline": "So nutzen wir dieses Deck",
        "bullets": [
            "Antworten auf Workshop-Folien eintippen (Presenter View oder geteilte Datei)",
            "Grüne Pfeile (→) = vereinbarte Antwort, die wir jetzt festhalten",
            "Programmnamen (z. B. Horizon bei Siemens Healthineers) = euer {{customer}}-Label — gleiches Deck für alle Kunden",
            "Integrations-Abschnitt optional — überspringen wenn Welle 1 nur Tempus",
        ],
    },
    "path-to-success": {
        "headline": "Weg zum Erfolg",
        "subline": "Aus dem Valkeen Kick-off Playbook",
        "bullets": [
            "Klarer Zweck für Tempus Resource — warum {{customer}} jetzt implementiert",
            "Engagiertes Implementierungsteam mit End-to-End-Blick (nicht nur IT)",
            "Change Management von Tag eins mitdenken",
            "Vision: modernes Enterprise Resource & Portfolio Management",
            "Legacy-PPM / Tabellen ersetzen durch eine Quelle für Kapazität und Ist-Stunden",
        ],
    },
    "team": {
        "headline": "Wer ist heute mit dabei?",
        "subline": "Name · Rolle · Bereich · E-Mail",
        "headers": ["Name", "Rolle (Admin / RM / PM / IT / Finance)", "Bereich", "E-Mail"],
        "facilitator_note": "Kunden-PM + mindestens ein zukünftiger Tempus-Admin",
    },
    "partnership": {
        "headline": "Partnerschaft Valkeen · ProSymmetry · {{customer}}",
        "subline": "Rollen im Implementierungsprogramm",
        "bullets": [
            "ProSymmetry: Tempus-Produkt, Roadmap, technischer Support",
            "Valkeen: Implementierung, Best Practices, Training, Integrationen",
            "{{customer}}: Daten, Prozesse, Entscheidungen, Test & Abnahme",
            "Gemeinsames Ziel: produktive Nutzung mit messbarem Nutzen in Welle 1",
        ],
    },
    "impl-team-roles": {
        "headline": "Implementierungsteam — typische Rollen",
        "bullets": [
            "Sponsor / Steering — Prioritäten, Budget, Eskalation",
            "Projektleitung {{customer}} — Termine, Abnahme, Change",
            "Tempus Admin(s) — Konfiguration, Security, Daten",
            "RM / PM Champions — Prozesse, Schulung, Hypercare",
            "IT / Integration — SSO, Schnittstellen, Umgebungen",
            "Finance (optional) — Buchungslogik, ERP-Keys",
        ],
    },
    "ways-of-working-theory": {
        "headline": "Zusammenarbeit im Projekt",
        "bullets": [
            "Regelmäßiger Status (z. B. wöchentlich) + monatliches Steering",
            "Ein Ansprechpartner pro Thema (Admin, Daten, Integration)",
            "Entscheidungen und offene Punkte im Parking Lot",
            "Dokumentation in diesem Deck + SharePoint/Confluence nach Absprache",
        ],
    },
    "ways-of-working": {
        "headline": "Zusammenarbeit — Workshop",
        "subline": "Was passt für {{customer}}?",
        "questions": [
            {"q": "Bevorzugter Meeting-Rhythmus (Status / Steering)?", "hint": "z. B. wöchentlich / 2-wöchentlich"},
            {"q": "Hauptkanäle (Teams, E-Mail, Jira)?", "hint": ""},
            {"q": "Wer ist Single Point of Contact Valkeen ↔ {{customer}}?", "hint": "Name + Rolle"},
            {"q": "Hypercare-Zeitraum nach Go-Live?", "hint": "Wochen"},
            {"q": "Sprache der Schulungen?", "hint": "DE / EN / beides"},
        ],
    },
    "valkeen-expectations": {
        "headline": "Was Valkeen von {{customer}} erwartet",
        "bullets": [
            "Benannte Owner für Scope, Daten, Integration, Change",
            "Testdaten und Entscheidungen innerhalb vereinbarter Fristen",
            "Zugang zu Umgebungen (Dev/UAT) und SSO-Kontakten",
            "Teilnahme an Admin- und Key-User-Trainings",
        ],
    },
    "success-metrics": {
        "headline": "Erfolgskriterien Welle 1",
        "subline": "Messbar bis Go-Live",
        "questions": [
            {"q": "Welche 3 KPIs definieren Erfolg für euch?", "hint": "z. B. RR-Durchlaufzeit, Planungsqualität"},
            {"q": "Ziel-Datum Go-Live / erster produktiver Monat?", "hint": ""},
            {"q": "Mindest-Nutzergruppen live (RM, PM, Timesheet)?", "hint": ""},
            {"q": "Was ist explizit NICHT in Welle 1?", "hint": "Parking Lot ok"},
        ],
    },
    "impl-phases": {
        "headline": "Implementierungsphasen (Überblick)",
        "bullets": [
            "Discover & Design — heute + Folge-Workshops",
            "Configure & Migrate — Daten, Kapazität, Projekte",
            "Train & Pilot — Admin, RM/PM, Timesheet",
            "Go-Live & Hypercare — Stabilisierung, Feintuning",
            "Phase 2 — Erweiterungen (Portfolio, Integrationen, Reporting)",
        ],
    },
    "documents-training": {
        "headline": "Dokumentation & Training",
        "bullets": [
            "Kick-off-Deck mit euren Antworten als lebendiges Protokoll",
            "Tempus User Guides (Standard + optional kundenspezifisch via Valkeen)",
            "Admin-Training vor Konfigurations-Sprints",
            "RM/PM/BPA-Workshops nach Rollout-Plan",
        ],
    },
    "scope-theory": {
        "headline": "Scope — was wir heute klären",
        "subline": "Grundlage für die Checkliste",
        "bullets": [
            "Datenbank-Setup · Excel-Import vs. manuell vs. API",
            "Benutzergruppen: Admin, RM, PM, Program/Portfolio Manager, Timesheet",
            "Kapazität: Einheiten (Stunden/FTE), BAU, Abwesenheiten, Feiertage",
            "Lifecycle: Vorschlag → Freigabe → Projekt → Ist",
            "RR-Workflow · Rollenkonzept (primär / sekundär / Skills)",
            "Integrationen: ERP, HR, PMO — programmspezifisch (z. B. SAP)",
        ],
    },
    "scope-wave1": {
        "headline": "Welle 1 — im Scope?",
        "subline": "Ja / Nein / Später pro Zeile",
        "items": [
            "Ressourcen-Kapazität & Allocations-Planung",
            "Resource Requests & Dispatching (RR)",
            "Projekt-Portfolio & Attribute",
            "Timesheets (einreichen → freigeben)",
            "Demand Planning / NN-Ressourcen",
            "Programm- & Portfolio-Views",
            "Excel- / API-Datenload",
            "ERP- / Finance-Integration (z. B. SAP)",
            "Weitere Schnittstellen (HR, PMO, BI)",
            "Custom Reporting über Standard hinaus",
        ],
    },
    "user-groups-theory": {
        "headline": "Benutzergruppen in Tempus",
        "bullets": [
            "Admin — Konfiguration, Security, Integrationen",
            "Resource Manager — Kapazität, RR, Allocations",
            "Project Manager — Projekte, Bedarf, Status",
            "Timesheet User — Ist-Stunden",
            "Portfolio / Program Manager — strategische Sicht",
        ],
    },
    "user-groups": {
        "headline": "Benutzergruppen — wer bei {{customer}}?",
        "headers": ["Gruppe", "Anzahl (ca.)", "Owner", "Go-Live Welle 1?"],
    },
    "integrated-process": {
        "headline": "Integrierter Prozess (End-to-End)",
        "bullets": [
            "Portfolio / Programm → Projekte → Aufgaben / Allocations",
            "Resource Requests → Zuordnung → Plan",
            "Timesheets → Freigabe → Reporting / ERP (optional)",
            "Eine Quelle der Wahrheit für Kapazität und Ist",
        ],
    },
    "projects-tempus": {
        "headline": "Projekte in Tempus",
        "bullets": [
            "Projektattribute & Custom Fields nach {{customer}}-PMO",
            "WBS / Aufgaben — Allocation vs. Schedule vs. Demand",
            "Status & Lifecycle — was wird wann freigegeben?",
        ],
    },
    "resource-requests": {
        "headline": "Resource Requests (RR)",
        "bullets": [
            "Anforderung → Review → Zuordnung → Freigabe",
            "Demand-Planning-Ressourcen vs. benannte Ressourcen",
            "Empfehlungen & Ersatz im Review-Screen",
        ],
    },
    "role-concept": {
        "headline": "Rollenkonzept Ressourcen",
        "bullets": [
            "Primär- / Sekundärrolle, Skills, Org-Zuordnung",
            "Named vs. NN (Demand Planning) — wann welches Modell?",
            "Resource Manager Zuordnung pro Ressource",
        ],
    },
    "timesheets-theory": {
        "headline": "Timesheets",
        "bullets": [
            "Erfassung gegen Projekte / Aufgaben",
            "Freigabe-Workflow (PM / RM / Admin)",
            "Basis für Ist-Reporting und ggf. ERP-Export",
        ],
    },
    "timesheets": {
        "headline": "Timesheets — Workshop",
        "questions": [
            {"q": "Wer erfasst (alle PMs, alle Ressourcen, ausgewählte Gruppen)?", "hint": ""},
            {"q": "Freigabe durch wen (PM, RM, beides)?", "hint": ""},
            {"q": "Granularität (Projekt, Aufgabe, Activity)?", "hint": ""},
            {"q": "Historische Ist-Daten importieren?", "hint": "Ja/Nein · Monate"},
            {"q": "Mobile / SSO-Anforderungen?", "hint": ""},
        ],
    },
    "capacity-theory": {
        "headline": "Kapazität & Planung",
        "bullets": [
            "Basiskapazität (Stunden/FTE), BAU, Abwesenheiten",
            "Feiertagskalender pro Standort",
            "Heatmaps & Auslastung im BPA",
        ],
    },
    "capacity": {
        "headline": "Kapazität — Workshop",
        "questions": [
            {"q": "Planungseinheit (Stunden, FTE, Tage)?", "hint": ""},
            {"q": "BAU / nicht-projektbezogene Arbeit abbilden?", "hint": ""},
            {"q": "Standorte / Kalender?", "hint": ""},
            {"q": "Demand Planning aktiv in Welle 1?", "hint": "Ja/Nein"},
        ],
    },
    "data-migration-theory": {
        "headline": "Datenmigration",
        "bullets": [
            "Ressourcen, Projekte, ggf. historische Allocations / Ist",
            "Excel-Templates vs. API vs. manuell",
            "Qualitätssicherung vor Go-Live",
        ],
    },
    "data-migration": {
        "headline": "Datenmigration — Workshop",
        "questions": [
            {"q": "Quellsysteme (PPM, Excel, HR)?", "hint": ""},
            {"q": "Ressourcenliste — Owner & ETA?", "hint": ""},
            {"q": "Load-Methode pro Entität (Excel / manuell / API)?", "hint": ""},
            {"q": "Historische Ist-Daten in Welle 1?", "hint": "Ja/Nein · Monate"},
        ],
    },
    "integrations-theory": {
        "headline": "Integrationsoptionen",
        "subline": "Wenn Welle 1 ERP oder andere Systeme umfasst",
        "bullets": [
            "Typisches Muster: freigegebene Timesheet-Ist → Finance (z. B. SAP via CPI)",
            "Nicht Allocations-Plan — Finance braucht gebuchte Ist pro Zeile",
            "Größere Programme: inbound Budget (EUR pro Projektschlüssel) — Phase 2",
            "Beispiel Siemens Healthineers: Programmnamen wie Horizon — gleiche Muster, kundenspezifische IDs",
            "Mapping-Workshop nach PO · Dev → UAT → Prod",
        ],
    },
    "integrations-scope": {
        "headline": "Integrationen — in Welle 1?",
        "subline": "Go / No-Go",
        "options": [
            {"id": "A", "label": "Ja — Outbound Ist → Finance/ERP", "note": "Typisch Phase 1"},
            {"id": "B", "label": "Ja — Outbound + Inbound (z. B. Budget)", "note": "Größerer Scope"},
            {"id": "C", "label": "Nein — nur Tempus in Welle 1", "note": "Später integrieren"},
        ],
        "decision_label": "Entscheidung heute",
    },
    "integrations-data": {
        "headline": "Integration — Daten & Format",
        "subline": "Vor Mapping-Workshop",
        "questions": [
            {"q": "Zielsystem(e)? (SAP, ERP, API…)", "hint": ""},
            {"q": "Quelle: nur Timesheet-Ist?", "hint": "Nicht Allocation"},
            {"q": "Buchungen auf Zeilenebene (nicht aggregiert)?", "hint": ""},
            {"q": "Rhythmus & Lookback (z. B. monatlich)?", "hint": ""},
            {"q": "Projekt-/Kostenschlüssel-Feld in Tempus?", "hint": ""},
        ],
    },
    "integrations-budget": {
        "headline": "Finance — Budget & Buchung",
        "subline": "Falls ERP relevant",
        "options": [
            {"id": "A", "label": "Inbound ERP + Logik in Tempus vor Export", "note": "Hoher Aufwand"},
            {"id": "B", "label": "Budget-/Activity-Regeln bei Buchung im ERP", "note": "Üblich Phase 1"},
            {"id": "C", "label": "Übergang manuell in Tempus", "note": ""},
        ],
        "decision_label": "Entscheidung heute",
    },
    "integrations-owners": {
        "headline": "Integration — Verantwortliche",
        "subline": "Namen heute",
        "headers": ["Thema", "Kunden-Owner", "Valkeen / ProSymmetry", "Notizen"],
        "rows": [
            ["Middleware / iPaaS", "", "", ""],
            ["ERP Finance / CO", "", "", ""],
            ["Testumgebung", "", "", ""],
            ["Tempus API / Export", "", "", ""],
            ["Mapping-Workshop", "", "", ""],
        ],
    },
    "integrations-open": {
        "headline": "Integration — offene Punkte",
        "subline": "Ggf. auf Parking Lot",
        "questions": [
            {"q": "Pflicht-Buchungsattribute?", "hint": "Mapping-Excel"},
            {"q": "Idempotenz / bereits gesendet?", "hint": ""},
            {"q": "Null-Stunden-Zeilen?", "hint": "Oft nein"},
            {"q": "Sätze in Welle 1?", "hint": "Oft nein"},
        ],
    },
    "parking-lot": {
        "headline": "Parking Lot",
        "subline": "Heute nicht fertig",
        "headers": ["Thema", "Owner", "Zieldatum"],
    },
    "decisions-today": {
        "headline": "Heute festgehaltene Entscheidungen",
        "subline": "Vor Abschluss vorlesen",
        "headers": ["#", "Entscheidung", "Owner", "Datum"],
    },
    "next-steps": {
        "headline": "Nächste Schritte",
        "subline": "Unmittelbarer Follow-up",
        "headers": ["Aktion", "Owner", "Fällig", "Status"],
        "rows": [
            ["Vertrag / Auftrag & Scope", "", "", ""],
            ["URLs freigegeben · Zugänge geliefert", "", "", ""],
            ["Admin-Training terminiert", "", "", ""],
            ["Migrationsdaten & Templates", "", "", ""],
            ["Integrations-Angebot / Anforderungen (falls relevant)", "", "", ""],
        ],
    },
}

payload = {"meta": META, "closing": CLOSING, "slides": SLIDES}
OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
print("Wrote", OUT)
