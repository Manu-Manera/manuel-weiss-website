# Deploy-Konfiguration (AWS Website)

Eine zentrale Stelle für alle AWS-Website-Deploys.  
**Schneller:** Mehr Einträge in `deploy-aws-exclude.txt` = weniger Dateien beim Sync = kürzere Deploy-Zeit. CloudFront wird nur invalidiert, wenn sich wirklich etwas geändert hat.

## Dateien

| Datei | Zweck |
|-------|--------|
| **deploy-aws-website.env** | Bucket, CloudFront-Distribution, Region, Live-URL. Hier anpassen, wenn sich AWS-Ressourcen ändern. |
| **deploy-aws-exclude.txt** | Was **nicht** nach S3 soll. Eine Zeile = ein Muster. Neue Ordner/Dateitypen hier eintragen – gelten für alle zukünftigen Deploys. |

## Verwendung

- **Schnell (nur geänderte Dateien):** `./deploy-aws-website.sh --quick` → oft in Sekunden
- **Normal (alles prüfen):** `./deploy-aws-website.sh`
- **Testen ohne Upload:** `./deploy-aws-website.sh --dry-run`
- **S3 aufräumen (löscht in S3, was lokal fehlt):** `./deploy-aws-website.sh --cleanup` → kann Minuten dauern
- **Mit Git + Deploy:** `./🚀_DEPLOY_ALL.sh` (ruft intern `deploy-aws-website.sh` auf)

## Neue Dateien/Ordner ausschließen

In **deploy-aws-exclude.txt** eine neue Zeile hinzufügen, z. B.:

- `mein-neuer-ordner/*`
- `*.intern`

Kein `#` davor, dann wird das Muster beim nächsten Deploy angewendet.

## Cursor-Extensions neu einrichten

Bei Renderer-Crashes kann ein sauberes Neu-Einrichten der Extensions helfen.

- **Alles in einem (empfohlen):** In **Terminal.app** oder **iTerm** (nicht im Cursor-Terminal) ausführen:  
  `./config/cursor-extensions-refresh.sh`  
  Das Skript deinstalliert alle Extensions, startet Cursor neu und installiert sie wieder.

- **Manuell:**  
  1. `./config/cursor-extensions-uninstall.sh`  
  2. Cursor beenden und neu starten  
  3. `./config/cursor-extensions-reinstall.sh`

Backup-Liste der IDs: `config/cursor-extensions-backup.txt`. Die Skripte nutzen die Cursor-CLI.
