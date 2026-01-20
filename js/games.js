/**
 * Games Manager
 * Verwaltet die Spiele-Übersicht und Online-Status
 */

class GamesManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.onlinePlayers = [];
        this.isOnline = true;
        this.init();
    }

    async init() {
        console.log('🎮 Games Manager initializing...');
        
        // Prüfe Authentifizierung
        await this.checkAuthentication();
        
        if (this.isAuthenticated) {
            this.showGamesContent();
            this.setupOnlineToggle();
            this.loadOnlinePlayers();
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
                            id: session.email,
                            email: session.email,
                            name: session.name || session.email.split('@')[0]
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
            authButton.onclick = () => {
                if (window.authModals) {
                    window.authModals.showLogin();
                } else if (window.unifiedAuthModals) {
                    window.unifiedAuthModals.showLogin();
                } else if (typeof openLoginModal === 'function') {
                    openLoginModal();
                } else {
                    window.location.href = 'index.html?login=true';
                }
            };
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

    setupOnlineToggle() {
        const toggle = document.getElementById('onlineStatusToggle');
        const statusText = document.getElementById('statusText');
        
        // Lade gespeicherten Status
        const savedStatus = localStorage.getItem('games_online_status');
        this.isOnline = savedStatus !== 'offline';
        
        if (toggle) {
            toggle.checked = this.isOnline;
            toggle.addEventListener('change', (e) => {
                this.isOnline = e.target.checked;
                localStorage.setItem('games_online_status', this.isOnline ? 'online' : 'offline');
                
                if (statusText) {
                    statusText.textContent = this.isOnline ? 'Online' : 'Offline';
                    statusText.className = 'status-text ' + (this.isOnline ? 'online' : 'offline');
                }
                
                // Update Buttons
                this.updatePlayerButtons();
            });
        }
        
        if (statusText) {
            statusText.textContent = this.isOnline ? 'Online' : 'Offline';
            statusText.className = 'status-text ' + (this.isOnline ? 'online' : 'offline');
        }
        
        this.updatePlayerButtons();
    }

    updatePlayerButtons() {
        const playerBtns = document.querySelectorAll('#playPlayerBtn, [onclick*="player"]');
        playerBtns.forEach(btn => {
            if (btn.id === 'playPlayerBtn') {
                btn.disabled = !this.isOnline;
                btn.title = this.isOnline ? '' : 'Setze deinen Status auf Online um gegen Spieler zu spielen';
            }
        });
    }

    async loadOnlinePlayers() {
        const container = document.getElementById('onlinePlayersList');
        const countEl = document.getElementById('onlineCount');
        
        // Da wir kein echtes Backend haben, zeigen wir realistisch keine Spieler
        this.onlinePlayers = [];
        
        if (countEl) {
            countEl.textContent = '0';
        }
        
        if (container) {
            container.innerHTML = `
                <div class="no-players-message">
                    <i class="fas fa-user-slash"></i>
                    <p>Aktuell sind keine anderen Spieler online.</p>
                    <small>Spiele gegen den Computer oder lade Freunde ein!</small>
                </div>
            `;
        }
        
        // Spieler-Count für Schach
        const chessCount = document.getElementById('chessPlayersCount');
        if (chessCount) chessCount.textContent = '0';
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// CHESS FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function startChessGame(mode = 'player') {
    if (!window.gamesManager || !window.gamesManager.isAuthenticated) {
        alert('Bitte melden Sie sich zuerst an.');
        return;
    }
    
    if (mode === 'player' && !window.gamesManager.isOnline) {
        alert('Setze deinen Status auf Online um gegen andere Spieler zu spielen.');
        return;
    }
    
    if (window.chessGame) {
        window.chessGame.startNewGame(mode);
    } else {
        const checkInterval = setInterval(() => {
            if (window.chessGame) {
                window.chessGame.startNewGame(mode);
                clearInterval(checkInterval);
            }
        }, 100);
        
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!window.chessGame) {
                alert('Schachspiel konnte nicht geladen werden. Bitte Seite neu laden.');
            }
        }, 2000);
    }
}

function changeBoardDesign(design) {
    if (window.chessGame) {
        window.chessGame.setBoardDesign(design);
    }
    localStorage.setItem('chess_board_design', design);
}

