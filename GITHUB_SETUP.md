# 🚀 GitHub Setup & Deployment Anleitung

## Schritt 1: GitHub Repository erstellen

1. **Gehe zu https://github.com** und melde dich an
2. **Klicke auf "New repository"** (grüner Button)
3. **Repository-Name**: `persoenliche-website` oder `manuel-weiss-website`
4. **Beschreibung**: "Manuel Weiss Professional Services Website"
5. **Wähle "Public"** (kostenlos)
6. **Lass alle anderen Optionen unmarkiert**
7. **Klicke "Create repository"**

## Schritt 2: Repository zu deinem lokalen Projekt hinzufügen

Führe diese Befehle in deinem Terminal aus:

```bash
# Ersetze USERNAME mit deinem GitHub-Benutzernamen
# Ersetze REPO-NAME mit dem Namen deines Repositories

git remote add origin https://github.com/USERNAME/REPO-NAME.git
git branch -M main
git push -u origin main
```

**Beispiel:**
```bash
git remote add origin https://github.com/manuelvonweiss/persoenliche-website.git
git branch -M main
git push -u origin main
```

## Schritt 3: Deployment auf Vercel

Nachdem du das Repository gepusht hast:

1. **Gehe zu https://vercel.com**
2. **Klicke "New Project"**
3. **Importiere dein GitHub-Repository**
4. **Wähle den Ordner aus** (falls nötig)
5. **Klicke "Deploy"**

## Schritt 4: Alternative: Netlify (einfacher)

1. **Gehe zu https://netlify.com**
2. **Klicke "New site from Git"**
3. **Wähle GitHub**
4. **Wähle dein Repository**
5. **Klicke "Deploy site"**

## 🎯 Schnellstart

Führe einfach aus:

```bash
./deploy.sh
```

Und wähle die gewünschte Option!

## 📞 Hilfe

Bei Problemen:
- **E-Mail**: weiss-manuel@gmx.de
- **GitHub Issues**: Erstelle ein Issue in deinem Repository
