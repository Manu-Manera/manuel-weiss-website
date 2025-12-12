// Modern Website Script - Manuel Weiss Professional Services

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeWebsite();
    fixMobileScroll();
});

// Mobile Scroll Fixes
function fixMobileScroll() {
    // Fix für iOS Safari Viewport
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        // Setze Viewport Height korrekt
        const setViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', setViewportHeight);
        
        // Entferne fixed positioning nach Load
        setTimeout(() => {
            document.body.classList.add('scrollable');
        }, 100);
    }
    
    // Verhindere Scroll-Locking beim Mobile Menu - NUR wenn Menu offen ist
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    
    if (mobileMenu && mobileMenuOverlay) {
        const observer = new MutationObserver(() => {
            const isMenuActive = mobileMenu.classList.contains('active');
            // Nur overflow: hidden setzen wenn Menu wirklich offen ist
            if (isMenuActive) {
                // Speichere aktuelle Scroll-Position
                const scrollY = window.scrollY;
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollY}px`;
                document.body.style.width = '100%';
            } else {
                // Sicherstellen dass Scrollen wieder funktioniert
                const scrollY = document.body.style.top;
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                // Stelle Scroll-Position wieder her
                if (scrollY) {
                    window.scrollTo(0, parseInt(scrollY || '0') * -1);
                }
            }
        });
        
        observer.observe(mobileMenu, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        // Initial check - STELLE SICHER dass Scrollen funktioniert wenn Menu geschlossen ist
        if (!mobileMenu.classList.contains('active')) {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            // Zusätzliche Sicherheit: Entferne alle inline styles die Scrollen blockieren könnten
            document.documentElement.style.overflow = '';
            document.documentElement.style.position = '';
        }
    }
    
    // ZUSÄTZLICHER FIX: Stelle sicher dass body immer scrollbar ist (außer wenn Menu offen)
    // Prüfe alle 500ms ob body scrollbar ist
    setInterval(() => {
        const mobileMenu = document.getElementById('mobileMenu');
        const isMenuActive = mobileMenu && mobileMenu.classList.contains('active');
        
        if (!isMenuActive) {
            // Stelle sicher dass Scrollen funktioniert
            if (document.body.style.overflow === 'hidden' || document.body.style.position === 'fixed') {
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
            }
        }
    }, 500);
    
    // Smooth Scroll für alle Browser
    if ('scrollBehavior' in document.documentElement.style) {
        // Native smooth scroll unterstützt
    } else {
        // Polyfill für ältere Browser
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href !== '#' && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }
}

// Initialize all website functions
function initializeWebsite() {
    hideLoadingScreen();
    initMobileMenu();
    initNavigation();
    initAnimations();
    initContactForm();
    initSmoothScroll();
    initTypingEffect();
    initParallax();
    loadProfileImageFromStorage();
    loadHeroContentFromStorage();
    setupProfileImageListener();
    initNutritionPlanner();
}

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileAuthSection = document.getElementById('mobileAuthSection');
    const authSection = document.querySelector('.auth-section');
    
    if (!mobileMenuToggle || !mobileMenu) return;
    
    // Toggle Menu
    mobileMenuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        mobileMenuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        mobileMenuOverlay.classList.toggle('active');
        const isMenuActive = mobileMenu.classList.contains('active');
        if (isMenuActive) {
            // Speichere Scroll-Position
            const scrollY = window.scrollY;
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
        } else {
            // Stelle Scroll-Position wieder her
            const scrollY = document.body.style.top;
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }
    });
    
    // KRITISCH: Stelle sicher dass Menu initial geschlossen ist und Scrollen funktioniert
    if (!mobileMenu.classList.contains('active')) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.position = '';
    }
    
    // Close Menu on Overlay Click
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function() {
            const scrollY = document.body.style.top;
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            // Stelle Scroll-Position wieder her
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        });
    }
    
    // Close Menu on Link Click
    const mobileLinks = mobileMenu.querySelectorAll('.nav-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            const scrollY = document.body.style.top;
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            // Stelle Scroll-Position wieder her
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        });
    });
    
    // Copy Auth Section to Mobile Menu - VERBESSERT
    if (mobileAuthSection) {
        const updateMobileAuth = () => {
            // Versuche zuerst die Desktop Auth Section zu finden
            const desktopAuthSection = document.querySelector('.nav-menu .auth-section') || 
                                      document.querySelector('.auth-section');
            
            if (desktopAuthSection) {
                const authClone = desktopAuthSection.cloneNode(true);
                mobileAuthSection.innerHTML = '';
                mobileAuthSection.appendChild(authClone);
                
                // Event-Listener für geklonte Buttons neu setzen
                const clonedAuthButton = mobileAuthSection.querySelector('#realAuthButton');
                if (clonedAuthButton) {
                    clonedAuthButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        // Öffne Auth Modal oder führe Login aus
                        if (window.realUserAuth && typeof window.realUserAuth.showLoginModal === 'function') {
                            window.realUserAuth.showLoginModal();
                        } else if (window.openAuthModal && typeof window.openAuthModal === 'function') {
                            window.openAuthModal();
                        } else {
                            // Fallback: Suche nach dem originalen Button und trigger ihn
                            const originalButton = document.querySelector('#realAuthButton');
                            if (originalButton) {
                                originalButton.click();
                            }
                        }
                        // Schließe Mobile Menu nach Klick
                        mobileMenuToggle.classList.remove('active');
                        mobileMenu.classList.remove('active');
                        if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
                        document.body.style.overflow = '';
                        document.body.style.position = '';
                        document.body.style.width = '';
                    });
                }
            } else {
                // Fallback: Erstelle eigenen Anmelden-Button
                mobileAuthSection.innerHTML = `
                    <button id="mobileAuthButton" class="nav-login-btn" style="width: 100%; justify-content: center;">
                        <i class="fas fa-user"></i>
                        <span data-de="Anmelden" data-en="Login">Anmelden</span>
                    </button>
                `;
                const mobileAuthButton = mobileAuthSection.querySelector('#mobileAuthButton');
                if (mobileAuthButton) {
                    mobileAuthButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (window.realUserAuth && typeof window.realUserAuth.showLoginModal === 'function') {
                            window.realUserAuth.showLoginModal();
                        } else if (window.openAuthModal && typeof window.openAuthModal === 'function') {
                            window.openAuthModal();
                        }
                        // Schließe Mobile Menu
                        const scrollY = document.body.style.top;
                        mobileMenuToggle.classList.remove('active');
                        mobileMenu.classList.remove('active');
                        if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
                        document.body.style.overflow = '';
                        document.body.style.position = '';
                        document.body.style.top = '';
                        document.body.style.width = '';
                        // Stelle Scroll-Position wieder her
                        if (scrollY) {
                            window.scrollTo(0, parseInt(scrollY || '0') * -1);
                        }
                    });
                }
            }
        };
        
        // Initial update
        updateMobileAuth();
        
        // Update when auth state changes (alle 2 Sekunden, nicht zu häufig)
        setInterval(updateMobileAuth, 2000);
        
        // Update auch bei Auth-Events
        document.addEventListener('authStateChanged', updateMobileAuth);
        document.addEventListener('userLoggedIn', updateMobileAuth);
        document.addEventListener('userLoggedOut', updateMobileAuth);
    }
    
    // Close Menu on Escape Key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            const scrollY = document.body.style.top;
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            // Stelle Scroll-Position wieder her
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }
    });
}

// Hide loading screen
function hideLoadingScreen() {
    const loading = document.getElementById('loading');
    if (loading) {
        setTimeout(() => {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 300);
        }, 500);
    }
}

// Navigation functionality
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll
        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
    
    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Active nav link
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');
            
            // Close mobile menu
            if (navMenu.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
    
    // Update active link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// Initialize animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Stagger animations for grids
                if (entry.target.classList.contains('services-grid') ||
                    entry.target.classList.contains('timeline') ||
                    entry.target.classList.contains('rental-grid')) {
                    const children = entry.target.children;
                    Array.from(children).forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('visible');
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in');
    animatedElements.forEach(el => observer.observe(el));
}

// Contact form handling
function initContactForm() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Show loading state
            const submitBtn = form.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gesendet...';
            submitBtn.disabled = true;
            
            try {
                // Simulate sending (replace with actual API call)
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Success
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Erfolgreich gesendet!';
                submitBtn.style.background = 'var(--gradient-success)';
                
                // Reset form
                setTimeout(() => {
                    form.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
                
                // Show success notification
                showNotification('Nachricht erfolgreich gesendet!', 'success');
                
    } catch (error) {
                // Error
                submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Fehler!';
                submitBtn.style.background = 'var(--danger)';
                submitBtn.disabled = false;
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                }, 3000);
                
                showNotification('Fehler beim Senden. Bitte versuchen Sie es erneut.', 'error');
            }
        });
    }
}

// Smooth scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                const offset = 80; // Navbar height
                const targetPosition = target.offsetTop - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
}

// Typing effect for hero title
function initTypingEffect() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;
    
    const text = heroTitle.textContent;
    heroTitle.textContent = '';
    heroTitle.style.opacity = '1';
    
    let index = 0;
    const typeWriter = () => {
        if (index < text.length) {
            heroTitle.textContent += text.charAt(index);
            index++;
            setTimeout(typeWriter, 50);
        }
    };
    
    // Start typing after a short delay
    setTimeout(typeWriter, 1000);
}

// Parallax effect
function initParallax() {
    const parallaxElements = document.querySelectorAll('.hero-bg');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 1rem;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Counter animation for stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat-value');
    
    counters.forEach(counter => {
        const target = parseInt(counter.innerText);
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.innerText = Math.ceil(current) + (counter.innerText.includes('+') ? '+' : counter.innerText.includes('%') ? '%' : '');
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = counter.innerText;
            }
        };
        
        // Start animation when in viewport
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counter);
    });
}

// Initialize counter animation
animateCounters();

// Magnetic buttons effect
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translate(0, 0)';
    });
});

// Image lazy loading
const lazyImages = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
        }
    });
});

lazyImages.forEach(img => imageObserver.observe(img));

// Add cursor effect
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
cursor.style.cssText = `
    width: 20px;
    height: 20px;
    border: 2px solid var(--primary);
    border-radius: 50%;
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    transition: all 0.1s ease;
    opacity: 0;
`;
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    cursor.style.opacity = '1';
    cursor.style.left = e.clientX - 10 + 'px';
    cursor.style.top = e.clientY - 10 + 'px';
});

document.addEventListener('mouseout', () => {
    cursor.style.opacity = '0';
});

// Hover effect for links and buttons
document.querySelectorAll('a, button').forEach(element => {
    element.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(1.5)';
        cursor.style.borderColor = 'var(--secondary)';
    });
    
    element.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursor.style.borderColor = 'var(--primary)';
    });
});

// Service cards 3D effect
document.querySelectorAll('.service-card, .rental-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
});

// Timeline animation
const timelineItems = document.querySelectorAll('.timeline-item');
const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

timelineItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(50px)';
    item.style.transition = 'all 0.6s ease';
    timelineObserver.observe(item);
});

// Dark mode toggle (if needed)
function initDarkMode() {
    const darkModeToggle = document.createElement('button');
    darkModeToggle.className = 'dark-mode-toggle';
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    darkModeToggle.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary);
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 100;
        transition: all 0.3s ease;
    `;
    
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        darkModeToggle.innerHTML = document.body.classList.contains('dark-mode') 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    });
    
    document.body.appendChild(darkModeToggle);
}