function updateDifficulty() {
    const select = document.getElementById('difficultySelect');
    if (window.chessGame && select) {
        window.chessGame.computerDifficulty = select.value;
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
    document.getElementById('chessModal').style.display = 'none';
    if (window.chessGame) {
        window.chessGame.cleanup();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TIC TAC TOE
// ═══════════════════════════════════════════════════════════════════════════

class TicTacToe {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.gameMode = 'computer';
        this.winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]  // Diagonals
        ];
    }

    start(mode) {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.gameMode = mode;
        
        document.getElementById('tictactoeModal').style.display = 'flex';
        this.renderBoard();
        this.updateStatus('Du bist X - Du beginnst!');
    }

    renderBoard() {
        const container = document.getElementById('tttBoard');
        if (!container) return;
        
        container.innerHTML = this.board.map((cell, i) => `
            <div class="ttt-cell ${cell ? 'filled' : ''}" 
                 data-index="${i}" 
                 onclick="window.ticTacToe.makeMove(${i})">
                ${cell ? `<span class="ttt-${cell.toLowerCase()}">${cell}</span>` : ''}
            </div>
        `).join('');
    }

    makeMove(index) {
        if (this.gameOver || this.board[index]) return;
        
        this.board[index] = this.currentPlayer;
        this.renderBoard();
        
        const winner = this.checkWinner();
        if (winner) {
            this.gameOver = true;
            this.updateStatus(winner === 'X' ? '🎉 Du hast gewonnen!' : '😔 Computer hat gewonnen!');
            this.highlightWinningLine(winner);
            return;
        }
        
        if (this.board.every(cell => cell)) {
            this.gameOver = true;
            this.updateStatus('🤝 Unentschieden!');
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        
        if (this.gameMode === 'computer' && this.currentPlayer === 'O') {
            this.updateStatus('Computer denkt...');
            setTimeout(() => this.computerMove(), 500);
        } else {
            this.updateStatus(`${this.currentPlayer === 'X' ? 'Du bist' : 'Gegner ist'} dran`);
        }
    }

    computerMove() {
        if (this.gameOver) return;
        
        // Einfache KI: Erst gewinnen, dann blocken, dann Mitte, dann zufällig
        let move = this.findWinningMove('O') ?? 
                   this.findWinningMove('X') ?? 
                   (this.board[4] === null ? 4 : null) ??
                   this.getRandomMove();
        
        if (move !== null) {
            this.board[move] = 'O';
            this.renderBoard();
            
            const winner = this.checkWinner();
            if (winner) {
                this.gameOver = true;
                this.updateStatus('😔 Computer hat gewonnen!');
                this.highlightWinningLine(winner);
                return;
            }
            
            if (this.board.every(cell => cell)) {
                this.gameOver = true;
                this.updateStatus('🤝 Unentschieden!');
                return;
            }
            
            this.currentPlayer = 'X';
            this.updateStatus('Du bist dran');
        }
    }

    findWinningMove(player) {
        for (let pattern of this.winPatterns) {
            const [a, b, c] = pattern;
            const line = [this.board[a], this.board[b], this.board[c]];
            const playerCount = line.filter(cell => cell === player).length;
            const emptyCount = line.filter(cell => cell === null).length;
            
            if (playerCount === 2 && emptyCount === 1) {
                return pattern[line.indexOf(null)];
            }
        }
        return null;
    }

    getRandomMove() {
        const empty = this.board.map((cell, i) => cell === null ? i : null).filter(i => i !== null);
        return empty[Math.floor(Math.random() * empty.length)];
    }

    checkWinner() {
        for (let pattern of this.winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return this.board[a];
            }
        }
        return null;
    }

    highlightWinningLine(winner) {
        for (let pattern of this.winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] === winner && this.board[b] === winner && this.board[c] === winner) {
                const cells = document.querySelectorAll('.ttt-cell');
                pattern.forEach(i => cells[i]?.classList.add('winning'));
                break;
            }
        }
    }

    updateStatus(text) {
        const status = document.getElementById('tttStatus');
        if (status) status.textContent = text;
    }
}

function startTicTacToe(mode) {
    if (!window.gamesManager?.isAuthenticated) {
        alert('Bitte melden Sie sich zuerst an.');
        return;
    }
    
    if (!window.ticTacToe) {
        window.ticTacToe = new TicTacToe();
    }
    window.ticTacToe.start(mode);
}

function restartTicTacToe() {
    if (window.ticTacToe) {
        window.ticTacToe.start(window.ticTacToe.gameMode);
    }
}

function closeTicTacToe() {
    document.getElementById('tictactoeModal').style.display = 'none';
}

// ═══════════════════════════════════════════════════════════════════════════
// VIER GEWINNT (Connect Four)
// ═══════════════════════════════════════════════════════════════════════════

class ConnectFour {
    constructor() {
        this.rows = 6;
        this.cols = 7;
        this.board = [];
        this.currentPlayer = 'red';
        this.gameOver = false;
        this.gameMode = 'computer';
    }

    start(mode) {
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        this.currentPlayer = 'red';
        this.gameOver = false;
        this.gameMode = mode;
        
        document.getElementById('connectFourModal').style.display = 'flex';
        this.renderBoard();
        this.updateStatus('Du bist Rot - Du beginnst!');
    }

