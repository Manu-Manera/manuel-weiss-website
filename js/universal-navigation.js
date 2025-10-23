/**
 * Universal Navigation Fix
 * Behebt Navigation-Probleme auf allen Seiten
 */

class UniversalNavigation {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 Universal Navigation initialized');
        this.setupSmoothScrolling();
        this.setupActiveLinks();
        this.setupMobileMenu();
    }

    setupSmoothScrolling() {
        // Fix all navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    console.log('🎯 Scrolling to:', targetId);
                    this.scrollToElement(target);
                    this.updateActiveLink(link);
                } else {
                    console.warn('❌ Target not found:', targetId);
                    // Try to find target on main page
                    this.handleCrossPageNavigation(targetId);
                }
            });
        });
    }

    scrollToElement(target) {
        const offset = 80; // Navbar height
        const targetPosition = target.offsetTop - offset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    updateActiveLink(activeLink) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to clicked link
        activeLink.classList.add('active');
    }

    handleCrossPageNavigation(targetId) {
        // If we're not on the main page, redirect to main page with anchor
        if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
            console.log('🔄 Redirecting to main page with anchor:', targetId);
            window.location.href = `index.html${targetId}`;
        }
    }

    setupActiveLinks() {
        // Update active links on scroll
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section[id]');
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });
            
            // Update nav links based on current section
            document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    setupMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
            
            // Close mobile menu when clicking on a link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    if (navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        navToggle.classList.remove('active');
                    }
                });
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UniversalNavigation();
});

// Also initialize on window load as fallback
window.addEventListener('load', () => {
    if (!window.universalNavigation) {
        window.universalNavigation = new UniversalNavigation();
    }
});
