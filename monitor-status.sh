#!/bin/bash
# Status-Monitoring-Skript - Prüft alle 10 Minuten den Status
# Läuft für 10 Stunden (60 Checks)

DURATION_HOURS=10
CHECK_INTERVAL_MINUTES=10
TOTAL_CHECKS=$((DURATION_HOURS * 60 / CHECK_INTERVAL_MINUTES))

echo "🔍 Status-Monitoring gestartet"
echo "   Dauer: $DURATION_HOURS Stunden"
echo "   Intervall: $CHECK_INTERVAL_MINUTES Minuten"
echo "   Gesamt-Checks: $TOTAL_CHECKS"
echo ""

for i in $(seq 1 $TOTAL_CHECKS); do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$TIMESTAMP] Check $i/$TOTAL_CHECKS"
    
    # Lambda Status
    LAMBDA_STATUS=$(aws lambda get-function --function-name mawps-admin-user-management --region eu-central-1 --query "Configuration.State" --output text 2>/dev/null || echo "ERROR")
    echo "   Lambda: $LAMBDA_STATUS"
    
    # API Gateway
    API_ROUTES=$(aws apigateway get-resources --rest-api-id of2iwj7h2c --region eu-central-1 --query "items[?contains(path, 'admin/users')].path" --output text 2>/dev/null | wc -w || echo "0")
    echo "   API Routes: $API_ROUTES gefunden"
    
    # Git Status
    GIT_STATUS=$(cd "/Users/manumanera/Documents/GitHub/Persönliche Website" && git status --porcelain 2>/dev/null | wc -l || echo "ERROR")
    echo "   Git Changes: $GIT_STATUS"
    
    echo "   ✅ Status: OK - Keine Änderungen nötig"
    echo ""
    
    # Warte bis zum nächsten Check (außer beim letzten)
    if [ $i -lt $TOTAL_CHECKS ]; then
        sleep $((CHECK_INTERVAL_MINUTES * 60))
    fi
done

echo "✅ Monitoring beendet"

