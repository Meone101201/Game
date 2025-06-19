document.addEventListener('DOMContentLoaded', () => {
    const statusElement = document.getElementById('simon-status');
    const startButton = document.getElementById('simon-start-button');
    const simonButtons = document.querySelectorAll('.simon-button');

    const buttons = [
        document.querySelector('.simon-button.green'),
        document.querySelector('.simon-button.red'),
        document.querySelector('.simon-button.yellow'),
        document.querySelector('.simon-button.blue')
    ];

    let sequence = [];
    let playerSequence = [];
    let level = 0;
    let isPlayerTurn = false;
    let gameInProgress = false;

    function startGame() {
        level = 0;
        sequence = [];
        playerSequence = [];
        isPlayerTurn = false;
        gameInProgress = true;
        startButton.disabled = true;
        statusElement.textContent = "Get Ready...";
        setTimeout(nextRound, 1000);
    }
    window.resetSimonGame = function() {
        level = 0;
        sequence = [];
        playerSequence = [];
        isPlayerTurn = false;
        gameInProgress = false;
        startButton.disabled = false;
        statusElement.textContent = "Press Start to Play";
        statusElement.style.color = 'var(--text-color)';
    };

    function nextRound() {
        isPlayerTurn = false;
        playerSequence = [];
        level++;
        statusElement.textContent = `Level: ${level}`;

        const nextColorIndex = Math.floor(Math.random() * 4);
        sequence.push(nextColorIndex);

        setTimeout(() => playSequence(), 1000);
    }

    function playSequence() {
        if (!gameInProgress) return;
        let i = 0;
        const intervalId = setInterval(() => {
            if (i >= sequence.length) {
                clearInterval(intervalId);
                isPlayerTurn = true;
                statusElement.textContent = `Level: ${level} - Your Turn!`;
                return;
            }
            lightUpButton(sequence[i]);
            i++;
        }, 800);
    }

    function lightUpButton(index) {
        if (!buttons[index]) return;
        buttons[index].classList.add('lit');
        setTimeout(() => {
            buttons[index].classList.remove('lit');
        }, 400);
    }

    function handlePlayerClick(event) {
        if (!isPlayerTurn || !gameInProgress) return;

        const clickedColorIndex = parseInt(event.currentTarget.dataset.color);
        lightUpButton(clickedColorIndex);
        playerSequence.push(clickedColorIndex);

        const lastPlayerIndex = playerSequence.length - 1;
        if (playerSequence[lastPlayerIndex] !== sequence[lastPlayerIndex]) {
            endGame();
            return;
        }

        if (playerSequence.length === sequence.length) {
            statusElement.textContent = 'Correct! Get ready...';
            isPlayerTurn = false;
            setTimeout(nextRound, 1500);
        }
    }

    function endGame() {
        gameInProgress = false;
        isPlayerTurn = false;
        statusElement.textContent = `Game Over! You reached Level ${level}. Press Start to try again.`;
        statusElement.style.color = 'var(--player1-color)';
        startButton.disabled = false;
    }

    startButton.addEventListener('click', startGame);

    simonButtons.forEach(button => {
        button.addEventListener('click', handlePlayerClick);
    });
});