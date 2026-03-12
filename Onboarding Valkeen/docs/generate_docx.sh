#!/bin/bash
# Erzeugt DOCX aus HTML mit kleineren Inline-Bildern (für Word optimiert)
# HTML: 260px (gut lesbar im Browser) | DOCX: 150px (kompakter in Word)

cd "$(dirname "$0")"
SRC="Tempus_Resource_Manager_Training_Komplett.html"
OUT="Tempus_Resource_Manager_Training_Komplett.docx"
TMP=".temp_docx_source.html"

# Kopie mit width="150" für fig-inline Bilder (Word interpretiert das)
sed 's/<div class="fig-item"><img src=/<div class="fig-item"><img width="150" src=/g' "$SRC" > "$TMP"

pandoc "$TMP" -o "$OUT" --resource-path=. --from=html

rm -f "$TMP"
echo "✓ $OUT erzeugt (Bilder: 150px Breite für Word)"
