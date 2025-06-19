document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('memory-board');
    const statusElement = document.getElementById('memory-status');
    const resetButton = document.getElementById('memory-reset-button');

    const cardEmojis = [
        '📦', '🎉', '🎈', '🎁', '🎃', '🎄', '🎊', '✨',
        '🍎', '🍕', '🚗', '🐶', '🌟', '⚽', '🎸', '🦄'
    ]; // 16 pairs = 32 cards

    let cards = [];
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let moves = 0;
    let matchedPairs = 0;

    function startGame() {
        moves = 0;
        matchedPairs = 0;
        hasFlippedCard = false;
        lockBoard = false;
        firstCard = null;
        secondCard = null;
        updateStatus();

        let fullDeck = [...cardEmojis, ...cardEmojis];

        // Shuffle cards
        for (let i = fullDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [fullDeck[i], fullDeck[j]] = [fullDeck[j], fullDeck[i]];
        }

        boardElement.innerHTML = '';
        cards = [];

        fullDeck.forEach(emoji => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memory-card');
            cardElement.dataset.emoji = emoji;

            cardElement.innerHTML = `
                <div class="memory-card-front">?</div>
                <div class="memory-card-back">${emoji}</div>
            `;

            cardElement.addEventListener('click', flipCard);
            boardElement.appendChild(cardElement);
            cards.push(cardElement);
        });
    }
    window.resetMemoryGame = startGame;

    function flipCard() {
        if (lockBoard || this.classList.contains('flipped')) return;
        if (this === firstCard) return;

        this.classList.add('flipped');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        secondCard = this;
        lockBoard = true;
        checkForMatch();
    }

    function checkForMatch() {
        moves++;
        updateStatus();
        let isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');

        matchedPairs++;
        if (matchedPairs === cardEmojis.length) {
            setTimeout(() => {
                statusElement.textContent = `You won in ${moves} moves!`;
                statusElement.style.color = 'green';
            }, 500);
        }

        resetBoard();
    }

    function unflipCards() {
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetBoard();
        }, 1000);
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    function updateStatus() {
        statusElement.textContent = `Moves: ${moves}`;
        statusElement.style.color = 'var(--text-color)';
    }

    resetButton.addEventListener('click', startGame);
});