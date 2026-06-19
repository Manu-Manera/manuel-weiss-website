#!/usr/bin/env python3
"""
Postet den "Tempus Excel-Upload Walkthrough" als Gamma-Deck im Valkeen-2026-Master-Stil.

Inhalt = Folien aus tempus-excel-upload-walkthrough.html (Datei-Zusammenhänge + Reihenfolge).
Branding (navy/teal/green, Logo oben links, Footer) wie beim Valkeen-Master-Post.

Env: GAMMA_API_KEY (docs/horizon_workshop/.env oder export)
Optional: VALKEEN_GAMMA_THEME_ID, GAMMA_FOLDER_IDS (kommagetrennt)
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VALKEEN_ENV = Path("/Users/manumanera/Valkeen/docs/horizon_workshop/.env")
OUTPUT_JSON = ROOT / "docs/excel-walkthrough-gamma-post-result.json"

API_BASE = "https://public-api.gamma.app/v1.0"
POLL_SEC = 8
POLL_MAX = 90  # ~12 min

# Eine Sektion zwischen --- = eine Folie (cardSplit=inputTextBreaks)
INPUT_TEXT = r"""# Excel-Upload Walkthrough
## So passen die Dateien in Tempus zusammen

Ein gemeinsamer Durchgang durch den Excel-Import in Tempus Resource: was in welcher Datei steht, wie die Dateien voneinander abhängen und in welcher Reihenfolge sie hochgeladen werden.

- 10 Import-Bausteine
- Klare Abhängigkeiten
- ca. 30–45 Min. Walkthrough
- Für PMO, Admin & Datenverantwortliche

---

# Das große Ganze
## Tempus ist anfangs ein leeres Blatt

Wir befüllen Tempus über standardisierte Excel-Vorlagen. Jede Vorlage steht für einen Datentyp – und diese Typen bauen logisch aufeinander auf.

- Stammdaten zuerst: Felder (Attribute), Ressourcen, Skills
- Dann die Container: Projekte (nutzen die Attribute)
- Dann die Verknüpfungen: Zuweisungen = Ressource + Projekt + Aufwand
- Zuletzt die Details: Finanzen, Raten, Admin-Zeiten, Team

Faustregel: Felder → Ressourcen → Projekte → Zuweisungen → Details

---

# Wo der Upload passiert
## Ein Ort, viele Vorlagen

Alle Vorlagen laufen über denselben Ort in Tempus – nur die Datei wechselt.

1. Navigieren: Admin Settings > Data Synchronization > Excel
2. Datei wählen: Choose File klicken oder .xlsx auf die Seite ziehen
3. Synchronisieren: Button Synchronize startet den Import

Zwei oft vergessene Regeln:
- Die auszufüllende Vorlage muss das erste Tab der Datei sein
- Format immer .xlsx, pro Synchronisation eine Vorlage / ein Datentyp
- Empfehlung: erst Sandbox testen, dann Produktion

---

# Die 10 Import-Dateien (1/2)
## Fundament & Aufbau

Fundament (keine Voraussetzung):
- 1 · Attributes — eigene Felder & Auswahllisten (Sheet: Attributes)
- 2 · Resources — Ressourcen-Pool, Kapazität, Login/Rollen (Sheet: Resources)
- 6 · Skills — Skill-Katalog & Kategorien (Sheet: Skills)

Baut auf dem Fundament auf:
- 3 · Projects — Projektliste, Start/Ende, Dataset Preference (← Attribute)
- 8 · Advanced Rates — zeitgestaffelte Sätze je Ressource (← Ressourcen)
- 10 · Team Resources — Team-Mitglieder, FTE-phasiert (← Ressourcen)
- 5 · Admin Times — Nicht-Projektzeiten je Ressource (← Ressourcen)

---

# Die 10 Import-Dateien (2/2)
## Verknüpfung von Projekten & Ressourcen

