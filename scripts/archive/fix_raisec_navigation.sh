#!/bin/bash

echo "Korrigiere Navigation für alle RAISEC-Seiten..."

# Investigative -> Artistic
sed -i '' 's/href="investigative-raisec.html" class="btn-primary">Weiter zu Investigativ/href="artistic-raisec.html" class="btn-primary">Weiter zu Künstlerisch/g' methods/raisec/investigative-raisec.html

# Artistic -> Social  
sed -i '' 's/href="artistic-raisec.html" class="btn-primary">Weiter zu Künstlerisch/href="social-raisec.html" class="btn-primary">Weiter zu Sozial/g' methods/raisec/artistic-raisec.html

# Social -> Enterprising
sed -i '' 's/href="social-raisec.html" class="btn-primary">Weiter zu Sozial/href="enterprising-raisec.html" class="btn-primary">Weiter zu Unternehmerisch/g' methods/raisec/social-raisec.html

# Enterprising -> Conventional
sed -i '' 's/href="enterprising-raisec.html" class="btn-primary">Weiter zu Unternehmerisch/href="conventional-raisec.html" class="btn-primary">Weiter zu Konventionell/g' methods/raisec/enterprising-raisec.html

# Conventional -> Results
sed -i '' 's/href="conventional-raisec.html" class="btn-primary">Weiter zu Konventionell/href="raisec-results.html" class="btn-primary">Weiter zu Auswertung/g' methods/raisec/conventional-raisec.html

echo "Navigation für alle RAISEC-Seiten korrigiert!"
