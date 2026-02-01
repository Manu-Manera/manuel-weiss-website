/**
 * Shooting Stars with Mouse Inactivity Detection
 * Stars only appear after 10 seconds of mouse inactivity
 */

(function() {
    'use strict';
    
    let inactivityTimer = null;
    let shootingStarsActive = false;
    let shootingStarsContainer = null;
    const INACTIVITY_DELAY = 10000; // 10 seconds
    
    function createShootingStarsContainer() {
        if (shootingStarsContainer) return shootingStarsContainer;
        
        shootingStarsContainer = document.createElement('div');
        shootingStarsContainer.className = 'shooting-stars';
        shootingStarsContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
            opacity: 0;
            transition: opacity 1s ease;
        `;
        
        // Create 3 shooting stars
        for (let i = 0; i < 3; i++) {
            const star = document.createElement('div');
            star.className = 'shooting-star';
            star.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.8),
                            0 0 12px 4px rgba(99, 102, 241, 0.6);
                opacity: 0;
            `;
            shootingStarsContainer.appendChild(star);
        }
        
        document.body.insertBefore(shootingStarsContainer, document.body.firstChild);
        return shootingStarsContainer;
    }
    
    function animateShootingStar(star, index) {
        // Random starting position
        const startX = Math.random() * 60 + 20; // 20-80% from left
        const startY = Math.random() * 30; // 0-30% from top
        
        // Random angle (diagonal movement)
        const angle = Math.random() * 30 + 30; // 30-60 degrees
        const distance = Math.random() * 200 + 300; // 300-500px travel
        
        const endX = startX + (distance * Math.cos(angle * Math.PI / 180) / window.innerWidth * 100);
        const endY = startY + (distance * Math.sin(angle * Math.PI / 180) / window.innerHeight * 100);
        
        star.style.left = startX + '%';
        star.style.top = startY + '%';
        
        // Create trail effect
        star.style.setProperty('--end-x', (endX - startX) + '%');
        star.style.setProperty('--end-y', (endY - startY) + '%');
        
        // Animate
        star.animate([
            { 
                opacity: 0, 
                transform: 'translate(0, 0) scale(0.5)',
                boxShadow: '0 0 6px 2px rgba(255, 255, 255, 0.3), 0 0 12px 4px rgba(99, 102, 241, 0.2)'
            },
            { 
                opacity: 1, 
                transform: 'translate(20%, 20%) scale(1)',
                boxShadow: '0 0 10px 4px rgba(255, 255, 255, 0.9), 0 0 20px 8px rgba(99, 102, 241, 0.7), -100px 0 60px 2px rgba(255, 255, 255, 0.3)'
            },
            { 
                opacity: 1, 
                transform: 'translate(50%, 50%) scale(1.2)',
                boxShadow: '0 0 10px 4px rgba(255, 255, 255, 0.9), 0 0 20px 8px rgba(99, 102, 241, 0.7), -150px 0 80px 2px rgba(255, 255, 255, 0.4)'
            },
            { 
                opacity: 0, 
                transform: `translate(${(endX - startX)}%, ${(endY - startY)}%) scale(0.3)`,
                boxShadow: '0 0 6px 2px rgba(255, 255, 255, 0.1), 0 0 12px 4px rgba(99, 102, 241, 0.1)'
            }
        ], {
            duration: 1500 + Math.random() * 1000, // 1.5-2.5s
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fill: 'forwards'
        });
    }
    
    function launchShootingStar() {
        if (!shootingStarsActive || !shootingStarsContainer) return;
        
        const stars = shootingStarsContainer.querySelectorAll('.shooting-star');
        const randomStar = stars[Math.floor(Math.random() * stars.length)];
        
        animateShootingStar(randomStar, 0);
        
        // Schedule next shooting star (15-45 seconds)
        if (shootingStarsActive) {
            setTimeout(launchShootingStar, 15000 + Math.random() * 30000);
        }
    }
    
    function showShootingStars() {
        if (shootingStarsActive) return;
        
        shootingStarsActive = true;
        createShootingStarsContainer();
        shootingStarsContainer.style.opacity = '1';
        
        // Launch first shooting star after a short delay
        setTimeout(launchShootingStar, 1000 + Math.random() * 2000);
    }
    
    function hideShootingStars() {
        shootingStarsActive = false;
        if (shootingStarsContainer) {
            shootingStarsContainer.style.opacity = '0';
        }
    }
    
    function resetInactivityTimer() {
        // Hide shooting stars when user moves mouse
        hideShootingStars();
        
        // Clear existing timer
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }
        
        // Set new timer
        inactivityTimer = setTimeout(showShootingStars, INACTIVITY_DELAY);
    }
    
    function init() {
        // Only run on pages with starry theme
        if (!document.body.classList.contains('starry-theme') && 
            !document.body.classList.contains('starry-bg')) {
            return;
        }
        
        // Listen for mouse movement and other activity
        document.addEventListener('mousemove', resetInactivityTimer);
        document.addEventListener('mousedown', resetInactivityTimer);
        document.addEventListener('keydown', resetInactivityTimer);
        document.addEventListener('scroll', resetInactivityTimer);
        document.addEventListener('touchstart', resetInactivityTimer);
        
        // Start the inactivity timer
        resetInactivityTimer();
        
        console.log('Shooting stars initialized - will appear after 10s of inactivity');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