// Initialize dark mode toggle
// initDarkMode(); // Uncomment if you want dark mode

// Performance optimization - Debounce scroll events
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

// Apply debounce to scroll events
const debouncedScroll = debounce(() => {
    // Scroll-based animations
}, 100);

window.addEventListener('scroll', debouncedScroll);

// Preload critical images
function preloadImages() {
    const criticalImages = [
        'manuel-weiss-photo.svg',
        'images/wohnmobil/wohnmobil-exterior.jpg',
        'images/fotobox/fotobox-1.jpg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Preload images
preloadImages();

// Service Worker Registration (for PWA)
// SERVICE WORKER DEAKTIVIERT - verursacht Cache-Probleme
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered:', registration))
            .catch(error => console.log('SW registration failed:', error));
    });
}

// Load profile image from localStorage
function loadProfileImageFromStorage() {
    // SCHUTZ: Nur laden wenn noch kein Profilbild gesetzt wurde oder wenn es das Standard-Bild ist
    const currentSrc = window.currentProfileImageSrc;
    const DEFAULT_IMAGES = ['manuel-weiss-portrait.jpg', 'manuel-weiss-photo.svg'];
    const isCurrentDefault = currentSrc && DEFAULT_IMAGES.some(defaultImg => currentSrc.includes(defaultImg));
    
    // Wenn bereits ein AWS-Profilbild gesetzt wurde, nicht überschreiben
    if (window.profileImageSetByAWS && currentSrc) {
        console.log('🛡️ SCRIPT.JS: AWS-Profilbild bereits gesetzt - überschreibe nicht');
        return;
    }
    
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage && savedImage.startsWith('data:image/')) {
        // Nur setzen wenn noch kein Profilbild gesetzt oder wenn es das Standard-Bild ist
        if (!currentSrc || isCurrentDefault) {
            const profileImageElement = document.getElementById('profile-photo');
            if (profileImageElement) {
                profileImageElement.src = savedImage;
                profileImageElement.dataset.loadedSrc = savedImage;
                window.currentProfileImageSrc = savedImage;
                console.log('✅ Profilbild aus localStorage geladen (script.js)');
            }
        } else {
            console.log('🛡️ SCRIPT.JS: Profilbild bereits gesetzt - überschreibe nicht mit localStorage');
        }
    }
}

