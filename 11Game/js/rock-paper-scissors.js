document.addEventListener('DOMContentLoaded', () => {
    const scoreElement = document.getElementById('rps-score');
    const statusElement = document.getElementById('rps-status');
    const playerChoiceElement = document.getElementById('rps-player-choice');
    const computerChoiceElement = document.getElementById('rps-computer-choice');
    const choiceButtons = document.querySelectorAll('.rps-choice-btn');
    const resetButton = document.getElementById('rps-reset-button');

    const choices = ['rock', 'paper', 'scissors'];
    const emojis = { 'rock': '✊', 'paper': '✋', 'scissors': '✌️' };
    const rules = {
        'rock': 'scissors',
        'paper': 'rock',
        'scissors': 'paper'
    };

    let score = { player: 0, computer: 0 };
    let playerHistory = [];

    function startGame() {
        score = { player: 0, computer: 0 };
        playerHistory = [];
        updateScore();
        statusElement.textContent = "Choose your weapon!";
        statusElement.style.color = 'var(--text-color)';
        playerChoiceElement.textContent = '🤔';
        computerChoiceElement.textContent = '🤖';
    }
    window.resetRpsGame = startGame;

    function playRound(playerChoice) {
        playerHistory.push(playerChoice);
        const computerChoice = getComputerChoice();

        playerChoiceElement.textContent = emojis[playerChoice];
        computerChoiceElement.textContent = emojis[computerChoice];

        if (playerChoice === computerChoice) {
            statusElement.textContent = "It's a Draw!";
            statusElement.style.color = 'grey';
        } else if (rules[playerChoice] === computerChoice) {
            score.player++;
            statusElement.textContent = "You Win!";
            statusElement.style.color = 'green';
        } else {
            score.computer++;
            statusElement.textContent = "You Lose!";
            statusElement.style.color = 'var(--player1-color)';
        }
        updateScore();
    }

    function getComputerChoice() {
        // Smart AI: Tries to predict player's next move based on patterns.
        if (playerHistory.length < 4) {
            return choices[Math.floor(Math.random() * choices.length)];
        }

        const lastMove = playerHistory[playerHistory.length - 2];
        const nextMoveCounts = { rock: 0, paper: 0, scissors: 0 };

        for (let i = 0; i < playerHistory.length - 1; i++) {
            if (playerHistory[i] === lastMove) {
                const nextMove = playerHistory[i + 1];
                nextMoveCounts[nextMove]++;
            }
        }

        let predictedPlayerMove = null;
        let maxCount = -1;
        for (const move in nextMoveCounts) {
            if (nextMoveCounts[move] > maxCount) {
                maxCount = nextMoveCounts[move];
                predictedPlayerMove = move;
            }
        }

        // If a pattern is found, play the counter move. Otherwise, play random.
        if (predictedPlayerMove && maxCount > 0) {
            const winningMove = Object.keys(rules).find(key => rules[key] === predictedPlayerMove);
            return winningMove;
        } else {
            return choices[Math.floor(Math.random() * choices.length)];
        }
    }

    function updateScore() {
        scoreElement.textContent = `Player: ${score.player} - Computer: ${score.computer}`;
    }

    choiceButtons.forEach(button => {
        button.addEventListener('click', () => playRound(button.dataset.choice));
    });

    resetButton.addEventListener('click', startGame);
});