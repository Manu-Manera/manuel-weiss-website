# Tempus Admin Times – Feiertage pro Region

Excel-Dateien mit Feiertagen für den Tempus Admin-Times-Import, abgestimmt auf das Upload-Template aus **Step 5 AdminTimes_instructions.xlsx**.

## Struktur

- **Resource Name:** Manuel, Marc, Aayushi (exakt wie in Tempus)
- **Aggregation Unit:** Day
- **Admin Time Type:** z.B. „Public Holidays Zurich“, „Public Holidays Bern“ usw.
- **Spalten:** Nur Feiertage (keine leeren Kalendertage)
- **Werte:** 8 Stunden Abwesenheit pro Feiertag

## Schweiz (26 Kantone)

| Datei | Kanton |
|-------|--------|
| `Tempus_AdminTimes_Feiertage_CH_Aargau.xlsx` | Aargau |
| `Tempus_AdminTimes_Feiertage_CH_Appenzell_Ausserrhoden.xlsx` | Appenzell Ausserrhoden |
| `Tempus_AdminTimes_Feiertage_CH_Appenzell_Innerrhoden.xlsx` | Appenzell Innerrhoden |
| `Tempus_AdminTimes_Feiertage_CH_Basel-Landschaft.xlsx` | Basel-Landschaft |
| `Tempus_AdminTimes_Feiertage_CH_Basel-Stadt.xlsx` | Basel-Stadt |
| `Tempus_AdminTimes_Feiertage_CH_Bern.xlsx` | Bern |
| `Tempus_AdminTimes_Feiertage_CH_Freiburg.xlsx` | Freiburg |
| `Tempus_AdminTimes_Feiertage_CH_Genf.xlsx` | Genf |
| `Tempus_AdminTimes_Feiertage_CH_Glarus.xlsx` | Glarus |
| `Tempus_AdminTimes_Feiertage_CH_Graubünden.xlsx` | Graubünden |
| `Tempus_AdminTimes_Feiertage_CH_Jura.xlsx` | Jura |
| `Tempus_AdminTimes_Feiertage_CH_Luzern.xlsx` | Luzern |
| `Tempus_AdminTimes_Feiertage_CH_Neuenburg.xlsx` | Neuenburg |
| `Tempus_AdminTimes_Feiertage_CH_Nidwalden.xlsx` | Nidwalden |
| `Tempus_AdminTimes_Feiertage_CH_Obwalden.xlsx` | Obwalden |
| `Tempus_AdminTimes_Feiertage_CH_Schaffhausen.xlsx` | Schaffhausen |
| `Tempus_AdminTimes_Feiertage_CH_Schwyz.xlsx` | Schwyz |
| `Tempus_AdminTimes_Feiertage_CH_Solothurn.xlsx` | Solothurn |
| `Tempus_AdminTimes_Feiertage_CH_St._Gallen.xlsx` | St. Gallen |
| `Tempus_AdminTimes_Feiertage_CH_Tessin.xlsx` | Tessin |
| `Tempus_AdminTimes_Feiertage_CH_Thurgau.xlsx` | Thurgau |
| `Tempus_AdminTimes_Feiertage_CH_Uri.xlsx` | Uri |
| `Tempus_AdminTimes_Feiertage_CH_Waadt.xlsx` | Waadt |
| `Tempus_AdminTimes_Feiertage_CH_Wallis.xlsx` | Wallis |
| `Tempus_AdminTimes_Feiertage_CH_Zug.xlsx` | Zug |
| `Tempus_AdminTimes_Feiertage_CH_Zürich.xlsx` | Zürich |

## Deutschland (16 Bundesländer)

| Datei | Bundesland |
|-------|------------|
| `Tempus_AdminTimes_Feiertage_DE_Baden-Württemberg.xlsx` | Baden-Württemberg |
| `Tempus_AdminTimes_Feiertage_DE_Bayern.xlsx` | Bayern |
| `Tempus_AdminTimes_Feiertage_DE_Berlin.xlsx` | Berlin |
| `Tempus_AdminTimes_Feiertage_DE_Brandenburg.xlsx` | Brandenburg |
| `Tempus_AdminTimes_Feiertage_DE_Bremen.xlsx` | Bremen |
| `Tempus_AdminTimes_Feiertage_DE_Hamburg.xlsx` | Hamburg |
| `Tempus_AdminTimes_Feiertage_DE_Hessen.xlsx` | Hessen |
| `Tempus_AdminTimes_Feiertage_DE_Mecklenburg-Vorpommern.xlsx` | Mecklenburg-Vorpommern |
| `Tempus_AdminTimes_Feiertage_DE_Niedersachsen.xlsx` | Niedersachsen |
| `Tempus_AdminTimes_Feiertage_DE_Nordrhein-Westfalen.xlsx` | Nordrhein-Westfalen |
| `Tempus_AdminTimes_Feiertage_DE_Rheinland-Pfalz.xlsx` | Rheinland-Pfalz |
| `Tempus_AdminTimes_Feiertage_DE_Saarland.xlsx` | Saarland |
| `Tempus_AdminTimes_Feiertage_DE_Sachsen.xlsx` | Sachsen |
| `Tempus_AdminTimes_Feiertage_DE_Sachsen-Anhalt.xlsx` | Sachsen-Anhalt |
| `Tempus_AdminTimes_Feiertage_DE_Schleswig-Holstein.xlsx` | Schleswig-Holstein |
| `Tempus_AdminTimes_Feiertage_DE_Thüringen.xlsx` | Thüringen |

## Österreich

| Datei | Region |
|-------|--------|
| `Tempus_AdminTimes_Feiertage_AT_Austria.xlsx` | Österreich |

## Import in Tempus

1. **Admin-Time-Typ anlegen:** Admin Settings → Admin Times → „Feiertag“ erstellen (falls noch nicht vorhanden)
2. **Ressourcennamen prüfen:** Manuel, Marc, Aayushi müssen exakt mit Tempus übereinstimmen (ggf. anpassen)
3. **Für mehrere Ressourcen:** Zeile 2 kopieren und für jede Ressource anpassen
4. **Import:** Admin Settings → Data Synchronization → Excel → Choose File → Datei wählen → Synchronize

## Admin Time Types per API anlegen

Bevor die Excel-Dateien importiert werden können, müssen die Admin Time Types (z.B. „Public Holidays Zurich“) in Tempus existieren. Diese können per API angelegt werden:

```bash
cd "Onboarding Valkeen"
export TEMPUS_API_URL="https://trial5.tempus-resource.com/slot4"   # oder deine Tempus-URL
export TEMPUS_API_TOKEN="Bearer <dein-token>"
python3 scripts/create_admin_time_types_api.py
```

**Token ermitteln:** In Tempus einloggen, Browser DevTools (F12) → Network → beliebige API-Anfrage auswählen → Request Headers → Authorization kopieren.

**Admin Times mit Ressourcen verknüpfen (Bayern, Österreich):**

```bash
python3 scripts/link_admin_times_to_resources_api.py
```

Verknüpft Bayern- und Österreich-Feiertage direkt mit Manuel, Marc, Aayushi per API (Jahr 2026).

**Hinweis:** Die Tempus-API unterstützt nur GET für Calendars — keine Erstellung von Work Calendars. Die Admin Time Types sind die „Feiertagskalender“ für den Import.

## Excel-Dateien neu generieren

```bash
cd "Onboarding Valkeen"
source .venv/bin/activate
python3 scripts/generate_admin_times_feiertage.py
```

*Stand: 2026 – Feiertage Kanton Zürich / Deutschland 2026*
