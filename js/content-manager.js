// Content Manager für Manuel Weiss Professional Services
class ContentManager {
    constructor() {
        this.content = null;
        this.init();
    }

    async init() {
        try {
            await this.loadContent();
            this.renderWebsite();
            this.setupEventListeners();
        } catch (error) {
            console.error('Fehler beim Laden der Inhalte:', error);
            this.showFallbackContent();
        }
    }

    async loadContent() {
        try {
            // Versuche verschiedene Pfade für die JSON-Datei
            const possiblePaths = [
                './data/website-content.json',
                '/data/website-content.json',
                'data/website-content.json'
            ];
            
            let response = null;
            for (const path of possiblePaths) {
                try {
                    response = await fetch(path);
                    if (response.ok) {
                        console.log('✅ JSON-Datei erfolgreich geladen von:', path);
                        break;
                    }
                } catch (e) {
                    console.log('❌ Pfad nicht gefunden:', path);
                }
            }
            
            if (!response || !response.ok) {
                throw new Error(`HTTP error! status: ${response ? response.status : 'No response'}`);
            }
            
            this.content = await response.json();
            console.log('✅ Content erfolgreich geladen:', this.content);
        } catch (error) {
            console.error('Fehler beim Laden der JSON-Datei:', error);
            // Fallback: Verwende eingebettete Inhalte
            this.content = this.getFallbackContent();
        }
    }

    getFallbackContent() {
        return {
            hero: {
                name: "Manuel Weiss",
                title: "Professional Services",
                subtitle: "Digitalisierung • Prozessmanagement • HR-Tech Beratung",
                description: "Seit über 6 Jahren begleite ich Unternehmen bei ihrer digitalen Transformation.",
                profileImage: "manuel-weiss-photo.jpg",
                stats: [
                    { name: "Jahre Erfahrung", value: 6, unit: "+" },
                    { name: "Projekte geleitet", value: 30, unit: "+" },
                    { name: "Lernkurveneffekt", value: 100, unit: "%" }
                ]
            },
            services: [],
            rentals: [],
            projects: [],
            contact: {
                email: "weiss-manuel@gmx.de",
                phone: "+49 173 3993407"
            }
        };
    }

    renderWebsite() {
        if (!this.content) return;

        this.renderHero();
        this.renderServices();
        this.renderRentals();
        this.renderProjects();
        this.renderContact();
        this.updateMetaTags();
    }

    renderHero() {
        const hero = this.content.hero;
        if (!hero) return;

        // Hero-Bereich aktualisieren
        const heroName = document.querySelector('#hero-name');
        const heroTitle = document.querySelector('#hero-title');
        const heroSubtitle = document.querySelector('#hero-subtitle');
        const heroDescription = document.querySelector('#hero-description');
        const profileImage = document.querySelector('#profile-photo');

        if (heroName) heroName.textContent = hero.name;
        if (heroTitle) heroTitle.textContent = hero.title;
        if (heroSubtitle) heroSubtitle.textContent = hero.subtitle;
        if (heroDescription) heroDescription.textContent = hero.description;
        
        // Profilbild mit verbesserter Fehlerbehandlung laden
        if (profileImage && !profileImage.getAttribute('data-loaded')) {
            if (hero.profileImage) {
                // Prüfe zuerst, ob ein hochgeladenes Profilbild existiert
                const uploadedImage = localStorage.getItem('profileImage');
                if (uploadedImage && uploadedImage.startsWith('data:image/')) {
                    profileImage.src = uploadedImage;
                    profileImage.setAttribute('data-loaded', 'true');
                    console.log('✅ Hochgeladenes Profilbild verwendet (content-manager)');
                } else {
                    // Verwende Image Manager für bessere Fehlerbehandlung
                    if (window.imageManager) {
                        const imagePath = hero.profileImage.startsWith('./') ? hero.profileImage : `./${hero.profileImage}`;
                        window.imageManager.loadImageWithFallback(profileImage, imagePath);
                        profileImage.setAttribute('data-loaded', 'true');
                        console.log('✅ Profilbild mit Image Manager geladen:', imagePath);
                    } else {
                        // Fallback zur ursprünglichen Methode
                        profileImage.src = hero.profileImage;
                        profileImage.setAttribute('data-loaded', 'true');
                        console.log('✅ Standard-Profilbild verwendet (content-manager):', hero.profileImage);
                    }
                }
                profileImage.alt = hero.name;
            }
        }

        // Statistiken rendern
        this.renderStats(hero.stats);
    }

    renderStats(stats) {
        const statsContainer = document.querySelector('.hero-stats');
        if (!statsContainer || !stats) return;

        statsContainer.innerHTML = stats.map(stat => `
            <div class="stat-item">
                <div class="stat-value">${stat.value}${stat.unit}</div>
                <div class="stat-label">${stat.name}</div>
            </div>
        `).join('');
    }

