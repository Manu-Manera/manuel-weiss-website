// Page Builder System for Application Pages

// View application page in new tab
function viewApplicationPage(appId) {
    const app = applications.find(a => a.id === appId);
    if (app && app.pageUrl) {
        window.open(app.pageUrl, '_blank');
    } else {
        // If no page exists, create one first
        createApplicationPage(appId);
    }
}

// Edit application page with page builder
function editApplicationPage(appId) {
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    
    // Create page builder modal
    const modal = document.createElement('div');
    modal.id = 'pageBuilderModal';
    modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000;';
    
    modal.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
            <!-- Header -->
            <div style="background: #1e293b; color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0;">Bewerbungsseite bearbeiten - ${app.company}</h2>
                <div style="display: flex; gap: 1rem;">
                    <button onclick="previewPage('${appId}')" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-eye"></i> Vorschau
                    </button>
                    <button onclick="savePageBuilder('${appId}')" style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-save"></i> Speichern
                    </button>
                    <button onclick="closePageBuilder()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
            </div>
            
            <div style="display: flex; flex: 1; overflow: hidden;">
                <!-- Sidebar with components -->
                <div style="width: 300px; background: #f8fafc; padding: 1.5rem; overflow-y: auto;">
                    <h3 style="margin-bottom: 1rem;">Bausteine</h3>
                    
                    <!-- Header Section -->
                    <div class="component-section" style="margin-bottom: 2rem;">
                        <h4 style="margin-bottom: 0.5rem;">Header</h4>
                        <div class="draggable-component" draggable="true" data-component="hero" style="padding: 1rem; background: white; border: 2px solid #e5e7eb; border-radius: 8px; cursor: move; margin-bottom: 0.5rem;">
                            <i class="fas fa-star"></i> Hero-Bereich
                        </div>
                        <div class="draggable-component" draggable="true" data-component="navigation" style="padding: 1rem; background: white; border: 2px solid #e5e7eb; border-radius: 8px; cursor: move; margin-bottom: 0.5rem;">
                            <i class="fas fa-bars"></i> Navigation
                        </div>
                    </div>
                    
                    <!-- Content Section -->
                    <div class="component-section" style="margin-bottom: 2rem;">
                        <h4 style="margin-bottom: 0.5rem;">Inhalt</h4>
                        <div class="draggable-component" draggable="true" data-component="about" style="padding: 1rem; background: white; border: 2px solid #e5e7eb; border-radius: 8px; cursor: move; margin-bottom: 0.5rem;">
                            <i class="fas fa-user"></i> Über mich
                        </div>
                        <div class="draggable-component" draggable="true" data-component="skills" style="padding: 1rem; background: white; border: 2px solid #e5e7eb; border-radius: 8px; cursor: move; margin-bottom: 0.5rem;">
                            <i class="fas fa-chart-bar"></i> Kompetenzen
                        </div>
                        <div class="draggable-component" draggable="true" data-component="experience" style="padding: 1rem; background: white; border: 2px solid #e5e7eb; border-radius: 8px; cursor: move; margin-bottom: 0.5rem;">
                            <i class="fas fa-briefcase"></i> Berufserfahrung
                        </div>
                        <div class="draggable-component" draggable="true" data-component="projects" style="padding: 1rem; background: white; border: 2px solid #e5e7eb; border-radius: 8px; cursor: move; margin-bottom: 0.5rem;">
                            <i class="fas fa-project-diagram"></i> Projekte
                        </div>
                        <div class="draggable-component" draggable="true" data-component="testimonials" style="padding: 1rem; background: white; border: 2px solid #e5e7eb; border-radius: 8px; cursor: move; margin-bottom: 0.5rem;">
                            <i class="fas fa-quote-left"></i> Referenzen
                        </div>
                    </div>
                    
                    <!-- Media Section -->
                    <div class="component-section" style="margin-bottom: 2rem;">
                        <h4 style="margin-bottom: 0.5rem;">Medien</h4>
                        <div class="draggable-component" draggable="true" data-component="gallery" style="padding: 1rem; background: white; border: 2px solid #e5e7eb; border-radius: 8px; cursor: move; margin-bottom: 0.5rem;">
                            <i class="fas fa-images"></i> Bildergalerie
                        </div>
                        <div class="draggable-component" draggable="true" data-component="video" style="padding: 1rem; background: white; border: 2px solid #e5e7eb; border-radius: 8px; cursor: move; margin-bottom: 0.5rem;">
                            <i class="fas fa-video"></i> Video
                        </div>
                        <div class="draggable-component" draggable="true" data-component="documents" style="padding: 1rem; background: white; border: 2px solid #e5e7eb; border-radius: 8px; cursor: move; margin-bottom: 0.5rem;">
                            <i class="fas fa-file-pdf"></i> Dokumente
                        </div>
                    </div>
                    
                    <!-- Contact Section -->
                    <div class="component-section">
                        <h4 style="margin-bottom: 0.5rem;">Kontakt</h4>
                        <div class="draggable-component" draggable="true" data-component="contact" style="padding: 1rem; background: white; border: 2px solid #e5e7eb; border-radius: 8px; cursor: move; margin-bottom: 0.5rem;">
                            <i class="fas fa-envelope"></i> Kontaktformular
                        </div>
                        <div class="draggable-component" draggable="true" data-component="cta" style="padding: 1rem; background: white; border: 2px solid #e5e7eb; border-radius: 8px; cursor: move; margin-bottom: 0.5rem;">
                            <i class="fas fa-bullhorn"></i> Call-to-Action
                        </div>
                    </div>
                </div>
                
                <!-- Main editor area -->
                <div style="flex: 1; background: #e5e7eb; padding: 2rem; overflow-y: auto;">
                    <div id="pageBuilderCanvas" style="background: white; min-height: 100%; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <div id="dropZone" style="padding: 4rem; text-align: center; color: #666; min-height: 600px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                            <i class="fas fa-layer-group" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                            <p style="font-size: 1.25rem;">Ziehe Bausteine hierher</p>
                            <p style="color: #999;">Erstelle deine individuelle Bewerbungsseite</p>
                        </div>
                    </div>
                </div>
                
                <!-- Settings panel -->
                <div style="width: 300px; background: #f8fafc; padding: 1.5rem; overflow-y: auto;">
                    <h3 style="margin-bottom: 1rem;">Einstellungen</h3>
                    
                    <div id="componentSettings" style="display: none;">
                        <!-- Settings will be populated based on selected component -->
                    </div>
                    
                    <div id="generalSettings">
                        <h4 style="margin-bottom: 1rem;">Allgemeine Einstellungen</h4>
                        
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Seitentitel:</label>
                            <input type="text" id="pageTitle" value="Bewerbung - ${app.position} bei ${app.company}" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Primärfarbe:</label>
                            <div style="display: flex; gap: 0.5rem;">
                                <input type="color" id="pagePrimaryColor" value="${app.design?.primaryColor || '#6366f1'}" style="width: 50px; height: 35px; border: none; border-radius: 4px; cursor: pointer;">
                                <input type="text" id="pagePrimaryColorHex" value="${app.design?.primaryColor || '#6366f1'}" style="flex: 1; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Schriftart:</label>
                            <select id="pageFont" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                                <option value="Inter">Inter (Modern)</option>
                                <option value="Roboto">Roboto (Clean)</option>
                                <option value="Playfair Display">Playfair Display (Elegant)</option>
                                <option value="Montserrat">Montserrat (Professional)</option>
                            </select>
                        </div>
                        
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">SEO Beschreibung:</label>
                            <textarea id="pageSEO" placeholder="Kurze Beschreibung für Suchmaschinen..." style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; height: 80px; resize: vertical;"></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize drag and drop
    initializeDragAndDrop();
    
    // Load existing page data if available
    if (app.pageData) {
        loadPageData(app.pageData);
    }
}

