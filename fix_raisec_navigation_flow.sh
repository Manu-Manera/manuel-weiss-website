#!/bin/bash

echo "Korrigiere RAISEC-Navigation-Flow für alle Seiten..."

# Korrekte RAISEC-Reihenfolge: Realistisch -> Investigativ -> Künstlerisch -> Sozial -> Unternehmerisch -> Konventionell -> Auswertung

# Realistisch -> Investigativ
sed -i '' 's/href="artistic-raisec.html" class="btn-primary">Weiter zu Künstlerisch/href="investigative-raisec.html" class="btn-primary">Weiter zu Investigativ/g' methods/raisec/realistic-raisec.html

# Investigativ -> Künstlerisch  
sed -i '' 's/href="artistic-raisec.html" class="btn-primary">Weiter zu Künstlerisch/href="artistic-raisec.html" class="btn-primary">Weiter zu Künstlerisch/g' methods/raisec/investigative-raisec.html

# Künstlerisch -> Sozial
sed -i '' 's/href="investigative-raisec.html" class="btn-primary">Weiter zu Sozial/href="social-raisec.html" class="btn-primary">Weiter zu Sozial/g' methods/raisec/artistic-raisec.html

# Sozial -> Unternehmerisch
sed -i '' 's/href="enterprising-raisec.html" class="btn-primary">Weiter zu Unternehmerisch/href="enterprising-raisec.html" class="btn-primary">Weiter zu Unternehmerisch/g' methods/raisec/social-raisec.html

# Unternehmerisch -> Konventionell
sed -i '' 's/href="conventional-raisec.html" class="btn-primary">Weiter zu Konventionell/href="conventional-raisec.html" class="btn-primary">Weiter zu Konventionell/g' methods/raisec/enterprising-raisec.html

# Konventionell -> Auswertung
sed -i '' 's/href="raisec-results.html" class="btn-primary">Weiter zu Auswertung/href="raisec-results.html" class="btn-primary">Weiter zu Auswertung/g' methods/raisec/conventional-raisec.html

echo "RAISEC-Navigation-Flow korrigiert!"
