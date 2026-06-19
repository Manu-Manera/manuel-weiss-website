# Telegram Productivity Bot - Setup

Erfasse deine Arbeitszeit per Telegram-Nachricht. DSGVO/DSG-konform.

## Quick Start

### 1. Bot bei Telegram erstellen (2 Minuten)

1. Öffne Telegram und suche **@BotFather**
2. Sende `/newbot`
3. Wähle einen Namen: z.B. `Manuel Productivity Bot`
4. Wähle einen Username: z.B. `manuel_productivity_bot` (muss auf `_bot` enden)
5. **Kopiere den Token** (sieht so aus: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Deine Chat-ID finden

1. Schreibe deinem neuen Bot eine beliebige Nachricht
2. Öffne im Browser: `https://api.telegram.org/bot<DEIN_TOKEN>/getUpdates`
3. Suche nach `"chat":{"id":` - die Zahl danach ist deine Chat-ID

### 3. Bot deployen

```bash
# Token und Chat-ID setzen
export TELEGRAM_BOT_TOKEN='1234567890:ABCdefGHIjklMNOpqrsTUVwxyz'
export ALLOWED_CHAT_ID='123456789'

# Deployen
cd "/Users/manumanera/Documents/GitHub/Persönliche Website"
./scripts/deploy-telegram-bot.sh
```

## Nutzung

### Einträge erfassen

Schreibe einfach was du gemacht hast:

```
2h Horizon Support-Call
30min Cistec Doku geschrieben
1.5h Knauf Training vorbereitet
45min internes Meeting
```

Der Bot erkennt automatisch:
- **Zeit**: 2h, 30min, 1.5h, 45min
- **Kunden**: Horizon, Cistec, Knauf, HR Campus, Akyurek, Lonza, Bayer, Intern
- **Typ**: Meeting, Support, Doku, Code, Demo, Training, etc.

### Befehle

- `/start` - Begrüßung und Hilfe
- `/heute` - Zeigt was du heute erfasst hast
- `/help` - Ausführliche Hilfe

### Reminder

Der Bot erinnert dich **täglich um 17:00 Uhr** (Mo-Fr):
> "Was hast du heute geschafft?"

## Datensicherheit

✅ **DSGVO/DSG-konform**

- AWS Region: `eu-central-1` (Frankfurt)
- Keine Chat-History gespeichert
- Nur extrahierte Artefakte werden gespeichert
- Verschlüsselung at rest und in transit
- Nur deine Chat-ID hat Zugriff

## Technische Details

### Architektur

```
Telegram → API Gateway → Lambda → DynamoDB
                           ↓
                    OpenAI (NLP Parsing)
```

### AWS Ressourcen

- Lambda: `telegram-productivity-bot` (Webhook)
- Lambda: `telegram-productivity-reminder` (17:00 Cron)
- API Gateway: `telegram-productivity-api`
- CloudWatch Event: `telegram-productivity-reminder-daily`

### Environment Variables

| Variable | Beschreibung |
|----------|--------------|
| `TELEGRAM_BOT_TOKEN` | Bot-Token von BotFather |
| `ALLOWED_CHAT_ID` | Deine Chat-ID (Sicherheit) |
| `OPENAI_API_KEY` | Wird automatisch aus AWS geladen |

## Troubleshooting

### Bot antwortet nicht

1. Prüfe Webhook: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
2. Prüfe Lambda Logs: AWS Console → CloudWatch → Log Groups → `/aws/lambda/telegram-productivity-bot`

### Falscher Kunde/Typ erkannt

Der Bot nutzt OpenAI für besseres Parsing. Falls nicht verfügbar, wird ein einfacher Regex-Parser verwendet.

### Reminder kommt nicht

Prüfe CloudWatch Events in der AWS Console. Die Zeit ist 15:00 UTC (= 17:00 CEST).
