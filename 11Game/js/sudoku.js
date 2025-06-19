document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('sudoku-board');
    const paletteElement = document.getElementById('sudoku-palette');
    const statusElement = document.getElementById('sudoku-status');
    const checkButton = document.getElementById('sudoku-check-button');
    const resetButton = document.getElementById('sudoku-reset-button');

    let solution, puzzle, boardState;
    let selectedNumber = null;
    let selectedCell = null;

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function isValid(board, row, col, num) {
        for (let i = 0; i < 9; i++) {
            const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
            const boxCol = 3 * Math.floor(col / 3) + i % 3;
            if (board[row][i] === num || board[i][col] === num || board[boxRow][boxCol] === num) {
                return false;
            }
        }
        return true;
    }

    function solveGrid(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (const num of numbers) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (solveGrid(board)) return true;
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    function countSolutions(board) {
        let count = 0;

        function solve() {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (board[row][col] === 0) {
                        for (let num = 1; num <= 9 && count < 2; num++) {
                            if (isValid(board, row, col, num)) {
                                board[row][col] = num;
                                solve();
                                board[row][col] = 0;
                            }
                        }
                        return;
                    }
                }
            }
            count++;
        }
        solve();
        return count;
    }

    function generateSudoku(difficulty = 0.6) {
        const board = Array(9).fill(0).map(() => Array(9).fill(0));
        solveGrid(board);
        const solutionGrid = board.map(row => [...row]);

        const puzzleGrid = board.map(row => [...row]);
        const cells = shuffle(Array.from({ length: 81 }, (_, i) => i));
        let removedCount = 0;
        const cellsToRemove = Math.floor(81 * difficulty);

        for (const cellIndex of cells) {
            if (removedCount >= cellsToRemove) break;
            const row = Math.floor(cellIndex / 9);
            const col = cellIndex % 9;
            const temp = puzzleGrid[row][col];
            puzzleGrid[row][col] = 0;

            const boardCopy = puzzleGrid.map(r => [...r]);
            if (countSolutions(boardCopy) !== 1) {
                puzzleGrid[row][col] = temp;
            } else {
                removedCount++;
            }
        }

        return [solutionGrid.flat(), puzzleGrid.flat()];
    }

    function startGame() {
        statusElement.textContent = "Generating a new puzzle...";
        statusElement.style.color = 'black';
        boardElement.innerHTML = '';
        paletteElement.innerHTML = '';

        setTimeout(() => {
            const [newSolution, newPuzzle] = generateSudoku(0.65);
            solution = newSolution;
            puzzle = newPuzzle;
            boardState = [...puzzle];
            selectedNumber = null;
            selectedCell = null;
            statusElement.textContent = "Select a number and fill the board.";
            renderBoard();
            renderPalette();
        }, 50);
    }
    window.resetSudokuGame = startGame;

    function renderBoard() {
        boardElement.innerHTML = '';
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.classList.add('sudoku-cell');
            cell.dataset.index = i;

            const row = Math.floor(i / 9);
            const col = i % 9;
            if ((col + 1) % 3 === 0 && col < 8) cell.style.borderRight = "3px solid #333";
            if ((row + 1) % 3 === 0 && row < 8) cell.style.borderBottom = "3px solid #333";

            if (boardState[i] !== 0) {
                cell.textContent = boardState[i];
                if (puzzle[i] !== 0) cell.classList.add('given');
                else cell.classList.add('user-filled');
            }

            if (puzzle[i] === 0) {
                cell.addEventListener('click', handleCellClick);
            }
            boardElement.appendChild(cell);
        }
    }

    function renderPalette() {
        paletteElement.innerHTML = '';
        for (let i = 1; i <= 9; i++) {
            const numElement = document.createElement('div');
            numElement.classList.add('sudoku-palette-number');
            numElement.textContent = i;
            numElement.dataset.number = i;
            numElement.addEventListener('click', handlePaletteClick);
            paletteElement.appendChild(numElement);
        }
        const eraserElement = document.createElement('div');
        eraserElement.classList.add('sudoku-palette-number');
        eraserElement.innerHTML = '⌫';
        eraserElement.title = "Erase";
        eraserElement.dataset.number = 0;
        eraserElement.addEventListener('click', handlePaletteClick);
        paletteElement.appendChild(eraserElement);
    }

    function handlePaletteClick(event) {
        selectedNumber = parseInt(event.currentTarget.dataset.number);
        document.querySelectorAll('.sudoku-palette-number').forEach(p => p.classList.remove('selected'));
        event.currentTarget.classList.add('selected');
    }

    function handleCellClick(event) {
        const cell = event.currentTarget;
        const index = parseInt(cell.dataset.index);

        if (selectedNumber !== null) {
            boardState[index] = boardState[index] === selectedNumber ? 0 : selectedNumber;
            updateCell(index);
        }
    }

    function updateCell(index) {
        const cell = boardElement.querySelector(`[data-index='${index}']`);
        cell.classList.remove('error', 'user-filled');
        if (boardState[index] !== 0) {
            cell.textContent = boardState[index];
            cell.classList.add('user-filled');
        } else {
            cell.textContent = '';
        }
    }

    function checkSolution() {
        let errors = 0;
        let filledCount = 0;

        for (let i = 0; i < 81; i++) {
            const cellElement = boardElement.querySelector(`[data-index='${i}']`);
            cellElement.classList.remove('error');
            if (boardState[i] !== 0) {
                filledCount++;
                if (boardState[i] !== solution[i]) {
                    errors++;
                    if (!cellElement.classList.contains('given')) {
                        cellElement.classList.add('error');
                    }
                }
            }
        }

        if (errors > 0) {
            statusElement.textContent = `Found ${errors} error(s). Keep trying!`;
            statusElement.style.color = 'var(--player1-color)';
        } else if (filledCount < 81) {
            statusElement.textContent = "Board not full, but no errors so far!";
            statusElement.style.color = 'var(--primary-color)';
        } else {
            statusElement.textContent = "Congratulations! You solved it!";
            statusElement.style.color = 'green';
            document.querySelectorAll('.sudoku-cell').forEach(c => c.removeEventListener('click', handleCellClick));
        }
    }

    checkButton.addEventListener('click', checkSolution);
    resetButton.addEventListener('click', startGame);
});