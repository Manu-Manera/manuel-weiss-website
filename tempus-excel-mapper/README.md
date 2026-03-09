# Tempus Excel Mapper

Intelligentes Tool zum Einlesen, Analysieren und Transformieren beliebiger Kunden-Excel-Dateien in eine Tempus-kompatible Import-Struktur.

## Features

- **Excel-Analyse**: Automatische Erkennung von Sheets, Spalten, Datentypen und Beziehungen
- **AI-gestützte Klassifikation**: Anthropic Claude analysiert Spalten semantisch und schlägt Zuordnungen vor
- **Tempus-Integration**: Lädt vorhandene Projekte, Ressourcen, Tasks und Custom Fields aus der Tempus API
- **Intelligentes Mapping**: Kombiniert regel-basierte und AI-gestützte Zuordnung mit Confidence Scores
- **Bestätigungs-Workflow**: Einzelne oder gesammelte Bestätigung/Ablehnung von Vorschlägen
- **Validierung**: Prüfung auf Vollständigkeit, Konsistenz und Konflikte vor dem Export
- **Tempus-kompatibler Export**: Generierung einer importfähigen Excel-Datei mit Mapping-Report
- **DSGVO-konform**: PII-Anonymisierung, Consent-Management, Audit-Log, automatische Datenlöschung

## DSGVO-Konformität

Siehe [docs/DSGVO_MASSNAHMEN.md](docs/DSGVO_MASSNAHMEN.md) für die vollständige DSGVO-Dokumentation.

**Highlights:**
- PII-Pseudonymisierung vor AI-Verarbeitung (Namen → „Person 1", E-Mails → „person1@example.com")
- Expliziter Consent-Dialog mit separatem AI-Opt-In
- Security Headers (Helmet/HSTS), CORS-Restriktion, Rate Limiting
- Automatische Session-Löschung nach 15 Minuten
- Keine dauerhafte Datenspeicherung
- Audit-Logging ohne personenbezogene Daten
- Lösch-Endpunkte für sofortige Datenentfernung (Art. 17 DSGVO)

## Voraussetzungen

- Node.js >= 18 (oder Docker)
- Tempus API Zugang (URL + Bearer Token)
- Anthropic API Key (optional, für AI-gestützte Analyse)

## Schnellstart (Entwicklung)

```bash
cd tempus-excel-mapper
npm install
npm run dev
```

Frontend: http://localhost:5173 | Backend: http://localhost:3001

## Deployment (Docker)

```bash
# 1. Environment-Datei erstellen
cp .env.production.example .env

# 2. Werte in .env anpassen (ALLOWED_ORIGINS, API-Keys optional)

# 3. Container starten
docker-compose up -d

# App läuft auf http://localhost:3001
```

## Deployment auf AWS

### Option A: EC2 mit Docker

```bash
# Auf EC2-Instanz:
sudo yum install -y docker git
sudo systemctl start docker
sudo usermod -aG docker ec2-user

# Projekt kopieren
scp -r tempus-excel-mapper/ ec2-user@your-ec2:/home/ec2-user/

# Starten
cd tempus-excel-mapper
docker-compose up -d
```

### Option B: ECS/Fargate

1. ECR-Repository erstellen und Image pushen:
```bash
aws ecr create-repository --repository-name tempus-excel-mapper
docker build -t tempus-excel-mapper .
docker tag tempus-excel-mapper:latest <account-id>.dkr.ecr.<region>.amazonaws.com/tempus-excel-mapper:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/tempus-excel-mapper:latest
```

2. ECS Task Definition erstellen (Port 3001, 512 MB Memory, 0.25 vCPU)
3. ALB davor schalten mit HTTPS-Zertifikat (ACM)
4. Environment-Variablen über ECS Task Definition oder AWS Secrets Manager

### Option C: Direkt mit Node.js

```bash
# Auf dem Server:
cd tempus-excel-mapper
npm ci
npm run build
NODE_ENV=production ALLOWED_ORIGINS=https://your-domain.com npx tsx server/index.ts
```

Für Daemonisierung: PM2 oder systemd verwenden.

### HTTPS (Pflicht für DSGVO)

In allen Fällen HTTPS verwenden:
- **ALB**: ACM-Zertifikat → HTTPS-Listener → Target Group (Port 3001)
- **CloudFront**: Origin auf ALB/EC2, HTTPS erzwingen
- **Nginx Reverse Proxy**: Let's Encrypt Zertifikat