// Hero-Content aus localStorage laden
function loadHeroContentFromStorage() {
    const savedHeroContent = localStorage.getItem('heroContent');
    if (savedHeroContent) {
        try {
            const heroData = JSON.parse(savedHeroContent);
            
            // Aktualisiere die Hero-Elemente
            const heroName = document.querySelector('#hero-name');
            const heroTitle = document.querySelector('#hero-title');
            const heroSubtitle = document.querySelector('#hero-subtitle');
            const heroDescription = document.querySelector('#hero-description');
            
            if (heroName && heroData.name) heroName.textContent = heroData.name;
            if (heroTitle && heroData.title) heroTitle.textContent = heroData.title;
            if (heroSubtitle && heroData.subtitle) heroSubtitle.textContent = heroData.subtitle;
            if (heroDescription && heroData.description) heroDescription.textContent = heroData.description;
            
            // Wende Text-Effekte an
            if (heroData.textEffect && heroData.textEffect !== 'none') {
                applyTextEffect(heroData.textEffect);
            }
            
            console.log('✅ Hero-Content aus localStorage geladen (script.js)');
        } catch (error) {
            console.error('Fehler beim Laden des Hero-Content:', error);
        }
    }
}

// Text-Effekte anwenden
function applyTextEffect(effect) {
    const heroTitle = document.querySelector('#hero-title');
    const heroSubtitle = document.querySelector('#hero-subtitle');
    
    if (!heroTitle && !heroSubtitle) return;
    
    // Entferne vorherige Effekte
    [heroTitle, heroSubtitle].forEach(element => {
        if (element) {
            element.classList.remove('text-gradient', 'text-glow', 'text-shadow', 'text-animated');
        }
    });
    
    // Wende neuen Effekt an
    switch (effect) {
        case 'gradient':
            [heroTitle, heroSubtitle].forEach(element => {
                if (element) element.classList.add('text-gradient');
            });
            break;
        case 'glow':
            [heroTitle, heroSubtitle].forEach(element => {
                if (element) element.classList.add('text-glow');
            });
            break;
        case 'shadow':
            [heroTitle, heroSubtitle].forEach(element => {
                if (element) element.classList.add('text-shadow');
            });
            break;
        case 'animated':
            [heroTitle, heroSubtitle].forEach(element => {
                if (element) element.classList.add('text-animated');
            });
            break;
    }
}

