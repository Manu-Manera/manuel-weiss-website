// Profile Image Management
async function loadSavedProfileImage() {
    try {
        // Try Netlify Storage first
        if (window.netlifyStorage) {
            const netlifyImage = await window.netlifyStorage.loadProfileImage();
            if (netlifyImage) {
                const profileImage = document.getElementById('profile-photo');
                if (profileImage) {
                    profileImage.src = netlifyImage;
                    console.log('✅ Profilbild aus Netlify Storage geladen');
                    return;
                }
            }
        }
        
        // Fallback to localStorage
        let savedImage = localStorage.getItem('profileImage') || 
                        localStorage.getItem('mwps-profile-image') || 
                        localStorage.getItem('current-profile-image');
        
        // Also check websiteData
        const websiteData = localStorage.getItem('websiteData');
        if (websiteData) {
            try {
                const data = JSON.parse(websiteData);
                if (data.profileImage) {
                    savedImage = data.profileImage;
                }
            } catch (e) {}
        }
        
        if (savedImage && savedImage.startsWith('data:image/')) {
            const profileImage = document.getElementById('profile-photo');
            if (profileImage) {
                profileImage.src = savedImage;
                console.log('✅ Profilbild aus localStorage geladen');
                return; // Wichtig: Beende hier, wenn Bild geladen wurde
            }
        } else {
            console.log('ℹ️ Kein gespeichertes Profilbild gefunden, verwende Standard');
        }
        
        // Fallback: Verwende Standard-Profilbild
        const profileImage = document.getElementById('profile-photo');
        if (profileImage) {
            // Prüfe, ob das Standard-Bild existiert
            const standardImage = 'manuel-weiss-photo.svg';
            profileImage.src = standardImage;
            console.log('✅ Standard-Profilbild geladen:', standardImage);
            
            // Prüfe, ob das Bild erfolgreich geladen wurde
            profileImage.onload = () => {
                console.log('✅ Standard-Profilbild erfolgreich geladen');
            };
            
            profileImage.onerror = () => {
                console.error('❌ Standard-Profilbild konnte nicht geladen werden:', standardImage);
                // Versuche alternative Bildformate
                const alternatives = ['manuel-weiss-photo.jpg', 'manuel-weiss-photo.png'];
                tryAlternativeImage(profileImage, alternatives, 0);
            };
        }
    } catch (error) {
        console.log('Fehler beim Laden des Profilbilds:', error);
    }
}

// Hilfsfunktion für alternative Bildformate
function tryAlternativeImage(profileImage, alternatives, index) {
    if (index >= alternatives.length) {
        console.error('❌ Kein alternatives Bildformat funktioniert');
        return;
    }
    
    const alternative = alternatives[index];
    console.log(`🔄 Versuche alternatives Bildformat: ${alternative}`);
    
    profileImage.src = alternative;
    profileImage.onload = () => {
        console.log(`✅ Alternatives Bild erfolgreich geladen: ${alternative}`);
    };
    
    profileImage.onerror = () => {
        console.log(`❌ Alternatives Bild fehlgeschlagen: ${alternative}`);
        // Versuche nächstes alternatives Format
        tryAlternativeImage(profileImage, alternatives, index + 1);
    };
}

