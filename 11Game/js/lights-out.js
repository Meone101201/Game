document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('lightsout-board');
    const statusElement = document.getElementById('lightsout-status');
    const resetButton = document.getElementById('lightsout-reset-button');

    const SIZE = 5;
    let board = [];
    let moves = 0;
    let gameOver = false;

    function startGame() {
        moves = 0;
        gameOver = false;
        boardElement.style.borderColor = '#444';
        board = Array(SIZE).fill(0).map(() => Array(SIZE).fill(false));

        const puzzleComplexity = Math.floor(Math.random() * 10) + 8;
        do {
            for (let i = 0; i < puzzleComplexity; i++) {
                const r = Math.floor(Math.random() * SIZE);
                const c = Math.floor(Math.random() * SIZE);
                toggleLights(r, c, false);
            }
        } while (board.flat().every(light => !light));

        renderBoard();
        updateStatus();
    }
    window.resetLightsoutGame = startGame;

    function renderBoard() {
        boardElement.innerHTML = '';
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const cell = document.createElement('div');
                cell.classList.add('lightsout-cell', board[r][c] ? 'lit' : 'off');
                cell.dataset.r = r;
                cell.dataset.c = c;
                cell.addEventListener('click', handleCellClick);
                boardElement.appendChild(cell);
            }
        }
    }

    function handleCellClick(event) {
        if (gameOver) return;
        const r = parseInt(event.currentTarget.dataset.r);
        const c = parseInt(event.currentTarget.dataset.c);
        toggleLights(r, c, true);
    }

    function toggleLights(r, c, isPlayerMove) {
        if (isPlayerMove) moves++;
        toggleCell(r, c);
        toggleCell(r - 1, c);
        toggleCell(r + 1, c);
        toggleCell(r, c - 1);
        toggleCell(r, c + 1);

        if (isPlayerMove) {
            renderBoard();
            updateStatus();
            checkWinCondition();
        }
    }

    function toggleCell(r, c) {
        if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
            board[r][c] = !board[r][c];
        }
    }

    function updateStatus() {
        if (gameOver) return;
        statusElement.textContent = `Turn all the lights off! Moves: ${moves}`;
    }

    function checkWinCondition() {
        if (board.flat().every(light => !light)) {
            gameOver = true;
            statusElement.textContent = `Solved in ${moves} moves!`;
            statusElement.style.color = 'green';
            boardElement.style.borderColor = '#28a745';
        }
    }

    resetButton.addEventListener('click', startGame);
});