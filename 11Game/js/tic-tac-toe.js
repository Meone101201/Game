document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('tic-tac-toe-game');
    const boardElement = document.getElementById('tic-tac-toe-board');
    const statusElement = document.getElementById('tic-tac-toe-status');
    const resetButton = document.getElementById('tic-tac-toe-reset-button');

    const humanPlayer = 'X';
    const aiPlayer = 'O';
    let board = [];
    let currentPlayer = humanPlayer;
    let gameOver = false;
    let difficultyLevel = 'hard';

    if (!gameContainer.querySelector('.difficulty-selector')) {
        const difficultySelector = document.createElement('div');
        difficultySelector.className = 'difficulty-selector';
        difficultySelector.innerHTML = `
            <label for="ttt-difficulty">AI Difficulty: </label>
            <select id="ttt-difficulty">
                <option value="easy">Easy</option>
                <option value="hard" selected>Hard (Unbeatable)</option>
            </select>
        `;
        gameContainer.insertBefore(difficultySelector, statusElement);
        document.getElementById('ttt-difficulty').addEventListener('change', (e) => {
            difficultyLevel = e.target.value;
            createBoard();
        });
    }

    function createBoard() {
        board = Array(9).fill(null);
        boardElement.innerHTML = '';
        gameOver = false;
        currentPlayer = humanPlayer;
        updateStatus();
        boardElement.classList.remove('game-over');

        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('tic-tac-toe-cell');
            cell.dataset.index = i;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }
    window.resetTicTacToeGame = createBoard;

    function handleCellClick(event) {
        if (gameOver || currentPlayer !== humanPlayer) return;
        const index = parseInt(event.target.dataset.index);

        if (board[index] === null) {
            makeMove(index, humanPlayer);
            if (!gameOver) {
                setTimeout(makeAIMove, 400);
            }
        }
    }

    function makeMove(index, player) {
        if (gameOver || board[index] !== null) return;
        board[index] = player;
        const cell = boardElement.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(`player${player === humanPlayer ? '1' : '2'}`);

        if (checkWinner(board, player)) {
            gameOver = true;
            updateStatus(player);
        } else if (board.every(cell => cell !== null)) {
            gameOver = true;
            updateStatus(null); // Draw
        } else {
            currentPlayer = player === humanPlayer ? aiPlayer : humanPlayer;
            updateStatus();
        }
    }

    function makeAIMove() {
        if (gameOver) return;
        const move = difficultyLevel === 'hard' ? getBestMove(board, aiPlayer).index : makeEasyAIMove();
        if (move !== undefined && move !== null) {
            makeMove(move, aiPlayer);
        }
    }

    function makeEasyAIMove() {
        // Win if possible
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                let testBoard = [...board];
                testBoard[i] = aiPlayer;
                if (checkWinner(testBoard, aiPlayer)) return i;
            }
        }
        // Block if necessary
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                let testBoard = [...board];
                testBoard[i] = humanPlayer;
                if (checkWinner(testBoard, humanPlayer)) return i;
            }
        }
        // Otherwise, random
        const emptyCells = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    function getBestMove(newBoard, player) {
        const availableSpots = newBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);

        if (checkWinner(newBoard, humanPlayer)) return { score: -10 };
        if (checkWinner(newBoard, aiPlayer)) return { score: 10 };
        if (availableSpots.length === 0) return { score: 0 };

        let moves = [];
        for (let i = 0; i < availableSpots.length; i++) {
            let move = {};
            move.index = availableSpots[i];
            newBoard[availableSpots[i]] = player;

            if (player === aiPlayer) {
                let result = getBestMove(newBoard, humanPlayer);
                move.score = result.score;
            } else {
                let result = getBestMove(newBoard, aiPlayer);
                move.score = result.score;
            }

            newBoard[availableSpots[i]] = null;
            moves.push(move);
        }

        let bestMove;
        if (player === aiPlayer) {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }
        return moves[bestMove];
    }


    function checkWinner(boardState, player) {
        const winConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8], // Rows
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8], // Columns
            [0, 4, 8],
            [2, 4, 6] // Diagonals
        ];
        return winConditions.some(condition => {
            return condition.every(index => boardState[index] === player);
        });
    }

    function updateStatus(winner = null) {
        if (gameOver) {
            boardElement.classList.add('game-over');
            if (winner) {
                statusElement.textContent = winner === humanPlayer ? "Player Wins!" : "AI Wins!";
                statusElement.style.color = winner === humanPlayer ? 'var(--player1-color)' : 'var(--player2-color)';
            } else {
                statusElement.textContent = "It's a Draw!";
                statusElement.style.color = 'var(--text-color)';
            }
        } else {
            statusElement.textContent = currentPlayer === humanPlayer ? "Player's Turn" : "AI's Turn";
            statusElement.style.color = currentPlayer === humanPlayer ? 'var(--player1-color)' : 'var(--player2-color)';
        }
    }

    resetButton.addEventListener('click', createBoard);
});