    renderBoard() {
        const container = document.getElementById('c4Board');
        if (!container) return;
        
        let html = '<div class="c4-column-hints">';
        for (let col = 0; col < this.cols; col++) {
            html += `<div class="c4-column-hint" onclick="window.connectFour.dropPiece(${col})">▼</div>`;
        }
        html += '</div><div class="c4-grid">';
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.board[row][col];
                html += `
                    <div class="c4-cell" data-row="${row}" data-col="${col}" onclick="window.connectFour.dropPiece(${col})">
                        <div class="c4-piece ${cell || ''}"></div>
                    </div>
                `;
            }
        }
        html += '</div>';
        
        container.innerHTML = html;
    }

    dropPiece(col) {
        if (this.gameOver) return;
        
        // Finde unterste leere Zeile
        let row = -1;
        for (let r = this.rows - 1; r >= 0; r--) {
            if (!this.board[r][col]) {
                row = r;
                break;
            }
        }
        
        if (row === -1) return; // Spalte voll
        
        this.board[row][col] = this.currentPlayer;
        this.renderBoard();
        this.animateDrop(row, col);
        
        const winner = this.checkWinner(row, col);
        if (winner) {
            this.gameOver = true;
            this.updateStatus(winner === 'red' ? '🎉 Du hast gewonnen!' : '😔 Computer hat gewonnen!');
            return;
        }
        
        if (this.board[0].every(cell => cell)) {
            this.gameOver = true;
            this.updateStatus('🤝 Unentschieden!');
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'red' ? 'yellow' : 'red';
        
        if (this.gameMode === 'computer' && this.currentPlayer === 'yellow') {
            this.updateStatus('Computer denkt...');
            setTimeout(() => this.computerMove(), 600);
        } else {
            this.updateStatus(`${this.currentPlayer === 'red' ? 'Du bist' : 'Gegner ist'} dran`);
        }
    }

    animateDrop(row, col) {
        const cell = document.querySelector(`.c4-cell[data-row="${row}"][data-col="${col}"] .c4-piece`);
        if (cell) {
            cell.classList.add('dropping');
        }
    }

    computerMove() {
        if (this.gameOver) return;
        
        // KI: Erst gewinnen, dann blocken, dann Mitte bevorzugen
        let col = this.findWinningCol('yellow') ?? 
                  this.findWinningCol('red') ?? 
                  this.getBestCol();
        
        if (col !== null) {
            this.dropPiece(col);
        }
    }

    findWinningCol(player) {
        for (let col = 0; col < this.cols; col++) {
            // Finde Zeile
            let row = -1;
            for (let r = this.rows - 1; r >= 0; r--) {
                if (!this.board[r][col]) {
                    row = r;
                    break;
                }
            }
            if (row === -1) continue;
            
            // Teste ob dieser Zug gewinnt
            this.board[row][col] = player;
            const wins = this.checkWinner(row, col);
            this.board[row][col] = null;
            
            if (wins) return col;
        }
        return null;
    }

    getBestCol() {
        // Bevorzuge Mitte
        const priority = [3, 2, 4, 1, 5, 0, 6];
        for (let col of priority) {
            if (!this.board[0][col]) return col;
        }
        return null;
    }

    checkWinner(row, col) {
        const player = this.board[row][col];
        if (!player) return null;
        
        const directions = [
            [0, 1],   // Horizontal
            [1, 0],   // Vertikal
            [1, 1],   // Diagonal /
            [1, -1]   // Diagonal \
        ];
        
        for (let [dr, dc] of directions) {
            let count = 1;
            
            // Positive Richtung
            for (let i = 1; i < 4; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) break;
                if (this.board[r][c] !== player) break;
                count++;
            }
            
            // Negative Richtung
            for (let i = 1; i < 4; i++) {
                const r = row - dr * i;
                const c = col - dc * i;
                if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) break;
                if (this.board[r][c] !== player) break;
                count++;
            }
            
            if (count >= 4) return player;
        }
        
        return null;
    }

    updateStatus(text) {
        const status = document.getElementById('c4Status');
        if (status) status.textContent = text;
    }
}

function startConnectFour(mode) {
    if (!window.gamesManager?.isAuthenticated) {
        alert('Bitte melden Sie sich zuerst an.');
        return;
    }
    
    if (!window.connectFour) {
        window.connectFour = new ConnectFour();
    }
    window.connectFour.start(mode);
}

function restartConnectFour() {
    if (window.connectFour) {
        window.connectFour.start(window.connectFour.gameMode);
    }
}

function closeConnectFour() {
    document.getElementById('connectFourModal').style.display = 'none';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.gamesManager = new GamesManager();
});
