# Deployment-Anleitung: Manuel Weiss Professional Services

## 🚀 Lokales Hosting (bereits aktiv)

Die Website läuft bereits lokal unter: **http://localhost:8000**

## 📋 Schritt-für-Schritt Deployment

### 1. GitHub Repository erstellen

#### Option A: Über GitHub Desktop
1. **GitHub Desktop öffnen**
2. **"File" → "New Repository"** oder **"Repository" → "New"**
3. **Einstellungen:**
   - Name: `manuel-weiss-website` (oder gewünschter Name)
   - Description: `Professionelle Website für Manuel Weiss - Beratung & Vermietung`
   - Local path: `/Users/manumanera/Documents/GitHub/Persönliche Website`
   - **"Create Repository"** klicken

#### Option B: Über GitHub.com
1. Auf **github.com** gehen und sich anmelden
2. **"New repository"** klicken
3. Repository-Name eingeben: `manuel-weiss-website`
4. **"Create repository"** klicken
5. Im Terminal:
   ```bash
   git remote add origin https://github.com/IHR_USERNAME/manuel-weiss-website.git
   git branch -M main
   git push -u origin main
   ```

### 2. GitHub Desktop Setup

1. **Repository in GitHub Desktop öffnen**
2. **Alle Dateien sollten bereits staged sein**
3. **Commit Message eingeben:** "Initial commit: Manuel Weiss Professional Services Website"
4. **"Commit to main"** klicken
5. **"Push origin"** klicken

### 3. Vercel Deployment

#### Option A: Über Vercel Dashboard
1. Auf **vercel.com** gehen und sich anmelden
2. **"New Project"** klicken
3. **GitHub Repository auswählen:** `manuel-weiss-website`
4. **Framework Preset:** "Other" oder "Static Site"
5. **"Deploy"** klicken

#### Option B: Über Vercel CLI
1. **Vercel CLI installieren:**
   ```bash
   npm install -g vercel
   ```
2. **Im Projektordner:**
   ```bash
   vercel login
   vercel
   ```
3. **Fragen beantworten:**
   - Set up and deploy: `Y`
   - Which scope: Ihr Account auswählen
   - Link to existing project: `N`
   - Project name: `manuel-weiss-website`
   - Directory: `./` (Enter drücken)
   - Override settings: `N`

### 4. Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Projekt öffnen
   - **"Settings" → "Domains"**
   - **"Add Domain"** klicken
   - Domain eingeben (z.B. `manuel-weiss.ch`)
   - DNS-Einstellungen bei Domain-Provider konfigurieren

## 🔧 Konfiguration

### Vercel-Konfiguration
Die `vercel.json` Datei ist bereits erstellt und enthält:
- **Static Site Build-Konfiguration**
- **Security Headers**
- **Caching-Optimierungen**

### Environment Variables (falls benötigt)
In Vercel Dashboard → Settings → Environment Variables:
```
NODE_ENV=production
```

## 📱 Nach dem Deployment

### 1. Website testen
- **Vercel-URL aufrufen** (z.B. `https://manuel-weiss-website.vercel.app`)
- **Alle Funktionen testen:**
  - Navigation
  - Kontaktformular
  - Responsive Design
  - Mobile Ansicht

### 2. Analytics einrichten
1. **Google Analytics 4** erstellen
2. **Tracking Code** in `index.html` einfügen
3. **Vercel Environment Variable** für GA_ID setzen

### 3. SEO optimieren
1. **Google Search Console** hinzufügen
2. **Sitemap** erstellen (optional)
3. **Meta-Tags** überprüfen

## 🔄 Updates und Änderungen

### Lokale Änderungen
1. **Dateien bearbeiten**
2. **GitHub Desktop:**
   - Änderungen sehen
   - Commit Message eingeben
   - "Commit to main" klicken
   - "Push origin" klicken

### Automatisches Deployment
- **Vercel deployt automatisch** bei jedem Push
- **Preview-URLs** für Pull Requests
- **Rollback** zu vorherigen Versionen möglich

## 🛠️ Troubleshooting

### Häufige Probleme

#### Website lädt nicht
- **Vercel Build-Logs** prüfen
- **Domain-Konfiguration** überprüfen
- **Cache leeren**

#### Kontaktformular funktioniert nicht
- **Backend-Integration** hinzufügen (EmailJS, Netlify Forms)
- **CORS-Einstellungen** prüfen

#### Mobile Ansicht problematisch
- **Viewport Meta-Tag** prüfen
- **CSS Media Queries** testen

## 📞 Support

Bei Problemen:
- **Vercel Documentation:** https://vercel.com/docs
- **GitHub Desktop Help:** https://docs.github.com/en/desktop
- **E-Mail:** weiss-manuel@gmx.de

## 🎯 Nächste Schritte

1. **Repository auf GitHub erstellen**
2. **Vercel-Projekt einrichten**
3. **Custom Domain konfigurieren** (optional)
4. **Analytics und SEO optimieren**
5. **Backend für Kontaktformular einrichten**

---

**Viel Erfolg beim Deployment! 🚀** 