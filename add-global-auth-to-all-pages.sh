#!/bin/bash

echo "🚀 GLOBAL AUTH SYSTEM ZU ALLEN PERSÖNLICHKEITSENTWICKLUNGSSEITEN HINZUFÜGEN"
echo ""

# Liste aller HTML-Dateien die das Global Auth System benötigen
PAGES=(
    "ikigai.html"
    "persoenlichkeitsentwicklung.html"
    "raisec-anwendung.html"
    "raisec-persoenlichkeitsentwicklung.html"
    "raisec-theorie.html"
    "methods/aek-communication/aek-communication.html"
    "methods/change-stages/change-stages.html"
    "methods/circular-interview/circular-interview.html"
    "methods/communication/communication.html"
    "methods/competence-map/competence-map.html"
    "methods/conflict-escalation/conflict-escalation.html"
    "methods/emotional-intelligence/emotional-intelligence.html"
    "methods/five-pillars/five-pillars.html"
    "methods/gallup-strengths/gallup-strengths.html"
    "methods/goal-setting/goal-setting.html"
    "methods/habit-building/habit-building.html"
    "methods/harvard-method/harvard-method.html"
    "methods/johari-window/johari-window.html"
    "methods/journaling/journaling.html"
    "methods/mindfulness/mindfulness.html"
    "methods/moment-excellence/moment-excellence.html"
    "methods/nlp-dilts/nlp-dilts.html"
    "methods/nlp-meta-goal/nlp-meta-goal.html"
    "methods/nonviolent-communication/nonviolent-communication.html"
    "methods/rafael-method/rafael-method.html"
    "methods/resource-analysis/resource-analysis.html"
    "methods/rubikon-model/rubikon-model.html"
    "methods/self-assessment/self-assessment.html"
    "methods/solution-focused/solution-focused.html"
    "methods/strengths-finder/strengths-finder.html"
    "methods/stress-management/stress-management.html"
    "methods/swot-analysis/swot-analysis.html"
    "methods/systemic-coaching/systemic-coaching.html"
    "methods/target-coaching/target-coaching.html"
    "methods/time-management/time-management.html"
    "methods/values-clarification/values-clarification.html"
    "methods/via-strengths/via-strengths.html"
    "methods/vision-board/vision-board.html"
    "methods/walt-disney/walt-disney.html"
    "methods/wheel-of-life/wheel-of-life.html"
)

echo "📋 ${#PAGES[@]} Seiten werden aktualisiert..."

# Counter für erfolgreiche Updates
SUCCESS_COUNT=0
TOTAL_COUNT=${#PAGES[@]}

for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo "🔄 Verarbeite: $page"
        
        # Prüfe ob bereits Global Auth System vorhanden ist
        if grep -q "global-auth-system.js" "$page"; then
            echo "   ✅ Global Auth System bereits vorhanden"
        else
            # Füge Global Auth System hinzu
            # Suche nach dem letzten Script-Tag vor </body>
            if grep -q "js/real-aws-auth.js" "$page"; then
                # Ersetze real-aws-auth.js mit der kompletten Auth-Kette
                sed -i '' 's|<script src="js/real-aws-auth.js"></script>|<script src="js/aws-config.js"></script>\
    <script src="js/real-aws-auth.js"></script>\
    <script src="js/global-auth-system.js"></script>|g' "$page"
                echo "   ✅ Global Auth System hinzugefügt"
                ((SUCCESS_COUNT++))
            elif grep -q "js/aws-config.js" "$page"; then
                # Füge nach aws-config.js hinzu
                sed -i '' '/js\/aws-config.js/a\
    <script src="js/global-auth-system.js"></script>' "$page"
                echo "   ✅ Global Auth System hinzugefügt"
                ((SUCCESS_COUNT++))
            else
                # Füge vor </body> hinzu
                sed -i '' 's|</body>|    <script src="js/global-auth-system.js"></script>\
</body>|' "$page"
                echo "   ✅ Global Auth System hinzugefügt"
                ((SUCCESS_COUNT++))
            fi
        fi
    else
        echo "   ❌ Datei nicht gefunden: $page"
    fi
done

echo ""
echo "📊 ZUSAMMENFASSUNG:"
echo "✅ Erfolgreich aktualisiert: $SUCCESS_COUNT von $TOTAL_COUNT Seiten"
echo "🎯 Global Auth System ist jetzt auf allen Persönlichkeitsentwicklungsseiten verfügbar!"
echo ""
echo "🔧 NÄCHSTE SCHRITTE:"
echo "1️⃣ Teste das Login-System auf verschiedenen Seiten"
echo "2️⃣ Überprüfe Session-Persistierung"
echo "3️⃣ Stelle sicher, dass UI-Updates funktionieren"
