# Lebenslauf-Felder Vorschlag - Modern & API-First
## Basierend auf HR-Trends 2024/2025

## 📋 Übersicht

Dieses Dokument beschreibt alle empfohlenen Datenfelder für den Lebenslauf-Editor, strukturiert nach Sektionen mit API-Endpunkten.

**Recherche-Basis:** Aktuelle HR-Trends 2024/2025 zeigen, dass HR-Mitarbeiter besonders Wert legen auf:
- **Skills-First Ansatz** - Fähigkeiten vor Abschlüssen
- **Konkrete Ergebnisse** - Quantifizierbare Erfolge und Metriken
- **Projekte** - Praktische Erfahrungen mit Beispielen
- **Digitale Präsenz** - GitHub, Portfolio, LinkedIn
- **ATS-Optimierung** - Keywords, standardisiertes Layout
- **Kulturelle Passung** - Werte und Arbeitsphilosophie

---

## 1. Persönliche Informationen (Personal Info)

### Aktuelle Felder ✅
- `firstName` - Vorname *
- `lastName` - Nachname *
- `email` - E-Mail *
- `phone` - Telefon
- `address` - Adresse
- `linkedin` - LinkedIn Profil
- `website` - Website/Portfolio

### Empfohlene Ergänzungen 🆕 (HR-Priorität: ⭐⭐⭐⭐⭐)
- `title` - Berufsbezeichnung (z.B. "Senior Software Engineer") **SEHR WICHTIG**
- `summary` - Kurzprofil (2-3 Sätze, 3-5 zentrale Fähigkeiten) **KRITISCH für ATS!**
- `photo` - Profilbild (URL) - Optional, aber modern
- `github` - GitHub Profil **WICHTIG für Tech-Jobs**
- `xing` - Xing Profil (für DACH-Region)
- `location` - Standort (Stadt, Land) - getrennt von Adresse
- `availability` - Verfügbarkeit (z.B. "Sofort", "In 2 Monaten")
- `workModel` - Arbeitsmodell (Remote, Hybrid, Vor Ort) **TREND 2025**
- `portfolio` - Portfolio-URL (zusätzlich zu Website)

### Optional (weniger Priorität)
- `dateOfBirth` - Geburtsdatum (nur wenn erforderlich)
- `nationality` - Nationalität (nur für internationale Jobs)
- `visaStatus` - Arbeitserlaubnis/Visum (nur für internationale Jobs)

### API-Endpunkte
```
GET    /resume/personal-info
PUT    /resume/personal-info/{field}  (z.B. firstName, title, summary)
POST   /resume/personal-info/photo    (Upload Profilbild)
```

---

## 2. Berufserfahrung (Work Experience)

### Aktuelle Struktur ✅
- Position
- Unternehmen
- Zeitraum
- Beschreibung

### Empfohlene Ergänzungen 🆕 (HR-Priorität: ⭐⭐⭐⭐⭐)
- `jobTitle` - Position/Jobtitel *
- `company` - Unternehmen *
- `location` - Standort (Stadt, Land)
- `startDate` - Startdatum (YYYY-MM)
- `endDate` - Enddatum (YYYY-MM) oder "heute"
- `current` - Boolean (aktuell tätig)
- `employmentType` - Art der Beschäftigung (Vollzeit, Teilzeit, Freelance, Praktikum)
- `description` - Array von Beschreibungen/Aufgaben
- `achievements` - Array von Erfolgen/Metriken **KRITISCH!** (z.B. "Umsatz um 30% gesteigert", "Team von 5 auf 15 erweitert")
- `technologies` - Array von verwendeten Technologien/Tools **WICHTIG für Skills-Matching**
- `skills` - Array von angewandten Skills (Hard & Soft Skills) **Skills-First Ansatz**
- `metrics` - Quantifizierbare Ergebnisse (z.B. "Budget: €500k", "Kunden: 200+", "Performance: +40%")
- `teamSize` - Teamgröße (optional)
- `industry` - Branche (optional)
- `remote` - Boolean (Remote/Hybrid/Vor Ort) **TREND 2025**

