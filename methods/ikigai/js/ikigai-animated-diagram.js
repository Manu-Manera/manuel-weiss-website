/**
 * 🎨 Ikigai Animated Diagram
 * Interaktives, animiertes Ikigai-Diagramm mit Drag & Drop
 * Autor: Manuel Weiss
 * Version: 1.0
 */

class IkigaiAnimatedDiagram {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.animationDuration = 2000;
        this.fillLevels = {
            passion: 0,
            mission: 0,
            profession: 0,
            vocation: 0
        };
        this.draggedElement = null;
        this.init();
    }

    init() {
        this.createDiagram();
        this.setupEventListeners();
        this.loadSavedData();
        console.log('🎨 Ikigai Animated Diagram initialized');
    }

    createDiagram() {
        this.container.innerHTML = `
            <div class="ikigai-animated-container">
                <div class="ikigai-flower-animated">
                    <!-- Passion Petal -->
                    <div class="ikigai-petal-animated petal-passion" data-area="passion">
                        <div class="petal-content">
                            <div class="petal-icon">❤️</div>
                            <div class="petal-label">Was du liebst</div>
                            <div class="petal-progress">
                                <div class="progress-circle" data-progress="0">
                                    <span class="progress-text">0%</span>
                                </div>
                            </div>
                            <div class="petal-items" data-area="passion"></div>
                        </div>
                    </div>
                    
                    <!-- Mission Petal -->
                    <div class="ikigai-petal-animated petal-mission" data-area="mission">
                        <div class="petal-content">
                            <div class="petal-icon">🌍</div>
                            <div class="petal-label">Was die Welt braucht</div>
                            <div class="petal-progress">
                                <div class="progress-circle" data-progress="0">
                                    <span class="progress-text">0%</span>
                                </div>
                            </div>
                            <div class="petal-items" data-area="mission"></div>
                        </div>
                    </div>
                    
                    <!-- Profession Petal -->
                    <div class="ikigai-petal-animated petal-profession" data-area="profession">
                        <div class="petal-content">
                            <div class="petal-icon">💰</div>
                            <div class="petal-label">Womit du Geld verdienst</div>
                            <div class="petal-progress">
                                <div class="progress-circle" data-progress="0">
                                    <span class="progress-text">0%</span>
                                </div>
                            </div>
                            <div class="petal-items" data-area="profession"></div>
                        </div>
                    </div>
                    
                    <!-- Vocation Petal -->
                    <div class="ikigai-petal-animated petal-vocation" data-area="vocation">
                        <div class="petal-content">
                            <div class="petal-icon">⭐</div>
                            <div class="petal-label">Was du gut kannst</div>
                            <div class="petal-progress">
                                <div class="progress-circle" data-progress="0">
                                    <span class="progress-text">0%</span>
                                </div>
                            </div>
                            <div class="petal-items" data-area="vocation"></div>
                        </div>
                    </div>
                    
                    <!-- Intersection Areas -->
                    <div class="intersection-area-animated intersection-passion-mission">
                        <div class="intersection-label">Passion + Mission</div>
                        <div class="intersection-description">Deine Berufung</div>
                        <div class="intersection-progress">
                            <div class="progress-bar" data-progress="0"></div>
                        </div>
                    </div>
                    
                    <div class="intersection-area-animated intersection-mission-profession">
                        <div class="intersection-label">Mission + Profession</div>
                        <div class="intersection-description">Deine Aufgabe</div>
                        <div class="intersection-progress">
                            <div class="progress-bar" data-progress="0"></div>
                        </div>
                    </div>
                    
                    <div class="intersection-area-animated intersection-profession-vocation">
                        <div class="intersection-label">Profession + Vocation</div>
                        <div class="intersection-description">Deine Expertise</div>
                        <div class="intersection-progress">
                            <div class="progress-bar" data-progress="0"></div>
                        </div>
                    </div>
                    
                    <div class="intersection-area-animated intersection-vocation-passion">
                        <div class="intersection-label">Vocation + Passion</div>
                        <div class="intersection-description">Deine Leidenschaft</div>
                        <div class="intersection-progress">
                            <div class="progress-bar" data-progress="0"></div>
                        </div>
                    </div>
                    
                    <!-- Center -->
                    <div class="ikigai-center-animated">
                        <div class="center-content">
                            <div class="center-icon">🎯</div>
                            <h3>Dein Ikigai</h3>
                            <div class="ikigai-score">
                                <div class="score-circle">
                                    <span class="score-text">0%</span>
                                </div>
                            </div>
                            <p class="center-description">Der Schnittpunkt aller vier Bereiche</p>
                        </div>
                    </div>
                </div>
                
                <!-- Drag & Drop Items -->
                <div class="drag-items-container">
                    <h4>Ziehe Elemente in die Bereiche:</h4>
                    <div class="drag-items">
                        <div class="drag-item" draggable="true" data-category="passion">
                            <span>Kreativität</span>
                        </div>
                        <div class="drag-item" draggable="true" data-category="passion">
                            <span>Musik</span>
                        </div>
                        <div class="drag-item" draggable="true" data-category="mission">
                            <span>Umweltschutz</span>
                        </div>
                        <div class="drag-item" draggable="true" data-category="mission">
                            <span>Bildung</span>
                        </div>
                        <div class="drag-item" draggable="true" data-category="profession">
                            <span>Marketing</span>
                        </div>
                        <div class="drag-item" draggable="true" data-category="profession">
                            <span>Beratung</span>
                        </div>
                        <div class="drag-item" draggable="true" data-category="vocation">
                            <span>Kommunikation</span>
                        </div>
                        <div class="drag-item" draggable="true" data-category="vocation">
                            <span>Analytik</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Drag & Drop Event Listeners
        const dragItems = this.container.querySelectorAll('.drag-item');
        const dropZones = this.container.querySelectorAll('.ikigai-petal-animated');

        dragItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                this.draggedElement = e.target;
                e.target.style.opacity = '0.5';
            });

            item.addEventListener('dragend', (e) => {
                e.target.style.opacity = '1';
                this.draggedElement = null;
            });
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', (e) => {
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                
                if (this.draggedElement) {
                    this.addItemToArea(zone, this.draggedElement);
                }
            });
        });

        // Click to add custom items
        dropZones.forEach(zone => {
            zone.addEventListener('click', (e) => {
                if (e.target.classList.contains('petal-items')) {
                    this.showAddItemModal(zone.dataset.area);
                }
            });
        });
    }

    addItemToArea(zone, item) {
        const area = zone.dataset.area;
        const itemText = item.textContent;
        
        // Create new item in the area
        const newItem = document.createElement('div');
        newItem.className = 'area-item';
        newItem.textContent = itemText;
        newItem.draggable = true;
        
        // Add remove functionality
        newItem.addEventListener('dblclick', () => {
            newItem.remove();
            this.updateAreaProgress(area);
        });

        // Add to the area
        const itemsContainer = zone.querySelector('.petal-items');
        itemsContainer.appendChild(newItem);
        
        // Update progress
        this.updateAreaProgress(area);
        
        // Save to localStorage
        this.saveItemToArea(area, itemText);
    }

    updateAreaProgress(area) {
        const zone = this.container.querySelector(`[data-area="${area}"]`);
        const items = zone.querySelectorAll('.area-item');
        const progress = Math.min(items.length * 20, 100); // Max 5 items = 100%
        
        this.fillLevels[area] = progress;
        
        // Update visual progress
        const progressCircle = zone.querySelector('.progress-circle');
        const progressText = zone.querySelector('.progress-text');
        
        if (progressCircle && progressText) {
            progressCircle.style.setProperty('--progress', `${progress}%`);
            progressText.textContent = `${progress}%`;
        }
        
        // Update intersection areas
        this.updateIntersectionAreas();
        
        // Update center score
        this.updateCenterScore();
    }

    updateIntersectionAreas() {
        const intersections = {
            'passion-mission': Math.min(this.fillLevels.passion, this.fillLevels.mission),
            'mission-profession': Math.min(this.fillLevels.mission, this.fillLevels.profession),
            'profession-vocation': Math.min(this.fillLevels.profession, this.fillLevels.vocation),
            'vocation-passion': Math.min(this.fillLevels.vocation, this.fillLevels.passion)
        };

        Object.entries(intersections).forEach(([intersection, progress]) => {
            const element = this.container.querySelector(`.intersection-${intersection}`);
            if (element) {
                const progressBar = element.querySelector('.progress-bar');
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
            }
        });
    }

    updateCenterScore() {
        const centerScore = this.calculateCenterScore();
        const scoreElement = this.container.querySelector('.score-text');
        if (scoreElement) {
            scoreElement.textContent = `${centerScore}%`;
        }
    }

    calculateCenterScore() {
        // Ikigai Score = Minimum of all four areas
        const minScore = Math.min(
            this.fillLevels.passion,
            this.fillLevels.mission,
            this.fillLevels.profession,
            this.fillLevels.vocation
        );
        
        return minScore;
    }

    showAddItemModal(area) {
        const itemText = prompt(`Füge ein Element zu "${area}" hinzu:`);
        if (itemText && itemText.trim()) {
            const zone = this.container.querySelector(`[data-area="${area}"]`);
            const newItem = document.createElement('div');
            newItem.className = 'area-item';
            newItem.textContent = itemText.trim();
            newItem.draggable = true;
            
            newItem.addEventListener('dblclick', () => {
                newItem.remove();
                this.updateAreaProgress(area);
            });

            const itemsContainer = zone.querySelector('.petal-items');
            itemsContainer.appendChild(newItem);
            
            this.updateAreaProgress(area);
            this.saveItemToArea(area, itemText.trim());
        }
    }

    saveItemToArea(area, item) {
        const savedItems = JSON.parse(localStorage.getItem(`ikigai-${area}-items`) || '[]');
        savedItems.push(item);
        localStorage.setItem(`ikigai-${area}-items`, JSON.stringify(savedItems));
    }

    loadSavedData() {
        const areas = ['passion', 'mission', 'profession', 'vocation'];
        
        areas.forEach(area => {
            const savedItems = JSON.parse(localStorage.getItem(`ikigai-${area}-items`) || '[]');
            const zone = this.container.querySelector(`[data-area="${area}"]`);
            const itemsContainer = zone.querySelector('.petal-items');
            
            savedItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'area-item';
                itemElement.textContent = item;
                itemElement.draggable = true;
                
                itemElement.addEventListener('dblclick', () => {
                    itemElement.remove();
                    this.updateAreaProgress(area);
                });
                
                itemsContainer.appendChild(itemElement);
            });
            
            this.updateAreaProgress(area);
        });
    }

    // Animation Methods
    animateFill(area, targetProgress) {
        const zone = this.container.querySelector(`[data-area="${area}"]`);
        const progressCircle = zone.querySelector('.progress-circle');
        const progressText = zone.querySelector('.progress-text');
        
        if (progressCircle && progressText) {
            let currentProgress = 0;
            const increment = targetProgress / (this.animationDuration / 16); // 60fps
            
            const animate = () => {
                currentProgress += increment;
                if (currentProgress >= targetProgress) {
                    currentProgress = targetProgress;
                }
                
                progressCircle.style.setProperty('--progress', `${currentProgress}%`);
                progressText.textContent = `${Math.round(currentProgress)}%`;
                
                if (currentProgress < targetProgress) {
                    requestAnimationFrame(animate);
                }
            };
            
            animate();
        }
    }

    animateAllFills() {
        const areas = ['passion', 'mission', 'profession', 'vocation'];
        areas.forEach((area, index) => {
            setTimeout(() => {
                this.animateFill(area, this.fillLevels[area]);
            }, index * 500);
        });
    }

    // Public Methods
    setAreaProgress(area, progress) {
        this.fillLevels[area] = Math.min(progress, 100);
        this.updateAreaProgress(area);
    }

    getAreaProgress(area) {
        return this.fillLevels[area];
    }

    getAllProgress() {
        return { ...this.fillLevels };
    }

    getCenterScore() {
        return this.calculateCenterScore();
    }

    resetDiagram() {
        this.fillLevels = {
            passion: 0,
            mission: 0,
            profession: 0,
            vocation: 0
        };
        
        // Clear all items
        const areas = ['passion', 'mission', 'profession', 'vocation'];
        areas.forEach(area => {
            localStorage.removeItem(`ikigai-${area}-items`);
            const zone = this.container.querySelector(`[data-area="${area}"]`);
            const itemsContainer = zone.querySelector('.petal-items');
            itemsContainer.innerHTML = '';
        });
        
        // Reset visual progress
        this.updateAreaProgress('passion');
        this.updateAreaProgress('mission');
        this.updateAreaProgress('profession');
        this.updateAreaProgress('vocation');
    }

    exportData() {
        const data = {
            fillLevels: this.fillLevels,
            centerScore: this.calculateCenterScore(),
            items: {},
            timestamp: new Date().toISOString()
        };
        
        const areas = ['passion', 'mission', 'profession', 'vocation'];
        areas.forEach(area => {
            data.items[area] = JSON.parse(localStorage.getItem(`ikigai-${area}-items`) || '[]');
        });
        
        return data;
    }
}

// CSS für das animierte Diagramm
const animatedDiagramCSS = `
.ikigai-animated-container {
    position: relative;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

.ikigai-flower-animated {
    position: relative;
    width: 600px;
    height: 600px;
    margin: 0 auto;
}

.ikigai-petal-animated {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 3px solid transparent;
}

.ikigai-petal-animated:hover {
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.8);
}

.petal-passion {
    top: 50px;
    left: 200px;
    background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
    box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
}

.petal-mission {
    top: 200px;
    left: 50px;
    background: linear-gradient(135deg, #4ecdc4, #6dd5ed);
    box-shadow: 0 10px 30px rgba(78, 205, 196, 0.3);
}

.petal-profession {
    top: 200px;
    right: 50px;
    background: linear-gradient(135deg, #45b7d1, #96c7ed);
    box-shadow: 0 10px 30px rgba(69, 183, 209, 0.3);
}

.petal-vocation {
    bottom: 50px;
    left: 200px;
    background: linear-gradient(135deg, #f9ca24, #f0932b);
    box-shadow: 0 10px 30px rgba(249, 202, 36, 0.3);
}

.petal-content {
    text-align: center;
    color: white;
    font-weight: 600;
}

.petal-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.petal-label {
    font-size: 0.9rem;
    margin-bottom: 1rem;
}

.progress-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: conic-gradient(from 0deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.8) var(--progress, 0%), transparent var(--progress, 0%), transparent 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    position: relative;
}

.progress-circle::before {
    content: '';
    position: absolute;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
}

.progress-text {
    position: relative;
    z-index: 1;
    font-size: 0.8rem;
    font-weight: 700;
}

.petal-items {
    min-height: 40px;
    margin-top: 1rem;
}

.area-item {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.3rem 0.6rem;
    margin: 0.2rem;
    border-radius: 15px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.area-item:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
}

.intersection-area-animated {
    position: absolute;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 0.7rem;
    color: white;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.intersection-passion-mission {
    top: 150px;
    left: 150px;
}

.intersection-mission-profession {
    top: 150px;
    right: 150px;
}

.intersection-profession-vocation {
    bottom: 150px;
    right: 150px;
}

.intersection-vocation-passion {
    bottom: 150px;
    left: 150px;
}

.intersection-progress {
    width: 80%;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    margin-top: 0.5rem;
    overflow: hidden;
}

.intersection-progress .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
    transition: width 0.5s ease;
}

.ikigai-center-animated {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
    border: 3px solid rgba(255, 255, 255, 0.3);
}

.center-content {
    text-align: center;
    color: white;
}

.center-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.center-content h3 {
    font-size: 1rem;
    margin: 0 0 0.5rem 0;
}

.score-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 0.5rem;
}

.score-text {
    font-size: 0.8rem;
    font-weight: 700;
}

.center-description {
    font-size: 0.7rem;
    margin: 0;
    opacity: 0.8;
}

.drag-items-container {
    margin-top: 2rem;
    text-align: center;
}

.drag-items {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 1rem;
}

.drag-item {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    cursor: grab;
    transition: all 0.2s ease;
    font-size: 0.9rem;
    font-weight: 500;
}

.drag-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.drag-item:active {
    cursor: grabbing;
}

.drag-over {
    border-color: #ff6b6b !important;
    box-shadow: 0 0 20px rgba(255, 107, 107, 0.5) !important;
}

@media (max-width: 768px) {
    .ikigai-flower-animated {
        width: 400px;
        height: 400px;
    }
    
    .ikigai-petal-animated {
        width: 120px;
        height: 120px;
    }
    
    .petal-passion {
        top: 30px;
        left: 140px;
    }
    
    .petal-mission {
        top: 140px;
        left: 30px;
    }
    
    .petal-profession {
        top: 140px;
        right: 30px;
    }
    
    .petal-vocation {
        bottom: 30px;
        left: 140px;
    }
    
    .ikigai-center-animated {
        width: 80px;
        height: 80px;
    }
}
`;

// CSS in den Head einfügen
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = animatedDiagramCSS;
    document.head.appendChild(style);
}

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IkigaiAnimatedDiagram;
}
