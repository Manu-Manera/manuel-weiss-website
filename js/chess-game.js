/**
 * Chess Game
 * Multiplayer-Schachspiel
 */

class ChessGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.gameState = 'waiting'; // waiting, playing, finished
        this.opponent = null;
        this.init();
    }

    init() {
        console.log('♟️ Chess Game initializing...');
        this.initializeBoard();
        this.renderBoard();
        this.setupEventListeners();
    }

    initializeBoard() {
        // Standard-Schachaufstellung
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Schwarze Figuren
        this.board[0] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
        this.board[1] = Array(8).fill('p');
        
        // Weiße Figuren
        this.board[6] = Array(8).fill('P');
        this.board[7] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
    }

    renderBoard() {
        const boardElement = document.getElementById('chessBoard');
        if (!boardElement) return;
        
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `chess-square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = 'chess-piece';
                    pieceElement.textContent = this.getPieceSymbol(piece);
                    square.appendChild(pieceElement);
                }
                
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                boardElement.appendChild(square);
            }
        }
    }

    getPieceSymbol(piece) {
        const symbols = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };
        return symbols[piece] || '';
    }

    handleSquareClick(row, col) {
        if (this.gameState !== 'playing') return;
        
        const piece = this.board[row][col];
        const isWhitePiece = piece && piece === piece.toUpperCase();
        const isBlackPiece = piece && piece === piece.toLowerCase();
        
        // Prüfe ob es der Spieler am Zug ist
        if (this.currentPlayer === 'white' && !isWhitePiece && this.selectedSquare) {
            // Versuche Zug
            this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
            this.selectedSquare = null;
            this.renderBoard();
            return;
        }
        
        if (this.currentPlayer === 'black' && !isBlackPiece && this.selectedSquare) {
            // Versuche Zug
            this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
            this.selectedSquare = null;
            this.renderBoard();
            return;
        }
        
        // Wähle Figur aus
        if (this.currentPlayer === 'white' && isWhitePiece) {
            this.selectedSquare = { row, col };
            this.renderBoard();
            this.highlightSquare(row, col);
        } else if (this.currentPlayer === 'black' && isBlackPiece) {
            this.selectedSquare = { row, col };
            this.renderBoard();
            this.highlightSquare(row, col);
        }
    }

    highlightSquare(row, col) {
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (square) {
            square.classList.add('selected');
        }
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        // Einfache Zug-Validierung (später erweitern)
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        // Führe Zug aus
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Wechsle Spieler
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.updateGameStatus();
        
        // Sende Zug an Gegner (später über WebSocket)
        this.sendMoveToOpponent({ fromRow, fromCol, toRow, toCol });
        
        return true;
    }

    sendMoveToOpponent(move) {
        // Hier würde der Zug über WebSocket an den Gegner gesendet werden
        console.log('📤 Sending move to opponent:', move);
    }

    receiveMoveFromOpponent(move) {
        // Empfange Zug vom Gegner
        console.log('📥 Received move from opponent:', move);
        this.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
        this.renderBoard();
    }

    updateGameStatus() {
        const statusElement = document.getElementById('gameStatus');
        if (statusElement) {
            if (this.gameState === 'waiting') {
                statusElement.textContent = 'Warte auf Gegner...';
            } else if (this.gameState === 'playing') {
                statusElement.textContent = `${this.currentPlayer === 'white' ? 'Weiß' : 'Schwarz'} ist am Zug`;
            }
        }
    }

    startNewGame() {
        console.log('🎮 Starting new chess game...');
        this.gameState = 'waiting';
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.initializeBoard();
        this.renderBoard();
        this.updateGameStatus();
        
        // Zeige Modal
        document.getElementById('chessModal').style.display = 'flex';
        
        // Suche nach Gegner (später über Backend)
        this.findOpponent();
    }

    findOpponent() {
        // Simuliere Gegner-Suche
        setTimeout(() => {
            this.opponent = { name: 'Gegner', id: 'opponent1' };
            this.gameState = 'playing';
            this.updateGameStatus();
            document.getElementById('blackPlayerName').textContent = 'Gegner (Schwarz)';
        }, 2000);
    }

    resign() {
        if (confirm('Möchten Sie wirklich aufgeben?')) {
            this.gameState = 'finished';
            this.updateGameStatus();
            alert('Sie haben aufgegeben.');
        }
    }

    offerDraw() {
        if (confirm('Möchten Sie Remis anbieten?')) {
            // Später: Sende Remis-Angebot an Gegner
            alert('Remis angeboten. Warte auf Antwort des Gegners...');
        }
    }

    setupEventListeners() {
        // Drag & Drop für Figuren (später implementieren)
    }

    cleanup() {
        this.selectedSquare = null;
        // Entferne Event-Listener etc.
    }
}

// Initialize chess game
document.addEventListener('DOMContentLoaded', () => {
    window.chessGame = new ChessGame();
});
