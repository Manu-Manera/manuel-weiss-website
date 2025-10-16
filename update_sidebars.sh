#!/bin/bash

# Social RAISEC
sed -i '' '/<!-- Sidebar -->/,/<\/div>/c\
                <!-- Sidebar -->\
                <div class="sidebar">\
                    <div class="sidebar-card">\
                        <h3>📚 Empfohlene Ressourcen</h3>\
                        <ul>\
                            <li>Soziale Kompetenz-Trainings</li>\
                            <li>Kommunikationskurse</li>\
                            <li>Empathie-Workshops</li>\
                            <li>Teamarbeit-Seminare</li>\
                        </ul>\
                    </div>\
\
                    <div class="sidebar-card">\
                        <h3>🎯 Berufsfelder</h3>\
                        <ul>\
                            <li>Sozialarbeit</li>\
                            <li>Pädagogik & Bildung</li>\
                            <li>Gesundheitswesen</li>\
                            <li>Beratung & Coaching</li>\
                            <li>HR & Personalwesen</li>\
                        </ul>\
                    </div>\
                </div>' methods/raisec/social-raisec.html

# Enterprising RAISEC
sed -i '' '/<!-- Sidebar -->/,/<\/div>/c\
                <!-- Sidebar -->\
                <div class="sidebar">\
                    <div class="sidebar-card">\
                        <h3>📚 Empfohlene Ressourcen</h3>\
                        <ul>\
                            <li>Führungskräfte-Trainings</li>\
                            <li>Unternehmertum-Kurse</li>\
                            <li>Networking-Events</li>\
                            <li>Business-Planung</li>\
                        </ul>\
                    </div>\
\
                    <div class="sidebar-card">\
                        <h3>🎯 Berufsfelder</h3>\
                        <ul>\
                            <li>Management & Führung</li>\
                            <li>Vertrieb & Marketing</li>\
                            <li>Unternehmertum</li>\
                            <li>Beratung</li>\
                            <li>Politik & Verwaltung</li>\
                        </ul>\
                    </div>\
                </div>' methods/raisec/enterprising-raisec.html

# Conventional RAISEC
sed -i '' '/<!-- Sidebar -->/,/<\/div>/c\
                <!-- Sidebar -->\
                <div class="sidebar">\
                    <div class="sidebar-card">\
                        <h3>📚 Empfohlene Ressourcen</h3>\
                        <ul>\
                            <li>Büroorganisation-Kurse</li>\
                            <li>Datenverarbeitung</li>\
                            <li>Projektmanagement</li>\
                            <li>Qualitätsmanagement</li>\
                        </ul>\
                    </div>\
\
                    <div class="sidebar-card">\
                        <h3>🎯 Berufsfelder</h3>\
                        <ul>\
                            <li>Büro & Verwaltung</li>\
                            <li>Finanzwesen</li>\
                            <li>Datenverarbeitung</li>\
                            <li>Qualitätskontrolle</li>\
                            <li>Logistik</li>\
                        </ul>\
                    </div>\
                </div>' methods/raisec/conventional-raisec.html

echo "Sidebar-Strukturen für alle RAISEC-Seiten aktualisiert!"