### API-Endpunkte
```
GET    /resume/experience
POST   /resume/experience
GET    /resume/experience/{id}
PUT    /resume/experience/{id}
DELETE /resume/experience/{id}
PUT    /resume/experience/{id}/achievements  (Einzelne Erfolge)
```

---

## 3. Ausbildung (Education)

### Aktuelle Struktur ✅
- Institution
- Abschluss
- Zeitraum

### Empfohlene Ergänzungen 🆕
- `degree` - Abschluss (z.B. "Bachelor of Science", "Master of Arts") *
- `fieldOfStudy` - Studienfach (z.B. "Informatik", "BWL")
- `institution` - Bildungseinrichtung *
- `location` - Standort (Stadt, Land)
- `startDate` - Startdatum (YYYY-MM)
- `endDate` - Enddatum (YYYY-MM) oder "heute"
- `current` - Boolean (aktuell studierend)
- `grade` - Abschlussnote (z.B. "1.3", "A+", "2.1")
- `description` - Beschreibung/Schwerpunkte
- `thesis` - Abschlussarbeit (Titel, optional)
- `honors` - Auszeichnungen (z.B. "Summa Cum Laude")

### API-Endpunkte
```
GET    /resume/education
POST   /resume/education
GET    /resume/education/{id}
PUT    /resume/education/{id}
DELETE /resume/education/{id}
```

---

## 4. Fähigkeiten & Kompetenzen (Skills)

### Aktuelle Struktur ✅
- Skills (kommagetrennt)

### Empfohlene Struktur 🆕 (HR-Priorität: ⭐⭐⭐⭐⭐)
**Skills-First Ansatz - HR legt 2025 besonderen Wert darauf!**

- `technicalSkills` - Technische Fähigkeiten (Hard Skills) **KRITISCH**
  - `category` - Kategorie (z.B. "Programmiersprachen", "Frameworks", "Tools", "Cloud", "Databases")
  - `skills` - Array von Skills
  - `proficiency` - Niveau (Beginner, Intermediate, Advanced, Expert)
  - `yearsOfExperience` - Jahre Erfahrung (optional)
  - `lastUsed` - Zuletzt verwendet (YYYY-MM, optional)
- `softSkills` - Soft Skills **WICHTIG für Cultural Fit**
  - `skill` - Skill-Name
  - `examples` - Array von konkreten Beispielen/Projekten, die das Skill belegen
- `languages` - Sprachen (siehe separater Abschnitt)
- `certifications` - Zertifikate (siehe separater Abschnitt)
- `keywords` - Automatisch generierte Keywords für ATS-Optimierung

### API-Endpunkte
```
GET    /resume/skills
PUT    /resume/skills/technical/{category}    (z.B. "programming", "frameworks")
PUT    /resume/skills/soft
POST   /resume/skills/technical/{category}    (Neue Kategorie)
DELETE /resume/skills/technical/{category}
```

---

## 5. Sprachen (Languages)

### Aktuelle Struktur ✅
- Sprache
- Niveau

### Empfohlene Struktur 🆕
- `language` - Sprache (z.B. "Deutsch", "Englisch") *
- `proficiency` - Niveau *
  - Optionen: "Muttersprache", "Fließend", "Verhandlungssicher", "Gut", "Grundkenntnisse"
  - Oder: CEFR-Level (A1, A2, B1, B2, C1, C2)
- `certificate` - Sprachzertifikat (z.B. "TOEFL 110", "Goethe-Zertifikat C1")
- `reading` - Lesen (optional, separat)
- `writing` - Schreiben (optional, separat)
- `speaking` - Sprechen (optional, separat)

### API-Endpunkte
```
GET    /resume/languages
POST   /resume/languages
GET    /resume/languages/{id}
PUT    /resume/languages/{id}
DELETE /resume/languages/{id}
```

---

## 6. Zertifikate & Weiterbildungen (Certifications)

### Aktuelle Struktur ❌
- Nicht vorhanden

