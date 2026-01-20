/**
 * Enhanced Chess Game
 * Vollständiges Schachspiel mit allen Regeln
 */

class ChessGameEnhanced {
    constructor() {
        this.board = [];
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.gameState = 'waiting';
        this.opponent = null;
        this.gameMode = 'player';
        this.computerDifficulty = 'medium';
        this.moveHistory = [];
        this.isComputerThinking = false;
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
        this.draggedPiece = null;
        this.dragStartSquare = null;
        this.kingPositions = { white: { row: 7, col: 4 }, black: { row: 0, col: 4 } };
        this.pendingPromotion = null;
        this.promotionResolve = null;
        this.boardDesign = localStorage.getItem('chess_board_design') || 'classic';
        
        // Spieluhr
        this.gameStartTime = null;
        this.totalGameTime = 0; // in Sekunden
        this.whiteTime = 0;
        this.blackTime = 0;
        this.timerInterval = null;
        this.lastMoveTime = null;
        
        // Spielspeicherung
        this.gameId = null;
        this.opponentId = null;
        this.opponentName = null;
        this.opponentOnline = false;
        this.savedGames = JSON.parse(localStorage.getItem('chess_saved_games') || '[]');
        
        this.init();
    }

    init() {
        console.log('♟️ Enhanced Chess Game initializing...');
        this.initializeBoard();
        this.renderBoard();
        this.setupEventListeners();
        this.renderSavedGames();
    }

    initializeBoard() {
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        this.board[0] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
        this.board[1] = Array(8).fill('p');
        this.board[6] = Array(8).fill('P');
        this.board[7] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
        
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
        this.kingPositions = { white: { row: 7, col: 4 }, black: { row: 0, col: 4 } };
    }

