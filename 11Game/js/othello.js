document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('othello-game');
    const boardElement = document.getElementById('othello-board');
    const statusElement = document.getElementById('othello-status');
    const resetButton = document.getElementById('othello-reset-button');

    const SIZE = 8;
    const P1 = 1; // Black (Player)
    const P2 = 2; // White (AI)

    let board = [];
    let currentPlayer;
    let validMoves = [];
    let difficultyLevel = 'easy';

    const directions = [
        { r: -1, c: 0 }, { r: -1, c: 1 }, { r: 0, c: 1 }, { r: 1, c: 1 },
        { r: 1, c: 0 }, { r: 1, c: -1 }, { r: 0, c: -1 }, { r: -1, c: -1 }
    ];

    if (!gameContainer.querySelector('.difficulty-selector')) {
        const difficultySelector = document.createElement('div');
        difficultySelector.className = 'difficulty-selector';
        difficultySelector.innerHTML = `
            <label for="othello-difficulty">AI Difficulty: </label>
            <select id="othello-difficulty">
                <option value="easy" selected>Easy</option>
                <option value="hard">Hard</option>
            </select>
        `;
        gameContainer.insertBefore(difficultySelector, statusElement);
        document.getElementById('othello-difficulty').addEventListener('change', (e) => {
            difficultyLevel = e.target.value;
            startGame();
        });
    }

    function startGame() {
        board = Array(SIZE).fill(0).map(() => Array(SIZE).fill(0));
        board[3][3] = P2; // White
        board[3][4] = P1; // Black
        board[4][3] = P1; // Black
        board[4][4] = P2; // White
        currentPlayer = P1;
        turnCycle();
    }
    window.resetOthelloGame = startGame;

    function renderBoard() {
        boardElement.innerHTML = '';
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const cell = document.createElement('div');
                cell.classList.add('othello-cell');
                cell.dataset.r = r;
                cell.dataset.c = c;

                const discValue = board[r][c];
                if (discValue !== 0) {
                    const discContainer = document.createElement('div');
                    discContainer.classList.add('othello-disc-container');
                    const disc = document.createElement('div');
                    disc.classList.add('othello-disc', `player${discValue}`);
                    // FIX: เพิ่ม div front/back เข้าไปใน disc
                    disc.innerHTML = `<div class="othello-disc-front"></div><div class="othello-disc-back"></div>`;
                    discContainer.appendChild(disc);
                    cell.appendChild(discContainer);
                } else if (currentPlayer === P1 && validMoves.some(m => m.r === r && m.c === c)) {
                    const hint = document.createElement('div');
                    hint.classList.add('valid-move-hint');
                    cell.appendChild(hint);
                    cell.addEventListener('click', handleCellClick);
                }
                boardElement.appendChild(cell);
            }
        }
        updateStatus();
    }

    function turnCycle() {
        validMoves = findValidMoves(currentPlayer);
        if (validMoves.length === 0) {
            // No moves for current player, pass the turn
            currentPlayer = (currentPlayer === P1) ? P2 : P1;
            validMoves = findValidMoves(currentPlayer);
            if (validMoves.length === 0) {
                // Game over, neither player can move
                endGame();
                return;
            }
        }
        renderBoard();
        if (currentPlayer === P2) {
            setTimeout(makeAIMove, 800);
        }
    }

    function findValidMoves(player) {
        const moves = [];
        const opponent = (player === P1) ? P2 : P1;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (board[r][c] !== 0) continue;
                for (const dir of directions) {
                    if (isAValidMove(board, player, opponent, r, c, dir)) {
                        moves.push({ r, c });
                        break;
                    }
                }
            }
        }
        return moves;
    }

    function isAValidMove(currentBoard, player, opponent, r, c, dir) {
        let r_scan = r + dir.r;
        let c_scan = c + dir.c;
        let hasOpponentInBetween = false;

        while (r_scan >= 0 && r_scan < SIZE && c_scan >= 0 && c_scan < SIZE) {
            if (currentBoard[r_scan][c_scan] === opponent) {
                hasOpponentInBetween = true;
            } else if (currentBoard[r_scan][c_scan] === player) {
                return hasOpponentInBetween;
            } else {
                return false;
            }
            r_scan += dir.r;
            c_scan += dir.c;
        }
        return false;
    }

    function handleCellClick(event) {
        if (currentPlayer !== P1) return;
        const r = parseInt(event.currentTarget.dataset.r);
        const c = parseInt(event.currentTarget.dataset.c);
        makeMove(r, c);
    }

    function makeMove(r, c) {
        board[r][c] = currentPlayer;
        flipDiscs(r, c, currentPlayer);
        currentPlayer = (currentPlayer === P1) ? P2 : P1;
        turnCycle();
    }

    function flipDiscs(r, c, player) {
        const opponent = (player === P1) ? P2 : P1;

        for (const dir of directions) {
            if (isAValidMove(board, player, opponent, r, c, dir)) {
                let r_scan = r + dir.r;
                let c_scan = c + dir.c;
                while (board[r_scan][c_scan] === opponent) {
                    board[r_scan][c_scan] = player;
                    r_scan += dir.r;
                    c_scan += dir.c;
                }
            }
        }
    }

    function updateStatus() {
        const scores = board.flat().reduce((acc, val) => {
            if (val === P1) acc.p1++;
            if (val === P2) acc.p2++;
            return acc;
        }, { p1: 0, p2: 0 });

        const turnText = currentPlayer === P1 ? 'Black (You)' : 'White (AI)';

        statusElement.innerHTML = `
            <span style="font-weight: bold;">Black (You): ${scores.p1}</span> - 
            <span style="font-weight: bold;">White (AI): ${scores.p2}</span>
            <br>
            <span>Turn: ${turnText}</span>
        `;
    }

    function endGame() {
        const scores = board.flat().reduce((acc, val) => {
            if (val === P1) acc.p1++;
            if (val === P2) acc.p2++;
            return acc;
        }, { p1: 0, p2: 0 });

        let winnerMsg = "It's a Draw!";
        if (scores.p1 > scores.p2) winnerMsg = "Black (You) Win!";
        if (scores.p2 > scores.p1) winnerMsg = "White (AI) Wins!";

        statusElement.innerHTML = `
            <strong>Black (You): ${scores.p1}</strong> - 
            <strong>White (AI): ${scores.p2}</strong>
            <br>
            <strong style="font-size: 1.2em;">Game Over! ${winnerMsg}</strong>
        `;
    }

    // ... (ส่วน AI ไม่มีการเปลี่ยนแปลง) ...
    function makeAIMove() {
        if (validMoves.length === 0) return;
        let move;
        if (difficultyLevel === 'hard') {
            move = getBestMove();
        } else {
            move = validMoves[Math.floor(Math.random() * validMoves.length)];
        }
        if (move) makeMove(move.r, move.c);
    }

    function getBestMove() {
        let bestScore = -Infinity;
        let bestMove = validMoves[0];
        for (const move of validMoves) {
            let tempBoard = JSON.parse(JSON.stringify(board));
            tempBoard[move.r][move.c] = P2;
            simulateFlipDiscs(tempBoard, move.r, move.c, P2);
            let score = evaluateBoard(tempBoard);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }

    function evaluateBoard(board) {
        const positionWeights = [
            [120, -20, 20, 5, 5, 20, -20, 120],
            [-20, -40, -5, -5, -5, -5, -40, -20],
            [20, -5, 15, 3, 3, 15, -5, 20],
            [5, -5, 3, 3, 3, 3, -5, 5],
            [5, -5, 3, 3, 3, 3, -5, 5],
            [20, -5, 15, 3, 3, 15, -5, 20],
            [-20, -40, -5, -5, -5, -5, -40, -20],
            [120, -20, 20, 5, 5, 20, -20, 120]
        ];

        let score = 0;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (board[r][c] === P2) score += positionWeights[r][c];
                else if (board[r][c] === P1) score -= positionWeights[r][c];
            }
        }
        return score;
    }

    function simulateFlipDiscs(board, r, c, player) {
        flipDiscs(r, c, player);
    }

    resetButton.addEventListener('click', startGame);
});