### Empfohlene Struktur 🆕
- `name` - Name des Zertifikats *
- `issuer` - Ausstellende Organisation *
- `issueDate` - Ausstellungsdatum (YYYY-MM)
- `expiryDate` - Ablaufdatum (YYYY-MM, optional)
- `credentialId` - Zertifikats-ID/Nummer (optional)
- `credentialUrl` - Link zum Zertifikat (optional)
- `description` - Beschreibung (optional)

### API-Endpunkte
```
GET    /resume/certifications
POST   /resume/certifications
GET    /resume/certifications/{id}
PUT    /resume/certifications/{id}
DELETE /resume/certifications/{id}
```

---

## 7. Projekte (Projects)

### Aktuelle Struktur ❌
- Nicht vorhanden

### Empfohlene Struktur 🆕 (HR-Priorität: ⭐⭐⭐⭐⭐)
**HR legt 2025 besonderen Wert auf praktische Projekterfahrungen!**

- `name` - Projektname *
- `description` - Beschreibung *
- `role` - Rolle im Projekt (z.B. "Lead Developer", "Product Manager")
- `startDate` - Startdatum (YYYY-MM)
- `endDate` - Enddatum (YYYY-MM) oder "laufend"
- `technologies` - Array von Technologien **WICHTIG für Skills-Matching**
- `skills` - Array von angewandten Skills (Hard & Soft)
- `url` - Projekt-URL (optional)
- `githubUrl` - GitHub-Repository **SEHR WICHTIG für Tech-Jobs**
- `achievements` - Array von Erfolgen/Metriken **KRITISCH!** (z.B. "User-Base um 200% gesteigert")
- `metrics` - Quantifizierbare Ergebnisse
- `teamSize` - Teamgröße (optional)
- `client` - Kunde/Unternehmen (optional, für externe Projekte)
- `status` - Status (Abgeschlossen, Laufend, Pausiert)

### API-Endpunkte
```
GET    /resume/projects
POST   /resume/projects
GET    /resume/projects/{id}
PUT    /resume/projects/{id}
DELETE /resume/projects/{id}
```

---

## 8. Publikationen (Publications)

### Aktuelle Struktur ❌
- Nicht vorhanden (optional, für akademische/technische Profile)

### Empfohlene Struktur 🆕
- `title` - Titel *
- `type` - Typ (Artikel, Buch, Paper, Blog-Post)
- `publisher` - Herausgeber/Plattform
- `publicationDate` - Veröffentlichungsdatum (YYYY-MM)
- `url` - Link zur Publikation
- `authors` - Array von Autoren (optional)
- `description` - Kurzbeschreibung (optional)

### API-Endpunkte
```
GET    /resume/publications
POST   /resume/publications
GET    /resume/publications/{id}
PUT    /resume/publications/{id}
DELETE /resume/publications/{id}
```

---

## 9. Referenzen (References)

### Aktuelle Struktur ❌
- Nicht vorhanden

### Empfohlene Struktur 🆕
- `name` - Name der Referenzperson *
- `position` - Position *
- `company` - Unternehmen
- `email` - E-Mail
- `phone` - Telefon
- `relationship` - Beziehung (z.B. "Ehemaliger Vorgesetzter", "Kollege")
- `availableOnRequest` - Boolean (nur "auf Anfrage" anzeigen)

### API-Endpunkte
```
GET    /resume/references
POST   /resume/references
GET    /resume/references/{id}
PUT    /resume/references/{id}
DELETE /resume/references/{id}
```

---

## 10. Hobbys & Interessen (Hobbies & Interests)

### Aktuelle Struktur ❌
- Nicht vorhanden

### Empfohlene Struktur 🆕
- `interests` - Array von Interessen/Hobbys
- `volunteerWork` - Ehrenamtliche Tätigkeiten (optional)
  - `organization` - Organisation
  - `role` - Rolle
  - `startDate` - Startdatum
  - `endDate` - Enddatum
  - `description` - Beschreibung

### API-Endpunkte
```
GET    /resume/interests
PUT    /resume/interests
GET    /resume/volunteer
POST   /resume/volunteer
PUT    /resume/volunteer/{id}
DELETE /resume/volunteer/{id}
```

---

## 11. Zusätzliche Metadaten