    renderServices() {
        const services = this.content.services;
        if (!services) return;

        const servicesContainer = document.querySelector('.services-grid');
        if (!servicesContainer) return;

        servicesContainer.innerHTML = services.map(service => `
            <div class="service-card ${service.isPrimary ? 'primary' : ''}">
                <div class="service-icon">
                    <i class="${service.icon}"></i>
                </div>
                <h3>${service.title}</h3>
                <p>${service.description}</p>
                <ul>
                    ${service.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    }

    renderRentals() {
        const rentals = this.content.rentals;
        if (!rentals) return;

        const rentalsContainer = document.querySelector('.activities-grid');
        if (!rentalsContainer) return;

        rentalsContainer.innerHTML = rentals.map(rental => `
            <div class="activity-card">
                <div class="activity-icon">
                    <i class="${rental.icon}"></i>
                </div>
                <h3>${rental.title}</h3>
                <p>${rental.description}</p>
                <a href="${rental.link}" class="btn btn-outline">Details ansehen</a>
            </div>
        `).join('');
    }

    renderProjects() {
        const projects = this.content.projects;
        if (!projects) return;

        const projectsContainer = document.querySelector('.projects-grid');
        if (!projectsContainer) return;

        projectsContainer.innerHTML = projects.map(project => `
            <div class="project-card">
                <h3>${project.title}</h3>
                <p class="project-company">${project.company}</p>
                <p>${project.description}</p>
                <div class="project-tech">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    renderContact() {
        const contact = this.content.contact;
        if (!contact) return;

        const contactEmail = document.querySelector('#contact-email');
        const contactPhone = document.querySelector('#contact-phone');

        if (contactEmail) contactEmail.textContent = contact.email;
        if (contactPhone) contactPhone.textContent = contact.phone;
    }

    updateMetaTags() {
        const meta = this.content.meta;
        if (!meta) return;

        // Titel aktualisieren
        if (meta.title) {
            document.title = meta.title;
        }

        // Meta-Description aktualisieren
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && meta.description) {
            metaDescription.setAttribute('content', meta.description);
        }

        // Meta-Keywords aktualisieren
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords && meta.keywords) {
            metaKeywords.setAttribute('content', meta.keywords);
        }
    }

    setupEventListeners() {
        // Event-Listener für dynamische Inhalte
        document.addEventListener('click', (e) => {
            if (e.target.matches('.service-card, .activity-card, .project-card')) {
                this.handleCardClick(e.target);
            }
        });

        // Smooth Scrolling für Anker-Links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    handleCardClick(card) {
        // Animation beim Klicken
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = 'scale(1)';
        }, 150);
    }

    showFallbackContent() {
        console.warn('Verwende Fallback-Inhalte');
        // Hier könnten Standard-Inhalte angezeigt werden
    }

    // Admin-Funktionen
    updateContent(section, data) {
        if (!this.content) return false;

        try {
            // Inhalte aktualisieren
            if (section === 'hero' && this.content.hero) {
                Object.assign(this.content.hero, data);
            } else if (section === 'services' && this.content.services) {
                const serviceIndex = this.content.services.findIndex(s => s.id === data.id);
                if (serviceIndex !== -1) {
                    this.content.services[serviceIndex] = { ...this.content.services[serviceIndex], ...data };
                }
            } else if (section === 'rentals' && this.content.rentals) {
                const rentalIndex = this.content.rentals.findIndex(r => r.id === data.id);
                if (rentalIndex !== -1) {
                    this.content.rentals[rentalIndex] = { ...this.content.rentals[rentalIndex], ...data };
                }
            }

            // Website neu rendern
            this.renderWebsite();
            
            // Änderungen speichern
            this.saveContent();
            
            return true;
        } catch (error) {
            console.error('Fehler beim Aktualisieren der Inhalte:', error);
            return false;
        }
    }

    async saveContent() {
        try {
            // Verwende das Data Persistence System
            if (window.dataPersistence) {
                await window.dataPersistence.saveData(this.content);
            } else {
                // Fallback: Lokaler Speicher
                localStorage.setItem('mwps-content-backup', JSON.stringify(this.content));
            }
            
            console.log('Inhalte erfolgreich gespeichert');
        } catch (error) {
            console.error('Fehler beim Speichern:', error);
        }
    }

    // Utility-Funktionen
    getContent(section) {
        return this.content ? this.content[section] : null;
    }

    getAllContent() {
        return this.content;
    }

    // Bildverwaltung
    addImage(service, imageData) {
        if (!this.content || !this.content.rentals) return false;

        const rental = this.content.rentals.find(r => r.id === parseInt(service));
        if (rental) {
            if (!rental.images) rental.images = [];
            rental.images.push({
                id: Date.now(),
                ...imageData,
                uploadedAt: new Date().toISOString()
            });
            this.renderWebsite();
            this.saveContent();
            return true;
        }
        return false;
    }

    removeImage(service, imageId) {
        if (!this.content || !this.content.rentals) return false;

        const rental = this.content.rentals.find(r => r.id === parseInt(service));
        if (rental && rental.images) {
            rental.images = rental.images.filter(img => img.id !== imageId);
            this.renderWebsite();
            this.saveContent();
            return true;
        }
        return false;
    }
}

// Globale Instanz erstellen
let contentManager;

// Initialisierung wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    contentManager = new ContentManager();
});

// Export für andere Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentManager;
}
