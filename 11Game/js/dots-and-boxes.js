document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('dots-and-boxes-game');
    const boardElement = document.getElementById('dots-and-boxes-board');
    const statusElement = document.getElementById('dots-and-boxes-status');
    const resetButton = document.getElementById('dots-and-boxes-reset-button');

    const GRID_SIZE = 4;
    const BOX_SIZE = 80;
    const LINE_THICKNESS = 8;

    let currentPlayer = 1;
    let scores = { 1: 0, 2: 0 };
    let lines = {};
    let boxes = {};
    let gameOver = false;
    let totalBoxes = (GRID_SIZE - 1) * (GRID_SIZE - 1);
    let difficultyLevel = 'easy';

    if (!gameContainer.querySelector('.difficulty-selector')) {
        const difficultySelector = document.createElement('div');
        difficultySelector.className = 'difficulty-selector';
        difficultySelector.innerHTML = `
            <label for="dots-and-boxes-difficulty">AI Difficulty: </label>
            <select id="dots-and-boxes-difficulty">
                <option value="easy" selected>Easy</option>
                <option value="hard">Hard</option>
            </select>
        `;
        gameContainer.insertBefore(difficultySelector, statusElement);
        document.getElementById('dots-and-boxes-difficulty').addEventListener('change', (e) => {
            difficultyLevel = e.target.value;
            createBoard();
        });
    }

    function createBoard() {
        boardElement.innerHTML = '';
        lines = {};
        boxes = {};
        scores = { 1: 0, 2: 0 };
        currentPlayer = 1;
        gameOver = false;
        updateStatus();

        // FIX: คำนวณตำแหน่งใหม่ทั้งหมดให้แม่นยำ
        const centerOffset = 40; // ครึ่งหนึ่งของ BOX_SIZE เพื่อให้กระดานอยู่กลาง

        // สร้างกล่อง (Boxes)
        for (let r = 0; r < GRID_SIZE - 1; r++) {
            for (let c = 0; c < GRID_SIZE - 1; c++) {
                const box = document.createElement('div');
                box.classList.add('box');
                box.id = `b-${r}-${c}`;
                box.style.left = `${centerOffset + c * BOX_SIZE + BOX_SIZE / 2}px`;
                box.style.top = `${centerOffset + r * BOX_SIZE + BOX_SIZE / 2}px`;
                box.style.width = `${BOX_SIZE}px`;
                box.style.height = `${BOX_SIZE}px`;
                boardElement.appendChild(box);
            }
        }

        // สร้างเส้นแนวนอน (Horizontal Lines)
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE - 1; c++) {
                const line = document.createElement('div');
                line.classList.add('line', 'horizontal-line');
                line.dataset.type = 'h';
                line.dataset.r = r;
                line.dataset.c = c;
                line.id = `h-${r}-${c}`;
                line.style.top = `${centerOffset + r * BOX_SIZE}px`;
                line.style.left = `${centerOffset + c * BOX_SIZE + BOX_SIZE / 2}px`;
                line.style.width = `${BOX_SIZE}px`;
                line.style.height = `${LINE_THICKNESS}px`;
                line.addEventListener('click', handleLineClick);
                boardElement.appendChild(line);
            }
        }

        // สร้างเส้นแนวตั้ง (Vertical Lines)
        for (let r = 0; r < GRID_SIZE - 1; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const line = document.createElement('div');
                line.classList.add('line', 'vertical-line');
                line.dataset.type = 'v';
                line.dataset.r = r;
                line.dataset.c = c;
                line.id = `v-${r}-${c}`;
                line.style.top = `${centerOffset + r * BOX_SIZE + BOX_SIZE / 2}px`;
                line.style.left = `${centerOffset + c * BOX_SIZE}px`;
                line.style.width = `${LINE_THICKNESS}px`;
                line.style.height = `${BOX_SIZE}px`;
                line.addEventListener('click', handleLineClick);
                boardElement.appendChild(line);
            }
        }

        // สร้างจุด (Dots)
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                dot.style.top = `${centerOffset + r * BOX_SIZE}px`;
                dot.style.left = `${centerOffset + c * BOX_SIZE}px`;
                boardElement.appendChild(dot);
            }
        }
    }
    window.resetDotsAndBoxesGame = createBoard;

    function handleLineClick(event) {
        if (gameOver || currentPlayer !== 1) return;
        const line = event.target;
        if (lines[line.id]) return;
        makeMove(line);
    }

    function makeMove(line) {
        if (!line || lines[line.id]) return;

        lines[line.id] = currentPlayer;
        line.classList.add(`taken-by-player${currentPlayer}`);

        let boxCompleted = checkForBoxCompletion(line);

        if (boxCompleted) {
            updateScores();
            if (scores[1] + scores[2] === totalBoxes) {
                endGame();
                return;
            }
            updateStatus(true);
            if (currentPlayer === 2) setTimeout(makeAIMove, 500);
        } else {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updateStatus();
            if (currentPlayer === 2) setTimeout(makeAIMove, 500);
        }
    }

    function makeAIMove() {
        if (gameOver || currentPlayer !== 2) return;
        const line = difficultyLevel === 'hard' ? makeHardAIMove() : makeEasyAIMove();
        if (line) makeMove(line);
    }

    function makeEasyAIMove() {
        const winningMove = findWinningMove();
        if (winningMove && Math.random() < 0.5) {
            return winningMove;
        }

        const availableLines = [];
        document.querySelectorAll('.line').forEach(line => {
            if (!lines[line.id]) availableLines.push(line);
        });

        if (availableLines.length > 0) {
            return availableLines[Math.floor(Math.random() * availableLines.length)];
        }
        return null;
    }

    function makeHardAIMove() {
        const winningMove = findWinningMove();
        if (winningMove) return winningMove;

        const availableLines = [];
        document.querySelectorAll('.line').forEach(line => {
            if (!lines[line.id]) availableLines.push(line);
        });
        const safeMoves = availableLines.filter(line => isSafeMove(line));

        if (safeMoves.length > 0) {
            return safeMoves[Math.floor(Math.random() * safeMoves.length)];
        }
        if (availableLines.length > 0) {
            return availableLines[Math.floor(Math.random() * availableLines.length)];
        }
        return null;
    }

    function findWinningMove() {
        for (let r = 0; r < GRID_SIZE - 1; r++) {
            for (let c = 0; c < GRID_SIZE - 1; c++) {
                if (!boxes[`b-${r}-${c}`] && countTakenSides(r, c) === 3) {
                    const winningLineId = getBoxSides(r, c).find(id => !lines[id]);
                    if (winningLineId) return document.getElementById(winningLineId);
                }
            }
        }
        return null;
    }

    function getBoxSides(r, c) { return [`h-${r}-${c}`, `h-${r + 1}-${c}`, `v-${r}-${c}`, `v-${r}-${c + 1}`]; }

    function countTakenSides(r, c) {
        if (r < 0 || r >= GRID_SIZE - 1 || c < 0 || c >= GRID_SIZE - 1) return 0;
        return getBoxSides(r, c).filter(id => lines[id]).length;
    }

    function isSafeMove(line) {
        const { type, r: rStr, c: cStr } = line.dataset;
        const r = parseInt(rStr),
            c = parseInt(cStr);
        const createsTrap = (boxR, boxC) => countTakenSides(boxR, boxC) === 2;
        if (type === 'h') return !createsTrap(r - 1, c) && !createsTrap(r, c);
        return !createsTrap(r, c - 1) && !createsTrap(r, c);
    }

    function checkForBoxCompletion(line) {
        const { type, r: rStr, c: cStr } = line.dataset;
        const r = parseInt(rStr),
            c = parseInt(cStr);
        let completed = false;
        const checkAndClaim = (boxR, boxC) => {
            if (boxR >= 0 && boxR < GRID_SIZE - 1 && boxC >= 0 && boxC < GRID_SIZE - 1) {
                if (!boxes[`b-${boxR}-${boxC}`] && countTakenSides(boxR, boxC) === 4) {
                    claimBox(boxR, boxC);
                    completed = true;
                }
            }
        };
        if (type === 'h') { checkAndClaim(r - 1, c);
            checkAndClaim(r, c); } else { checkAndClaim(r, c - 1);
            checkAndClaim(r, c); }
        return completed;
    }

    function claimBox(r, c) {
        const boxId = `b-${r}-${c}`;
        if (boxes[boxId]) return;
        boxes[boxId] = currentPlayer;
        scores[currentPlayer]++;
        document.getElementById(boxId).classList.add(`box-player${currentPlayer}`);
    }

    function updateScores() { updateStatus(); }

    function updateStatus(keepTurn = false) {
        if (gameOver) {
            let winnerText;
            if (scores[1] > scores[2]) winnerText = "Player Wins!";
            else if (scores[2] > scores[1]) winnerText = "AI Wins!";
            else winnerText = "It's a Draw!";
            statusElement.textContent = `Game Over! ${winnerText} (Player: ${scores[1]} - AI: ${scores[2]})`;
            statusElement.style.color = 'var(--text-color)';
            return;
        }
        let text = `Player: ${scores[1]} - AI: ${scores[2]} | `;
        if (keepTurn) text += currentPlayer === 1 ? `Player gets another turn!` : `AI gets another turn!`;
        else text += currentPlayer === 1 ? `Player's Turn` : `AI's Turn`;
        statusElement.textContent = text;
        statusElement.style.color = currentPlayer === 1 ? 'var(--player1-color)' : 'var(--player2-color)';
    }

    function endGame() {
        gameOver = true;
        updateStatus();
    }

    resetButton.addEventListener('click', createBoard);
});