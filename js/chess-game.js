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
        this.gameMode = 'player'; // 'player' or 'computer'
        this.computerDifficulty = 'medium'; // 'easy', 'medium', 'hard'
        this.moveHistory = [];
        this.isComputerThinking = false;
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.enPassantTarget = null; // {row, col} wenn En Passant möglich
        this.halfMoveClock = 0; // Für 50-Zug-Regel
        this.fullMoveNumber = 1;
        this.inCheck = { white: false, black: false };
        this.checkmate = { white: false, black: false };
        this.stalemate = false;
        this.draggedPiece = null;
        this.dragStartSquare = null;
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
        
        // Reset game state
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.enPassantTarget = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.inCheck = { white: false, black: false };
        this.checkmate = { white: false, black: false };
        this.stalemate = false;
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
                    pieceElement.draggable = true;
                    pieceElement.addEventListener('dragstart', (e) => this.handleDragStart(e, row, col));
                    pieceElement.addEventListener('dragend', (e) => this.handleDragEnd(e));
                    square.appendChild(pieceElement);
                }
                
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                square.addEventListener('dragover', (e) => this.handleDragOver(e));
                square.addEventListener('drop', (e) => this.handleDrop(e, row, col));
                boardElement.appendChild(square);
            }
        }
        
        // Highlight selected square und mögliche Züge
        if (this.selectedSquare) {
            this.highlightSquare(this.selectedSquare.row, this.selectedSquare.col);
            this.showPossibleMoves(this.selectedSquare.row, this.selectedSquare.col);
        }
        
        // Highlight König im Schach
        this.highlightCheck();
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
        if (this.isComputerThinking) return; // Verhindere Züge während Computer denkt
        
        // Wenn Computer am Zug ist, ignoriere Klicks
        if (this.gameMode === 'computer' && this.currentPlayer === 'black') {
            return;
        }
        
        const piece = this.board[row][col];
        const isWhitePiece = piece && piece === piece.toUpperCase();
        const isBlackPiece = piece && piece === piece.toLowerCase();
        
        // Prüfe ob es der Spieler am Zug ist
        if (this.currentPlayer === 'white' && !isWhitePiece && this.selectedSquare) {
            // Versuche Zug
            if (this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
                this.selectedSquare = null;
                this.renderBoard();
                // Wenn gegen Computer, lass Computer ziehen
                if (this.gameMode === 'computer' && this.currentPlayer === 'black') {
                    setTimeout(() => this.computerMove(), 500);
                }
            }
            return;
        }
        
        if (this.currentPlayer === 'black' && !isBlackPiece && this.selectedSquare && this.gameMode === 'player') {
            // Versuche Zug (nur im Multiplayer-Modus)
            if (this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
                this.selectedSquare = null;
                this.renderBoard();
            }
            return;
        }
        
        // Wähle Figur aus
        if (this.currentPlayer === 'white' && isWhitePiece) {
            this.selectedSquare = { row, col };
            this.renderBoard();
            this.highlightSquare(row, col);
            this.showPossibleMoves(row, col);
        } else if (this.currentPlayer === 'black' && isBlackPiece && this.gameMode === 'player') {
            this.selectedSquare = { row, col };
            this.renderBoard();
            this.highlightSquare(row, col);
            this.showPossibleMoves(row, col);
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

    updateGameStatus(customMessage = null) {
        const statusElement = document.getElementById('gameStatus');
        if (statusElement) {
            if (customMessage) {
                statusElement.textContent = customMessage;
                return;
            }
            
            if (this.gameState === 'waiting') {
                statusElement.textContent = 'Warte auf Gegner...';
            } else if (this.gameState === 'playing') {
                if (this.gameMode === 'computer' && this.currentPlayer === 'black') {
                    statusElement.textContent = 'Computer denkt nach...';
                } else {
                    statusElement.textContent = `${this.currentPlayer === 'white' ? 'Weiß' : 'Schwarz'} ist am Zug`;
                }
            } else if (this.gameState === 'finished') {
                statusElement.textContent = 'Spiel beendet';
            }
        }
    }

    startNewGame(mode = 'player') {
        console.log('🎮 Starting new chess game...', mode);
        this.gameMode = mode;
        this.gameState = mode === 'computer' ? 'playing' : 'waiting';
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.moveHistory = [];
        this.initializeBoard();
        this.renderBoard();
        this.updateGameStatus();
        
        // Zeige Modal
        document.getElementById('chessModal').style.display = 'flex';
        
        // Update UI basierend auf Modus
        if (mode === 'computer') {
            document.getElementById('blackPlayerName').textContent = 'Computer (Schwarz)';
            document.getElementById('blackPlayerIcon').className = 'fas fa-robot';
            document.getElementById('difficultySelector').style.display = 'block';
            this.opponent = { name: 'Computer', type: 'computer' };
            this.updateGameStatus();
        } else {
            document.getElementById('blackPlayerName').textContent = 'Gegner (Schwarz)';
            document.getElementById('blackPlayerIcon').className = 'fas fa-user';
            document.getElementById('difficultySelector').style.display = 'none';
            this.findOpponent();
        }
    }

    findOpponent() {
        // Simuliere Gegner-Suche
        setTimeout(() => {
            this.opponent = { name: 'Gegner', id: 'opponent1' };
            this.gameState = 'playing';
            this.updateGameStatus();
        }, 2000);
    }

    async computerMove() {
        if (this.gameState !== 'playing' || this.currentPlayer !== 'black') return;
        if (this.isComputerThinking) return;
        
        this.isComputerThinking = true;
        this.updateGameStatus('Computer denkt nach...');
        
        // Simuliere Denkzeit basierend auf Schwierigkeit
        const thinkTime = this.computerDifficulty === 'easy' ? 1000 : 
                         this.computerDifficulty === 'medium' ? 1500 : 2000;
        
        await new Promise(resolve => setTimeout(resolve, thinkTime));
        
        // Finde besten Zug
        const move = this.findBestMove();
        
        if (move) {
            this.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
            this.renderBoard();
            this.updateGameStatus();
        }
        
        this.isComputerThinking = false;
    }

    findBestMove() {
        // Einfacher Schach-Engine mit Minimax-ähnlichem Ansatz
        const possibleMoves = this.getAllPossibleMoves('black');
        
        if (possibleMoves.length === 0) return null;
        
        // Je nach Schwierigkeit wähle unterschiedliche Strategien
        if (this.computerDifficulty === 'easy') {
            // Zufälliger Zug
            return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        } else if (this.computerDifficulty === 'medium') {
            // Bevorzuge Züge, die Figuren schlagen
            const captureMoves = possibleMoves.filter(m => 
                this.board[m.toRow][m.toCol] !== null
            );
            if (captureMoves.length > 0) {
                return captureMoves[Math.floor(Math.random() * captureMoves.length)];
            }
            return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        } else {
            // Hard: Minimax mit begrenzter Tiefe
            return this.minimaxMove(possibleMoves, 2);
        }
    }

    getAllPossibleMoves(color) {
        const moves = [];
        const isWhite = color === 'white';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (!piece) continue;
                
                const isPieceWhite = piece === piece.toUpperCase();
                if ((isWhite && !isPieceWhite) || (!isWhite && isPieceWhite)) continue;
                
                // Einfache Zug-Generierung (später erweitern)
                const pieceMoves = this.getPieceMoves(row, col, piece);
                pieceMoves.forEach(move => {
                    moves.push({
                        fromRow: row,
                        fromCol: col,
                        toRow: move.row,
                        toCol: move.col,
                        piece: piece
                    });
                });
            }
        }
        
        return moves;
    }

    getPieceMoves(row, col, piece) {
        const moves = [];
        const isWhite = piece === piece.toUpperCase();
        const pieceType = piece.toLowerCase();
        
        // Einfache Zug-Regeln (später erweitern)
        if (pieceType === 'p') {
            // Bauern
            const direction = isWhite ? -1 : 1;
            const startRow = isWhite ? 6 : 1;
            
            // Vorwärts
            if (row + direction >= 0 && row + direction < 8 && !this.board[row + direction][col]) {
                moves.push({ row: row + direction, col: col });
                // Doppelzug vom Start
                if (row === startRow && !this.board[row + 2 * direction][col]) {
                    moves.push({ row: row + 2 * direction, col: col });
                }
            }
            
            // Schräg schlagen
            for (const dcol of [-1, 1]) {
                if (col + dcol >= 0 && col + dcol < 8 && row + direction >= 0 && row + direction < 8) {
                    const target = this.board[row + direction][col + dcol];
                    if (target && (target === target.toUpperCase()) !== isWhite) {
                        moves.push({ row: row + direction, col: col + dcol });
                    }
                }
            }
        } else if (pieceType === 'r') {
            // Turm - horizontal und vertikal
            const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            directions.forEach(([drow, dcol]) => {
                for (let i = 1; i < 8; i++) {
                    const newRow = row + i * drow;
                    const newCol = col + i * dcol;
                    if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
                    const target = this.board[newRow][newCol];
                    if (!target) {
                        moves.push({ row: newRow, col: newCol });
                    } else {
                        if ((target === target.toUpperCase()) !== isWhite) {
                            moves.push({ row: newRow, col: newCol });
                        }
                        break;
                    }
                }
            });
        } else if (pieceType === 'n') {
            // Springer
            const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
            knightMoves.forEach(([drow, dcol]) => {
                const newRow = row + drow;
                const newCol = col + dcol;
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    const target = this.board[newRow][newCol];
                    if (!target || (target === target.toUpperCase()) !== isWhite) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            });
        } else if (pieceType === 'b') {
            // Läufer - diagonal
            const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
            directions.forEach(([drow, dcol]) => {
                for (let i = 1; i < 8; i++) {
                    const newRow = row + i * drow;
                    const newCol = col + i * dcol;
                    if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
                    const target = this.board[newRow][newCol];
                    if (!target) {
                        moves.push({ row: newRow, col: newCol });
                    } else {
                        if ((target === target.toUpperCase()) !== isWhite) {
                            moves.push({ row: newRow, col: newCol });
                        }
                        break;
                    }
                }
            });
        } else if (pieceType === 'q') {
            // Dame - kombiniert Turm und Läufer
            const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
            directions.forEach(([drow, dcol]) => {
                for (let i = 1; i < 8; i++) {
                    const newRow = row + i * drow;
                    const newCol = col + i * dcol;
                    if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
                    const target = this.board[newRow][newCol];
                    if (!target) {
                        moves.push({ row: newRow, col: newCol });
                    } else {
                        if ((target === target.toUpperCase()) !== isWhite) {
                            moves.push({ row: newRow, col: newCol });
                        }
                        break;
                    }
                }
            });
        } else if (pieceType === 'k') {
            // König - ein Feld in alle Richtungen
            const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
            directions.forEach(([drow, dcol]) => {
                const newRow = row + drow;
                const newCol = col + dcol;
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    const target = this.board[newRow][newCol];
                    if (!target || (target === target.toUpperCase()) !== isWhite) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            });
        }
        
        return moves;
    }

    showPossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return;
        
        const moves = this.getPieceMoves(row, col, piece);
        moves.forEach(move => {
            const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            if (square) {
                square.classList.add('possible-move');
            }
        });
    }

    minimaxMove(moves, depth) {
        // Einfache Minimax-Implementierung
        let bestMove = null;
        let bestScore = -Infinity;
        
        moves.forEach(move => {
            // Simuliere Zug
            const originalPiece = this.board[move.toRow][move.toCol];
            this.board[move.toRow][move.toCol] = this.board[move.fromRow][move.fromCol];
            this.board[move.fromRow][move.fromCol] = null;
            
            const score = this.evaluatePosition();
            
            // Rückgängig machen
            this.board[move.fromRow][move.fromCol] = this.board[move.toRow][move.toCol];
            this.board[move.toRow][move.toCol] = originalPiece;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        });
        
        return bestMove || moves[0];
    }

    evaluatePosition() {
        // Einfache Positionsbewertung
        let score = 0;
        const pieceValues = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100 };
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (!piece) continue;
                
                const pieceType = piece.toLowerCase();
                const value = pieceValues[pieceType] || 0;
                
                if (piece === piece.toUpperCase()) {
                    score += value; // Weiß
                } else {
                    score -= value; // Schwarz
                }
            }
        }
        
        return score;
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
