#!/bin/bash

echo "Korrigiere Navigation für alle RAISEC-Seiten..."

# Realistisch -> Investigativ
echo "Korrigiere Realistic -> Investigative..."
sed -i '' 's/href="investigative-raisec.html" class="btn-primary">Weiter zu Investigativ/href="investigative-raisec.html" class="btn-primary">Weiter zu Investigativ/g' methods/raisec/realistic-raisec.html

# Investigativ -> Künstlerisch
echo "Korrigiere Investigative -> Artistic..."
sed -i '' 's/href="artistic-raisec.html" class="btn-primary">Weiter zu Künstlerisch/href="artistic-raisec.html" class="btn-primary">Weiter zu Künstlerisch/g' methods/raisec/investigative-raisec.html

# Künstlerisch -> Sozial
echo "Korrigiere Artistic -> Social..."
sed -i '' 's/href="social-raisec.html" class="btn-primary">Weiter zu Sozial/href="social-raisec.html" class="btn-primary">Weiter zu Sozial/g' methods/raisec/artistic-raisec.html

# Sozial -> Unternehmerisch
echo "Korrigiere Social -> Enterprising..."
sed -i '' 's/href="enterprising-raisec.html" class="btn-primary">Weiter zu Unternehmerisch/href="enterprising-raisec.html" class="btn-primary">Weiter zu Unternehmerisch/g' methods/raisec/social-raisec.html

# Unternehmerisch -> Konventionell
echo "Korrigiere Enterprising -> Conventional..."
sed -i '' 's/href="conventional-raisec.html" class="btn-primary">Weiter zu Konventionell/href="conventional-raisec.html" class="btn-primary">Weiter zu Konventionell/g' methods/raisec/enterprising-raisec.html

# Konventionell -> Auswertung
echo "Korrigiere Conventional -> Results..."
sed -i '' 's/href="raisec-results.html" class="btn-primary">Weiter zu Auswertung/href="raisec-results.html" class="btn-primary">Weiter zu Auswertung/g' methods/raisec/conventional-raisec.html

echo "Alle RAISEC-Navigation korrigiert!"
