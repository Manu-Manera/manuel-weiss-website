/**
 * 🔐 AUTHENTICATION MODALS
 * Login und Register Modal System
 */

// Login Modal HTML
const loginModalHTML = `
<div id="loginModal" class="auth-modal" style="display: none;">
    <div class="auth-modal-content">
        <div class="auth-modal-header">
            <h2>Anmelden</h2>
            <button class="auth-modal-close" onclick="hideLoginModal()">&times;</button>
        </div>
        <div class="auth-modal-body">
            <form id="loginForm" onsubmit="event.preventDefault(); handleLogin();">
                <div class="auth-form-group">
                    <label for="loginEmail">E-Mail</label>
                    <input type="email" id="loginEmail" required placeholder="ihre@email.com">
                </div>
                <div class="auth-form-group">
                    <label for="loginPassword">Passwort</label>
                    <input type="password" id="loginPassword" required placeholder="Ihr Passwort">
                </div>
                <div class="auth-form-actions">
                    <button type="submit" class="auth-btn auth-btn-primary">
                        <i class="fas fa-sign-in-alt"></i>
                        Anmelden
                    </button>
                    <button type="button" class="auth-btn auth-btn-link" onclick="showRegisterModal()">
                        Noch kein Konto? Registrieren
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
`;

// Register Modal HTML
const registerModalHTML = `
<div id="registerModal" class="auth-modal" style="display: none;">
    <div class="auth-modal-content">
        <div class="auth-modal-header">
            <h2>Registrieren</h2>
            <button class="auth-modal-close" onclick="hideRegisterModal()">&times;</button>
        </div>
        <div class="auth-modal-body">
            <form id="registerForm" onsubmit="event.preventDefault(); handleRegister();">
                <div class="auth-form-group">
                    <label for="registerName">Name</label>
                    <input type="text" id="registerName" required placeholder="Ihr Name">
                </div>
                <div class="auth-form-group">
                    <label for="registerEmail">E-Mail</label>
                    <input type="email" id="registerEmail" required placeholder="ihre@email.com">
                </div>
                <div class="auth-form-group">
                    <label for="registerPassword">Passwort</label>
                    <input type="password" id="registerPassword" required placeholder="Mindestens 8 Zeichen">
                </div>
                <div class="auth-form-actions">
                    <button type="submit" class="auth-btn auth-btn-primary">
                        <i class="fas fa-user-plus"></i>
                        Registrieren
                    </button>
                    <button type="button" class="auth-btn auth-btn-link" onclick="showLoginModal()">
                        Bereits registriert? Anmelden
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
`;

// CSS für die Modals
const authModalCSS = `
<style>
.auth-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
}

.auth-modal-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 400px;
    max-height: 90vh;
    overflow-y: auto;
    animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.auth-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.auth-modal-header h2 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
    font-weight: 600;
}

.auth-modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #666;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.2s ease;
}

.auth-modal-close:hover {
    background: #f3f4f6;
    color: #333;
}

.auth-modal-body {
    padding: 1.5rem;
}

.auth-form-group {
    margin-bottom: 1.5rem;
}

.auth-form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #374151;
    font-weight: 500;
    font-size: 0.9rem;
}

.auth-form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

.auth-form-group input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.auth-form-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.auth-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.auth-btn-primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
}

.auth-btn-primary:hover {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.auth-btn-link {
    background: none;
    color: #6366f1;
    text-decoration: underline;
}

.auth-btn-link:hover {
    color: #4f46e5;
}

/* Mobile Optimizations */
@media (max-width: 480px) {
    .auth-modal-content {
        width: 95%;
        margin: 1rem;
    }
    
    .auth-modal-header,
    .auth-modal-body {
        padding: 1rem;
    }
}
</style>
`;

// Initialize Auth Modals
function initializeAuthModals() {
    // Füge CSS hinzu
    const styleSheet = document.createElement('style');
    styleSheet.textContent = authModalCSS.replace('<style>', '').replace('</style>', '');
    document.head.appendChild(styleSheet);
    
    // Füge Modals zum DOM hinzu
    document.body.insertAdjacentHTML('beforeend', loginModalHTML);
    document.body.insertAdjacentHTML('beforeend', registerModalHTML);
    
    // Event Listeners für Modal-Schließung
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('auth-modal')) {
            hideLoginModal();
            hideRegisterModal();
        }
    });
    
    // ESC-Taste zum Schließen
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideLoginModal();
            hideRegisterModal();
        }
    });
    
    console.log('✅ Auth Modals initialized');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeAuthModals);

console.log('🔐 Auth Modals loaded');