- 4 · Allocation & Tasks — das Herzstück: Zuweisungen + Plan/Ist-Werte; verbindet Projekt + Ressource + Task (← Ressourcen & Projekte)
- 9 · Financials — Kosten je Projekt & Kategorie, Plan/Ist, zeit-phasiert (← Projekte & Kategorien)
- 7 · Sheets — Daten für bestehende Sheet-Templates; Zeilen werden angehängt (← Projekte/Ressourcen & Template)

Jede Datei hat ein festes Arbeitsblatt (Sheet) und einen klaren Zweck.

---

# Zusammenhänge der Dateien
## Drei Ebenen – was unten steht, braucht die Ebene darüber

Ebene 1 · Fundament (keine Voraussetzungen): Attributes (1) · Resources (2) · Skills (6)

Ebene 2 · baut auf dem Fundament auf: Projects (3) ← Attribute · Advanced Rates (8) ← Ressourcen · Team Resources (10) ← Ressourcen · Admin Times (5) ← Ressourcen

Ebene 3 · verknüpft Projekte & Ressourcen: Allocation & Tasks (4) ← Ressourcen + Projekte · Financials (9) ← Projekte · Sheets (7) ← Projekte/Ressourcen

Stolperstein: Eine Zuweisung (4) auf „Projekt X / Max M." scheitert, wenn Projekt X oder Max M. noch nicht existieren. Referenzen müssen vorher angelegt sein.

---

# Die richtige Reihenfolge
## Die offizielle Nummerierung 1 → 10 bildet die Abhängigkeiten ab

1. Attributes — Felder & Auswahllisten (keine Voraussetzung)
2. Resources — Ressourcen-Pool (keine Voraussetzung)
3. Projects — Container, nutzen Schritt 1 (braucht 1)
4. Allocation & Tasks — Zuweisungen (braucht 2 & 3)
5. Admin Times — Nicht-Projektzeiten (braucht 2, 1)
6. Skills — unabhängig
7. Sheets — Daten in Templates (braucht 2 & 3)
8. Advanced Rates — Sätze je Ressource (braucht 2)
9. Financials — Kosten je Projekt (braucht 3, 1)
10. Team Resources — Team-Mitglieder (braucht 2)

Faustregel: Stammdaten → Container → Verknüpfungen → Details.

---

# Wie Tempus Zeilen wiedererkennt
## Der Schlüssel entscheidet: neu anlegen oder aktualisieren

- Attributes (1): Custom Field Name + Entity Type
- Resources (2): Resource Name (oder API External Id)
- Projects (3): Project Name (oder API External Id)
- Allocation & Tasks (4): Project + Resource + Task + Plan Type + Allocation Type
- Skills (6): Skill Name

Praxis: Namen über alle Dateien hinweg identisch halten – ein Tippfehler erzeugt versehentlich einen zweiten Datensatz.

Projekt-Level-Zuweisung ohne echten Task: eingebauten Task-Namen „Generic" verwenden.

---

# Import Behavior
## Merge · Overwrite · Skip — pro Zeile steuerbar

- Merge — legt Neues an und aktualisiert Bestehendes; in Tempus gepflegte Werte bleiben erhalten. Standard für fast alles.
- Overwrite — ersetzt einen gleichnamigen Datensatz vollständig; bisherige Werte gehen verloren. Nur bewusst einsetzen.
- Skip — überspringt die komplette Zeile; nichts wird importiert.

Datenverlust-Risiko: Overwrite entfernt und ersetzt – bei Attributen gehen auch zugeordnete Werte verloren. Im Zweifel immer Merge.

---

# Zeit-phasierte Spalten
## Datums-Spalten hinter den festen Spalten

- Resources (2): Monat — Stunden (Kapazität)
- Allocation (4): Projekt/Jahr/Quartal/Monat/Woche/Tag — Hours oder FTE
- Admin Times (5): Woche — Stunden / FTE
- Financials (9): Monat/Quartal/Jahr — Kosten
- Team Resources (10): Woche — FTE (Inclusion %)

