# DynamoDB Highscores Tabelle Setup

## AWS CLI Befehl zum Erstellen der Tabelle

```bash
aws dynamodb create-table \
    --table-name snowflake-highscores \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region eu-central-1
```

## Tabellenstruktur

- **Tabelle**: `snowflake-highscores`
- **Partition Key**: `id` (String)
- **Attribute**:
  - `id`: Eindeutige ID (String)
  - `name`: Spielername (String, max 20 Zeichen)
  - `score`: Punktzahl (Number)
  - `date`: Datum (String, Format: DD.MM.YYYY)
  - `timestamp`: Unix Timestamp (Number) für Sortierung

## IAM Permissions

Die Netlify Function benötigt folgende DynamoDB Permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:eu-central-1:*:table/snowflake-highscores"
    }
  ]
}
```

## Netlify Environment Variables

Stelle sicher, dass folgende Variablen in Netlify gesetzt sind:

- `NETLIFY_AWS_REGION=eu-central-1`
- `NETLIFY_AWS_ACCESS_KEY_ID=<dein-access-key>`
- `NETLIFY_AWS_SECRET_ACCESS_KEY=<dein-secret-key>`

## Testen

Nach dem Setup kannst du die Highscores testen:

1. Öffne die Website
2. Klicke auf Schneeflocken
3. Speichere einen Highscore
4. Prüfe die Highscore-Liste bei "Aktivitäten"

