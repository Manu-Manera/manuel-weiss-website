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
        
        // Filtere aktuellen Spieler und offline Spieler
        const visiblePlayers = this.onlinePlayers.filter(p => 
            p.id !== this.currentUser?.id && p.status === 'online'
        );
        
        if (visiblePlayers.length === 0) {
            container.innerHTML = '<div class="no-players"><i class="fas fa-users"></i><p>Keine anderen Spieler online</p></div>';
            return;
        }
        
        container.innerHTML = visiblePlayers.map(player => `
            <li class="online-player-item" data-player-id="${player.id}">
                <div class="player-avatar">
                    ${player.name.charAt(0).toUpperCase()}
                </div>
                <div class="player-info">
                    <span class="player-name">${player.name}</span>
                    ${player.rating ? `<span class="player-rating">${player.rating}</span>` : ''}
                </div>
                <div class="player-actions">
                    <button class="btn-challenge" onclick="challengePlayer('${player.id}', '${player.name}')" title="Herausfordern">
                        <i class="fas fa-chess"></i>
                    </button>
                </div>
            </li>
        `).join('');
    }

    updateGameStats() {
        const chessPlayers = this.onlinePlayers.filter(p => 
            (p.game === 'chess' || !p.game) && p.status === 'online'
        ).length;
        document.getElementById('chessPlayersCount').textContent = chessPlayers;
        document.getElementById('tictactoePlayersCount').textContent = 0;
    }

    setOnlineStatus(isOnline) {
        // Später: Echte API-Call zum Backend
        console.log('Setting online status to:', isOnline);
        // Simuliere Status-Update
        if (this.currentUser) {
            const userIndex = this.onlinePlayers.findIndex(p => p.id === this.currentUser.id);
            if (userIndex !== -1) {
                this.onlinePlayers[userIndex].status = isOnline ? 'online' : 'offline';
            } else {
                this.onlinePlayers.push({
                    id: this.currentUser.id,
                    name: this.currentUser.name || this.currentUser.email?.split('@')[0] || 'Du',
                    status: isOnline ? 'online' : 'offline',
                    game: null
                });
            }
            this.renderOnlinePlayers();
            this.updateGameStats();
        }
    }
}

// Global functions
function startChessGame(mode = 'player') {
    if (!window.gamesManager || !window.gamesManager.isAuthenticated) {
        alert('Bitte melden Sie sich zuerst an.');
        return;
    }
    
    // Warte bis chess game initialisiert ist
    if (window.chessGame) {
        window.chessGame.startNewGame(mode);
    } else {
        // Warte auf Initialisierung
        const checkInterval = setInterval(() => {
            if (window.chessGame) {
                window.chessGame.startNewGame(mode);
                clearInterval(checkInterval);
            }
        }, 100);
        
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!window.chessGame) {
                console.error('Chess game not initialized');
                alert('Schachspiel konnte nicht geladen werden. Bitte Seite neu laden.');
            }
        }, 2000);
    }
}

function updateDifficulty() {
    const select = document.getElementById('difficultySelect');
    if (window.chessGame && select) {
        window.chessGame.computerDifficulty = select.value;
        console.log('Schwierigkeit geändert zu:', select.value);
    }
}

function undoMove() {
    if (window.chessGame) {
        window.chessGame.undoMove();
    }
}

function selectPromotion(piece) {
    if (window.chessGame && window.chessGame.promotionResolve) {
        window.chessGame.promotionResolve(piece);
        window.chessGame.promotionResolve = null;
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

function closeChessGame() {
    const modal = document.getElementById('chessModal');
    if (modal) {
        modal.style.display = 'none';
    }
    if (window.chessGame) {
        window.chessGame.cleanup();
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