Time Period muss zu den Spaltenköpfen passen (Month = beliebiges Datum im Monat; Week = immer Montag).
Hours = Aufwand über die Arbeitstage verteilt. FTE = Kapazitätsanteil über die Arbeitstage repliziert.

---

# Schritt-für-Schritt: ein sauberer Import
## Erst-Import gemeinsam durchgehen

1. Vorbereiten: pro Datentyp eine .xlsx, Vorlage als erstes Tab, Namen einheitlich
2. Schritt 1 – Attributes: Felder & Auswahllisten anlegen
3. Schritt 2 – Resources: Ressourcen-Pool inkl. Kapazität
4. Schritt 3 – Projects: Projekte anlegen, Attribute werden befüllt
5. Schritt 4 – Allocation & Tasks: Zuweisungen mit Plan-Werten
6. Schritte 5–10: Admin-Zeiten, Skills, Sheets, Raten, Finanzen, Team ergänzen
7. Prüfen: nach jedem Synchronize Rückmeldung kontrollieren + Stichproben in Tempus

Tipp: jede Datei separat hochladen und prüfen – so ist bei Fehlern sofort klar, welcher Datentyp betroffen ist.

---

# Häufige Fehler – und wie wir sie vermeiden

- Auswahlwert fehlt (z. B. „Critical" bei Priorität) → Wert vorab in Attributes (1) ergänzen
- Attribut fehlt (z. B. „Portfolio") → Custom Field in Schritt 1 anlegen
- Referenz fehlt (unbekanntes Projekt/Ressource) → Reihenfolge einhalten (2 & 3 vor 4)
- Falsches Format (Datum) → Vorlagenformat übernehmen, nicht umformatieren
- Falsche Reihenfolge → 1 → 10 abarbeiten
- Spalten weichen ab („Priorität" statt „Project Priority") → Original-Überschriften beibehalten
- Vorlage nicht erstes Tab → Datenblatt an erste Stelle ziehen

Valkeen-Support: Für abweichende Quell-Exporte (SAP, Jira, MS Project) richten wir ein Mapping auf die Tempus-Vorlagen ein.

---

# Checkliste & nächste Schritte
## Vor jedem Import prüfen

- Richtige Vorlage für den Datentyp gewählt
- Vorlage ist das erste Tab, Format .xlsx
- Original-Spaltenüberschriften unverändert
- Pflichtfelder gefüllt (mind. der Name)
- Namen über alle Dateien identisch
- Reihenfolge 1 → 10 eingehalten
- Import Behavior bewusst gesetzt (i. d. R. Merge)
- Datums-Spalten passen zu Time Period
- Auswahlwerte existieren in den Attributen
- Erst Sandbox, dann Produktion

Nächster Schritt: gemeinsamer Test-Import in der Sandbox mit Ihren echten Dateien – Schritt 1–4 live.
"""


def load_dotenv(path: Path) -> None:
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        k, v = k.strip(), v.strip().strip("'\"")
        if k and k not in os.environ:
            os.environ[k] = v


def find_custom_valkeen_theme(api_key: str) -> str | None:
    """Sucht Custom Theme mit valk/tempus/blau im Namen."""
    after = ""
    for _ in range(20):
        path = "/themes?limit=50&type=custom"
        if after:
            path += f"&after={after}"
        try:
            data = api("GET", path, api_key)
        except RuntimeError:
            return None
        for t in data.get("data") or []:
            name = (t.get("name") or "").lower()
            if any(k in name for k in ("valk", "tempus", "blau")):
                return t.get("id")
        if not data.get("hasMore"):
            break
        after = data.get("nextCursor") or ""
    return None


DEFAULT_THEME = "marine"


def api(method: str, path: str, key: str, body: dict | None = None) -> dict:
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(
        f"{API_BASE}{path}",
        data=data,
        headers={
            "X-API-KEY": key,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "Valkeen-Post-Walkthrough/1.0",
        },
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code}: {e.read().decode('utf-8', errors='replace')[:800]}") from e


def main() -> int:
    load_dotenv(VALKEEN_ENV)
    api_key = os.environ.get("GAMMA_API_KEY", "").strip()
    if not api_key:
        print("GAMMA_API_KEY fehlt (Valkeen docs/horizon_workshop/.env)", file=sys.stderr)
        return 1

    num_cards = INPUT_TEXT.count("\n---\n") + 1
    print(f"Karten: {num_cards} · Zeichen: {len(INPUT_TEXT):,}")

    body: dict = {
        "inputText": INPUT_TEXT,
        "textMode": "preserve",
        "format": "presentation",
        "cardSplit": "inputTextBreaks",
        "title": "Tempus Resource · Excel-Upload Walkthrough (Valkeen 2026)",
        "additionalInstructions": (
            "Look exakt wie der Tempus Resource / Valkeen 2026 Master (Theme 'Blau II'). "
            "Helle/weiße Inhaltsfolien mit dunkel-slateblauen Überschriften (#335B74). "
            "Akzentfarben: Teal #27CED7, Hellblau #1CADE4, Mittelblau #2683C6, Grün #42BA97, dunkler Slate #335B74. "
            "Klare, ruhige Corporate-Folien, viel Weißraum, serifenlose Schrift im Calibri/Arial-Stil. "
            "Zentrierte Folientitel mit kurzem grauen Untertitel darunter (Eyebrow). "
            "Wenig Text pro Karte, starke Typografie. Keine Stock-Foto-Wände; lieber schlichte Icons/Diagramme. "
            "Abhängigkeits-/Reihenfolge-Folien als saubere Stufen-/Spalten-Visualisierung in den Akzentfarben."
        ),
        "textOptions": {
            "amount": "medium",
            "language": "de",
            "tone": "professionell, klar, beratend",
            "audience": "Kunden-PMO, Admin, Datenverantwortliche",
        },
        "imageOptions": {
            "source": "themeAccent",
            "style": "Valkeen/Tempus corporate, slate navy #335B74 and teal #27CED7, minimal, clean",
        },
        "cardOptions": {
            "dimensions": "16x9",
            "headerFooter": {
                "bottomRight": {"type": "text", "value": "Valkeen GmbH · Tempus Resource"},
                "hideFromFirstCard": True,
            },
        },
    }
    theme = os.environ.get("VALKEEN_GAMMA_THEME_ID", "").strip()
    if not theme:
        theme = find_custom_valkeen_theme(api_key) or DEFAULT_THEME
        print(f"Theme: {theme}" + (" (Custom Valkeen)" if theme not in (DEFAULT_THEME, "consultant") else ""))
    body["themeId"] = theme
    folders = os.environ.get("GAMMA_FOLDER_IDS", "").strip()
    if folders:
        body["folderIds"] = [x.strip() for x in folders.split(",") if x.strip()]

    print("Starte Gamma-Generierung …")
    created = api("POST", "/generations", api_key, body)
    gen_id = created.get("generationId")
    if not gen_id:
        print(json.dumps(created, indent=2), file=sys.stderr)
        return 1
    print(f"generationId: {gen_id}")

    result: dict = {}
    for i in range(POLL_MAX):
        if i:
            time.sleep(POLL_SEC)
        st = api("GET", f"/generations/{gen_id}", api_key)
        status = st.get("status", "?")
        print(f"  [{i+1}] status={status}", flush=True)
        if status == "completed":
            result = st
            break
        if status == "failed":
            print(json.dumps(st, indent=2), file=sys.stderr)
            return 1
    else:
        print(f"Timeout — generationId={gen_id}", file=sys.stderr)
        return 1

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n✅ Fertig: {result.get('gammaUrl', '—')}")
    print(f"Gespeichert: {OUTPUT_JSON}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