### Integration in Onboarding-App

Das Excel-Mapper-Tool kann als eigenständiger Service neben der Onboarding-App laufen:

```
https://your-domain.com/              → Onboarding-App
https://your-domain.com/excel-mapper/ → Tempus Excel Mapper
```

Konfiguration über Nginx oder ALB Path-Based Routing.

## Konfiguration

### Via UI (empfohlen)

Nach dem Start die API-Keys im Konfigurationsbildschirm eingeben:
1. **Tempus Base URL**: z.B. `https://trial5.tempus-resource.com/slot4`
2. **Tempus API Key**: Bearer Token
3. **Anthropic API Key**: `sk-ant-...` (optional)

### Via Umgebungsvariablen

```bash
cp .env.example .env
# .env anpassen
```

### DSGVO-relevante Variablen

| Variable | Beschreibung | Default |
|----------|-------------|---------|
| `ALLOWED_ORIGINS` | Erlaubte CORS-Origins (kommasepariert) | `http://localhost:5173,http://localhost:3000` |
| `NODE_ENV` | `production` aktiviert strikte Sicherheit | `development` |

## Workflow

1. **Datenschutzhinweis**: Consent-Dialog mit optionalem AI-Opt-In
2. **Konfiguration**: API-Keys eingeben und Verbindungen testen
3. **Upload**: Excel-Datei hochladen (beliebige Struktur)
4. **Analyse**: Automatische Struktur-Erkennung + optionale AI-Analyse
5. **Tempus-Sync**: Vorhandene Tempus-Daten laden
6. **Mapping**: Zuordnungsvorschläge prüfen und bestätigen
7. **Validierung**: Prüfung auf Fehler und Warnungen
8. **Export**: Tempus-kompatible Excel herunterladen

## Architektur

Siehe [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) für die detaillierte Architekturübersicht.

## Technologie-Stack

| Bereich | Technologie |
|---------|-------------|
| Frontend | React 18, TypeScript, Tailwind CSS v4, Zustand |
| Backend | Express, TypeScript, tsx |
| Excel | ExcelJS |
| AI | Anthropic Claude (Sonnet) – optional, mit PII-Anonymisierung |
| Tempus | REST API (`/api/sg/v1/`) |
| Security | Helmet, express-rate-limit, CORS |
| Deployment | Docker, docker-compose |

## API-Endpunkte

| Methode | Pfad | Beschreibung |
|---------|------|--------------|
| GET/POST | `/api/config` | Konfiguration lesen/speichern |
| GET | `/api/config/test-tempus` | Tempus-Verbindung testen |
| GET | `/api/config/test-anthropic` | Anthropic-Verbindung testen |
| POST | `/api/privacy/consent` | DSGVO-Einwilligung erfassen |
| GET | `/api/privacy/info` | Datenschutzinformationen |
| GET | `/api/privacy/audit-log` | Audit-Protokoll |
| POST | `/api/upload` | Excel hochladen und analysieren |
| POST | `/api/sessions/:id/sync-tempus` | Tempus-Daten synchronisieren |
| POST | `/api/sessions/:id/generate-mappings` | Mappings generieren |
| PUT | `/api/sessions/:id/mappings/:mid` | Einzelnes Mapping aktualisieren |
| POST | `/api/sessions/:id/mappings/bulk-action` | Bulk-Aktion auf Mappings |
| GET | `/api/sessions/:id/validation` | Validierung durchführen |
| POST | `/api/sessions/:id/export` | Export generieren |
| GET | `/api/sessions/:id/download` | Excel-Export herunterladen |
| GET | `/api/sessions/:id/download-report` | Mapping-Report herunterladen |
| DELETE | `/api/sessions/:id` | Session + Daten löschen (Art. 17) |
| DELETE | `/api/sessions` | Alle Sessions löschen |

## Bekannte Einschränkungen

- Sessions laufen nach 15 Minuten ab (In-Memory-Speicher)
- Einzelbenutzer-Modus (globale API-Key-Konfiguration)
- AI-Analyse erfordert Anthropic API Key und explizite Einwilligung
- Excel-Dateien bis 50 MB unterstützt
- Tempus-Create-Endpunkte werden nicht automatisch aufgerufen
