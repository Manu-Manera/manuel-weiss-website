# Lebenslauf-Felder Vorschlag - Modern & API-First

## 📋 Übersicht

Dieses Dokument beschreibt alle empfohlenen Datenfelder für den Lebenslauf-Editor, strukturiert nach Sektionen mit API-Endpunkten.

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

### Empfohlene Ergänzungen 🆕
- `title` - Berufsbezeichnung (z.B. "Senior Software Engineer")
- `summary` - Kurzprofil (2-3 Sätze, sehr wichtig für ATS!)
- `photo` - Profilbild (URL)
- `dateOfBirth` - Geburtsdatum (optional, für manche Länder)
- `nationality` - Nationalität (optional)
- `visaStatus` - Arbeitserlaubnis/Visum (optional, für internationale Jobs)
- `github` - GitHub Profil
- `xing` - Xing Profil (für DACH-Region)
- `location` - Standort (Stadt, Land) - getrennt von Adresse
- `availability` - Verfügbarkeit (z.B. "Sofort", "In 2 Monaten")

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

### Empfohlene Ergänzungen 🆕
- `jobTitle` - Position/Jobtitel *
- `company` - Unternehmen *
- `location` - Standort (Stadt, Land)
- `startDate` - Startdatum (YYYY-MM)
- `endDate` - Enddatum (YYYY-MM) oder "heute"
- `current` - Boolean (aktuell tätig)
- `employmentType` - Art der Beschäftigung (Vollzeit, Teilzeit, Freelance, Praktikum)
- `description` - Array von Beschreibungen/Aufgaben
- `achievements` - Array von Erfolgen/Metriken (z.B. "Umsatz um 30% gesteigert")
- `technologies` - Array von verwendeten Technologien/Tools
- `teamSize` - Teamgröße (optional)
- `industry` - Branche (optional)

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

### Empfohlene Struktur 🆕
**Kategorisierung ist wichtig für ATS!**

- `technicalSkills` - Technische Fähigkeiten
  - `category` - Kategorie (z.B. "Programmiersprachen", "Frameworks", "Tools")
  - `skills` - Array von Skills
  - `proficiency` - Niveau (Beginner, Intermediate, Advanced, Expert) - optional
- `softSkills` - Soft Skills (z.B. "Kommunikation", "Teamarbeit")
- `languages` - Sprachen (siehe separater Abschnitt)
- `certifications` - Zertifikate (siehe separater Abschnitt)

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

### Empfohlene Struktur 🆕
- `name` - Projektname *
- `description` - Beschreibung *
- `role` - Rolle im Projekt (z.B. "Lead Developer", "Product Manager")
- `startDate` - Startdatum (YYYY-MM)
- `endDate` - Enddatum (YYYY-MM) oder "laufend"
- `technologies` - Array von Technologien
- `url` - Projekt-URL (optional)
- `githubUrl` - GitHub-Repository (optional)
- `achievements` - Array von Erfolgen/Metriken
- `teamSize` - Teamgröße (optional)

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

## 📊 Priorisierung

### Phase 1: Essentiell (Sofort implementieren)
1. ✅ Persönliche Informationen (erweitert)
2. ✅ Berufserfahrung (erweitert)
3. ✅ Ausbildung (erweitert)
4. ✅ Fähigkeiten (kategorisiert)
5. ✅ Sprachen (erweitert)

### Phase 2: Wichtig (Nächster Schritt)
6. 🆕 Zertifikate & Weiterbildungen
7. 🆕 Projekte
8. 🆕 Kurzprofil (Summary)

### Phase 3: Optional (Später)
9. 🆕 Publikationen
10. 🆕 Referenzen
11. 🆕 Hobbys & Interessen
12. 🆕 Ehrenamtliche Tätigkeiten

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

## ✅ Zusammenfassung

**Empfohlene Felder für modernen, praktischen Lebenslauf:**

1. **Persönliche Info** (erweitert): title, summary, photo, github, xing, location, availability
2. **Berufserfahrung** (erweitert): achievements, technologies, employmentType, teamSize
3. **Ausbildung** (erweitert): fieldOfStudy, grade, thesis, honors
4. **Fähigkeiten** (kategorisiert): technicalSkills (nach Kategorien), softSkills
5. **Sprachen** (erweitert): proficiency, certificate, separate skills
6. **Zertifikate** (neu): name, issuer, dates, credentialId
7. **Projekte** (neu): name, description, role, technologies, achievements
8. **Kurzprofil** (neu): summary (sehr wichtig für ATS!)

**Optional:**
- Publikationen
- Referenzen
- Hobbys & Interessen
- Ehrenamtliche Tätigkeiten

Alle Felder sollten über eigene API-Endpunkte verfügen für maximale Flexibilität!

