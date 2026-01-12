/**
 * Success Checkmark Animation
 * Zeigt einen animierten Haken, der wie handgezeichnet erscheint
 */

(function() {
    // CSS für die Animation
    const checkmarkStyles = document.createElement('style');
    checkmarkStyles.id = 'success-checkmark-styles';
    checkmarkStyles.textContent = `
        .success-checkmark-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        }
        
        .success-checkmark {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            display: block;
            stroke-width: 3;
            stroke: #10b981;
            stroke-miterlimit: 10;
            box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
            animation: checkmark-scale 0.4s ease-in-out 0.4s both;
            background: rgba(16, 185, 129, 0.1);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        
        .success-checkmark__circle {
            stroke-dasharray: 166;
            stroke-dashoffset: 166;
            stroke-width: 3;
            stroke-miterlimit: 10;
            stroke: #10b981;
            fill: none;
            animation: checkmark-stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        
        .success-checkmark__check {
            transform-origin: 50% 50%;
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            stroke: #10b981;
            stroke-width: 3;
            stroke-linecap: round;
            stroke-linejoin: round;
            animation: checkmark-stroke 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
        }
        
        @keyframes checkmark-stroke {
            100% {
                stroke-dashoffset: 0;
            }
        }
        
        @keyframes checkmark-scale {
            0%, 100% {
                transform: none;
            }
            50% {
                transform: scale3d(1.1, 1.1, 1);
            }
        }
        
        .success-checkmark-fade-out {
            animation: checkmark-fade-out 0.3s ease-out forwards;
        }
        
        @keyframes checkmark-fade-out {
            0% {
                opacity: 1;
                transform: scale(1);
            }
            100% {
                opacity: 0;
                transform: scale(0.8);
            }
        }
        
        /* Kleine Version für inline Anzeige */
        .success-checkmark-inline {
            width: 24px;
            height: 24px;
            display: inline-block;
            vertical-align: middle;
        }
        
        .success-checkmark-inline .success-checkmark {
            width: 24px;
            height: 24px;
            box-shadow: none;
            background: transparent;
        }
        
        .success-checkmark-inline .success-checkmark__circle {
            stroke-width: 2;
        }
        
        .success-checkmark-inline .success-checkmark__check {
            stroke-width: 2;
        }
    `;
    
    // Füge Styles hinzu wenn noch nicht vorhanden
    if (!document.getElementById('success-checkmark-styles')) {
        document.head.appendChild(checkmarkStyles);
    }
    
    /**
     * Zeigt den animierten Erfolgs-Haken
     * @param {Object} options - Optionen
     * @param {number} options.duration - Anzeigedauer in ms (default: 1500)
     * @param {string} options.position - Position: 'top-right', 'center', 'inline' (default: 'top-right')
     * @param {HTMLElement} options.target - Ziel-Element für inline Anzeige
     */
    function showSuccessCheck(options = {}) {
        const duration = options.duration || 1500;
        const position = options.position || 'top-right';
        const target = options.target || null;
        
        // Entferne bestehende Checkmarks
        const existing = document.querySelectorAll('.success-checkmark-container');
        existing.forEach(el => el.remove());
        
        // Container erstellen
        const container = document.createElement('div');
        container.className = 'success-checkmark-container';
        
        if (position === 'center') {
            container.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10000;
            `;
        } else if (position === 'inline' && target) {
            container.className = 'success-checkmark-inline';
            container.style.cssText = `
                position: relative;
                display: inline-block;
            `;
        }
        
        // SVG Checkmark
        container.innerHTML = `
            <svg class="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle class="success-checkmark__circle" cx="26" cy="26" r="23" fill="none"/>
                <path class="success-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
        `;
        
        // Zum DOM hinzufügen
        if (position === 'inline' && target) {
            target.appendChild(container);
        } else {
            document.body.appendChild(container);
        }
        
        // Nach duration entfernen
        setTimeout(() => {
            container.classList.add('success-checkmark-fade-out');
            setTimeout(() => {
                if (container.parentNode) {
                    container.remove();
                }
            }, 300);
        }, duration);
        
        return container;
    }
    
    // Global verfügbar machen
    window.showSuccessCheck = showSuccessCheck;
    
    console.log('✅ Success Checkmark Animation loaded');
})();
