document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('sudoku-board');
    const paletteElement = document.getElementById('sudoku-palette');
    const statusElement = document.getElementById('sudoku-status');
    const checkButton = document.getElementById('sudoku-check-button');
    const resetButton = document.getElementById('sudoku-reset-button');

    // ★ เราจะไม่ใช้ตัวแปร puzzles แบบเก่า แต่จะสร้างโจทย์ใหม่ทุกครั้ง
    let solution, puzzle, boardState;
    let selectedNumber = null;
    let selectedCell = null;

    // --- ส่วนของโค้ดสำหรับสร้าง Sudoku ---

    // ฟังก์ชันสลับตำแหน่งใน Array (Fisher-Yates Shuffle)
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // ฟังก์ชันตรวจสอบว่าการวางตัวเลขถูกต้องตามกฎ Sudoku หรือไม่
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

    // ฟังก์ชันสร้างเฉลย Sudoku ที่สมบูรณ์ (ใช้ Backtracking)
    function solveGrid(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (const num of numbers) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (solveGrid(board)) {
                                return true;
                            }
                            board[row][col] = 0; // Backtrack
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // ฟังก์ชันนับจำนวนเฉลยที่เป็นไปได้ (เพื่อตรวจสอบ Unique Solution)
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
                                board[row][col] = 0; // Backtrack
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


    // ฟังก์ชันหลักในการสร้างโจทย์ Sudoku
    function generateSudoku(difficulty = 0.5) {
        // difficulty: 0.2 (ง่าย) to 0.8 (ยาก) - คือสัดส่วนของช่องที่จะพยายามลบ
        const board = Array(9).fill(0).map(() => Array(9).fill(0));

        // 1. สร้างเฉลยที่สมบูรณ์
        solveGrid(board);
        const solutionGrid = board.map(row => [...row]);

        // 2. เจาะช่องว่างเพื่อสร้างโจทย์
        const puzzleGrid = board.map(row => [...row]);
        const cells = shuffle(Array.from({ length: 81 }, (_, i) => i));

        let attempts = Math.floor(81 * difficulty);
        let removed = 0;

        for (const cellIndex of cells) {
            if (removed > attempts) break;

            const row = Math.floor(cellIndex / 9);
            const col = cellIndex % 9;
            const temp = puzzleGrid[row][col];

            puzzleGrid[row][col] = 0;
            removed++;

            // สร้าง copy เพื่อส่งไปตรวจสอบ ไม่ให้กระทบ grid หลัก
            const boardCopy = puzzleGrid.map(r => [...r]);

            // 3. ตรวจสอบว่าโจทย์มีเฉลยเดียวหรือไม่
            if (countSolutions(boardCopy) !== 1) {
                // ถ้ามีมากกว่า 1 เฉลย ให้ใส่ตัวเลขกลับคืน
                puzzleGrid[row][col] = temp;
                removed--;
            }
        }

        // แปลง Array 2D กลับเป็น 1D เพื่อให้เข้ากับโค้ดเดิม
        const solution1D = solutionGrid.flat();
        const puzzle1D = puzzleGrid.flat();

        return [solution1D, puzzle1D];
    }
    
    function startGame() {
        // 1. สร้างโจทย์และเฉลยใหม่ทันที ไม่ต้องมีข้อความ "Generating..." คั่น
        const [newSolution, newPuzzle] = generateSudoku(0.65); // ปรับค่านี้เพื่อเปลี่ยนความยาก

        // 2. อัปเดตตัวแปรสถานะต่างๆ ของเกม
        solution = newSolution;
        puzzle = newPuzzle;
        boardState = [...puzzle]; // คัดลอกโจทย์ไปเป็นสถานะเริ่มต้นของกระดาน
        selectedNumber = null;
        selectedCell = null;

        // 3. อัปเดตข้อความสถานะให้พร้อมเล่นได้เลย
        statusElement.textContent = "Select a number and fill the board.";
        statusElement.style.color = 'black'; // ตั้งค่าสีข้อความกลับเป็นปกติ

        // 4. วาดกระดานและแผงตัวเลขใหม่
        // (ฟังก์ชัน renderBoard และ renderPalette จะเคลียร์ของเก่าออกเองอยู่แล้ว)
        renderBoard();
        renderPalette();
}
    // --- สิ้นสุดส่วนของโค้ดสำหรับสร้าง Sudoku ---

/*     function startGame() {
        statusElement.textContent = "Generating a new puzzle...";
        statusElement.style.color = 'black';
        boardElement.innerHTML = ''; // เคลียร์บอร์ดระหว่างรอ
        paletteElement.innerHTML = '';

        // ใช้ setTimeout เพื่อให้ browser มีเวลาแสดงข้อความ "Generating..."
        setTimeout(() => {
            // ★ สร้างโจทย์ใหม่ทุกครั้ง
            const [newSolution, newPuzzle] = generateSudoku(0.65); // ปรับค่านี้เพื่อเปลี่ยนความยาก (0.5=กลาง, 0.7=ยาก)

            solution = newSolution;
            puzzle = newPuzzle;
            boardState = [...puzzle]; // Copy puzzle to board state

            selectedNumber = null;
            selectedCell = null;
            statusElement.textContent = "Select a number and fill the board.";

            renderBoard();
            renderPalette();
        }, 50); // หน่วงเวลาเล็กน้อย
    } */
    window.resetSudokuGame = startGame;

    function renderBoard() {
        boardElement.innerHTML = '';
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.classList.add('sudoku-cell');
            cell.dataset.index = i;

            // เพิ่ม class สำหรับเส้นหนา
            const row = Math.floor(i / 9);
            const col = i % 9;
            if ((col + 1) % 3 === 0 && col < 8) {
                cell.style.borderRight = "3px solid #333";
            }
            if ((row + 1) % 3 === 0 && row < 8) {
                cell.style.borderBottom = "3px solid #333";
            }


            if (boardState[i] !== 0) {
                cell.textContent = boardState[i];
                if (puzzle[i] !== 0) { // เปรียบเทียบกับโจทย์ตั้งต้น
                    cell.classList.add('given');
                } else {
                    cell.classList.add('user-filled');
                }
            }

            if (puzzle[i] === 0) { // ถ้าเป็นช่องว่างในโจทย์เท่านั้นถึงจะคลิกได้
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
        // เพิ่มปุ่มยางลบ
        const eraserElement = document.createElement('div');
        eraserElement.classList.add('sudoku-palette-number');
        eraserElement.innerHTML = '🢀'; // Eraser icon
        eraserElement.title = "Erase";
        eraserElement.dataset.number = 0; // 0 หมายถึงการลบ
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
            // ถ้าเลือกเลขเดิมซ้ำอีกครั้ง ให้ลบเลขนั้นออก (เหมือนยางลบเฉพาะเลขนั้น)
            if (boardState[index] === selectedNumber) {
                boardState[index] = 0;
            } else {
                boardState[index] = selectedNumber;
            }
            // re-render แค่ cell ที่เปลี่ยน ไม่ต้อง render ทั้งบอร์ด
            updateCell(index);
        }

        // Highlight selected cell
        if (selectedCell) selectedCell.classList.remove('selected');
        document.querySelectorAll('.sudoku-cell').forEach(c => c.classList.remove('selected'));
        selectedCell = cell;
        cell.classList.add('selected');
    }

    // ฟังก์ชันเล็กๆ เพื่ออัปเดตแค่ cell เดียว แทนการ renderBoard ทั้งหมด
    function updateCell(index) {
        const cell = boardElement.querySelector(`[data-index='${index}']`);
        if (boardState[index] === 0) {
            cell.textContent = '';
            cell.classList.remove('user-filled');
        } else {
            cell.textContent = boardState[index];
            cell.classList.add('user-filled');
        }
        // ลบ error class ออกก่อนเมื่อมีการแก้ไข
        cell.classList.remove('error');
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
            statusElement.style.color = 'red';
        } else if (filledCount < 81) {
            statusElement.textContent = "Board not full, but no errors so far!";
            statusElement.style.color = '#007bff';
        } else {
            statusElement.textContent = "Congratulations! You solved it!";
            statusElement.style.color = 'green';
            // Disable board after solving
            document.querySelectorAll('.sudoku-cell').forEach(c => c.removeEventListener('click', handleCellClick));
        }
    }

    checkButton.addEventListener('click', checkSolution);
    resetButton.addEventListener('click', startGame);

    // เริ่มเกมครั้งแรกเมื่อโหลดเสร็จ
    // startGame(); // ถูกเรียกจาก navigation script แทน
});
