# 🎮 WebSocket Multiplayer - Deploy Anleitung

## Übersicht

Das WebSocket-System ermöglicht Echtzeit-Multiplayer für alle Spiele.

## Komponenten

```
infrastructure/lib/websocket-stack.ts    # CDK Stack Definition
lambda/websocket-connect/                # Connect Handler
lambda/websocket-disconnect/             # Disconnect Handler  
lambda/websocket-message/                # Message Handler (Game Logic)
js/game-websocket.js                     # Frontend Client
```

## Deploy Schritte

### 1. Lambda Dependencies installieren

```bash
cd lambda/websocket-connect && npm install && cd ..
cd websocket-disconnect && npm install && cd ..
cd websocket-message && npm install && cd ..
```

### 2. CDK Stack deployen

```bash
cd infrastructure

# Falls noch nicht geschehen:
npm install

# WebSocket Stack deployen
npx cdk deploy WebSocketStack --profile manuel-weiss
```

### 3. WebSocket URL im Frontend konfigurieren

Nach dem Deploy wird die WebSocket URL ausgegeben. Diese im Browser speichern:

```javascript
// In der Browser-Konsole auf manuel-weiss.ch/games.html:
localStorage.setItem('game_websocket_url', 'wss://XXXXXX.execute-api.eu-central-1.amazonaws.com/prod');
```

Oder in `js/game-websocket.js` direkt eintragen.

## API Nachrichten

### Client → Server

| Action | Beschreibung |
|--------|--------------|
| `get_online_players` | Online-Spieler abrufen |
| `invite_player` | Spieler einladen |
| `accept_invite` | Einladung annehmen |
| `decline_invite` | Einladung ablehnen |
| `game_move` | Spielzug senden |
| `chat_message` | Chat-Nachricht senden |
| `leave_game` | Spiel verlassen |
| `heartbeat` | Keep-Alive |

### Server → Client

| Type | Beschreibung |
|------|--------------|
| `online_players` | Liste der Online-Spieler |
| `game_invite` | Eingehende Einladung |
| `invite_sent` | Einladung bestätigt |
| `invite_declined` | Einladung abgelehnt |
| `game_start` | Spiel startet |
| `game_move` | Zug vom Gegner |
| `chat_message` | Chat vom Gegner |
| `opponent_disconnected` | Gegner offline |

## Kosten (geschätzt)

| Service | Kosten |
|---------|--------|
| API Gateway WebSocket | ~$1/Million Nachrichten |
| Lambda | ~$0.20/Million Requests |
| DynamoDB | ~$1-2/Monat (On-Demand) |
| **Gesamt** | ~$3-5/Monat |

## Troubleshooting

### WebSocket verbindet nicht
1. Prüfe ob URL korrekt in localStorage
2. Prüfe CloudWatch Logs der Lambda Functions
3. Prüfe ob User eingeloggt ist

### Nachrichten kommen nicht an
1. Prüfe DynamoDB Connections Tabelle
2. Prüfe Lambda Permissions für API Gateway
3. Prüfe WebSocket Stage deployed

## Fallback

Wenn WebSocket nicht verfügbar ist, verwendet das System automatisch simulierte Spieler für Demo-Zwecke.