// Listen for localStorage changes to update profile image in real-time
function setupProfileImageListener() {
    window.addEventListener('storage', function(e) {
        if (e.key === 'profileImage' && e.newValue && e.newValue.startsWith('data:image/')) {
            // SCHUTZ: Nur aktualisieren wenn noch kein AWS-Profilbild gesetzt wurde
            if (window.profileImageSetByAWS && window.currentProfileImageSrc) {
                console.log('🛡️ SCRIPT.JS: AWS-Profilbild bereits gesetzt - überschreibe nicht mit storage event');
                return;
            }
            
            const profileImageElement = document.getElementById('profile-photo');
            if (profileImageElement) {
                profileImageElement.src = e.newValue;
                profileImageElement.dataset.loadedSrc = e.newValue;
                window.currentProfileImageSrc = e.newValue;
                console.log('✅ Profilbild in Echtzeit aktualisiert (storage event)');
            }
        }
    });
    
    // Auch auf localStorage-Änderungen im gleichen Tab reagieren
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        if (key === 'profileImage' && value && value.startsWith('data:image/')) {
            // SCHUTZ: Nur aktualisieren wenn noch kein AWS-Profilbild gesetzt wurde
            if (window.profileImageSetByAWS && window.currentProfileImageSrc) {
                console.log('🛡️ SCRIPT.JS: AWS-Profilbild bereits gesetzt - überschreibe nicht mit setItem');
                return;
            }
            
            const profileImageElement = document.getElementById('profile-photo');
            if (profileImageElement) {
                profileImageElement.src = value;
                profileImageElement.dataset.loadedSrc = value;
                window.currentProfileImageSrc = value;
                console.log('✅ Profilbild in Echtzeit aktualisiert (setItem override)');
            }
        }
    };
}

// Initialize Nutrition Planner
function initNutritionPlanner() {
    // Wait for DOM to be fully loaded
    setTimeout(() => {
        if (typeof NutritionPlanner !== 'undefined') {
            window.nutritionPlanner = new NutritionPlanner();
            console.log('🍽️ Nutrition Planner initialized');
        } else {
            console.error('❌ NutritionPlanner class not found');
        }
        
        if (typeof AIIntegration !== 'undefined') {
            window.aiIntegration = new AIIntegration();
            console.log('🤖 AI Integration initialized');
        } else {
            console.error('❌ AIIntegration class not found');
        }
    }, 100);
}

// Export functions for external use
window.showNotification = showNotification;
window.loadProfileImageFromStorage = loadProfileImageFromStorage;
