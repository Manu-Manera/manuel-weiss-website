#!/bin/bash

echo "Erstelle alle RAISEC-Seiten mit vollständigen 6 Fragen und korrekter Sidebar-Struktur..."

# Kopiere die komplette Realistic-Seite als Basis
cp methods/raisec/realistic-raisec.html methods/raisec/template-complete.html

# Erstelle alle RAISEC-Seiten mit vollständigen Inhalten
for type in investigative artistic social enterprising conventional; do
  echo "Erstelle $type RAISEC-Seite mit 6 Fragen..."
  
  # Kopiere die komplette Struktur
  cp methods/raisec/template-complete.html methods/raisec/${type}-raisec.html
  
  # Ersetze die Inhalte je nach Typ
  case $type in
    "investigative")
      sed -i '' 's/Realistisch (R)/Investigativ (I)/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/🔧/🔬/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistisch/investigativ/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/Realistisch/Investigativ/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic/investigative/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic-styles.css/investigative-styles.css/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic-form/investigative-form/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic-raisec.html/artistic-raisec.html/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/Weiter zu Investigativ/Weiter zu Künstlerisch/g' methods/raisec/${type}-raisec.html
      ;;
    "artistic")
      sed -i '' 's/Realistisch (R)/Künstlerisch (A)/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/🔧/🎨/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistisch/künstlerisch/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/Realistisch/Künstlerisch/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic/artistic/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic-styles.css/artistic-styles.css/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic-form/artistic-form/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic-raisec.html/social-raisec.html/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/Weiter zu Investigativ/Weiter zu Sozial/g' methods/raisec/${type}-raisec.html
      ;;
    "social")
      sed -i '' 's/Realistisch (R)/Sozial (S)/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/🔧/👥/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistisch/sozial/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/Realistisch/Sozial/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic/social/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic-styles.css/social-styles.css/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic-form/social-form/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic-raisec.html/enterprising-raisec.html/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/Weiter zu Investigativ/Weiter zu Unternehmerisch/g' methods/raisec/${type}-raisec.html
      ;;
    "enterprising")
      sed -i '' 's/Realistisch (R)/Unternehmerisch (E)/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/🔧/💼/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistisch/unternehmerisch/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/Realistisch/Unternehmerisch/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic/enterprising/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic-styles.css/enterprising-styles.css/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic-form/enterprising-form/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic-raisec.html/conventional-raisec.html/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/Weiter zu Investigativ/Weiter zu Konventionell/g' methods/raisec/${type}-raisec.html
      ;;
    "conventional")
      sed -i '' 's/Realistisch (R)/Konventionell (C)/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/🔧/📊/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistisch/konventionell/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/Realistisch/Konventionell/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic/conventional/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic-styles.css/conventional-styles.css/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic-form/conventional-form/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/realistic-raisec.html/raisec-results.html/g' methods/raisec/${type}-raisec.html
      sed -i '' 's/Weiter zu Investigativ/Weiter zu Auswertung/g' methods/raisec/${type}-raisec.html
      ;;
  esac
done

# Lösche die Template-Datei
rm methods/raisec/template-complete.html

echo "Alle RAISEC-Seiten mit vollständigen 6 Fragen und korrekter Sidebar-Struktur erstellt!"