    renderBoard() {
        const boardElement = document.getElementById('chessBoard');
        if (!boardElement) return;
        
        boardElement.innerHTML = '';
        
        // Board Design anwenden - WICHTIG: chess-board-chesscom beibehalten!
        const existingClasses = boardElement.classList.contains('chess-board-chesscom') ? 'chess-board-chesscom' : '';
        boardElement.className = `chess-board chess-board-mobile ${existingClasses} design-${this.boardDesign}`.trim();
        
        // Prüfe ob Touch-Gerät
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                // Verwende sowohl light/dark als auch white/black für Kompatibilität
                const isLight = (row + col) % 2 === 0;
                square.className = `chess-square ${isLight ? 'light white' : 'dark black'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    const isWhite = piece === piece.toUpperCase();
                    pieceElement.className = `chess-piece chess-piece-3d ${isWhite ? 'white' : 'black'}`;
                    pieceElement.textContent = this.getPieceSymbol(piece);
                    pieceElement.dataset.piece = piece; // Für CSS-Styling
                    
                    // Drag & Drop nur für Desktop
                    if (!isTouchDevice) {
                        pieceElement.draggable = true;
                        pieceElement.addEventListener('dragstart', (e) => this.handleDragStart(e, row, col));
                        pieceElement.addEventListener('dragend', (e) => this.handleDragEnd(e));
                    }
                    
                    square.appendChild(pieceElement);
                }
                
                // Click/Touch Events
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                
                // Touch Events für mobile Geräte
                if (isTouchDevice) {
                    square.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        this.handleTouchStart(e, row, col);
                    }, { passive: false });
                    square.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        this.handleTouchEnd(e, row, col);
                    }, { passive: false });
                } else {
                    // Desktop Drag & Drop
                    square.addEventListener('dragover', (e) => this.handleDragOver(e));
                    square.addEventListener('drop', (e) => this.handleDrop(e, row, col));
                }
                
                boardElement.appendChild(square);
            }
        }
        
        if (this.selectedSquare) {
            this.highlightSquare(this.selectedSquare.row, this.selectedSquare.col);
            this.showPossibleMoves(this.selectedSquare.row, this.selectedSquare.col);
        }
        
        this.highlightCheck();
    }

    getPieceSymbol(piece) {
        const symbols = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };
        return symbols[piece] || '';
    }

    setBoardDesign(design) {
        this.boardDesign = design;
        localStorage.setItem('chess_board_design', design);
        this.renderBoard();
        console.log('🎨 Board design changed to:', design);
    }

    // Drag & Drop Handlers
    handleDragStart(e, row, col) {
        const piece = this.board[row][col];
        if (!piece) return;
        
        const isWhite = piece === piece.toUpperCase();
        if ((this.currentPlayer === 'white' && !isWhite) || 
            (this.currentPlayer === 'black' && isWhite)) {
            e.preventDefault();
            return;
        }
        
        if (this.gameMode === 'computer' && this.currentPlayer === 'black') {
            e.preventDefault();
            return;
        }
        
        this.draggedPiece = piece;
        this.dragStartSquare = { row, col };
        e.dataTransfer.effectAllowed = 'move';
        e.target.style.opacity = '0.5';
    }

    handleDragEnd(e) {
        e.target.style.opacity = '1';
        this.draggedPiece = null;
        this.dragStartSquare = null;
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    async handleDrop(e, toRow, toCol) {
        e.preventDefault();
        
        if (!this.dragStartSquare) return;
        
        const { row: fromRow, col: fromCol } = this.dragStartSquare;
        await this.executeMove(fromRow, fromCol, toRow, toCol);
        
        this.draggedPiece = null;
        this.dragStartSquare = null;
    }

    handleSquareClick(row, col) {
        if (this.gameState !== 'playing') return;
        if (this.isComputerThinking) return;
        if (this.gameMode === 'computer' && this.currentPlayer === 'black') return;
        
        const piece = this.board[row][col];
        const isWhitePiece = piece && piece === piece.toUpperCase();
        const isBlackPiece = piece && piece === piece.toLowerCase();
        
        if (this.selectedSquare) {
            // Versuche Zug
            if (this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
                this.selectedSquare = null;
                this.renderBoard();
                if (this.gameMode === 'computer' && this.currentPlayer === 'black') {
                    setTimeout(() => this.computerMove(), 500);
                }
            } else {
                // Neuer Auswahlversuch
                if ((this.currentPlayer === 'white' && isWhitePiece) ||
                    (this.currentPlayer === 'black' && isBlackPiece && this.gameMode === 'player')) {
                    this.selectedSquare = { row, col };
                    this.renderBoard();
                } else {
                    this.selectedSquare = null;
                    this.renderBoard();
                }
            }
        } else {
            // Wähle Figur
            if ((this.currentPlayer === 'white' && isWhitePiece) ||
                (this.currentPlayer === 'black' && isBlackPiece && this.gameMode === 'player')) {
                this.selectedSquare = { row, col };
                this.renderBoard();
            }
        }
    }

    highlightSquare(row, col) {
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (square) square.classList.add('selected');
    }

    highlightCheck() {
        // Entferne alte Highlights
        document.querySelectorAll('.in-check').forEach(el => el.classList.remove('in-check'));
        
        // Highlight König im Schach
        if (this.inCheck.white) {
            const king = this.kingPositions.white;
            const square = document.querySelector(`[data-row="${king.row}"][data-col="${king.col}"]`);
            if (square) square.classList.add('in-check');
        }
        if (this.inCheck.black) {
            const king = this.kingPositions.black;
            const square = document.querySelector(`[data-row="${king.row}"][data-col="${king.col}"]`);
            if (square) square.classList.add('in-check');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MOVE EXECUTION
    // ═══════════════════════════════════════════════════════════════════════════

    makeMove(fromRow, fromCol, toRow, toCol, promotionPiece = null) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        const isWhite = piece === piece.toUpperCase();
        const color = isWhite ? 'white' : 'black';
        
        // Prüfe ob Zug gültig ist
        const validMoves = this.getAllValidMoves(fromRow, fromCol, piece);
        const isValidMove = validMoves.some(m => m.row === toRow && m.col === toCol);
        
        if (!isValidMove) return false;
        
        const capturedPiece = this.board[toRow][toCol];
        const wasPawnDoubleMove = (piece.toLowerCase() === 'p' && Math.abs(fromRow - toRow) === 2);
        const isCastling = (piece.toLowerCase() === 'k' && Math.abs(fromCol - toCol) === 2);
        const isEnPassant = (piece.toLowerCase() === 'p' && this.enPassantTarget && 
                            toRow === this.enPassantTarget.row && toCol === this.enPassantTarget.col);
        
        const moveData = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            captured: capturedPiece,
            castling: null,
            enPassant: false,
            promotion: null,
            castlingRightsBefore: JSON.parse(JSON.stringify(this.castlingRights))
        };
        
        // Execute move
        if (isCastling) {
            this.executeCastling(fromRow, fromCol, toRow, toCol);
            moveData.castling = { kingside: toCol > fromCol };
        } else if (isEnPassant) {
            this.board[toRow][toCol] = piece;
            this.board[fromRow][fromCol] = null;
            this.board[isWhite ? toRow + 1 : toRow - 1][toCol] = null;
            moveData.enPassant = true;
            moveData.captured = isWhite ? 'p' : 'P';
        } else {
            this.board[toRow][toCol] = piece;
            this.board[fromRow][fromCol] = null;
        }
        
        // Update king position
        if (piece.toLowerCase() === 'k') {
            this.kingPositions[color] = { row: toRow, col: toCol };
        }
        
        // Promotion
        if (piece.toLowerCase() === 'p' && (toRow === 0 || toRow === 7)) {
            const newPiece = promotionPiece || (isWhite ? 'Q' : 'q');
            this.board[toRow][toCol] = newPiece;
            moveData.promotion = newPiece;
        }
        
        // Update castling rights
        this.updateCastlingRights(fromRow, fromCol, toRow, toCol, piece);
        
        // Update en passant target
        this.enPassantTarget = wasPawnDoubleMove ? { row: (fromRow + toRow) / 2, col: fromCol } : null;
        
        // Update move counters
        if (piece.toLowerCase() === 'p' || capturedPiece) {
            this.halfMoveClock = 0;
        } else {
            this.halfMoveClock++;
        }
        if (color === 'black') this.fullMoveNumber++;
        
        this.moveHistory.push(moveData);
        
        // Check for check/checkmate/stalemate
        this.checkForCheck();
        this.checkForCheckmate();
        this.checkForStalemate();
        
        // Switch player
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.updateGameStatus();
        
        // Timer und Autosave nach Zug
        this.onMoveComplete();
        
        if (this.gameMode === 'player') {
            this.sendMoveToOpponent({ fromRow, fromCol, toRow, toCol, promotion: moveData.promotion });
        }
        
        return true;
    }

    executeCastling(fromRow, fromCol, toRow, toCol) {
        const isWhite = fromRow === 7;
        const isKingside = toCol > fromCol;
        
        // Move king
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
        
        // Move rook
        const rookCol = isKingside ? 7 : 0;
        const newRookCol = isKingside ? 5 : 3;
        this.board[fromRow][newRookCol] = this.board[fromRow][rookCol];
        this.board[fromRow][rookCol] = null;
        
        // Update king position
        this.kingPositions[isWhite ? 'white' : 'black'] = { row: toRow, col: toCol };
    }

    updateCastlingRights(fromRow, fromCol, toRow, toCol, piece) {
        const isWhite = piece === piece.toUpperCase();
        const color = isWhite ? 'white' : 'black';
        
        // King moved
        if (piece.toLowerCase() === 'k') {
            this.castlingRights[color].kingside = false;
            this.castlingRights[color].queenside = false;
        }
        
        // Rook moved
        if (piece.toLowerCase() === 'r') {
            if (fromRow === (isWhite ? 7 : 0)) {
                if (fromCol === 0) this.castlingRights[color].queenside = false;
                if (fromCol === 7) this.castlingRights[color].kingside = false;
            }
        }
        
        // Rook captured
        const captured = this.board[toRow] && this.board[toRow][toCol];
        if (captured && captured.toLowerCase() === 'r') {
            if (toRow === (isWhite ? 0 : 7)) {
                if (toCol === 0) this.castlingRights[isWhite ? 'black' : 'white'].queenside = false;
                if (toCol === 7) this.castlingRights[isWhite ? 'black' : 'white'].kingside = false;
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MOVE GENERATION
    // ═══════════════════════════════════════════════════════════════════════════

    getAllValidMoves(fromRow, fromCol, piece) {
        const allMoves = this.getPieceMoves(fromRow, fromCol, piece);
        const validMoves = [];
        
        for (const move of allMoves) {
            if (this.isMoveLegal(fromRow, fromCol, move.row, move.col, piece)) {
                validMoves.push(move);
            }
        }
        
        return validMoves;
    }

    isMoveLegal(fromRow, fromCol, toRow, toCol, piece) {
        // Simuliere Zug
        const originalPiece = this.board[toRow][toCol];
        const isWhite = piece === piece.toUpperCase();
        const color = isWhite ? 'white' : 'black';
        
        // Temporärer Zug
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Update king position temporär
        let originalKingPos = null;
        if (piece.toLowerCase() === 'k') {
            originalKingPos = { ...this.kingPositions[color] };
            this.kingPositions[color] = { row: toRow, col: toCol };
        }
        
        // Prüfe ob König im Schach steht
        const isInCheck = this.isKingInCheck(color);
        
        // Rückgängig machen
        this.board[fromRow][fromCol] = piece;
        this.board[toRow][toCol] = originalPiece;
        if (originalKingPos) {
            this.kingPositions[color] = originalKingPos;
        }
        
        return !isInCheck;
    }

    getPieceMoves(row, col, piece) {
        const moves = [];
        const isWhite = piece === piece.toUpperCase();
        const pieceType = piece.toLowerCase();
        
        if (pieceType === 'p') {
            return this.getPawnMoves(row, col, piece, isWhite);
        } else if (pieceType === 'r') {
            return this.getRookMoves(row, col, piece, isWhite);
        } else if (pieceType === 'n') {
            return this.getKnightMoves(row, col, piece, isWhite);
        } else if (pieceType === 'b') {
            return this.getBishopMoves(row, col, piece, isWhite);
        } else if (pieceType === 'q') {
            return this.getQueenMoves(row, col, piece, isWhite);
        } else if (pieceType === 'k') {
            return this.getKingMoves(row, col, piece, isWhite);
        }
        
        return moves;
    }

    getPawnMoves(row, col, piece, isWhite) {
        const moves = [];
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        
        // Forward
        if (row + direction >= 0 && row + direction < 8 && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col: col });
            // Double move from start
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col: col });
            }
        }
        
        // Capture diagonally
        for (const dcol of [-1, 1]) {
            if (col + dcol >= 0 && col + dcol < 8 && row + direction >= 0 && row + direction < 8) {
                const target = this.board[row + direction][col + dcol];
                if (target && (target === target.toUpperCase()) !== isWhite) {
                    moves.push({ row: row + direction, col: col + dcol });
                }
            }
        }
        
        // En Passant
        if (this.enPassantTarget && row === (isWhite ? 3 : 4)) {
            if (Math.abs(col - this.enPassantTarget.col) === 1) {
                moves.push({ row: this.enPassantTarget.row, col: this.enPassantTarget.col });
            }
        }
        
        return moves;
    }

    getRookMoves(row, col, piece, isWhite) {
        const moves = [];
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
        
        return moves;
    }

    getKnightMoves(row, col, piece, isWhite) {
        const moves = [];
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
        
        return moves;
    }

    getBishopMoves(row, col, piece, isWhite) {
        const moves = [];
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
        
        return moves;
    }

    getQueenMoves(row, col, piece, isWhite) {
        return [...this.getRookMoves(row, col, piece, isWhite), ...this.getBishopMoves(row, col, piece, isWhite)];
    }

    getKingMoves(row, col, piece, isWhite) {
        const moves = [];
        const color = isWhite ? 'white' : 'black';
        const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        
        // Normal moves
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
        
        // Castling
        if (!this.inCheck[color]) {
            // Kingside
            if (this.castlingRights[color].kingside && 
                !this.board[row][5] && !this.board[row][6] &&
                !this.isSquareAttacked(row, 5, !isWhite) &&
                !this.isSquareAttacked(row, 6, !isWhite)) {
                moves.push({ row: row, col: 6 });
            }
            
            // Queenside
            if (this.castlingRights[color].queenside &&
                !this.board[row][1] && !this.board[row][2] && !this.board[row][3] &&
                !this.isSquareAttacked(row, 2, !isWhite) &&
                !this.isSquareAttacked(row, 3, !isWhite)) {
                moves.push({ row: row, col: 2 });
            }
        }
        
        return moves;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CHECK/CHECKMATE DETECTION
    // ═══════════════════════════════════════════════════════════════════════════

    isSquareAttacked(row, col, byWhite) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (!piece) continue;
                const isPieceWhite = piece === piece.toUpperCase();
                if (isPieceWhite !== byWhite) continue;
                
                const moves = this.getPieceMoves(r, c, piece);
                if (moves.some(m => m.row === row && m.col === col)) {
                    return true;
                }
            }
        }
        return false;
    }

    isKingInCheck(color) {
        const king = this.kingPositions[color];
        if (!king) return false;
        
        const isWhite = color === 'white';
        return this.isSquareAttacked(king.row, king.col, !isWhite);
    }

    checkForCheck() {
        this.inCheck.white = this.isKingInCheck('white');
        this.inCheck.black = this.isKingInCheck('black');
    }

    checkForCheckmate() {
        this.checkForCheck();
        
        if (this.inCheck.white) {
            this.checkmate.white = !this.hasLegalMoves('white');
        }
        if (this.inCheck.black) {
            this.checkmate.black = !this.hasLegalMoves('black');
        }
    }

    checkForStalemate() {
        if (!this.inCheck.white && !this.inCheck.black) {
            this.stalemate = (!this.hasLegalMoves('white') && this.currentPlayer === 'white') ||
                           (!this.hasLegalMoves('black') && this.currentPlayer === 'black');
        }
    }

    hasLegalMoves(color) {
        const isWhite = color === 'white';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (!piece) continue;
                const isPieceWhite = piece === piece.toUpperCase();
                if (isPieceWhite !== isWhite) continue;
                
                const validMoves = this.getAllValidMoves(row, col, piece);
                if (validMoves.length > 0) return true;
            }
        }
        
        return false;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // COMPUTER AI
    // ═══════════════════════════════════════════════════════════════════════════

    async computerMove() {
        if (this.gameState !== 'playing' || this.currentPlayer !== 'black') return;
        if (this.isComputerThinking) return;
        
        this.isComputerThinking = true;
        this.updateGameStatus('Computer denkt nach...');
        this.updateUndoButton();
        
        const thinkTime = this.computerDifficulty === 'easy' ? 1000 : 
                         this.computerDifficulty === 'medium' ? 1500 : 2500;
        
        await new Promise(resolve => setTimeout(resolve, thinkTime));
        
        const move = this.findBestMove();
        
        if (move) {
            // Für Computer: Automatisch Dame bei Promotion
            const needsPromotion = move.piece.toLowerCase() === 'p' && 
                                  (move.toRow === 0 || move.toRow === 7);
            const promotionPiece = needsPromotion ? (move.piece === move.piece.toUpperCase() ? 'Q' : 'q') : null;
            
            await this.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol, promotionPiece);
            this.renderBoard();
            this.updateGameStatus();
        }
        
        this.isComputerThinking = false;
        this.updateUndoButton();
    }

    findBestMove() {
        const possibleMoves = this.getAllPossibleMoves('black');
        if (possibleMoves.length === 0) return null;
        
        if (this.computerDifficulty === 'easy') {
            return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        } else if (this.computerDifficulty === 'medium') {
            const captureMoves = possibleMoves.filter(m => 
                this.board[m.toRow][m.toCol] !== null
            );
            if (captureMoves.length > 0) {
                return captureMoves[Math.floor(Math.random() * captureMoves.length)];
            }
            return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        } else {
            const result = this.minimax(3, -Infinity, Infinity, true);
            return result.move;
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
                if (isPieceWhite !== isWhite) continue;
                
                const validMoves = this.getAllValidMoves(row, col, piece);
                validMoves.forEach(move => {
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

    minimax(depth, alpha, beta, maximizingPlayer) {
        if (depth === 0) {
            return { score: this.evaluatePosition(), move: null };
        }
        
        const color = maximizingPlayer ? 'black' : 'white';
        const moves = this.getAllPossibleMoves(color);
        
        if (moves.length === 0) {
            if (this.inCheck[color]) {
                return { score: maximizingPlayer ? -10000 : 10000, move: null };
            }
            return { score: 0, move: null }; // Stalemate
        }
        
        let bestMove = null;
        let bestScore = maximizingPlayer ? -Infinity : Infinity;
        
        for (const move of moves) {
            // Make move
            const originalPiece = this.board[move.toRow][move.toCol];
            const originalKingPos = move.piece.toLowerCase() === 'k' ? 
                { ...this.kingPositions[color] } : null;
            
            this.board[move.toRow][move.toCol] = move.piece;
            this.board[move.fromRow][move.fromCol] = null;
            if (originalKingPos) {
                this.kingPositions[color] = { row: move.toRow, col: move.toCol };
            }
            
            this.checkForCheck();
            
            // Recursive call
            const result = this.minimax(depth - 1, alpha, beta, !maximizingPlayer);
            const score = result.score;
            
            // Undo move
            this.board[move.fromRow][move.fromCol] = move.piece;
            this.board[move.toRow][move.toCol] = originalPiece;
            if (originalKingPos) {
                this.kingPositions[color] = originalKingPos;
            }
            
            if (maximizingPlayer) {
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                alpha = Math.max(alpha, score);
            } else {
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                beta = Math.min(beta, score);
            }
            
            if (beta <= alpha) break; // Alpha-beta pruning
        }
        
        return { score: bestScore, move: bestMove };
    }

    evaluatePosition() {
        let score = 0;
        const pieceValues = { 'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000 };
        
        // Material und Position
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (!piece) continue;
                
                const pieceType = piece.toLowerCase();
                const value = pieceValues[pieceType] || 0;
                let positionValue = 0;
                
                // Positional bonuses
                if (pieceType === 'p') {
                    // Pawn advancement
                    positionValue = piece === piece.toUpperCase() ? 
                        (7 - row) * 10 : row * 10;
                } else if (pieceType === 'n' || pieceType === 'b') {
                    // Center control
                    const centerDist = Math.abs(row - 3.5) + Math.abs(col - 3.5);
                    positionValue = (7 - centerDist) * 5;
                } else if (pieceType === 'r') {
                    // Rook on open file
                    let openFile = true;
                    for (let r = 0; r < 8; r++) {
                        if (this.board[r][col] && this.board[r][col].toLowerCase() === 'p') {
                            openFile = false;
                            break;
                        }
                    }
                    if (openFile) positionValue = 20;
                }
                
                if (piece === piece.toUpperCase()) {
                    score += value + positionValue;
                } else {
                    score -= value + positionValue;
                }
            }
        }
        
        // Check/Checkmate bonuses
        this.checkForCheck();
        if (this.inCheck.white) score += 50;
        if (this.inCheck.black) score -= 50;
        if (this.checkmate.white) score += 10000;
        if (this.checkmate.black) score -= 10000;
        
        return score;
    }

    showPossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return;
        
        const moves = this.getAllValidMoves(row, col, piece);
        moves.forEach(move => {
            const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            if (square) square.classList.add('possible-move');
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GAME MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    startNewGame(mode = 'player') {
        console.log('🎮 Starting new chess game...', mode);
        this.gameMode = mode;
        this.gameState = mode === 'computer' ? 'playing' : 'waiting';
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.moveHistory = [];
        
        // Neue Spieluhr
        this.gameId = this.generateGameId();
        this.whiteTime = 0;
        this.blackTime = 0;
        this.totalGameTime = 0;
        this.gameStartTime = Date.now();
        this.stopTimer(); // Alten Timer stoppen falls vorhanden
        
        this.initializeBoard();
        this.renderBoard();
        this.updateGameStatus();
        this.renderTimer();
        
        document.getElementById('chessModal').style.display = 'flex';
        
        // Update UI für neues Chess.com-Style Layout
        const blackTimerName = document.getElementById('blackTimerName');
        const chatOpponentName = document.getElementById('chatOpponentName');
        const chatOpponentAvatar = document.getElementById('chatOpponentAvatar');
        const chatOpponentStatus = document.getElementById('chatOpponentStatus');
        const difficultySelector = document.getElementById('difficultySelector');
        
        if (mode === 'computer') {
            // Neues Layout: Timer und Chat-Bereich aktualisieren
            if (blackTimerName) blackTimerName.textContent = 'Computer';
            if (chatOpponentName) chatOpponentName.textContent = 'Computer';
            if (chatOpponentAvatar) chatOpponentAvatar.innerHTML = '<i class="fas fa-robot"></i>';
            if (chatOpponentStatus) chatOpponentStatus.textContent = 'KI-Gegner';
            if (difficultySelector) difficultySelector.style.display = 'flex';
            
            this.opponent = { name: 'Computer', type: 'computer' };
            this.opponentName = `Computer (${this.computerDifficulty})`;
            this.updateGameStatus();
            this.startTimer();
        } else {
            // Gegen Spieler
            if (blackTimerName) blackTimerName.textContent = 'Gegner';
            if (chatOpponentName) chatOpponentName.textContent = 'Gegner';
            if (chatOpponentAvatar) chatOpponentAvatar.innerHTML = '<i class="fas fa-user"></i>';
            if (chatOpponentStatus) chatOpponentStatus.textContent = 'Wartet...';
            if (difficultySelector) difficultySelector.style.display = 'none';
            
            this.findOpponent();
        }
        
        // Initiales Auto-Save
        this.saveGame(false);
    }

    findOpponent() {
        setTimeout(() => {
            this.opponent = { name: 'Gegner', id: 'opponent1' };
            this.gameState = 'playing';
            this.updateGameStatus();
        }, 2000);
    }

    updateGameStatus(customMessage = null) {
        const statusElement = document.getElementById('gameStatus');
        if (!statusElement) return;
        
        if (customMessage) {
            statusElement.textContent = customMessage;
            return;
        }
        
        if (this.checkmate.white) {
            statusElement.textContent = 'Schachmatt! Schwarz gewinnt!';
            this.gameState = 'finished';
        } else if (this.checkmate.black) {
            statusElement.textContent = 'Schachmatt! Weiß gewinnt!';
            this.gameState = 'finished';
        } else if (this.stalemate) {
            statusElement.textContent = 'Patt! Unentschieden.';
            this.gameState = 'finished';
        } else if (this.inCheck.white) {
            statusElement.textContent = 'Weiß im Schach!';
        } else if (this.inCheck.black) {
            statusElement.textContent = 'Schwarz im Schach!';
        } else if (this.gameState === 'waiting') {
            statusElement.textContent = 'Warte auf Gegner...';
        } else if (this.gameState === 'playing') {
            if (this.gameMode === 'computer' && this.currentPlayer === 'black') {
                statusElement.textContent = 'Computer denkt nach...';
            } else {
                statusElement.textContent = `${this.currentPlayer === 'white' ? 'Weiß' : 'Schwarz'} ist am Zug`;
            }
        }
    }

    sendMoveToOpponent(move) {
        console.log('📤 Sending move to opponent:', move);
    }

    receiveMoveFromOpponent(move) {
        console.log('📥 Received move from opponent:', move);
        this.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol, move.promotion);
        this.renderBoard();
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
            alert('Remis angeboten. Warte auf Antwort des Gegners...');
        }
    }

    setupEventListeners() {
        // Event listeners werden in renderBoard gesetzt
    }

    cleanup() {
        this.selectedSquare = null;
        this.draggedPiece = null;
        this.dragStartSquare = null;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MOVE HISTORY & UNDO
    // ═══════════════════════════════════════════════════════════════════════════

    updateMoveHistory() {
        const historyElement = document.getElementById('moveHistory');
        if (!historyElement) return;
        
        historyElement.innerHTML = '';
        
        if (this.moveHistory.length === 0) {
            historyElement.innerHTML = '<p class="no-moves">Noch keine Züge</p>';
            return;
        }
        
        // Gruppiere Züge in Paaren (Weiß, Schwarz)
        for (let i = 0; i < this.moveHistory.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = this.moveHistory[i];
            const blackMove = this.moveHistory[i + 1];
            
            const moveRow = document.createElement('div');
            moveRow.className = 'move-history-row';
            
            const moveNumberSpan = document.createElement('span');
            moveNumberSpan.className = 'move-number';
            moveNumberSpan.textContent = `${moveNumber}.`;
            moveRow.appendChild(moveNumberSpan);
            
            // Weißer Zug
            const whiteMoveSpan = document.createElement('span');
            whiteMoveSpan.className = 'move-notation white-move';
            whiteMoveSpan.textContent = this.getMoveNotation(whiteMove);
            whiteMoveSpan.onclick = () => this.jumpToMove(i);
            moveRow.appendChild(whiteMoveSpan);
            
            // Schwarzer Zug (falls vorhanden)
            if (blackMove) {
                const blackMoveSpan = document.createElement('span');
                blackMoveSpan.className = 'move-notation black-move';
                blackMoveSpan.textContent = this.getMoveNotation(blackMove);
                blackMoveSpan.onclick = () => this.jumpToMove(i + 1);
                moveRow.appendChild(blackMoveSpan);
            }
            
            historyElement.appendChild(moveRow);
        }
        
        // Scroll to bottom
        historyElement.scrollTop = historyElement.scrollHeight;
    }

    getMoveNotation(move) {
        const piece = move.piece;
        const pieceType = piece.toLowerCase();
        const fromSquare = this.squareToNotation(move.from.row, move.from.col);
        const toSquare = this.squareToNotation(move.to.row, move.to.col);
        
        let notation = '';
        
        // Spezielle Züge
        if (move.castling) {
            return move.castling.kingside ? 'O-O' : 'O-O-O';
        }
        
        // Figurenbezeichnung (außer Bauer)
        if (pieceType !== 'p') {
            const pieceNames = { 'k': 'K', 'q': 'Q', 'r': 'R', 'b': 'B', 'n': 'N' };
            notation += pieceNames[pieceType] || '';
        }
        
        // Capture
        if (move.captured) {
            if (pieceType === 'p') {
                notation += fromSquare[0]; // Datei des Bauern
            }
            notation += 'x';
        }
        
        // Ziel
        notation += toSquare;
        
        // Promotion
        if (move.promotion) {
            const promoPiece = move.promotion.toUpperCase();
            notation += '=' + (promoPiece === 'Q' ? 'Q' : promoPiece === 'R' ? 'R' : promoPiece === 'B' ? 'B' : 'N');
        }
        
        // Check/Checkmate (vereinfacht)
        // Könnte später erweitert werden
        
        return notation;
    }

    squareToNotation(row, col) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        return files[col] + ranks[row];
    }

    jumpToMove(moveIndex) {
        // Springe zu einem bestimmten Zug in der Historie
        // Dies würde das Brett auf den Zustand nach diesem Zug zurücksetzen
        // Für jetzt nur visuelles Feedback
        console.log('Jump to move', moveIndex);
    }

    undoMove() {
        if (this.moveHistory.length === 0) return;
        if (this.isComputerThinking) return;
        
        const lastMove = this.moveHistory.pop();
        
        // Restore board state
        const piece = lastMove.promotion || this.board[lastMove.to.row][lastMove.to.col];
        this.board[lastMove.from.row][lastMove.from.col] = piece;
        this.board[lastMove.to.row][lastMove.to.col] = lastMove.captured;
        
        // Restore king position
        if (piece.toLowerCase() === 'k') {
            const color = piece === piece.toUpperCase() ? 'white' : 'black';
            this.kingPositions[color] = { row: lastMove.from.row, col: lastMove.from.col };
        }
        
        // Restore castling
        if (lastMove.castling) {
            const isWhite = lastMove.from.row === 7;
            const isKingside = lastMove.castling.kingside;
            const rookCol = isKingside ? 5 : 3;
            const originalRookCol = isKingside ? 7 : 0;
            this.board[lastMove.from.row][originalRookCol] = this.board[lastMove.from.row][rookCol];
            this.board[lastMove.from.row][rookCol] = null;
        }
        
        // Restore en passant
        if (lastMove.enPassant) {
            const isWhite = piece === piece.toUpperCase();
            this.board[isWhite ? lastMove.to.row + 1 : lastMove.to.row - 1][lastMove.to.col] = 
                isWhite ? 'p' : 'P';
        }
        
        // Restore state
        this.castlingRights = lastMove.castlingRightsBefore;
        this.enPassantTarget = lastMove.enPassantTargetBefore;
        this.halfMoveClock = lastMove.halfMoveClockBefore;
        this.fullMoveNumber = lastMove.fullMoveNumberBefore;
        
        // Switch player back
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Re-check game state
        this.checkForCheck();
        this.checkForCheckmate();
        this.checkForStalemate();
        
        this.renderBoard();
        this.updateGameStatus();
        this.updateMoveHistory();
        this.updateUndoButton();
    }

    updateUndoButton() {
        const undoButton = document.getElementById('undoButton');
        if (undoButton) {
            undoButton.disabled = this.moveHistory.length === 0 || this.isComputerThinking;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SPIELUHR / GAME TIMER
    // ═══════════════════════════════════════════════════════════════════════════

    startTimer() {
        if (this.timerInterval) return;
        
        this.gameStartTime = this.gameStartTime || Date.now();
        this.lastMoveTime = Date.now();
        
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
        
        this.renderTimer();
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimer() {
        const now = Date.now();
        const elapsed = Math.floor((now - this.lastMoveTime) / 1000);
        
        // Aktualisiere Zeit für aktuellen Spieler
        if (this.currentPlayer === 'white') {
            this.whiteTime = (this.whiteTime || 0) + 1;
        } else {
            this.blackTime = (this.blackTime || 0) + 1;
        }
        
        // Gesamtspielzeit
        this.totalGameTime = Math.floor((now - this.gameStartTime) / 1000);
        
        this.renderTimer();
    }

    onMoveComplete() {
        this.lastMoveTime = Date.now();
        this.autoSaveGame();
    }

    renderTimer() {
        // Neues Chess.com-Style Layout: Timer-Elemente direkt aktualisieren
        const whiteTimerClock = document.getElementById('whiteTimerClock');
        const blackTimerClock = document.getElementById('blackTimerClock');
        const totalTimerDisplay = document.getElementById('totalTimerDisplay');
        
        if (whiteTimerClock) {
            whiteTimerClock.textContent = this.formatTime(this.whiteTime || 0);
            whiteTimerClock.parentElement?.classList.toggle('active', this.currentPlayer === 'white' && this.gameState === 'playing');
        }
        
        if (blackTimerClock) {
            blackTimerClock.textContent = this.formatTime(this.blackTime || 0);
            blackTimerClock.parentElement?.classList.toggle('active', this.currentPlayer === 'black' && this.gameState === 'playing');
        }
        
        if (totalTimerDisplay) {
            totalTimerDisplay.textContent = `Gesamt: ${this.formatTime(this.totalGameTime || 0)}`;
        }
        
        // Fallback für altes Layout (falls vorhanden)
        const timerContainer = document.getElementById('gameTimerContainer');
        if (timerContainer) {
            timerContainer.innerHTML = `
                <div class="game-timer">
                    <span class="timer-label">Weiß</span>
                    <span class="timer-value ${this.currentPlayer === 'white' && this.gameState === 'playing' ? 'active' : ''}">${this.formatTime(this.whiteTime || 0)}</span>
                </div>
                <div class="timer-divider">⚔️</div>
                <div class="game-timer">
                    <span class="timer-label">Schwarz</span>
                    <span class="timer-value ${this.currentPlayer === 'black' && this.gameState === 'playing' ? 'active' : ''}">${this.formatTime(this.blackTime || 0)}</span>
                </div>
                <div class="total-game-time">
                    <i class="fas fa-clock"></i>
                    <span>Gesamt: ${this.formatTime(this.totalGameTime || 0)}</span>
                </div>
            `;
        }
    }

    formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SPIELSPEICHERUNG / GAME PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════════

    generateGameId() {
        return 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    saveGame(manual = false) {
        if (!this.gameId) {
            this.gameId = this.generateGameId();
        }
        
        const gameData = {
            id: this.gameId,
            board: JSON.parse(JSON.stringify(this.board)),
            currentPlayer: this.currentPlayer,
            gameState: this.gameState,
            gameMode: this.gameMode,
            computerDifficulty: this.computerDifficulty,
            moveHistory: this.moveHistory,
            castlingRights: this.castlingRights,
            enPassantTarget: this.enPassantTarget,
            halfMoveClock: this.halfMoveClock,
            fullMoveNumber: this.fullMoveNumber,
            kingPositions: this.kingPositions,
            whiteTime: this.whiteTime,
            blackTime: this.blackTime,
            totalGameTime: this.totalGameTime,
            gameStartTime: this.gameStartTime,
            opponentId: this.opponentId,
            opponentName: this.opponentName || (this.gameMode === 'computer' ? `Computer (${this.computerDifficulty})` : 'Spieler'),
            savedAt: Date.now(),
            lastMove: this.moveHistory.length > 0 ? this.moveHistory[this.moveHistory.length - 1] : null
        };
        
        // Aktualisiere oder füge hinzu
        const existingIndex = this.savedGames.findIndex(g => g.id === this.gameId);
        if (existingIndex >= 0) {
            this.savedGames[existingIndex] = gameData;
        } else {
            this.savedGames.unshift(gameData); // Neueste zuerst
        }
        
        // Maximal 10 Spiele speichern
        if (this.savedGames.length > 10) {
            this.savedGames = this.savedGames.slice(0, 10);
        }
        
        localStorage.setItem('chess_saved_games', JSON.stringify(this.savedGames));
        
        if (manual) {
            this.showToast('Spiel gespeichert!', 'success');
        }
        
        this.renderSavedGames();
        console.log('💾 Spiel gespeichert:', this.gameId);
    }

    autoSaveGame() {
        // Automatisches Speichern nach jedem Zug
        if (this.gameState === 'playing') {
            this.saveGame(false);
        }
    }

    loadGame(gameId) {
        const game = this.savedGames.find(g => g.id === gameId);
        if (!game) {
            console.error('Spiel nicht gefunden:', gameId);
            return;
        }
        
        // Wiederherstellen des Spielstands
        this.gameId = game.id;
        this.board = JSON.parse(JSON.stringify(game.board));
        this.currentPlayer = game.currentPlayer;
        this.gameState = game.gameState;
        this.gameMode = game.gameMode;
        this.computerDifficulty = game.computerDifficulty || 'medium';
        this.moveHistory = game.moveHistory || [];
        this.castlingRights = game.castlingRights;
        this.enPassantTarget = game.enPassantTarget;
        this.halfMoveClock = game.halfMoveClock;
        this.fullMoveNumber = game.fullMoveNumber;
        this.kingPositions = game.kingPositions;
        this.whiteTime = game.whiteTime || 0;
        this.blackTime = game.blackTime || 0;
        this.totalGameTime = game.totalGameTime || 0;
        this.gameStartTime = game.gameStartTime;
        this.opponentId = game.opponentId;
        this.opponentName = game.opponentName;
        
        // UI aktualisieren
        this.renderBoard();
        this.updateGameStatus();
        this.updateMoveHistory();
        this.renderTimer();
        
        // Timer starten wenn Spiel läuft
        if (this.gameState === 'playing') {
            this.startTimer();
        }
        
        this.showToast('Spiel geladen!', 'info');
        console.log('📂 Spiel geladen:', gameId);
    }

    deleteGame(gameId) {
        this.savedGames = this.savedGames.filter(g => g.id !== gameId);
        localStorage.setItem('chess_saved_games', JSON.stringify(this.savedGames));
        this.renderSavedGames();
        this.showToast('Spiel gelöscht', 'info');
    }

    renderSavedGames() {
        const container = document.getElementById('savedGamesContainer');
        if (!container) return;
        
        if (this.savedGames.length === 0) {
            container.innerHTML = `
                <div class="saved-games-section">
                    <h3><i class="fas fa-save"></i> Gespeicherte Spiele</h3>
                    <div class="no-saved-games">
                        <p>Keine gespeicherten Spiele vorhanden.</p>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="saved-games-section">
                <h3><i class="fas fa-save"></i> Gespeicherte Spiele (${this.savedGames.length})</h3>
                <div class="saved-games-list">
                    ${this.savedGames.map(game => `
                        <div class="saved-game-item" data-game-id="${game.id}">
                            <div class="saved-game-info">
                                <span class="saved-game-title">
                                    ${game.gameMode === 'computer' ? '🤖' : '👥'} 
                                    vs. ${game.opponentName || 'Unbekannt'}
                                </span>
                                <div class="saved-game-meta">
                                    <span><i class="fas fa-chess"></i> ${game.moveHistory?.length || 0} Züge</span>
                                    <span><i class="fas fa-clock"></i> ${this.formatTime(game.totalGameTime || 0)}</span>
                                    <span><i class="fas fa-calendar"></i> ${this.formatDate(game.savedAt)}</span>
                                </div>
                            </div>
                            <div class="saved-game-opponent">
                                <span class="opponent-status ${this.isOpponentOnline(game.opponentId) ? 'online' : ''}"></span>
                            </div>
                            <div class="saved-game-actions">
                                <button class="btn-continue-game" onclick="window.chessGame.loadGame('${game.id}')">
                                    <i class="fas fa-play"></i> Fortsetzen
                                </button>
                                <button class="btn-delete-game" onclick="window.chessGame.deleteGame('${game.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    formatDate(timestamp) {
        if (!timestamp) return 'Unbekannt';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // Weniger als 1 Minute
        if (diff < 60000) return 'Gerade eben';
        // Weniger als 1 Stunde
        if (diff < 3600000) return `Vor ${Math.floor(diff / 60000)} Min.`;
        // Weniger als 24 Stunden
        if (diff < 86400000) return `Vor ${Math.floor(diff / 3600000)} Std.`;
        // Weniger als 7 Tage
        if (diff < 604800000) return `Vor ${Math.floor(diff / 86400000)} Tagen`;
        
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    isOpponentOnline(opponentId) {
        // Hier könnte eine WebSocket-Verbindung prüfen, ob der Gegner online ist
        // Für jetzt simulieren wir das
        if (!opponentId) return false;
        
        // Prüfe im localStorage nach Online-Status
        const onlinePlayers = JSON.parse(localStorage.getItem('chess_online_players') || '[]');
        return onlinePlayers.includes(opponentId);
    }

    setOnlineStatus(isOnline) {
        const userId = this.getCurrentUserId();
        if (!userId) return;
        
        let onlinePlayers = JSON.parse(localStorage.getItem('chess_online_players') || '[]');
        
        if (isOnline) {
            if (!onlinePlayers.includes(userId)) {
                onlinePlayers.push(userId);
            }
        } else {
            onlinePlayers = onlinePlayers.filter(id => id !== userId);
        }
        
        localStorage.setItem('chess_online_players', JSON.stringify(onlinePlayers));
        this.updateOnlinePlayersDisplay();
    }

    getCurrentUserId() {
        // Versuche User-ID aus verschiedenen Quellen
        if (window.unifiedAWSAuth?.currentUser?.username) {
            return window.unifiedAWSAuth.currentUser.username;
        }
        if (window.awsAuth?.currentUser?.username) {
            return window.awsAuth.currentUser.username;
        }
        // Fallback: localStorage
        return localStorage.getItem('chess_user_id') || null;
    }

    updateOnlinePlayersDisplay() {
        const container = document.getElementById('onlinePlayersList');
        if (!container) return;
        
        const onlinePlayers = JSON.parse(localStorage.getItem('chess_online_players') || '[]');
        const currentUser = this.getCurrentUserId();
        
        if (onlinePlayers.length === 0) {
            container.innerHTML = '<p style="color: rgba(255,255,255,0.6); font-style: italic;">Keine Spieler online</p>';
            return;
        }
        
        container.innerHTML = onlinePlayers.map(playerId => `
            <div class="online-player ${playerId === currentUser ? 'is-you' : ''}">
                <span class="status-dot"></span>
                <span>${playerId === currentUser ? 'Du' : playerId}</span>
                ${playerId !== currentUser ? `
                    <button class="btn-challenge" onclick="window.chessGame.challengePlayer('${playerId}')" title="Herausfordern">
                        <i class="fas fa-chess-knight"></i>
                    </button>
                ` : ''}
            </div>
        `).join('');
    }

    challengePlayer(opponentId) {
        this.opponentId = opponentId;
        this.opponentName = opponentId;
        this.startNewGame('player');
        this.showToast(`Spiel gegen ${opponentId} gestartet!`, 'success');
    }

    showToast(message, type = 'info') {
        // Einfache Toast-Benachrichtigung
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideUp 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

}

// Replace old chess game
if (window.chessGame) {
    window.chessGame = new ChessGameEnhanced();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        window.chessGame = new ChessGameEnhanced();
    });
}

// Toast Animation Styles
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideUp {
        from { transform: translate(-50%, 100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(toastStyles);