### Empfohlene Felder 🆕
- `template` - Verwendete Vorlage (z.B. "modern", "classic", "creative")
- `version` - Version des Lebenslaufs (für mehrere Versionen)
- `lastUpdated` - Letzte Aktualisierung
- `atsOptimized` - Boolean (ATS-optimiert)
- `keywords` - Array von Keywords (automatisch generiert)
- `customSections` - Array von benutzerdefinierten Sektionen

---

## 📊 Priorisierung (Basierend auf HR-Trends 2024/2025)

### Phase 1: KRITISCH - Sofort implementieren (HR-Priorität: ⭐⭐⭐⭐⭐)
1. ✅ **Kurzprofil (Summary)** - 3-5 zentrale Fähigkeiten, Jobtitel **KRITISCH für ATS!**
2. ✅ **Persönliche Informationen (erweitert)** - title, summary, github, portfolio
3. ✅ **Fähigkeiten (Skills)** - Kategorisiert, Hard & Soft Skills mit Beispielen **Skills-First Ansatz!**
4. ✅ **Berufserfahrung (erweitert)** - achievements, metrics, technologies, skills **Ergebnisse im Fokus!**
5. ✅ **Projekte** - Mit achievements, metrics, githubUrl **Praktische Erfahrungen!**

### Phase 2: WICHTIG - Nächster Schritt (HR-Priorität: ⭐⭐⭐⭐)
6. ✅ **Ausbildung (erweitert)** - fieldOfStudy, grade, honors
7. 🆕 **Zertifikate & Weiterbildungen** - Zeigt kontinuierliche Entwicklung
8. ✅ **Sprachen (erweitert)** - proficiency, certificate
9. 🆕 **Arbeitsmodell** - Remote/Hybrid/Vor Ort **TREND 2025**

### Phase 3: NÜTZLICH - Später (HR-Priorität: ⭐⭐⭐)
10. 🆕 **Kulturelle Passung** - Werte, Arbeitsphilosophie (optional)
11. 🆕 **Ehrenamtliche Tätigkeiten** - Zeigt Engagement
12. 🆕 **Hobbys & Interessen** - Nur wenn relevant für Position

### Phase 4: Optional - Spezialfälle (HR-Priorität: ⭐⭐)
13. 🆕 **Publikationen** - Für akademische/technische Profile
14. 🆕 **Referenzen** - Meist "auf Anfrage"
15. 🆕 **Awards & Auszeichnungen** - Optional

### 🎯 HR-Fokus 2025: Was wirklich zählt
- **Skills-First** - Fähigkeiten vor Abschlüssen
- **Konkrete Ergebnisse** - Quantifizierbare Erfolge (Metriken!)
- **Projekte** - Praktische Erfahrungen mit Beispielen
- **Digitale Präsenz** - GitHub, Portfolio, LinkedIn
- **ATS-Optimierung** - Keywords, standardisiertes Layout

---

## 🎯 API-First Prinzipien

### 1. RESTful Struktur
- Jede Sektion hat eigene Endpunkte
- CRUD-Operationen für alle Entitäten
- Einzelfeld-Updates für wichtige Felder

### 2. Versionierung
- `/v1/resume/...` für zukünftige Versionen

### 3. Batch-Operations
- `POST /resume/batch` - Mehrere Updates auf einmal
- `GET /resume/export` - Vollständiger Export

### 4. Validierung
- Feld-Validierung auf Backend
- Fehlerbehandlung mit klaren Meldungen

### 5. Auto-Save
- Jedes Feld mit Auto-Save (2s Debounce)
- Einzelfeld-Endpunkte für Performance

---

## 🔄 Datenfluss

```
Frontend (Resume Editor)
    ↓
Auto-Save (2s Debounce)
    ↓
PUT /resume/{section}/{field}
    ↓
Backend (Lambda)
    ↓
DynamoDB (User Profile)
```

---

## 📝 Beispiel-API-Calls

### Einzelfeld Update
```bash
PUT /resume/personal-info/title
{
  "value": "Senior Software Engineer"
}
```