// Content Management
function loadSavedContent() {
    try {
        const savedData = localStorage.getItem('websiteData');
        if (savedData) {
            const data = JSON.parse(savedData);
            
            // Lade Hero-Texte
            if (data.heroName) {
                const element = document.getElementById('hero-name');
                if (element) {
                    element.textContent = data.heroName;
                    console.log('✅ Hero Name geladen:', data.heroName);
                }
            }
            
            if (data.heroTitle) {
                const element = document.getElementById('hero-title');
                if (element) {
                    element.textContent = data.heroTitle;
                    console.log('✅ Hero Title geladen:', data.heroTitle);
                }
            }
            
            if (data.heroSubtitle) {
                const element = document.getElementById('hero-subtitle');
                if (element) {
                    element.textContent = data.heroSubtitle;
                    console.log('✅ Hero Subtitle geladen:', data.heroSubtitle);
                }
            }
            
            if (data.heroDescription) {
                const element = document.getElementById('hero-description');
                if (element) {
                    element.textContent = data.heroDescription;
                    console.log('✅ Hero Description geladen:', data.heroDescription);
                }
            }
            
            // Lade Services dynamisch
            if (data.services && data.services.length > 0) {
                loadDynamicServices(data.services);
            }
            
            // Lade Activities dynamisch
            if (data.activities && data.activities.length > 0) {
                loadDynamicActivities(data.activities);
            }
            
            // Lade Projects dynamisch
            if (data.projects && data.projects.length > 0) {
                loadDynamicProjects(data.projects);
            }
            
            // Lade Contact-Informationen
            if (data.contactEmail) {
                const elements = document.querySelectorAll('[data-contact="email"]');
                elements.forEach(el => el.textContent = data.contactEmail);
            }
            
            if (data.contactPhone) {
                const elements = document.querySelectorAll('[data-contact="phone"]');
                elements.forEach(el => el.textContent = data.contactPhone);
            }
            
            // Lade Zertifikate dynamisch
            if (data.certificates && data.certificates.length > 0) {
                loadDynamicCertificates(data.certificates);
            }
            
            // Lade Statistiken dynamisch
            if (data.stats && data.stats.length > 0) {
                loadDynamicStats(data.stats);
            }
            
            console.log('✅ Alle Website-Inhalte geladen');
        }
    } catch (error) {
        console.log('Fehler beim Laden der Website-Inhalte:', error);
    }
}