// Initialize drag and drop functionality
function initializeDragAndDrop() {
    const draggables = document.querySelectorAll('.draggable-component');
    const dropZone = document.getElementById('dropZone');
    const canvas = document.getElementById('pageBuilderCanvas');
    
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('component', e.target.dataset.component);
            e.target.style.opacity = '0.5';
        });
        
        draggable.addEventListener('dragend', (e) => {
            e.target.style.opacity = '1';
        });
    });
    
    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(canvas, e.clientY);
        const dragging = document.querySelector('.dragging');
        if (afterElement == null) {
            canvas.appendChild(dragging);
        } else {
            canvas.insertBefore(dragging, afterElement);
        }
    });
    
    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const componentType = e.dataTransfer.getData('component');
        
        // Remove drop zone if it exists
        const dropZoneElement = document.getElementById('dropZone');
        if (dropZoneElement) {
            dropZoneElement.remove();
        }
        
        // Add component to canvas
        addComponentToCanvas(componentType);
    });
}

// Add component to canvas
function addComponentToCanvas(componentType) {
    const canvas = document.getElementById('pageBuilderCanvas');
    const componentId = `component-${Date.now()}`;
    
    const componentTemplates = {
        hero: `
            <div class="page-component hero-component" id="${componentId}" style="padding: 4rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; position: relative;">
                <h1 contenteditable="true" style="font-size: 3rem; margin-bottom: 1rem; outline: none;">Manuel Weiß</h1>
                <p contenteditable="true" style="font-size: 1.5rem; margin-bottom: 2rem; outline: none;">HR-Experte & Digitalisierungsberater</p>
                <button style="padding: 1rem 2rem; background: white; color: #667eea; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Kontakt aufnehmen</button>
                <button onclick="removeComponent('${componentId}')" style="position: absolute; top: 1rem; right: 1rem; background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.5rem; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `,
        navigation: `
            <div class="page-component navigation-component" id="${componentId}" style="padding: 1rem 2rem; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); position: relative;">
                <nav style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
                    <div contenteditable="true" style="font-size: 1.5rem; font-weight: 600; color: #333; outline: none;">MW</div>
                    <div style="display: flex; gap: 2rem;">
                        <a href="#about" style="color: #666; text-decoration: none; font-weight: 500;">Über mich</a>
                        <a href="#skills" style="color: #666; text-decoration: none; font-weight: 500;">Kompetenzen</a>
                        <a href="#experience" style="color: #666; text-decoration: none; font-weight: 500;">Erfahrung</a>
                        <a href="#contact" style="color: #666; text-decoration: none; font-weight: 500;">Kontakt</a>
                    </div>
                </nav>
                <button onclick="removeComponent('${componentId}')" style="position: absolute; top: 1rem; right: 1rem; background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.5rem; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `,
        about: `
            <div class="page-component about-component" id="${componentId}" style="padding: 3rem 2rem; position: relative;">
                <h2 contenteditable="true" style="font-size: 2rem; margin-bottom: 1.5rem; text-align: center; outline: none;">Über mich</h2>
                <div style="max-width: 800px; margin: 0 auto; line-height: 1.8;">
                    <p contenteditable="true" style="outline: none;">Als erfahrener HR-Berater und Digitalisierungsexperte bringe ich über 15 Jahre Erfahrung in der Transformation von Personalprozessen mit. Meine Leidenschaft liegt darin, Unternehmen dabei zu unterstützen, ihre HR-Strategien zu modernisieren und zukunftsfähig zu gestalten.</p>
                </div>
                <button onclick="removeComponent('${componentId}')" style="position: absolute; top: 1rem; right: 1rem; background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.5rem; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `,
        experience: `
            <div class="page-component experience-component" id="${componentId}" style="padding: 3rem 2rem; position: relative;">
                <h2 contenteditable="true" style="font-size: 2rem; margin-bottom: 2rem; text-align: center; outline: none;">Berufserfahrung</h2>
                <div style="max-width: 800px; margin: 0 auto;">
                    <div style="margin-bottom: 2rem; padding-left: 2rem; border-left: 3px solid #6366f1;">
                        <h3 contenteditable="true" style="margin-bottom: 0.5rem; outline: none;">Senior HR Consultant</h3>
                        <p contenteditable="true" style="color: #666; margin-bottom: 0.5rem; outline: none;">ABC Consulting GmbH | 2020 - heute</p>
                        <p contenteditable="true" style="line-height: 1.6; outline: none;">Beratung von Großunternehmen bei der digitalen Transformation ihrer HR-Prozesse. Implementierung von SAP SuccessFactors und Workday Lösungen.</p>
                    </div>
                    <div style="margin-bottom: 2rem; padding-left: 2rem; border-left: 3px solid #6366f1;">
                        <h3 contenteditable="true" style="margin-bottom: 0.5rem; outline: none;">HR Manager</h3>
                        <p contenteditable="true" style="color: #666; margin-bottom: 0.5rem; outline: none;">XYZ AG | 2015 - 2020</p>
                        <p contenteditable="true" style="line-height: 1.6; outline: none;">Verantwortlich für die Personalentwicklung und Digitalisierung der HR-Abteilung. Einführung agiler Arbeitsmethoden.</p>
                    </div>
                </div>
                <button onclick="removeComponent('${componentId}')" style="position: absolute; top: 1rem; right: 1rem; background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.5rem; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `,
        projects: `
            <div class="page-component projects-component" id="${componentId}" style="padding: 3rem 2rem; background: #f8fafc; position: relative;">
                <h2 contenteditable="true" style="font-size: 2rem; margin-bottom: 2rem; text-align: center; outline: none;">Projekte</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; max-width: 1000px; margin: 0 auto;">
                    <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h3 contenteditable="true" style="margin-bottom: 1rem; color: #6366f1; outline: none;">HR-Digitalisierung DAX-Konzern</h3>
                        <p contenteditable="true" style="line-height: 1.6; outline: none;">Komplette Neuausrichtung der HR-IT-Landschaft mit Cloud-First-Ansatz. Migration von 50.000+ Mitarbeiterdaten.</p>
                    </div>
                    <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h3 contenteditable="true" style="margin-bottom: 1rem; color: #6366f1; outline: none;">KI-basiertes Recruiting</h3>
                        <p contenteditable="true" style="line-height: 1.6; outline: none;">Entwicklung und Implementierung eines KI-gestützten Bewerbermanagement-Systems mit 40% Zeitersparnis.</p>
                    </div>
                </div>
                <button onclick="removeComponent('${componentId}')" style="position: absolute; top: 1rem; right: 1rem; background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.5rem; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `,
        testimonials: `
            <div class="page-component testimonials-component" id="${componentId}" style="padding: 3rem 2rem; position: relative;">
                <h2 contenteditable="true" style="font-size: 2rem; margin-bottom: 2rem; text-align: center; outline: none;">Referenzen</h2>
                <div style="max-width: 800px; margin: 0 auto;">
                    <div style="background: #f8fafc; padding: 2rem; border-radius: 8px; margin-bottom: 1.5rem;">
                        <p contenteditable="true" style="font-style: italic; line-height: 1.6; margin-bottom: 1rem; outline: none;">"Herr Weiß hat unsere HR-Abteilung in die digitale Zukunft geführt. Seine Expertise und sein strukturiertes Vorgehen waren entscheidend für den Projekterfolg."</p>
                        <p contenteditable="true" style="font-weight: 600; outline: none;">Dr. Sarah Schmidt, CHRO XYZ AG</p>
                    </div>
                    <div style="background: #f8fafc; padding: 2rem; border-radius: 8px;">
                        <p contenteditable="true" style="font-style: italic; line-height: 1.6; margin-bottom: 1rem; outline: none;">"Die Zusammenarbeit war außergewöhnlich professionell. Die implementierten Lösungen haben unsere Effizienz deutlich gesteigert."</p>
                        <p contenteditable="true" style="font-weight: 600; outline: none;">Thomas Müller, CEO ABC GmbH</p>
                    </div>
                </div>
                <button onclick="removeComponent('${componentId}')" style="position: absolute; top: 1rem; right: 1rem; background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.5rem; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `,
        gallery: `
            <div class="page-component gallery-component" id="${componentId}" style="padding: 3rem 2rem; position: relative;">
                <h2 contenteditable="true" style="font-size: 2rem; margin-bottom: 2rem; text-align: center; outline: none;">Impressionen</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; max-width: 1000px; margin: 0 auto;">
                    <div style="height: 200px; background: #e5e7eb; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-image" style="font-size: 3rem; color: #9ca3af;"></i>
                    </div>
                    <div style="height: 200px; background: #e5e7eb; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-image" style="font-size: 3rem; color: #9ca3af;"></i>
                    </div>
                    <div style="height: 200px; background: #e5e7eb; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-image" style="font-size: 3rem; color: #9ca3af;"></i>
                    </div>
                </div>
                <button onclick="removeComponent('${componentId}')" style="position: absolute; top: 1rem; right: 1rem; background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.5rem; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `,
        video: `
            <div class="page-component video-component" id="${componentId}" style="padding: 3rem 2rem; background: #1e293b; position: relative;">
                <h2 contenteditable="true" style="font-size: 2rem; margin-bottom: 2rem; text-align: center; color: white; outline: none;">Video-Vorstellung</h2>
                <div style="max-width: 800px; margin: 0 auto; background: #374151; border-radius: 8px; padding: 2rem; text-align: center;">
                    <i class="fas fa-play-circle" style="font-size: 4rem; color: #9ca3af; margin-bottom: 1rem;"></i>
                    <p style="color: #9ca3af;">Video-Platzhalter</p>
                </div>
                <button onclick="removeComponent('${componentId}')" style="position: absolute; top: 1rem; right: 1rem; background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.5rem; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `,
        documents: `
            <div class="page-component documents-component" id="${componentId}" style="padding: 3rem 2rem; position: relative;">
                <h2 contenteditable="true" style="font-size: 2rem; margin-bottom: 2rem; text-align: center; outline: none;">Dokumente</h2>
                <div style="max-width: 600px; margin: 0 auto;">
                    <a href="#" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #f8fafc; border-radius: 8px; margin-bottom: 1rem; text-decoration: none; color: #333;">
                        <i class="fas fa-file-pdf" style="font-size: 2rem; color: #ef4444;"></i>
                        <div>
                            <p contenteditable="true" style="font-weight: 600; outline: none;">Lebenslauf</p>
                            <p contenteditable="true" style="font-size: 0.875rem; color: #666; outline: none;">PDF, 2 Seiten</p>
                        </div>
                    </a>
                    <a href="#" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #f8fafc; border-radius: 8px; margin-bottom: 1rem; text-decoration: none; color: #333;">
                        <i class="fas fa-file-pdf" style="font-size: 2rem; color: #ef4444;"></i>
                        <div>
                            <p contenteditable="true" style="font-weight: 600; outline: none;">Zeugnisse</p>
                            <p contenteditable="true" style="font-size: 0.875rem; color: #666; outline: none;">PDF, 10 Seiten</p>
                        </div>
                    </a>
                </div>
                <button onclick="removeComponent('${componentId}')" style="position: absolute; top: 1rem; right: 1rem; background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.5rem; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `,
        cta: `
            <div class="page-component cta-component" id="${componentId}" style="padding: 3rem 2rem; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-align: center; position: relative;">
                <h2 contenteditable="true" style="font-size: 2.5rem; margin-bottom: 1rem; outline: none;">Lassen Sie uns sprechen!</h2>
                <p contenteditable="true" style="font-size: 1.25rem; margin-bottom: 2rem; outline: none;">Ich freue mich darauf, mehr über Ihre Herausforderungen zu erfahren.</p>
                <button style="padding: 1rem 2rem; background: white; color: #6366f1; border: none; border-radius: 8px; font-weight: 600; font-size: 1.1rem; cursor: pointer;">Termin vereinbaren</button>
                <button onclick="removeComponent('${componentId}')" style="position: absolute; top: 1rem; right: 1rem; background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.5rem; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `,
        skills: `
            <div class="page-component skills-component" id="${componentId}" style="padding: 3rem 2rem; background: #f8fafc; position: relative;">
                <h2 style="font-size: 2rem; margin-bottom: 2rem; text-align: center;">Kompetenzen</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; max-width: 1000px; margin: 0 auto;">
                    <div style="text-align: center;">
                        <i class="fas fa-users" style="font-size: 3rem; color: #6366f1; margin-bottom: 1rem;"></i>
                        <h3>HR-Strategie</h3>
                        <p>Entwicklung zukunftsfähiger Personalstrategien</p>
                    </div>
                    <div style="text-align: center;">
                        <i class="fas fa-laptop" style="font-size: 3rem; color: #6366f1; margin-bottom: 1rem;"></i>
                        <h3>Digitalisierung</h3>
                        <p>HR-Tech Implementierung und Prozessoptimierung</p>
                    </div>
                    <div style="text-align: center;">
                        <i class="fas fa-chart-line" style="font-size: 3rem; color: #6366f1; margin-bottom: 1rem;"></i>
                        <h3>Change Management</h3>
                        <p>Begleitung von Transformationsprozessen</p>
                    </div>
                </div>
                <button onclick="removeComponent('${componentId}')" style="position: absolute; top: 1rem; right: 1rem; background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.5rem; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `,
        contact: `
            <div class="page-component contact-component" id="${componentId}" style="padding: 3rem 2rem; background: #1e293b; color: white; position: relative;">
                <h2 style="font-size: 2rem; margin-bottom: 2rem; text-align: center;">Kontakt</h2>
                <div style="max-width: 600px; margin: 0 auto; text-align: center;">
                    <p style="margin-bottom: 2rem;">Lassen Sie uns über Ihre Herausforderungen sprechen!</p>
                    <div style="display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap;">
                        <a href="mailto:manuel@example.com" style="color: white; text-decoration: none;">
                            <i class="fas fa-envelope"></i> E-Mail
                        </a>
                        <a href="tel:+491234567890" style="color: white; text-decoration: none;">
                            <i class="fas fa-phone"></i> Telefon
                        </a>
                        <a href="https://linkedin.com" style="color: white; text-decoration: none;">
                            <i class="fab fa-linkedin"></i> LinkedIn
                        </a>
                    </div>
                </div>
                <button onclick="removeComponent('${componentId}')" style="position: absolute; top: 1rem; right: 1rem; background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.5rem; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `
    };
    
    if (componentTemplates[componentType]) {
        const componentDiv = document.createElement('div');
        componentDiv.innerHTML = componentTemplates[componentType];
        canvas.appendChild(componentDiv.firstElementChild);
    }
}

