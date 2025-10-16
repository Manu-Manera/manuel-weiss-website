#!/bin/bash

# Kopiere die korrekte HTML-Struktur von realistic-raisec.html auf alle anderen RAISEC-Seiten
for file in methods/raisec/investigative-raisec.html methods/raisec/artistic-raisec.html methods/raisec/social-raisec.html methods/raisec/enterprising-raisec.html methods/raisec/conventional-raisec.html; do
  echo "Korrigiere $file..."
  
  # Erstelle eine temporäre Datei mit der korrekten Struktur
  cat > temp_structure.html << 'STRUCTURE_EOF'
    <!-- Main Content -->
    <section class="main-content">
        <div class="container">
            <div class="content-grid">
                <!-- Fragen Section -->
                <div class="questions-section">
STRUCTURE_EOF

  # Finde den Beginn der Main Content Section und ersetze sie
  sed -i '' '/<!-- Main Content -->/,/<!-- Sidebar -->/c\
    <!-- Main Content -->\
    <section class="main-content">\
        <div class="container">\
            <div class="content-grid">\
                <!-- Fragen Section -->\
                <div class="questions-section">' "$file"
done

echo "HTML-Struktur für alle RAISEC-Seiten korrigiert!"
