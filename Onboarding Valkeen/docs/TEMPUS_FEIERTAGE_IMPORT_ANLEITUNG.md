# Feiertags- und Ferienkalender in Tempus Resource importieren

Anleitung, wie du einen Feiertagskalender (z.B. Kanton Zürich) oder Ferienkalender in Tempus Resource importierst, damit die Tage im Resource Management als nicht verfügbar angezeigt werden.

---

## Übersicht der möglichen Ansätze

| Ansatz | Beschreibung | Aufwand |
|--------|--------------|---------|
| **1. Admin Time** | Admin-Time-Typ „Feiertag“ anlegen und datumsbezogen Ressourcen zuweisen | Mittel |
| **2. Kalender** | Tempus-Kalender mit Feiertagen konfigurieren und Ressourcen zuordnen | Niedrig (falls unterstützt) |
| **3. Bulk Resource Capacities** | Über „Massen-Ressourcenkapazitäten“ Kapazität 0 für Feiertage setzen | Mittel |
| **4. REST API** | Feiertage per API importieren (falls verfügbar) | Hoch |

---

## Ansatz 1: Admin Time (empfohlen)

Admin Times in Tempus dienen für Abwesenheiten wie Urlaub, Krankheit oder **Feiertage**.

### Schritt 1: Admin-Time-Typ „Feiertag“ anlegen

1. In Tempus: **Administratoreinstellungen** → **Admin Times** (oder vergleichbar)
2. Neuen Admin-Time-Typ anlegen, z.B. **„Feiertag“** oder **„Public Holiday“**

### Schritt 2: Feiertage als Admin Time zuweisen

- Über die **Resource Management**-Ansicht oder **Bulk Resource Capacities**
- Für jede Ressource (oder global) die Feiertage als Admin Time vom Typ „Feiertag“ eintragen
- Datum und Dauer (z.B. 1 Tag) angeben

### Schritt 3: Import per Excel (falls unterstützt)

Tempus unterstützt Excel-Import. Das **Admin Times**-Template hat u.a.:

- **Resource Name**
- **Aggregation Unit**
- **Admin Time Type**

Ob datumsbezogene Admin Times (Start/Ende) per Excel importiert werden können, hängt von der Tempus-Version ab. In der UI unter **Import** prüfen, ob ein Admin-Times-Sheet mit Datumsspalten möglich ist.

---

## Ansatz 2: Kalender

Tempus hat **Kalender** (`/Calendars` in der API). Kalender können Arbeitszeiten und Ausnahmen (z.B. Feiertage) definieren.

### Vorgehen

1. **Administratoreinstellungen** → **Kalender** (oder **Work Calendars**)
2. Neuen Kalender anlegen, z.B. **„Zürich Feiertage“**
3. Feiertage als **Ausnahmen** (Exceptions) mit leerem `workPeriods` eintragen
4. Kalender den Ressourcen zuordnen (z.B. über Ressourcen-Einstellungen)

Die genaue Konfiguration (JSON, UI-Felder) steht in der Tempus-Dokumentation oder im Admin-Bereich.

---

## Ansatz 3: Bulk Resource Capacities

Der Menüpunkt **„Massen-Ressourcenkapazitäten“** (Bulk Resource Capacities) erlaubt, Kapazitäten für viele Ressourcen und Zeiträume zu setzen.

### Idee

- Für Feiertage die Kapazität auf **0** setzen
- So werden diese Tage als nicht verfügbar berücksichtigt

### Vorgehen

1. **Ressourcenverwaltung** → **Massen-Ressourcenkapazitäten**
2. Zeitraum wählen (z.B. Jahr)
3. Für jeden Feiertag die Kapazität der betroffenen Ressourcen auf 0 setzen

Ob ein **Import** aus Excel/CSV möglich ist, in der Oberfläche prüfen (z.B. „Import“-Button oder ähnlich).

---

## Feiertagsdaten für Zürich

### Quelle 1: PublicHolidays.ch

- **URL:** [publicholidays.ch/de/zurich](https://publicholidays.ch/de/zurich/)
- Offizielle Feiertage Kanton Zürich
- Mehrere Jahre verfügbar

### Quelle 2: Feiertagskalender.ch

- **URL:** [feiertagskalender.ch](https://www.feiertagskalender.ch/index.php?geo=3055)
- Geo-ID 3055 = Stadt Zürich
- Export (falls angeboten) für Excel/CSV nutzen

### Feiertage Kanton Zürich (Beispiel 2026)

| Datum | Feiertag |
|-------|----------|
| 1. Januar | Neujahrstag |
| 3. April | Karfreitag |
| 6. April | Ostermontag |
| 1. Mai | Tag der Arbeit |
| 14. Mai | Christi Himmelfahrt |
| 25. Mai | Pfingstmontag |
| 1. August | Nationalfeiertag Schweiz |
| 25. Dezember | Weihnachtstag |
| 26. Dezember | Stephanstag |

### Schulferien Zürich

- [zh.ch – Schulferien](https://www.zh.ch/de/bildung/schulferien.html)
- Für Ferienkalender (z.B. Kinderbetreuung) relevant

---

## Fertige Excel-Dateien (Upload-Template)

Im Ordner **`docs/AdminTimes_Feiertage/`** liegen fertige Excel-Dateien, abgestimmt auf das Tempus Admin-Times-Upload-Template:

- **Schweiz:** 26 Dateien (je Kanton)
- **Deutschland:** 16 Dateien (je Bundesland)

Struktur: Resource Name, Aggregation Unit „Day“, Admin Time Type „Feiertag“, Spalten = nur Feiertage, Werte = 8 Stunden Abwesenheit pro Feiertag.

Siehe `docs/AdminTimes_Feiertage/README.md` für die vollständige Liste und Import-Anleitung.

---

## Empfohlene nächste Schritte

1. **Tempus Support prüfen:** [support.tempusresource.com](https://support.tempusresource.com) (Login nötig) – Suche nach „holiday“, „calendar“, „admin time“, „non-working days“.
2. **Valkeen anfragen:** Als EU-Partner für Tempus – [valkeen.com](https://valkeen.com), z.B. ob ein Feiertags-Import für Zürich dokumentiert oder als Best Practice existiert.
3. **Admin-Bereich durchgehen:** Unter **Administratoreinstellungen** nach Kalender-, Admin-Time- und Kapazitäts-Import-Optionen schauen.
4. **Bulk Resource Capacities testen:** Prüfen, ob dort ein Import-Button oder eine CSV/Excel-Option vorhanden ist.

---

## Kurzreferenz: Tempus-Entitäten

| Entität | Verwendung |
|---------|------------|
| **Admin Times** | Abwesenheitstypen (Urlaub, Feiertag, Krankheit etc.) |
| **Calendars** | Arbeitszeiten und Ausnahmen (z.B. Feiertage) |
| **Resources** | Können Kalender und Admin-Time-Zuordnungen haben |
| **Bulk Resource Capacities** | Massenänderung von Kapazitäten pro Zeitraum |

---

*Stand: März 2026 – Tempus-Version und UI können abweichen. Bei Unklarheiten Valkeen oder ProSymmetry Support kontaktieren.*
