#!/bin/bash

echo "Korrigiere Navigation-Buttons für alle RAISEC-Seiten..."

# Investigative -> Artistic
echo "Korrigiere Investigative Navigation..."
sed -i '' '/<!-- Navigation Buttons -->/,/<\/div>/c\
                        <!-- Navigation Buttons -->\
                        <div class="navigation-buttons">\
                            <a href="index-raisec.html" class="btn-secondary">Zurück zur Übersicht</a>\
                            <a href="artistic-raisec.html" class="btn-primary">Weiter zu Künstlerisch</a>\
                        </div>' methods/raisec/investigative-raisec.html

# Artistic -> Social
echo "Korrigiere Artistic Navigation..."
sed -i '' '/<!-- Navigation Buttons -->/,/<\/div>/c\
                        <!-- Navigation Buttons -->\
                        <div class="navigation-buttons">\
                            <a href="index-raisec.html" class="btn-secondary">Zurück zur Übersicht</a>\
                            <a href="social-raisec.html" class="btn-primary">Weiter zu Sozial</a>\
                        </div>' methods/raisec/artistic-raisec.html

# Social -> Enterprising
echo "Korrigiere Social Navigation..."
sed -i '' '/<!-- Navigation Buttons -->/,/<\/div>/c\
                        <!-- Navigation Buttons -->\
                        <div class="navigation-buttons">\
                            <a href="index-raisec.html" class="btn-secondary">Zurück zur Übersicht</a>\
                            <a href="enterprising-raisec.html" class="btn-primary">Weiter zu Unternehmerisch</a>\
                        </div>' methods/raisec/social-raisec.html

# Enterprising -> Conventional
echo "Korrigiere Enterprising Navigation..."
sed -i '' '/<!-- Navigation Buttons -->/,/<\/div>/c\
                        <!-- Navigation Buttons -->\
                        <div class="navigation-buttons">\
                            <a href="index-raisec.html" class="btn-secondary">Zurück zur Übersicht</a>\
                            <a href="conventional-raisec.html" class="btn-primary">Weiter zu Konventionell</a>\
                        </div>' methods/raisec/enterprising-raisec.html

# Conventional -> Results
echo "Korrigiere Conventional Navigation..."
sed -i '' '/<!-- Navigation Buttons -->/,/<\/div>/c\
                        <!-- Navigation Buttons -->\
                        <div class="navigation-buttons">\
                            <a href="index-raisec.html" class="btn-secondary">Zurück zur Übersicht</a>\
                            <a href="raisec-results.html" class="btn-primary">Weiter zu Auswertung</a>\
                        </div>' methods/raisec/conventional-raisec.html

echo "Alle RAISEC-Navigation-Buttons korrigiert!"