// Remove component from canvas
function removeComponent(componentId) {
    const component = document.getElementById(componentId);
    if (component && confirm('Möchten Sie diesen Baustein wirklich entfernen?')) {
        component.remove();
        
        // Show drop zone if canvas is empty
        const canvas = document.getElementById('pageBuilderCanvas');
        if (canvas.children.length === 0) {
            canvas.innerHTML = `
                <div id="dropZone" style="padding: 4rem; text-align: center; color: #666; min-height: 600px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                    <i class="fas fa-layer-group" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p style="font-size: 1.25rem;">Ziehe Bausteine hierher</p>
                    <p style="color: #999;">Erstelle deine individuelle Bewerbungsseite</p>
                </div>
            `;
        }
    }
}

// Preview page
function previewPage(appId) {
    const pageData = collectPageData();
    const previewWindow = window.open('', '_blank');
    
    const app = applications.find(a => a.id === appId);
    const pageTitle = document.getElementById('pageTitle').value;
    const primaryColor = document.getElementById('pagePrimaryColor').value;
    const font = document.getElementById('pageFont').value;
    
    const previewHTML = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${pageTitle}</title>
            <link href="https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: '${font}', sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 1200px; margin: 0 auto; }
                :root { --primary-color: ${primaryColor}; }
            </style>
        </head>
        <body>
            ${document.getElementById('pageBuilderCanvas').innerHTML}
        </body>
        </html>
    `;
    
    previewWindow.document.write(previewHTML);
    previewWindow.document.close();
}

// Save page
function savePageBuilder(appId) {
    const pageData = collectPageData();
    const app = applications.find(a => a.id === appId);
    
    if (!app) return;
    
    // Generate unique page URL
    if (!app.pageUrl) {
        const pageId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        app.pageUrl = `https://bewerbung.manuelweiss.de/${pageId}`;
    }
    
    // Save page data
    app.pageData = pageData;
    app.pageSettings = {
        title: document.getElementById('pageTitle').value,
        primaryColor: document.getElementById('pagePrimaryColor').value,
        font: document.getElementById('pageFont').value,
        seo: document.getElementById('pageSEO').value
    };
    
    // Update applications in localStorage
    localStorage.setItem('applications', JSON.stringify(applications));
    
    // Save page HTML
    const pageHTML = generatePageHTML(app);
    localStorage.setItem(`applicationPage_${appId}`, pageHTML);
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Seite gespeichert!', 'success');
    }
    
    // Refresh application list
    loadApplications();
}

// Collect page data
function collectPageData() {
    const canvas = document.getElementById('pageBuilderCanvas');
    const components = [];
    
    canvas.querySelectorAll('.page-component').forEach(component => {
        components.push({
            id: component.id,
            type: component.className.split(' ')[1].replace('-component', ''),
            content: component.outerHTML
        });
    });
    
    return components;
}

// Generate final page HTML
function generatePageHTML(app) {
    const { title, primaryColor, font, seo } = app.pageSettings;
    
    return `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <meta name="description" content="${seo}">
            <link href="https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: '${font}', sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 1200px; margin: 0 auto; }
                :root { --primary-color: ${primaryColor}; }
                .page-component { position: relative; }
                .hero-component button:last-child { display: none; }
                .about-component button:last-child { display: none; }
                .skills-component button:last-child { display: none; }
                .contact-component button:last-child { display: none; }
            </style>
        </head>
        <body>
            ${app.pageData.map(component => component.content).join('')}
        </body>
        </html>
    `;
}

// Close page builder
function closePageBuilder() {
    const modal = document.getElementById('pageBuilderModal');
    if (modal) {
        modal.remove();
    }
}

// Helper function for drag and drop positioning
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.page-component:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
