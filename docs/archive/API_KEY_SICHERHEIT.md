# 🔐 Sichere API-Key-Speicherung

## Übersicht

Die API-Keys (OpenAI, Anthropic, Google) werden **verschlüsselt** in AWS DynamoDB gespeichert. Dies erfüllt Amazons Sicherheitsanforderungen und schützt die Keys vor unbefugtem Zugriff.

## Verschlüsselungsmethode

### AES-256-GCM Verschlüsselung

- **Algorithmus**: AES-256-GCM (Advanced Encryption Standard mit Galois/Counter Mode)
- **Key-Derivation**: PBKDF2 mit 100.000 Iterationen
- **IV (Initialization Vector)**: 16 Bytes, zufällig generiert pro Verschlüsselung
- **Auth Tag**: Authentifizierung der verschlüsselten Daten

### Speicherformat

Verschlüsselte Keys werden im Format gespeichert:
```
{iv}:{authTag}:{encryptedData}
```

Alle Teile sind Base64-kodiert.

## Sicherheitsmerkmale

### ✅ Was geschützt ist

1. **API-Keys werden nie im Klartext gespeichert**
   - Weder in DynamoDB noch in CloudWatch Logs
   
2. **Benutzerspezifische Verschlüsselung**
   - Jeder User hat einen eigenen Verschlüsselungsschlüssel (abgeleitet aus User-ID)
   
3. **Authentizität**
   - GCM Mode stellt sicher, dass verschlüsselte Daten nicht manipuliert wurden

### ✅ Amazons Sicherheitsanforderungen

- **Keine Klartext-Secrets in Code**: ✅ Erfüllt
- **Keine Secrets in Logs**: ✅ Erfüllt (nur maskierte Keys werden geloggt)
- **Verschlüsselung at rest**: ✅ Erfüllt (AES-256-GCM)
- **Benutzer-Isolation**: ✅ Erfüllt (Keys sind an User-ID gebunden)

## Architektur

```
┌─────────────────────┐
│   Admin Panel       │
│   (Browser)         │
└─────────┬───────────┘
          │ API-Key (Klartext)
          ▼
┌─────────────────────┐
│   API Gateway       │
│   + Cognito Auth    │
└─────────┬───────────┘
          │ Autorisierter Request
          ▼
┌─────────────────────┐
│   Lambda Function   │
│   api-settings      │
│   ┌───────────────┐ │
│   │ encryptApiKey │ │  ←── Verschlüsselt mit AES-256-GCM
│   └───────────────┘ │
└─────────┬───────────┘
          │ Verschlüsselter Key
          ▼
┌─────────────────────┐
│   DynamoDB          │
│   mawps-api-settings│
│   ┌───────────────┐ │
│   │ apiKey:       │ │  ←── Format: iv:authTag:encrypted
│   │ "abc123:..."  │ │
│   └───────────────┘ │
└─────────────────────┘
```

## Verwendung

### API-Key speichern (Admin Panel)

```javascript
// Der Key wird automatisch verschlüsselt beim Speichern
await awsAPISettings.saveSettings({
    openai: {
        apiKey: 'sk-proj-...',
        model: 'gpt-4o-mini',
        maxTokens: 1000,
        temperature: 0.7
    }
});
```

### API-Key abrufen (für OCR, Anschreiben-Generierung)

```javascript
// Der Key wird automatisch entschlüsselt
const keyData = await awsAPISettings.getFullApiKey('openai');
// keyData.apiKey enthält den entschlüsselten Key
```

### API-Key anzeigen (maskiert)

```javascript
// Für Anzeige im Admin Panel - nur maskiert
const settings = await awsAPISettings.getSettings();
// settings.openai.keyMasked = "sk-p...abcd"
```

## Environment Variables

Die Lambda-Funktion benötigt:

| Variable | Beschreibung | Erforderlich |
|----------|--------------|--------------|
| `API_SETTINGS_TABLE` | DynamoDB Tabellenname | Ja |
| `ENCRYPTION_SECRET` | Geheimer Schlüssel für Verschlüsselung | Empfohlen |
| `KMS_KEY_ID` | AWS KMS Key (zusätzliche Sicherheit) | Optional |

## Migration von unverschlüsselten Keys

Bestehende unverschlüsselte Keys werden automatisch erkannt:
- Beim Speichern werden sie verschlüsselt
- Beim Lesen werden sie korrekt interpretiert (Legacy-Support)

## Troubleshooting

### "API-Key nicht gefunden"

1. Prüfe ob der User eingeloggt ist
2. Prüfe ob der Key im Admin Panel gespeichert wurde
3. Prüfe die CloudWatch Logs der Lambda-Funktion

### "Entschlüsselungsfehler"

1. Möglicherweise wurde `ENCRYPTION_SECRET` geändert
2. Speichere den Key erneut im Admin Panel

## Vergleich: Alt vs. Neu

| Aspekt | Alt | Neu |
|--------|-----|-----|
| Speicherung | Klartext | AES-256-GCM verschlüsselt |
| In DynamoDB | `sk-proj-abc123...` | `iv:authTag:encrypted` |
| Amazon Sicherheit | ❌ Nicht konform | ✅ Konform |
| Key-Rotation | Problematisch | Einfach (neu speichern) |