### Neue Berufserfahrung
```bash
POST /resume/experience
{
  "jobTitle": "Senior Developer",
  "company": "Tech Corp",
  "startDate": "2020-01",
  "endDate": "heute",
  "current": true,
  "description": ["Entwicklung von Web-Apps", "Teamleitung"],
  "achievements": ["Umsatz um 30% gesteigert"],
  "technologies": ["React", "Node.js"]
}
```

### Skills Update
```bash
PUT /resume/skills/technical/programming
{
  "skills": ["JavaScript", "TypeScript", "Python"],
  "proficiency": "Advanced"
}
```

---

## ✅ Zusammenfassung - HR-Fokus 2025

### 🔥 TOP-Priorität (Was HR-Mitarbeiter 2025 am meisten wert legen):

1. **Kurzprofil (Summary)** ⭐⭐⭐⭐⭐
   - 2-3 Sätze mit Jobtitel und 3-5 zentralen Fähigkeiten
   - **KRITISCH für ATS-Screening!**

2. **Skills (Fähigkeiten)** ⭐⭐⭐⭐⭐
   - Hard Skills: Kategorisiert (Programmiersprachen, Tools, etc.)
   - Soft Skills: Mit konkreten Beispielen belegt
   - **Skills-First Ansatz - HR-Trend 2025!**

3. **Achievements & Metriken** ⭐⭐⭐⭐⭐
   - Quantifizierbare Erfolge in Berufserfahrung
   - Konkrete Ergebnisse in Projekten
   - **"Was wurde erreicht?" statt nur "Was wurde gemacht?"**

4. **Projekte** ⭐⭐⭐⭐⭐
   - Praktische Erfahrungen mit GitHub-Links
   - Technologien und Skills
   - Achievements und Metriken
   - **Zeigt praktische Anwendung von Skills!**

5. **Digitale Präsenz** ⭐⭐⭐⭐
   - GitHub (für Tech-Jobs essentiell!)
   - Portfolio/Website
   - LinkedIn
   - **Zeigt Engagement und Professionalität**

6. **Berufserfahrung (erweitert)** ⭐⭐⭐⭐⭐
   - Achievements mit Metriken
   - Technologies & Skills
   - Remote/Hybrid Optionen
   - **Ergebnisse im Fokus!**

### 📋 Empfohlene Felder für modernen, praktischen Lebenslauf:

**Phase 1 (KRITISCH):**
- ✅ Kurzprofil (Summary) - **NEU, höchste Priorität!**
- ✅ Persönliche Info: title, summary, github, portfolio, workModel
- ✅ Skills: technicalSkills (kategorisiert), softSkills (mit Beispielen)
- ✅ Berufserfahrung: achievements, metrics, technologies, skills
- ✅ Projekte: achievements, metrics, githubUrl, technologies

**Phase 2 (WICHTIG):**
- ✅ Ausbildung: fieldOfStudy, grade, honors
- ✅ Zertifikate: name, issuer, dates, credentialId
- ✅ Sprachen: proficiency, certificate
- ✅ Arbeitsmodell: Remote/Hybrid/Vor Ort

**Phase 3 (Optional):**
- Kulturelle Passung (Werte, Arbeitsphilosophie)
- Ehrenamtliche Tätigkeiten
- Hobbys & Interessen
- Publikationen
- Referenzen

### 🎯 HR-Insights 2025:

**Was HR-Mitarbeiter suchen:**
- ✅ Skills-First statt nur Abschlüsse
- ✅ Konkrete Ergebnisse statt nur Aufgaben
- ✅ Praktische Projekte mit Beispielen
- ✅ Digitale Präsenz (GitHub, Portfolio)
- ✅ ATS-optimiert (Keywords, standardisiertes Layout)
- ✅ Kulturelle Passung (Werte, Arbeitsphilosophie)

**Was weniger wichtig ist:**
- ❌ Nur formale Abschlüsse ohne Skills
- ❌ Aufgabenlisten ohne Ergebnisse
- ❌ Fehlende digitale Präsenz
- ❌ Keine quantifizierbaren Erfolge

### 🚀 API-First Prinzip:

Alle Felder sollten über eigene API-Endpunkte verfügen für maximale Flexibilität und Auto-Save-Funktionalität!

