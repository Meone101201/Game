document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('nim-game');
    const statusElement = document.getElementById('nim-status');
    const pilesContainer = document.getElementById('nim-piles-container');
    const takeAmountInput = document.getElementById('nim-take-input');
    const takeButton = document.getElementById('nim-take-button');
    const resetButton = document.getElementById('nim-reset-button');

    let piles = [];
    let selectedPileIndex = -1;
    let gameOver = false;
    let isPlayerTurn = true;
    let difficultyLevel = 'easy';

    if (!gameContainer.querySelector('.difficulty-selector')) {
        const difficultySelector = document.createElement('div');
        difficultySelector.className = 'difficulty-selector';
        difficultySelector.innerHTML = `
            <label for="nim-difficulty">AI Difficulty: </label>
            <select id="nim-difficulty">
                <option value="easy" selected>Easy</option>
                <option value="hard">Hard</option>
            </select>
        `;
        gameContainer.insertBefore(difficultySelector, statusElement);
        document.getElementById('nim-difficulty').addEventListener('change', (e) => {
            difficultyLevel = e.target.value;
            startGame();
        });
    }

    function startGame() {
        piles = [3, 5, 7];
        selectedPileIndex = -1;
        gameOver = false;
        isPlayerTurn = true;
        takeAmountInput.value = 1;
        renderPiles();
        updateStatus();
    }
    window.resetNimGame = startGame;

    function renderPiles() {
        pilesContainer.innerHTML = '';
        piles.forEach((itemCount, index) => {
            const pileElement = document.createElement('div');
            pileElement.classList.add('nim-pile');
            pileElement.dataset.pileIndex = index;
            if (index === selectedPileIndex) {
                pileElement.classList.add('selected');
            }
            if (itemCount === 0) {
                pileElement.style.cursor = 'not-allowed';
            }

            for (let i = 0; i < itemCount; i++) {
                const itemElement = document.createElement('div');
                itemElement.classList.add('nim-item');
                pileElement.appendChild(itemElement);
            }
            pileElement.addEventListener('click', handlePileClick);
            pilesContainer.appendChild(pileElement);
        });
    }

    function handlePileClick(event) {
        if (gameOver || !isPlayerTurn) return;
        const clickedIndex = parseInt(event.currentTarget.dataset.pileIndex);
        if (piles[clickedIndex] > 0) {
            selectedPileIndex = clickedIndex;
            renderPiles();
            updateStatus();
        }
    }

    function handleTakeTurn() {
        if (gameOver || selectedPileIndex === -1 || !isPlayerTurn) return;

        const amountToTake = parseInt(takeAmountInput.value);
        if (isNaN(amountToTake) || amountToTake <= 0 || amountToTake > piles[selectedPileIndex]) {
            alert("Invalid number of items to take.");
            return;
        }

        makeMove(selectedPileIndex, amountToTake, 'Player');

        if (!gameOver) {
            setTimeout(makeAIMove, 800);
        }
    }

    function makeMove(pileIndex, amount, player) {
        piles[pileIndex] -= amount;

        const totalItemsLeft = piles.reduce((sum, current) => sum + current, 0);
        if (totalItemsLeft === 0) {
            gameOver = true;
            statusElement.textContent = `${player} takes the last item and loses! ${player === 'Player' ? 'AI' : 'Player'} Wins!`;
            statusElement.style.color = player === 'Player' ? 'var(--player2-color)' : 'var(--player1-color)';
        } else {
            isPlayerTurn = !isPlayerTurn;
            selectedPileIndex = -1;
            updateStatus();
        }
        renderPiles();
    }

    function makeAIMove() {
        if (gameOver) return;
        const move = difficultyLevel === 'hard' ? getOptimalMove() : getRandomMove();
        if (move) {
            makeMove(move.pileIndex, move.amount, 'AI');
        }
    }

    function getRandomMove() {
        const availablePiles = piles.map((count, index) => ({ index, count }))
            .filter(pile => pile.count > 0);
        if (availablePiles.length === 0) return null;

        const randomPile = availablePiles[Math.floor(Math.random() * availablePiles.length)];
        const amount = Math.floor(Math.random() * randomPile.count) + 1;
        return { pileIndex: randomPile.index, amount: amount };
    }

    function getOptimalMove() {
        const nimSum = piles.reduce((xor, pile) => xor ^ pile, 0);
        if (nimSum === 0) return getRandomMove();

        for (let i = 0; i < piles.length; i++) {
            const pileSize = piles[i];
            const targetSize = pileSize ^ nimSum;
            if (targetSize < pileSize) {
                return { pileIndex: i, amount: pileSize - targetSize };
            }
        }
        return getRandomMove(); // Fallback
    }

    function updateStatus() {
        if (gameOver) return;
        let statusText = isPlayerTurn ? "Your Turn. " : "AI is thinking...";
        if (isPlayerTurn) {
            if (selectedPileIndex !== -1) {
                statusText += `Selected pile with ${piles[selectedPileIndex]} items.`;
            } else {
                statusText += "Select a pile.";
            }
        }
        statusElement.textContent = statusText;
        statusElement.style.color = isPlayerTurn ? 'var(--player1-color)' : 'var(--player2-color)';
    }

    takeButton.addEventListener('click', handleTakeTurn);
    resetButton.addEventListener('click', startGame);

    document.getElementById('nim-increase').addEventListener('click', () => {
        const input = document.getElementById('nim-take-input');
        input.value = parseInt(input.value) + 1;
    });

    document.getElementById('nim-decrease').addEventListener('click', () => {
        const input = document.getElementById('nim-take-input');
        if (parseInt(input.value) > 1) {
            input.value = parseInt(input.value) - 1;
        }
    });
});