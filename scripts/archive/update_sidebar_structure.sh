#!/bin/bash

# Social RAISEC - Korrigiere Sidebar-Struktur
sed -i '' '/<!-- Sidebar -->/,/<\/div>/c\
                <!-- Sidebar -->\
                <div class="sidebar">\
                    <div class="sidebar-card">\
                        <h3>💡 Tipps für soziale Typen</h3>\
                        <ul>\
                            <li>Verbessere deine Kommunikationsfähigkeiten</li>\
                            <li>Lerne Konfliktlösung</li>\
                            <li>Übe Teamarbeit</li>\
                            <li>Entwickle Führungsqualitäten</li>\
                        </ul>\
                    </div>\
\
                    <div class="sidebar-card">\
                        <h3>🔗 Verwandte Methoden</h3>\
                        <ul>\
                            <li><a href="../ikigai/index-ikigai.html">Ikigai</a></li>\
                            <li><a href="../swot/index-swot.html">SWOT</a></li>\
                            <li><a href="../wheel-of-life/index-wheel-of-life.html">Wheel of Life</a></li>\
                        </ul>\
                    </div>\
\
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

# Enterprising RAISEC - Korrigiere Sidebar-Struktur
sed -i '' '/<!-- Sidebar -->/,/<\/div>/c\
                <!-- Sidebar -->\
                <div class="sidebar">\
                    <div class="sidebar-card">\
                        <h3>💡 Tipps für unternehmerische Typen</h3>\
                        <ul>\
                            <li>Entwickle deine Führungsqualitäten</li>\
                            <li>Baue ein starkes Netzwerk auf</li>\
                            <li>Lerne Verhandlungsgeschick</li>\
                            <li>Übe Präsentationsfähigkeiten</li>\
                        </ul>\
                    </div>\
\
                    <div class="sidebar-card">\
                        <h3>🔗 Verwandte Methoden</h3>\
                        <ul>\
                            <li><a href="../ikigai/index-ikigai.html">Ikigai</a></li>\
                            <li><a href="../swot/index-swot.html">SWOT</a></li>\
                            <li><a href="../wheel-of-life/index-wheel-of-life.html">Wheel of Life</a></li>\
                        </ul>\
                    </div>\
\
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

# Conventional RAISEC - Korrigiere Sidebar-Struktur
sed -i '' '/<!-- Sidebar -->/,/<\/div>/c\
                <!-- Sidebar -->\
                <div class="sidebar">\
                    <div class="sidebar-card">\
                        <h3>💡 Tipps für konventionelle Typen</h3>\
                        <ul>\
                            <li>Entwickle deine Organisationsfähigkeiten</li>\
                            <li>Lerne neue Software-Tools</li>\
                            <li>Übe präzises Arbeiten</li>\
                            <li>Verbessere deine Zeitplanung</li>\
                        </ul>\
                    </div>\
\
                    <div class="sidebar-card">\
                        <h3>🔗 Verwandte Methoden</h3>\
                        <ul>\
                            <li><a href="../ikigai/index-ikigai.html">Ikigai</a></li>\
                            <li><a href="../swot/index-swot.html">SWOT</a></li>\
                            <li><a href="../wheel-of-life/index-wheel-of-life.html">Wheel of Life</a></li>\
                        </ul>\
                    </div>\
\
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

echo "Sidebar-Strukturen für alle RAISEC-Seiten auf das Realistic-Format umgestellt!"
