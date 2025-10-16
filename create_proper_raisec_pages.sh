#!/bin/bash

echo "Erstelle alle RAISEC-Seiten mit korrekten Inhalten und Navigation..."

# Erstelle Investigative-Seite mit korrekten Inhalten
echo "Erstelle Investigative-Seite..."
cat > methods/raisec/investigative-raisec.html << 'INVESTIGATIVE_EOF'
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Investigativ (I) - RAISEC | Manuel Weiss</title>
    <link rel="stylesheet" href="css/raisec-smart-styles.css">
    <link rel="stylesheet" href="css/investigative-styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <!-- Progress Bar -->
    <div class="progress-container">
        <div class="progress-bar">
            <div class="progress-fill" style="width: 16.67%"></div>
        </div>
        <div class="progress-text">Schritt 1 von 6 - Investigativ</div>
    </div>

    <!-- Hero Section -->
    <section class="hero-section">
        <div class="hero-background">
            <div class="sparkling-stars"></div>
        </div>
        <div class="container">
            <div class="hero-content">
                <div class="hero-text">
                    <h1 class="hero-title">
                        <span class="title-icon">🔬</span>
                        Investigativ (I)
                    </h1>
                    <p class="hero-subtitle">
                        Forschend-analytisch, wissenschaftlich interessiert
                    </p>
                    <p class="hero-description">
                        Du löst gerne komplexe Probleme, arbeitest analytisch und wissenschaftlich. 
                        Forschung und Wissensdrang motivieren dich.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Main Content -->
    <section class="main-content">
        <div class="container">
            <div class="content-grid">
                <!-- Fragen Section -->
                <div class="questions-section">
                    <h2 class="section-title">Deine investigativen Interessen</h2>
                    <p class="section-subtitle">Beantworte die folgenden Fragen ehrlich und detailliert</p>
                    
                    <form class="questions-form" id="investigative-form">
                        <!-- Frage 1 -->
                        <div class="question-card">
                            <h3 class="question-title">1. Analytisches Denken</h3>
                            <p class="question-description">
                                Wie sehr interessierst du dich für analytisches Denken und Problemlösung?
                            </p>
                            <div class="question-hints">
                                <h4>Denkanstöße:</h4>
                                <div class="hints-sliders">
                                    <div class="hint-slider">
                                        <label>Analysierst du gerne komplexe Probleme?</label>
                                        <div class="slider-wrapper">
                                            <input type="range" name="analyze_problems_slider" min="1" max="10" value="5" class="hint-slider-input">
                                            <span class="slider-value">5</span>
                                        </div>
                                    </div>
                                    <div class="hint-slider">
                                        <label>Interessierst du dich für wissenschaftliche Methoden?</label>
                                        <div class="slider-wrapper">
                                            <input type="range" name="scientific_methods_slider" min="1" max="10" value="5" class="hint-slider-input">
                                            <span class="slider-value">5</span>
                                        </div>
                                    </div>
                                    <div class="hint-slider">
                                        <label>Führst du gerne Experimente durch?</label>
                                        <div class="slider-wrapper">
                                            <input type="range" name="conduct_experiments_slider" min="1" max="10" value="5" class="hint-slider-input">
                                            <span class="slider-value">5</span>
                                        </div>
                                    </div>
                                    <div class="hint-slider">
                                        <label>Liest du gerne wissenschaftliche Artikel?</label>
                                        <div class="slider-wrapper">
                                            <input type="range" name="read_scientific_articles_slider" min="1" max="10" value="5" class="hint-slider-input">
                                            <span class="slider-value">5</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="answer-section">
                                <div class="slider-container">
                                    <label for="analytical_thinking_slider">Wie wichtig ist dir analytisches Denken insgesamt? (1-10)</label>
                                    <div class="slider-wrapper">
                                        <input type="range" 
                                               id="analytical_thinking_slider" 
                                               name="analytical_thinking_slider" 
                                               min="1" 
                                               max="10" 
                                               value="5" 
                                               class="importance-slider">
                                        <span class="slider-value">5</span>
                                    </div>
                                </div>
                                <textarea 
                                    name="analytical_thinking" 
                                    placeholder="Beschreibe deine analytischen Interessen und Fähigkeiten..."
                                    rows="4"
                                    required></textarea>
                            </div>
                        </div>

                        <!-- Navigation Buttons -->
                        <div class="navigation-buttons">
                            <a href="index-raisec.html" class="btn-secondary">Zurück zur Übersicht</a>
                            <a href="artistic-raisec.html" class="btn-primary">Weiter zu Künstlerisch</a>
                        </div>
                    </form>
                </div>

                <!-- Sidebar -->
                <div class="sidebar">
                    <div class="sidebar-card">
                        <h3>💡 Tipps für investigative Typen</h3>
                        <ul>
                            <li>Zerlege komplexe Probleme in kleinere Teile</li>
                            <li>Verwende systematische Methoden</li>
                            <li>Suche nach Mustern und Zusammenhängen</li>
                            <li>Bewerte verschiedene Lösungsansätze</li>
                        </ul>
                    </div>

                    <div class="sidebar-card">
                        <h3>🔗 Verwandte Methoden</h3>
                        <ul>
                            <li><a href="../ikigai/index-ikigai.html">Ikigai</a></li>
                            <li><a href="../swot/index-swot.html">SWOT</a></li>
                            <li><a href="../wheel-of-life/index-wheel-of-life.html">Wheel of Life</a></li>
                        </ul>
                    </div>

                    <div class="sidebar-card">
                        <h3>📚 Empfohlene Ressourcen</h3>
                        <ul>
                            <li>Fachzeitschriften und Papers</li>
                            <li>Online-Kurse und MOOCs</li>
                            <li>Forschungsnetzwerke</li>
                            <li>Konferenzen und Workshops</li>
                        </ul>
                    </div>

                    <div class="sidebar-card">
                        <h3>🎯 Berufsfelder</h3>
                        <ul>
                            <li>Forschung & Entwicklung</li>
                            <li>Wissenschaft & Technik</li>
                            <li>Datenanalyse</li>
                            <li>Medizin & Pharmazie</li>
                            <li>Ingenieurwesen</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>RAISEC - Investigativ</h3>
                    <p>Forschend-analytisch orientierte Berufsinteressen</p>
                </div>
                <div class="footer-section">
                    <h3>Navigation</h3>
                    <ul>
                        <li><a href="index-raisec.html">Übersicht</a></li>
                        <li><a href="artistic-raisec.html">Künstlerisch</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </footer>

    <script src="js/raisec-workflow.js"></script>
</body>
</html>
INVESTIGATIVE_EOF

echo "Investigative RAISEC-Seite mit korrekten Inhalten erstellt!"
