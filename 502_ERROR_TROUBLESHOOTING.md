# 502 Bad Gateway Error - Troubleshooting Guide

## Problem
Der 502-Fehler tritt auf, wenn:
- Netlify Functions nicht deployed sind
- AWS API Gateway nicht verfügbar ist
- Lambda Functions einen Fehler haben
- Timeout bei API-Calls

## Lösungen

### 1. Netlify Functions prüfen
```bash
# Prüfe ob Functions deployed sind
netlify functions:list

# Teste Function lokal
netlify functions:serve
```

### 2. AWS API Gateway prüfen
```bash
# Prüfe API Gateway Status
aws apigateway get-rest-apis --region eu-central-1

# Prüfe Lambda Function Status
aws lambda get-function --function-name <function-name> --region eu-central-1
```

### 3. Error-Handling verbessert
- Alle Functions haben jetzt besseres Error-Handling
- 502/503/504 Fehler werden erkannt und klar gemeldet
- Retry-Logik im Frontend

### 4. Frontend Error-Handling
- Klare Fehlermeldungen für Benutzer
- Automatische Retry-Versuche
- Fallback-Mechanismen

## Nächste Schritte
1. Prüfe Netlify Dashboard → Functions → Logs
2. Prüfe AWS CloudWatch → Lambda Logs
3. Teste Functions lokal mit `netlify dev`















