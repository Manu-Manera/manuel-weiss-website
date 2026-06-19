# 🌐 Netlify Custom Domain Setup für manuel-weiss.ch

## Übersicht

Diese Anleitung zeigt, wie du `manuel-weiss.ch` und `www.manuel-weiss.ch` als Custom Domain für deine Netlify-Site einrichtest.

## Schritt 1: Domain in Netlify hinzufügen

1. **Gehe zu https://app.netlify.com** und melde dich an
2. **Wähle deine Site** (z.B. `mawps`)
3. **Gehe zu**: `Site settings → Domain management → Custom domains`
4. **Klicke auf "Add custom domain"**
5. **Gib ein**: `manuel-weiss.ch`
6. **Netlify wird dir DNS-Records anzeigen**, die du benötigst

## Schritt 2: DNS Records in Route53 erstellen

Netlify gibt dir normalerweise zwei Optionen:

### Option A: A/AAAA Records (für Root Domain)
- **A Record**: `manuel-weiss.ch` → Netlify IP-Adresse (z.B. `75.2.60.5`)
- **AAAA Record**: `manuel-weiss.ch` → Netlify IPv6-Adresse (falls vorhanden)

### Option B: CNAME Record (für www Subdomain)
- **CNAME Record**: `www.manuel-weiss.ch` → `mawps.netlify.app`

**Empfehlung**: Verwende Option A für die Root Domain und Option B für www.

## Schritt 3: DNS Records mit AWS CLI erstellen

Führe das Skript `setup-netlify-dns.sh` aus, nachdem du die Netlify DNS-Records erhalten hast:

```bash
./setup-netlify-dns.sh
```

Das Skript fragt nach:
- Netlify IP-Adresse (A Record)
- Netlify IPv6-Adresse (AAAA Record, optional)
- Netlify Load Balancer DNS (falls CNAME verwendet wird)

## Schritt 4: SSL-Zertifikat

Netlify stellt automatisch ein kostenloses SSL-Zertifikat (Let's Encrypt) bereit:
- **Warte 1-2 Minuten** nach dem Hinzufügen der Domain
- Netlify prüft automatisch die DNS-Records
- Sobald die Records korrekt sind, wird das SSL-Zertifikat ausgestellt
- Die Domain ist dann über HTTPS erreichbar

## Schritt 5: Domain-Verifizierung

Netlify kann eine Domain-Verifizierung verlangen:
- **DNS-Verifizierung**: Netlify erstellt einen TXT Record, den du in Route53 eintragen musst
- **E-Mail-Verifizierung**: Netlify sendet eine E-Mail an die Domain-Admin-Adresse

## Schritt 6: Redirects einrichten (optional)

In Netlify kannst du einrichten:
- `www.manuel-weiss.ch` → `manuel-weiss.ch` (oder umgekehrt)
- HTTP → HTTPS Redirect

**Netlify Dashboard**: `Site settings → Domain management → HTTPS`

## Troubleshooting

### Domain wird nicht verifiziert
- **Prüfe DNS-Propagation**: https://dnschecker.org/#A/manuel-weiss.ch
- **Warte 5-15 Minuten** nach dem Erstellen der DNS-Records
- **Prüfe Route53 Records**: `aws route53 list-resource-record-sets --hosted-zone-id Z02760862I1VK88B8J0ED`

### SSL-Zertifikat wird nicht ausgestellt
- **Prüfe, ob DNS-Records korrekt sind**
- **Warte bis zu 24 Stunden** (normalerweise 1-2 Minuten)
- **Kontaktiere Netlify Support**, falls es länger dauert

### Website lädt nicht
- **Prüfe, ob die Domain in Netlify als "Primary domain" gesetzt ist**
- **Prüfe Browser-Cache**: Hard Refresh (`Cmd+Shift+R` auf Mac)
- **Prüfe Netlify Build Logs**: `Site settings → Build & deploy → Deploys`

## Nächste Schritte

Nach erfolgreicher Einrichtung:
1. ✅ Domain ist über `https://manuel-weiss.ch` erreichbar
2. ✅ SSL-Zertifikat ist aktiv
3. ✅ `www.manuel-weiss.ch` leitet auf `manuel-weiss.ch` um (oder umgekehrt)

## Wichtige Notizen

- **DNS-Propagation kann 5-15 Minuten dauern**
- **Netlify SSL-Zertifikat wird automatisch erneuert**
- **Backup der Netlify URL**: `mawps.netlify.app` bleibt weiterhin erreichbar
- **Route53 Hosted Zone ID**: `Z02760862I1VK88B8J0ED`

