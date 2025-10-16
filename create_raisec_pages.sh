#!/bin/bash

# Erstelle alle RAISEC-Seiten mit korrekter Struktur und Inhalten
echo "Erstelle alle RAISEC-Seiten mit korrekter Struktur..."

# Kopiere die Realistic-Seite als Basis für alle anderen
cp methods/raisec/realistic-raisec.html methods/raisec/template.html

# Erstelle Investigative-Seite
echo "Erstelle Investigative-Seite..."
cp methods/raisec/template.html methods/raisec/investigative-raisec.html
sed -i '' 's/Realistisch (R)/Investigativ (I)/g' methods/raisec/investigative-raisec.html
sed -i '' 's/🔧/🔬/g' methods/raisec/investigative-raisec.html
sed -i '' 's/realistisch/investigativ/g' methods/raisec/investigative-raisec.html
sed -i '' 's/Realistisch/Investigativ/g' methods/raisec/investigative-raisec.html
sed -i '' 's/realistic/investigative/g' methods/raisec/investigative-raisec.html
sed -i '' 's/realistic-styles.css/investigative-styles.css/g' methods/raisec/investigative-raisec.html
sed -i '' 's/realistic-form/investigative-form/g' methods/raisec/investigative-raisec.html
sed -i '' 's/realistic-raisec.html/artistic-raisec.html/g' methods/raisec/investigative-raisec.html

# Erstelle Artistic-Seite
echo "Erstelle Artistic-Seite..."
cp methods/raisec/template.html methods/raisec/artistic-raisec.html
sed -i '' 's/Realistisch (R)/Künstlerisch (A)/g' methods/raisec/artistic-raisec.html
sed -i '' 's/🔧/🎨/g' methods/raisec/artistic-raisec.html
sed -i '' 's/realistisch/künstlerisch/g' methods/raisec/artistic-raisec.html
sed -i '' 's/Realistisch/Künstlerisch/g' methods/raisec/artistic-raisec.html
sed -i '' 's/realistic/artistic/g' methods/raisec/artistic-raisec.html
sed -i '' 's/realistic-styles.css/artistic-styles.css/g' methods/raisec/artistic-raisec.html
sed -i '' 's/realistic-form/artistic-form/g' methods/raisec/artistic-raisec.html
sed -i '' 's/realistic-raisec.html/social-raisec.html/g' methods/raisec/artistic-raisec.html

# Erstelle Social-Seite
echo "Erstelle Social-Seite..."
cp methods/raisec/template.html methods/raisec/social-raisec.html
sed -i '' 's/Realistisch (R)/Sozial (S)/g' methods/raisec/social-raisec.html
sed -i '' 's/🔧/👥/g' methods/raisec/social-raisec.html
sed -i '' 's/realistisch/sozial/g' methods/raisec/social-raisec.html
sed -i '' 's/Realistisch/Sozial/g' methods/raisec/social-raisec.html
sed -i '' 's/realistic/social/g' methods/raisec/social-raisec.html
sed -i '' 's/realistic-styles.css/social-styles.css/g' methods/raisec/social-raisec.html
sed -i '' 's/realistic-form/social-form/g' methods/raisec/social-raisec.html
sed -i '' 's/realistic-raisec.html/enterprising-raisec.html/g' methods/raisec/social-raisec.html

# Erstelle Enterprising-Seite
echo "Erstelle Enterprising-Seite..."
cp methods/raisec/template.html methods/raisec/enterprising-raisec.html
sed -i '' 's/Realistisch (R)/Unternehmerisch (E)/g' methods/raisec/enterprising-raisec.html
sed -i '' 's/🔧/💼/g' methods/raisec/enterprising-raisec.html
sed -i '' 's/realistisch/unternehmerisch/g' methods/raisec/enterprising-raisec.html
sed -i '' 's/Realistisch/Unternehmerisch/g' methods/raisec/enterprising-raisec.html
sed -i '' 's/realistic/enterprising/g' methods/raisec/enterprising-raisec.html
sed -i '' 's/realistic-styles.css/enterprising-styles.css/g' methods/raisec/enterprising-raisec.html
sed -i '' 's/realistic-form/enterprising-form/g' methods/raisec/enterprising-raisec.html
sed -i '' 's/realistic-raisec.html/conventional-raisec.html/g' methods/raisec/enterprising-raisec.html

# Erstelle Conventional-Seite
echo "Erstelle Conventional-Seite..."
cp methods/raisec/template.html methods/raisec/conventional-raisec.html
sed -i '' 's/Realistisch (R)/Konventionell (C)/g' methods/raisec/conventional-raisec.html
sed -i '' 's/🔧/📊/g' methods/raisec/conventional-raisec.html
sed -i '' 's/realistisch/konventionell/g' methods/raisec/conventional-raisec.html
sed -i '' 's/Realistisch/Konventionell/g' methods/raisec/conventional-raisec.html
sed -i '' 's/realistic/conventional/g' methods/raisec/conventional-raisec.html
sed -i '' 's/realistic-styles.css/conventional-styles.css/g' methods/raisec/conventional-raisec.html
sed -i '' 's/realistic-form/conventional-form/g' methods/raisec/conventional-raisec.html
sed -i '' 's/realistic-raisec.html/raisec-results.html/g' methods/raisec/conventional-raisec.html

# Lösche die Template-Datei
rm methods/raisec/template.html

echo "Alle RAISEC-Seiten mit korrekter Struktur erstellt!"
