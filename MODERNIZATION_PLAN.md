# 🚀 UMFASSENDER MODERNISIERUNGSPLAN

## 📋 Übersicht

Dieser Plan transformiert die Website von einer statischen HTML-Sammlung zu einer modernen, skalierbaren Enterprise-Plattform mit klarer Struktur und professioneller Architektur.

## 🎯 Ziele

1. **Struktur & Namespacing modernisieren** - Mono-Struktur einführen
2. **Live statt statisch** - Daten & Inhalte dynamisch machen  
3. **Auth & Userflows klar** - Einheitlich und sicher
4. **Media-Upload stabil** - Standard-Pattern implementieren
5. **Workflows nie wieder hängen** - Step Functions + Retries
6. **API-Docs eine Quelle** - OpenAPI 3.1 + Redoc
7. **Deployment live** - Sauberes Routing & Caching
8. **Testing wie ein User** - Playwright E2E + Cursor Integration
9. **Design & Performance** - Astro + React-Inseln
10. **Dokumentation konsolidieren** - Namen = Wahrheit

## 🏗️ Neue Struktur

```
/
├── apps/
│   └── web/                    # Website & Admin (Astro + React-Inseln)
│       ├── src/
│       │   ├── pages/          # Astro Pages
│       │   │   ├── admin.astro
│       │   │   ├── analytics.astro
│       │   │   └── bewerbungen.astro
│       │   ├── components/     # React-Inseln
│       │   │   ├── MediaGallery.tsx
│       │   │   ├── ApplicationForm.tsx
│       │   │   └── AnalyticsDashboard.tsx
│       │   ├── layouts/        # Astro Layouts
│       │   ├── content/        # Content Collections
│       │   └── theme.ts        # Chakra Theme zentral
│       ├── public/
│       └── package.json
│
├── services/
│   └── api/                    # Lambdas (applications, media, jobs)
│       ├── applications/
│       ├── media/
│       ├── jobs/
│       └── shared/
│
├── docs/
│   └── api/                    # OpenAPI + Redoc
│       ├── openapi.yaml
│       └── redoc.html
│
└── tests/
    ├── e2e/                    # Playwright Tests
    └── fixtures/               # Test Data
```

## 🔄 Migration Strategy

### Phase 1: Struktur aufbauen
- [x] Neue Ordnerstruktur erstellen
- [ ] Astro Setup für apps/web
- [ ] React-Inseln migrieren
- [ ] Chakra Theme zentralisieren

### Phase 2: Content dynamisch
- [ ] Content Collections einrichten
- [ ] Pagefind Suchindex
- [ ] KPIs aus echten Quellen
- [ ] Analytics Integration

### Phase 3: Auth & Security
- [ ] AuthGuard Komponente
- [ ] Admin-Routen schützen
- [ ] Secrets aus aws-config.json entfernen
- [ ] Cognito Groups implementieren

### Phase 4: Media stabil
- [ ] Standard Upload-Pattern
- [ ] CloudFront + OAC
- [ ] Uppy + Progress + Retry
- [ ] Admin Medienliste

### Phase 5: Workflows robust
- [ ] Step Functions Setup
- [ ] Job Status Tracking
- [ ] Retry Logic
- [ ] DLQ Implementation

### Phase 6: API Docs einheitlich
- [ ] OpenAPI 3.1 finalisieren
- [ ] Redoc als /api-docs
- [ ] CI Validation
- [ ] Type Generation

### Phase 7: Deployment optimieren
- [ ] netlify.toml zentralisieren
- [ ] Routing optimieren
- [ ] Caching Headers
- [ ] Performance Budget

### Phase 8: Testing implementieren
- [ ] Playwright E2E
- [ ] A11y Testing
- [ ] Chaos Testing
- [ ] Cursor Integration

### Phase 9: Design & Performance
- [ ] Astro + React-Inseln
- [ ] Bild-Pipeline
- [ ] Critical CSS
- [ ] PWA Features

### Phase 10: Dokumentation
- [ ] Docusaurus Setup
- [ ] Runbooks erstellen
- [ ] Navigation strukturieren
- [ ] Alte Docs archivieren

## 🎯 Erwartete Ergebnisse

- **Performance**: Lighthouse Score 95+
- **Maintainability**: Klare Struktur, modulare Komponenten
- **Scalability**: Enterprise-ready Architektur
- **Developer Experience**: Moderne Tools, klare Dokumentation
- **User Experience**: Schnell, zuverlässig, intuitiv

## 📊 Success Metrics

- Build-Zeit < 2 Minuten
- Test-Coverage > 80%
- Lighthouse Score > 95
- Zero Downtime Deployments
- Developer Onboarding < 1 Tag