function loadDynamicServices(services) {
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

function loadDynamicActivities(activities) {
    const activitiesContainer = document.querySelector('.activities-grid');
    if (!activitiesContainer) {
        console.log('❌ Activities Container nicht gefunden');
        return;
    }
    
    if (activities && activities.length > 0) {
        // Erstelle Activity-Cards mit Platzhaltern für Bilder
        activitiesContainer.innerHTML = activities.map(activity => `
            <div class="activity-card" data-activity="${activity.adminKey || activity.id}">
                <div class="activity-image">
                    <div class="activity-image-placeholder">
                        <i class="${activity.icon}"></i>
                    </div>
                    <img class="activity-hero-image" src="" alt="${activity.title}" style="display: none;">
                </div>
                <div class="activity-content">
                    <h3>${activity.title}</h3>
                    <p>${activity.description}</p>
                    <a href="${activity.link}" class="btn btn-outline">Details ansehen</a>
                </div>
            </div>
        `).join('');
        
        console.log('✅ Activities dynamisch geladen:', activities);
        
        // Lade Hauptbilder für jede Aktivität
        activities.forEach(activity => {
            loadActivityHeroImage(activity);
        });
        
    } else {
        console.log('⚠️ Keine Activities gefunden in den Daten');
    }
}

// Lade Hauptbild für eine Aktivität
function loadActivityHeroImage(activity) {
    const activityCard = document.querySelector(`[data-activity="${activity.adminKey || activity.id}"]`);
    if (!activityCard) return;
    
    const imagePlaceholder = activityCard.querySelector('.activity-image-placeholder');
    const heroImage = activityCard.querySelector('.activity-hero-image');
    
    if (!imagePlaceholder || !heroImage) return;
    
    // Versuche zuerst ein hochgeladenes Bild zu laden
    const storageKey = `${activity.adminKey || activity.id}_images`;
    const uploadedImages = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (uploadedImages.length > 0) {
        // Verwende das erste hochgeladene Bild
        const firstImage = uploadedImages[0];
        heroImage.src = firstImage.imageData;
        heroImage.alt = firstImage.title || activity.title;
        
        // Verstecke Placeholder und zeige Bild
        imagePlaceholder.style.display = 'none';
        heroImage.style.display = 'block';
        
        console.log(`🖼️ Hauptbild für ${activity.title} geladen:`, firstImage.title);
        
    } else if (activity.images && activity.images.length > 0) {
        // Verwende Standardbild aus der JSON-Datei
        const firstImage = activity.images[0];
        heroImage.src = firstImage.filename;
        heroImage.alt = firstImage.title || activity.title;
        
        // Verstecke Placeholder und zeige Bild
        imagePlaceholder.style.display = 'none';
        heroImage.style.display = 'block';
        
        console.log(`🖼️ Standardbild für ${activity.title} geladen:`, firstImage.title);
        
    } else {
        // Kein Bild verfügbar, behalte Placeholder
        console.log(`ℹ️ Kein Bild für ${activity.title} verfügbar`);
    }
}

// Aktualisiere das Hauptbild einer Aktivität (wird aufgerufen, wenn neue Bilder hochgeladen werden)
function updateActivityHeroImage(activityKey) {
    console.log(`🔄 Aktualisiere Hauptbild für: ${activityKey}`);
    
    // Finde die entsprechende Activity-Card
    const activityCard = document.querySelector(`[data-activity="${activityKey}"]`);
    if (!activityCard) {
        console.log(`❌ Activity-Card für ${activityKey} nicht gefunden`);
        return;
    }
    
    const imagePlaceholder = activityCard.querySelector('.activity-image-placeholder');
    const heroImage = activityCard.querySelector('.activity-hero-image');
    
    if (!imagePlaceholder || !heroImage) return;
    
    // Lade das neueste Bild aus dem localStorage
    const storageKey = `${activityKey}_images`;
    const uploadedImages = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (uploadedImages.length > 0) {
        // Verwende das neueste hochgeladene Bild
        const latestImage = uploadedImages[uploadedImages.length - 1];
        heroImage.src = latestImage.imageData;
        heroImage.alt = latestImage.title || 'Aktivität';
        
        // Verstecke Placeholder und zeige Bild
        imagePlaceholder.style.display = 'none';
        heroImage.style.display = 'block';
        
        console.log(`🖼️ Hauptbild für ${activityKey} aktualisiert:`, latestImage.title);
        
    } else {
        // Kein Bild verfügbar, zeige Placeholder
        imagePlaceholder.style.display = 'block';
        heroImage.style.display = 'none';
        console.log(`ℹ️ Kein Bild für ${activityKey} verfügbar, zeige Placeholder`);
    }
}

// Aktualisiere alle Activity-Hauptbilder
function updateAllActivityHeroImages() {
    console.log('🔄 Aktualisiere alle Activity-Hauptbilder...');
    
    const activities = ['wohnmobil', 'fotobox', 'sup', 'ebike'];
    
    activities.forEach(activityKey => {
        updateActivityHeroImage(activityKey);
    });
    
    console.log('✅ Alle Activity-Hauptbilder aktualisiert');
}

function loadDynamicProjects(projects) {
    const projectsContainer = document.querySelector('.projects-grid');
    if (!projectsContainer) return;
    
    projectsContainer.innerHTML = projects.map(project => `
        <div class="project-card">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-tags">
                ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function loadDynamicCertificates(certificates) {
    // Update im Hero-Bereich (Certification Badges)
    const heroCertificates = document.querySelector('[data-certificates="hero"]');
    if (heroCertificates && certificates.length > 0) {
        heroCertificates.innerHTML = certificates.map(cert => `
            <div class="badge">
                <i class="fas fa-certificate"></i>
                <span>${cert}</span>
            </div>
        `).join('');
        console.log('✅ Zertifikate im Hero-Bereich aktualisiert:', certificates);
    }
    
    // Update im Footer-Bereich (falls vorhanden)
    const footerCertificates = document.querySelector('[data-certificates="footer"]');
    if (footerCertificates) {
        footerCertificates.innerHTML = certificates.map(cert => `<span class="certificate">${cert}</span>`).join(' • ');
    }
    
    // Update in der Kontakt-Sektion (falls vorhanden)
    const contactCertificates = document.querySelector('[data-certificates="contact"]');
    if (contactCertificates) {
        contactCertificates.innerHTML = certificates.map(cert => `<li>${cert}</li>`).join('');
    }
}

function loadDynamicStats(stats) {
    // Update im Hero-Bereich (Expertise Stats)
    const heroStats = document.querySelector('[data-stats="hero"]');
    if (heroStats && stats.length > 0) {
        heroStats.innerHTML = stats.map(stat => `
            <div class="stat">
                <span class="stat-number">${stat.value}${stat.unit}</span>
                <span class="stat-label">${stat.name}</span>
            </div>
        `).join('');
        console.log('✅ Statistiken im Hero-Bereich aktualisiert:', stats);
    }
}

// Listen for updates from admin panel
window.addEventListener('message', function(event) {
    if (event.data.type === 'updateProfileImage') {
        const profileImage = document.getElementById('profile-photo');
        if (profileImage) {
            profileImage.src = event.data.imageData;
            console.log('✅ Profilbild vom Admin-Panel aktualisiert');
        }
    }
    
    if (event.data.type === 'updateHeroContent') {
        // Lade alle Inhalte neu
        loadSavedContent();
        console.log('✅ Website-Inhalte vom Admin-Panel aktualisiert');
    }
});

// Load saved content on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM geladen, starte Profilbild-Laden...');
    
    // Debug: Zeige Profilbild-Status
    debugProfileImageStatus();
    
    loadSavedProfileImage();
    loadSavedContent();
    
    // Aktualisiere Hauptbilder nach kurzer Verzögerung
    setTimeout(() => {
        updateAllActivityHeroImages();
    }, 1000);
});

// Debug-Funktion für Profilbild-Status
function debugProfileImageStatus() {
    console.log('🔍 Debug: Profilbild-Status...');
    
    // Prüfe localStorage
    const profileImage = localStorage.getItem('profileImage');
    const mwpsImage = localStorage.getItem('mwps-profile-image');
    const currentImage = localStorage.getItem('current-profile-image');
    const websiteData = localStorage.getItem('websiteData');
    
    console.log('📦 localStorage Status:');
    console.log('- profileImage:', profileImage ? '✅ vorhanden' : '❌ nicht vorhanden');
    console.log('- mwps-profile-image:', mwpsImage ? '✅ vorhanden' : '❌ nicht vorhanden');
    console.log('- current-profile-image:', currentImage ? '✅ vorhanden' : '❌ nicht vorhanden');
    console.log('- websiteData:', websiteData ? '✅ vorhanden' : '❌ nicht vorhanden');
    
    // Prüfe DOM-Element
    const profilePhoto = document.getElementById('profile-photo');
    console.log('🖼️ DOM-Element profile-photo:', profilePhoto ? '✅ gefunden' : '❌ nicht gefunden');
    
    if (profilePhoto) {
        console.log('📊 Aktueller src:', profilePhoto.src);
        console.log('📊 Aktueller alt:', profilePhoto.alt);
        console.log('📊 Aktuelle Breite:', profilePhoto.width);
        console.log('📊 Aktuelle Höhe:', profilePhoto.height);
    }
    
    // Prüfe Standard-Bild
    const standardImage = new Image();
    standardImage.onload = () => {
        console.log('✅ Standard-Bild kann geladen werden: manuel-weiss-photo.svg');
    };
    standardImage.onerror = () => {
        console.error('❌ Standard-Bild kann nicht geladen werden: manuel-weiss-photo.svg');
    };
    standardImage.src = 'manuel-weiss-photo.svg';
}

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
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

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Form submission handling
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const service = formData.get('service');
        const message = formData.get('message');
        
        // Basic validation
        if (!name || !email || !message) {
            showNotification('Bitte füllen Sie alle Pflichtfelder aus.', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'error');
            return;
        }
        
        // Simulate form submission (replace with actual backend integration)
        showNotification('Nachricht wird gesendet...', 'info');
        
        // Simulate API call
        setTimeout(() => {
            showNotification('Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns in Kürze bei Ihnen.', 'success');
            this.reset();
        }, 2000);
    });
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }
        
        .notification-close:hover {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .rental-card, .project-card, .expertise-section');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Load saved profile image if available
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
        const profileImage = document.getElementById('profile-photo');
        if (profileImage) {
            profileImage.src = savedImage;
        }
    }
});

// Service selection in contact form
const serviceSelect = document.getElementById('service');
if (serviceSelect) {
    serviceSelect.addEventListener('change', function() {
        const messageField = document.getElementById('message');
        const selectedService = this.value;
        
        // Pre-fill message based on service selection
        const serviceMessages = {
            'beratung': 'Ich interessiere mich für Ihre Beratungsdienstleistungen im Bereich Digitalisierung und Prozessmanagement. Bitte kontaktieren Sie mich für ein unverbindliches Gespräch.',
            'wohnmobil': 'Ich interessiere mich für die Vermietung Ihres Wohnmobils. Bitte senden Sie mir Informationen zu Verfügbarkeit und Preisen.',
            'fotobox': 'Ich suche eine Fotobox für ein Event. Bitte informieren Sie mich über Verfügbarkeit, Preise und technische Details.',
            'sup': 'Ich interessiere mich für die Vermietung von Stand-Up-Paddles. Bitte senden Sie mir Informationen zu Größen, Preisen und Transport.',
            'ebike': 'Ich suche E-Bikes für einen Ausflug. Bitte informieren Sie mich über verfügbare Modelle und Preise.',
            'projekt': 'Ich interessiere mich für Ihre IT- und Upcycling-Projekte. Bitte kontaktieren Sie mich für weitere Details.'
        };
        
        if (serviceMessages[selectedService]) {
            messageField.value = serviceMessages[selectedService];
        }
    });
}

// Add loading state to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function() {
        if (this.type === 'submit') {
            const originalText = this.textContent;
            this.textContent = 'Wird gesendet...';
            this.disabled = true;
            
            // Reset button after form submission
            setTimeout(() => {
                this.textContent = originalText;
                this.disabled = false;
            }, 3000);
        }
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add active state to navigation based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Add active state styles
const style = document.createElement('style');
style.textContent = `
    .nav-menu a.active {
        color: #2563eb !important;
        font-weight: 600;
    }
    
    .nav-menu a.active::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 0;
        width: 100%;
        height: 2px;
        background: #2563eb;
    }
`;
document.head.appendChild(style);

// Lazy loading for images (if added later)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close mobile menu
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        
        // Close notifications
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => notification.remove());
    }
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    // Navbar background change
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
    
    // Parallax effect
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Load profile image and content when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Seite geladen - lade Profilbild...');
    loadSavedProfileImage();
    loadSavedContent();
});

// Listen for updates from admin panel
window.addEventListener('message', function(event) {
    console.log('Message received:', event.data);
    
    if (event.data.type === 'updateProfileImage') {
        const imgElement = document.getElementById('profile-photo');
        if (imgElement && event.data.imageData) {
            imgElement.src = event.data.imageData;
            console.log('✅ Profilbild von Admin-Panel aktualisiert');
        }
    }
    
    if (event.data.type === 'updateHeroContent') {
        loadSavedContent(); // Reload all content
        console.log('✅ Website-Inhalte vom Admin-Panel aktualisiert');
    }
    
    if (event.data.type === 'updateActivityImages') {
        // Aktualisiere die entsprechende Galerie
        if (window.activityGallery && event.data.activity) {
            console.log('✅ Galerie-Update empfangen für:', event.data.activity);
            // Lade die Galerie neu
            window.activityGallery.loadActivityImages();
        }
        
        // Aktualisiere auch das Hauptbild auf der Startseite
        updateActivityHeroImage(event.data.activity);
    }
}); 