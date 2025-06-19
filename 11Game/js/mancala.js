document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('mancala-game');
    const statusElement = document.getElementById('mancala-status');
    const resetButton = document.getElementById('mancala-reset-button');
    const player1PitsContainer = document.getElementById('mancala-pits-1');
    const player2PitsContainer = document.getElementById('mancala-pits-2');
    const player1Store = document.getElementById('mancala-store-1');
    const player2Store = document.getElementById('mancala-store-2');

    const P1_STORE_INDEX = 6;
    const P2_STORE_INDEX = 13;
    const INITIAL_SEEDS = 4;

    let board = [];
    let gameOver = false;
    let isPlayerTurn = true;
    let difficultyLevel = 'easy';

    if (!gameContainer.querySelector('.difficulty-selector')) {
        const difficultySelector = document.createElement('div');
        difficultySelector.className = 'difficulty-selector';
        difficultySelector.innerHTML = `
            <label for="mancala-difficulty">AI Difficulty: </label>
            <select id="mancala-difficulty">
                <option value="easy" selected>Easy</option>
                <option value="hard">Hard</option>
            </select>
        `;
        gameContainer.insertBefore(difficultySelector, statusElement);
        document.getElementById('mancala-difficulty').addEventListener('change', (e) => {
            difficultyLevel = e.target.value;
            startGame();
        });
    }

    function startGame() {
        board = Array(14).fill(INITIAL_SEEDS);
        board[P1_STORE_INDEX] = 0;
        board[P2_STORE_INDEX] = 0;
        gameOver = false;
        isPlayerTurn = true;
        renderBoard();
        updateStatus();
    }
    window.resetMancalaGame = startGame;

    function renderBoard() {
        player1PitsContainer.innerHTML = '';
        player2PitsContainer.innerHTML = '';
        document.querySelectorAll('.mancala-pit').forEach(pit => pit.classList.remove('ai-selected'));

        for (let i = 0; i < 6; i++) {
            player1PitsContainer.appendChild(createPit(i));
        }
        for (let i = 12; i >= 7; i--) {
            player2PitsContainer.appendChild(createPit(i));
        }

        player1Store.textContent = board[P1_STORE_INDEX];
        player2Store.textContent = board[P2_STORE_INDEX];
        highlightActivePits();
    }

    function createPit(index) {
        const pit = document.createElement('div');
        pit.classList.add('mancala-pit');
        pit.dataset.index = index;
        pit.textContent = board[index];
        pit.addEventListener('click', handlePitClick);
        return pit;
    }

    function highlightActivePits() {
        document.querySelectorAll('.mancala-pit').forEach(pit => {
            const index = parseInt(pit.dataset.index);
            pit.classList.remove('player1-pit', 'inactive-pit');
            const isPlayerPit = index >= 0 && index < 6;
            if (isPlayerTurn && isPlayerPit && board[index] > 0) {
                pit.classList.add('player1-pit');
            } else {
                pit.classList.add('inactive-pit');
            }
        });
    }

    function highlightAIMove(pitIndex) {
        const pit = document.querySelector(`.mancala-pit[data-index='${pitIndex}']`);
        if (pit) pit.classList.add('ai-selected');
    }

    function handlePitClick(event) {
        if (gameOver || !isPlayerTurn) return;
        const index = parseInt(event.currentTarget.dataset.index);
        if (index < 0 || index >= 6 || board[index] === 0) return;

        const { newBoard, extraTurn } = makeMove(board, index, true);
        board = newBoard;
        renderBoard();

        if (checkGameOver()) return;

        if (extraTurn) {
            updateStatus('You get another turn!');
        } else {
            isPlayerTurn = false;
            updateStatus('AI is thinking...');
            highlightActivePits();
            setTimeout(makeAIMove, 1000);
        }
    }

    function makeAIMove() {
        if (gameOver || isPlayerTurn) return;
        const move = difficultyLevel === 'hard' ? getBestMove(board, 4) : getEasyMove(board);
        if (move === -1) {
            checkGameOver();
            return;
        }

        highlightAIMove(move);

        setTimeout(() => {
            let currentBoard = [...board];
            let hasExtraTurn = true;

            while (hasExtraTurn && !gameOver) {
                const bestMove = (hasExtraTurn && difficultyLevel === 'hard') ? getBestMove(currentBoard, 4) : getEasyMove(currentBoard);

                if (bestMove === -1) {
                    hasExtraTurn = false;
                    break;
                }

                const result = makeMove(currentBoard, bestMove, false);
                currentBoard = result.newBoard;
                hasExtraTurn = result.extraTurn;

                if (isGameOver(currentBoard)) {
                    gameOver = true;
                }
            }

            board = currentBoard;
            renderBoard();

            if (checkGameOver()) return;

            isPlayerTurn = true;
            updateStatus();
            highlightActivePits();

        }, 500);
    }

    function makeMove(currentBoard, pitIndex, isPlayer) {
        let newBoard = [...currentBoard];
        const playerStoreIndex = isPlayer ? P1_STORE_INDEX : P2_STORE_INDEX;
        const opponentStoreIndex = isPlayer ? P2_STORE_INDEX : P1_STORE_INDEX;

        let seedsToSow = newBoard[pitIndex];
        newBoard[pitIndex] = 0;

        let currentIndex = pitIndex;
        while (seedsToSow > 0) {
            currentIndex = (currentIndex + 1) % 14;
            if (currentIndex === opponentStoreIndex) continue;
            newBoard[currentIndex]++;
            seedsToSow--;
        }

        const lastPitIndex = currentIndex;
        let extraTurn = false;

        if (lastPitIndex === playerStoreIndex) {
            extraTurn = true;
        } else {
            const isOwnSide = isPlayer ? (lastPitIndex >= 0 && lastPitIndex < 6) : (lastPitIndex >= 7 && lastPitIndex < 13);
            if (newBoard[lastPitIndex] === 1 && isOwnSide) {
                const oppositeIndex = 12 - lastPitIndex;
                if (newBoard[oppositeIndex] > 0) {
                    const capturedSeeds = newBoard[oppositeIndex] + 1;
                    newBoard[oppositeIndex] = 0;
                    newBoard[lastPitIndex] = 0;
                    newBoard[playerStoreIndex] += capturedSeeds;
                }
            }
        }
        return { newBoard, extraTurn };
    }

    function getValidMoves(currentBoard, isPlayer) {
        const moves = [];
        const startIndex = isPlayer ? 0 : 7;
        const endIndex = isPlayer ? 6 : 13;
        for (let i = startIndex; i < endIndex; i++) {
            if (currentBoard[i] > 0) moves.push(i);
        }
        return moves;
    }

    function getEasyMove(currentBoard) {
        const validMoves = getValidMoves(currentBoard, false);
        if (validMoves.length === 0) return -1;
        // Prioritize move that gives an extra turn
        for (const move of validMoves) {
            const { extraTurn } = makeMove(currentBoard, move, false);
            if (extraTurn) return move;
        }
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    function getBestMove(currentBoard, depth) {
        let bestScore = -Infinity;
        let bestMove = -1;
        const validMoves = getValidMoves(currentBoard, false);

        for (const move of validMoves) {
            const { newBoard, extraTurn } = makeMove(currentBoard, move, false);
            const score = minimax(newBoard, depth - 1, -Infinity, Infinity, extraTurn, true);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }

    function minimax(board, depth, alpha, beta, isMaximizing, isPlayerAi) {
        if (depth === 0 || isGameOver(board)) {
            return evaluateBoard(board);
        }

        const validMoves = getValidMoves(board, !isPlayerAi);

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of validMoves) {
                const { newBoard, extraTurn } = makeMove(board, move, !isPlayerAi);
                const evalScore = minimax(newBoard, depth - 1, alpha, beta, extraTurn ? true : false, isPlayerAi);
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of validMoves) {
                const { newBoard, extraTurn } = makeMove(board, move, isPlayerAi);
                const evalScore = minimax(newBoard, depth - 1, alpha, beta, extraTurn ? false : true, !isPlayerAi);
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    function evaluateBoard(currentBoard) {
        return currentBoard[P2_STORE_INDEX] - currentBoard[P1_STORE_INDEX];
    }

    function isGameOver(currentBoard) {
        const playerPitsEmpty = currentBoard.slice(0, 6).every(seeds => seeds === 0);
        const aiPitsEmpty = currentBoard.slice(7, 13).every(seeds => seeds === 0);
        return playerPitsEmpty || aiPitsEmpty;
    }

    function checkGameOver() {
        if (isGameOver(board)) {
            gameOver = true;
            const playerRemaining = board.slice(0, 6).reduce((a, b) => a + b, 0);
            const aiRemaining = board.slice(7, 13).reduce((a, b) => a + b, 0);
            board[P1_STORE_INDEX] += playerRemaining;
            board[P2_STORE_INDEX] += aiRemaining;
            for (let i = 0; i < 14; i++) {
                if (i !== P1_STORE_INDEX && i !== P2_STORE_INDEX) board[i] = 0;
            }
            renderBoard();

            const playerScore = board[P1_STORE_INDEX];
            const aiScore = board[P2_STORE_INDEX];
            let winnerMsg = "It's a Draw!";
            if (playerScore > aiScore) winnerMsg = "You Win!";
            else if (aiScore > playerScore) winnerMsg = "AI Wins!";
            statusElement.textContent = `Game Over! ${winnerMsg} (You: ${playerScore}, AI: ${aiScore})`;
            statusElement.style.color = 'var(--text-color)';
            return true;
        }
        return false;
    }

    function updateStatus(message = "") {
        if (gameOver) return;
        if (!message) {
            message = isPlayerTurn ? "Your Turn" : "AI's Turn";
        }
        statusElement.textContent = message;
        statusElement.style.color = isPlayerTurn ? 'var(--player1-color)' : 'var(--player2-color)';
    }

    resetButton.addEventListener('click', startGame);
});