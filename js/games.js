/**
 * Games Manager
 * Verwaltet die Spiele-Übersicht und Online-Status
 */

class GamesManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.onlinePlayers = [];
        this.wsConnection = null;
        this.init();
    }

    async init() {
        console.log('🎮 Games Manager initializing...');
        
        // Prüfe Authentifizierung
        await this.checkAuthentication();
        
        if (this.isAuthenticated) {
            this.showGamesContent();
            this.initWebSocket();
            this.updateOnlinePlayers();
        } else {
            this.showLoginOverlay();
        }
        
        // Setup Auth Button
        this.setupAuthButton();
    }

    async checkAuthentication() {
        try {
            // Prüfe verschiedene Auth-Systeme
            if (window.unifiedAWSAuth && window.unifiedAWSAuth.isUserLoggedIn()) {
                this.isAuthenticated = true;
                this.currentUser = window.unifiedAWSAuth.getCurrentUser();
                console.log('✅ User authenticated via unifiedAWSAuth');
                return;
            }
            
            // Prüfe localStorage
            const authSession = localStorage.getItem('aws_auth_session');
            if (authSession) {
                try {
                    const session = JSON.parse(authSession);
                    if (session.accessToken && session.email) {
                        this.isAuthenticated = true;
                        this.currentUser = {
                            email: session.email,
                            name: session.email.split('@')[0]
                        };
                        console.log('✅ User authenticated via localStorage');
                        return;
                    }
                } catch (e) {
                    console.warn('Could not parse auth session:', e);
                }
            }
            
            // Prüfe andere Auth-Systeme
            if (window.awsAuth && window.awsAuth.isInitialized && window.awsAuth.currentUser) {
                this.isAuthenticated = true;
                this.currentUser = window.awsAuth.currentUser;
                console.log('✅ User authenticated via awsAuth');
                return;
            }
            
            console.log('❌ User not authenticated');
            this.isAuthenticated = false;
        } catch (error) {
            console.error('Error checking authentication:', error);
            this.isAuthenticated = false;
        }
    }

    showLoginOverlay() {
        document.getElementById('loginOverlay').style.display = 'flex';
        document.getElementById('gamesContent').style.display = 'none';
    }

    showGamesContent() {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('gamesContent').style.display = 'block';
    }

    setupAuthButton() {
        const authButton = document.getElementById('authButton');
        const authButtonText = document.getElementById('authButtonText');
        
        if (this.isAuthenticated) {
            authButtonText.textContent = this.currentUser?.name || this.currentUser?.email || 'Abmelden';
            authButton.onclick = () => this.logout();
        } else {
            authButtonText.textContent = 'Anmelden';
            authButton.onclick = () => window.location.href = 'index.html#contact';
        }
    }

    async logout() {
        try {
            if (window.unifiedAWSAuth) {
                await window.unifiedAWSAuth.logout();
            }
            localStorage.removeItem('aws_auth_session');
            window.location.reload();
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('aws_auth_session');
            window.location.reload();
        }
    }

    initWebSocket() {
        // WebSocket für Echtzeit-Updates
        // Für jetzt simulieren wir mit Polling
        // Später kann hier eine echte WebSocket-Verbindung implementiert werden
        console.log('📡 Initializing WebSocket connection...');
        
        // Simuliere Online-Status (später durch echten WebSocket ersetzen)
        this.simulateOnlinePlayers();
        
        // Polling für Online-Status (alle 5 Sekunden)
        setInterval(() => {
            this.updateOnlinePlayers();
        }, 5000);
    }

    simulateOnlinePlayers() {
        // Simuliere Online-Spieler (später durch echten Backend-Call ersetzen)
        const mockPlayers = [
            { id: '1', name: 'Spieler 1', status: 'online', game: 'chess' },
            { id: '2', name: 'Spieler 2', status: 'online', game: 'chess' },
            { id: '3', name: this.currentUser?.name || 'Du', status: 'online', game: 'chess' }
        ];
        
        this.onlinePlayers = mockPlayers;
        this.renderOnlinePlayers();
        this.updateGameStats();
    }

    async updateOnlinePlayers() {
        try {
            // Hier würde ein echter API-Call gemacht werden
            // Für jetzt verwenden wir die Simulation
            this.simulateOnlinePlayers();
        } catch (error) {
            console.error('Error updating online players:', error);
        }
    }

    renderOnlinePlayers() {
        const container = document.getElementById('onlinePlayersList');
        if (!container) return;
        
        if (this.onlinePlayers.length === 0) {
            container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Keine Spieler online</div>';
            return;
        }
        
        container.innerHTML = this.onlinePlayers.map(player => `
            <div class="online-player">
                <span class="status-dot"></span>
                <span>${player.name}</span>
                ${player.game ? `<span class="game-badge">${player.game}</span>` : ''}
            </div>
        `).join('');
    }

    updateGameStats() {
        const chessPlayers = this.onlinePlayers.filter(p => p.game === 'chess' || !p.game).length;
        document.getElementById('chessPlayersCount').textContent = chessPlayers;
        document.getElementById('tictactoePlayersCount').textContent = 0;
    }
}

// Global functions
function startChessGame(mode = 'player') {
    if (!window.gamesManager || !window.gamesManager.isAuthenticated) {
        alert('Bitte melden Sie sich zuerst an.');
        return;
    }
    
    if (window.chessGame) {
        window.chessGame.startNewGame(mode);
    } else {
        console.error('Chess game not initialized');
    }
}

function updateDifficulty() {
    const select = document.getElementById('difficultySelect');
    if (window.chessGame && select) {
        window.chessGame.computerDifficulty = select.value;
        console.log('Schwierigkeit geändert zu:', select.value);
    }
}

function closeChessGame() {
    document.getElementById('chessModal').style.display = 'none';
    if (window.chessGame) {
        window.chessGame.cleanup();
    }
}

function resignGame() {
    if (window.chessGame) {
        window.chessGame.resign();
    }
}

function offerDraw() {
    if (window.chessGame) {
        window.chessGame.offerDraw();
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.gamesManager = new GamesManager();
});
