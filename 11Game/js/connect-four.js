document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('connect-four-game');
    const boardElement = document.getElementById('connect-four-board');
    const statusElement = document.getElementById('connect-four-status');
    const resetButton = document.getElementById('connect-four-reset-button');

    const ROWS = 6;
    const COLS = 7;
    let board = [];
    let currentPlayer = 1;
    let gameOver = false;
    let difficultyLevel = 'easy';

    // Add difficulty selector if it doesn't exist
    if (!gameContainer.querySelector('.difficulty-selector')) {
        const difficultySelector = document.createElement('div');
        difficultySelector.className = 'difficulty-selector';
        difficultySelector.innerHTML = `
            <label for="connect-four-difficulty">AI Difficulty: </label>
            <select id="connect-four-difficulty">
                <option value="easy" selected>Easy</option>
                <option value="hard">Hard</option>
            </select>
        `;
        gameContainer.insertBefore(difficultySelector, statusElement);
        document.getElementById('connect-four-difficulty').addEventListener('change', (e) => {
            difficultyLevel = e.target.value;
            createBoard();
        });
    }

    function createBoard() {
        board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        boardElement.innerHTML = '';
        gameOver = false;
        currentPlayer = 1;
        statusElement.textContent = "Player's Turn";
        statusElement.style.color = 'var(--player1-color)';

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const slot = document.createElement('div');
                slot.classList.add('connect-four-slot');
                slot.dataset.row = r;
                slot.dataset.col = c;
                slot.addEventListener('click', handleSlotClick);
                boardElement.appendChild(slot);
            }
        }
    }
    window.resetConnectFourGame = createBoard;

    function handleSlotClick(event) {
        if (gameOver || currentPlayer !== 1) return;
        const col = parseInt(event.currentTarget.dataset.col);
        makeHumanMove(col);
    }

    function makeHumanMove(col) {
        if (!makeMove(col)) return; // If move is invalid, do nothing

        if (!gameOver) {
            setTimeout(makeAIMove, 500);
        }
    }

    function makeMove(col) {
        if (gameOver) return false;
        let rowToPlace = -1;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r][col] === 0) {
                rowToPlace = r;
                break;
            }
        }

        if (rowToPlace === -1) return false;

        board[rowToPlace][col] = currentPlayer;
        const slotToUpdate = boardElement.querySelector(`[data-row='${rowToPlace}'][data-col='${col}']`);
        slotToUpdate.style.setProperty('--drop-delay', `${rowToPlace * 0.05}s`);
        slotToUpdate.classList.add(`player${currentPlayer}`);

        if (checkWin(rowToPlace, col)) {
            gameOver = true;
            statusElement.textContent = currentPlayer === 1 ? "Player Wins!" : "AI Wins!";
            statusElement.style.color = currentPlayer === 1 ? 'var(--player1-color)' : 'var(--player2-color)';
            return true;
        }

        if (board[0].every(slot => slot !== 0)) {
            gameOver = true;
            statusElement.textContent = "It's a Draw!";
            statusElement.style.color = 'var(--text-color)';
            return true;
        }

        currentPlayer = currentPlayer === 1 ? 2 : 1;
        statusElement.textContent = currentPlayer === 1 ? "Player's Turn" : "AI's Turn";
        statusElement.style.color = currentPlayer === 1 ? 'var(--player1-color)' : 'var(--player2-color)';
        return true;
    }

    function makeAIMove() {
        if (gameOver || currentPlayer !== 2) return;
        let col;
        if (difficultyLevel === 'easy') {
            col = makeEasyAIMove();
        } else {
            col = makeHardAIMove();
        }
        makeMove(col);
    }

    function makeEasyAIMove() {
        const validMoves = [];
        for (let c = 0; c < COLS; c++) {
            if (board[0][c] === 0) validMoves.push(c);
        }
        // Block player's winning move with 70% chance
        const blockingMove = findWinningMove(1);
        if (blockingMove !== -1 && Math.random() < 0.7) {
            return blockingMove;
        }
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    function makeHardAIMove() {
        // 1. Check for AI's winning move
        const winningMove = findWinningMove(2);
        if (winningMove !== -1) return winningMove;

        // 2. Block player's winning move
        const blockingMove = findWinningMove(1);
        if (blockingMove !== -1) return blockingMove;

        // 3. Simple heuristic: prefer center columns
        const moveOrder = [3, 4, 2, 5, 1, 6, 0];
        for (const col of moveOrder) {
            if (board[0][col] === 0) {
                return col;
            }
        }
        return -1; // Should not happen
    }

    function findWinningMove(player) {
        for (let c = 0; c < COLS; c++) {
            if (board[0][c] === 0) { // Check if column is not full
                let r = getNextOpenRow(c);
                board[r][c] = player; // Temporarily make the move
                if (checkWin(r, c)) {
                    board[r][c] = 0; // Undo the move
                    return c;
                }
                board[r][c] = 0; // Undo the move
            }
        }
        return -1;
    }

    function getNextOpenRow(col) {
        for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r][col] === 0) return r;
        }
        return -1;
    }

    function checkWin(r, c) {
        const player = board[r][c];
        const directions = [
            { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: -1 }
        ];

        for (const dir of directions) {
            let count = 1;
            for (let i = 1; i < 4; i++) {
                const newR = r + dir.r * i;
                const newC = c + dir.c * i;
                if (newR >= 0 && newR < ROWS && newC >= 0 && newC < COLS && board[newR][newC] === player) {
                    count++;
                } else break;
            }
            for (let i = 1; i < 4; i++) {
                const newR = r - dir.r * i;
                const newC = c - dir.c * i;
                if (newR >= 0 && newR < ROWS && newC >= 0 && newC < COLS && board[newR][newC] === player) {
                    count++;
                } else break;
            }
            if (count >= 4) return true;
        }
        return false;
    }

    resetButton.addEventListener('click', createBoard);
});