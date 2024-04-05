const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('.start'),
    pause: document.querySelector('.pause'),
    quit: document.querySelector('.quit'),
    win: document.querySelector('.win'),
    points: document.querySelector('.points')
}

const state = {
    gameStarted: false,
    gamePaused: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    points: 0,
    loop: null
}

const shuffle = array => {
    const clonedArray = [...array]
    for (let i = clonedArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1))
        const original = clonedArray[i]
        clonedArray[i] = clonedArray[randomIndex]
        clonedArray[randomIndex] = original
    }
    return clonedArray
}

const pickRandom = (array, items) => {
    const clonedArray = [...array]
    const randomPicks = []
    for (let i = 0; i < items; i++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length)
        randomPicks.push(clonedArray[randomIndex])
        clonedArray.splice(randomIndex, 1)
    }
    return randomPicks
}

const generateGame = () => {
    const dimensions = selectors.board.getAttribute('data-dimension')
    if (dimensions % 2 !== 0) {
        throw new Error("The dimension of the board must be an even number.")
    }

    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯']
    const picks = pickRandom(emojis, (dimensions * dimensions) / 2)
    const items = shuffle([...picks, ...picks])
    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map((item, index) => `
                <div class="card" data-index="${index}">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                </div>
            `).join('')}
       </div>
    `

    const parser = new DOMParser().parseFromString(cards, 'text/html')
    selectors.board.replaceWith(parser.querySelector('.board'))
}

const startGame = () => {
    state.gameStarted = true;
    selectors.start.classList.add('disabled');
    let timeLeft = 100;

    const backgroundMusic = document.getElementById('background-music');
    if (backgroundMusic && backgroundMusic.paused) {
        backgroundMusic.play();
    }

    state.loop = setInterval(() => {
        state.totalTime++;
        selectors.moves.innerText = `${state.totalFlips} moves`;
        selectors.timer.innerText = `Time: ${state.totalTime} sec`;

        timeLeft--;
        const timeBar = document.querySelector('.time-bar');
        timeBar.style.width = `${timeLeft}%`;

        if (state.totalTime > 100) {
            timeBar.classList.add('alert');
            selectors.boardContainer.classList.add('flipped');
            selectors.win.innerHTML = `
                <span class="game-over">Game Over!</span><br />
                <span class="win-text">
                    You took too long!<br />
                    with <span class="highlight">${state.totalFlips}</span> moves<br />
                    Total Points: <span class="highlight">${state.points}</span>
                </span>
            `;
            const backgroundMusic = document.getElementById('background-music');
            if (backgroundMusic && !backgroundMusic.paused) {
            backgroundMusic.pause();
        }
            clearInterval(state.loop);
        }
    }, 1000);
}

const pauseGame = () => {
    state.gamePaused = !state.gamePaused;
    if (state.gamePaused) {
        clearInterval(state.loop);
        selectors.pause.innerText = 'Resume';
        const backgroundMusic = document.getElementById('background-music');
        if (backgroundMusic && !backgroundMusic.paused) {
            backgroundMusic.pause();
        }
        const pauseSound = document.getElementById('pause-sound');
        if (pauseSound) {
            pauseSound.play();
        }
        
    } else {
        startGame();
        selectors.pause.innerText = 'Pause';
        const backgroundMusic = document.getElementById('background-music');
        if (backgroundMusic && !backgroundMusic.paused) {
            backgroundMusic.play();
        }
        const pauseSound = document.getElementById('pause-sound');
        if (pauseSound) {
            pauseSound.play();
        }
        
        
    }
}

const quitGame = () => {
    clearInterval(state.loop);
    selectors.boardContainer.classList.add('flipped');
    selectors.win.innerHTML = `
        <span class="game-over">Game Over!</span><br />
        <span class="win-text">
            You quit the game!<br />
            with <span class="highlight">${state.totalFlips}</span> moves<br />
            Total Points: <span class="highlight">${state.points}</span>
        </span>
        
    `;
    const backgroundMusic = document.getElementById('background-music');
        if (backgroundMusic && !backgroundMusic.paused) {
            backgroundMusic.pause();
        }
        const failedSound = document.getElementById('failed-sound');
            if (failedSound) {failedSound.play();
            }
}

const flipCard = card => {
    state.flippedCards++;
    state.totalFlips++;

    if (!state.gameStarted) {
        startGame();
    }
    const flipSound = document.getElementById('flip-sound');
    if (flipSound) {
        flipSound.play();
    }

    if (state.flippedCards <= 2) {
        card.classList.add('flipped');
    }

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)');
        const emoji1 = flippedCards[0].querySelector('.card-back').textContent.trim();
        const emoji2 = flippedCards[1].querySelector('.card-back').textContent.trim();

        if (emoji1 === emoji2) {
            flippedCards.forEach(card => {
                card.classList.add('matched');
            });
            state.points++;
            selectors.points.innerText = `Points: ${state.points}`;
            const rightSound = document.getElementById('right-sound');
            if (rightSound) {
           rightSound.play();
       }
        }

        setTimeout(() => {
            flipBackCards();
        }, 1000);
    }

    const matchedCards = document.querySelectorAll('.matched');
    if (matchedCards.length === document.querySelectorAll('.card').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped');
            selectors.win.innerHTML = `
                <span class="win-text">
                    You won!<br />
                    with <span class="highlight">${state.totalFlips}</span> moves<br />
                    under <span class="highlight">${state.totalTime}</span> seconds<br />
                    Total Points: <span class="highlight">${state.points}</span>
                </span>
            `;
            clearInterval(state.loop);
            const winSound = document.getElementById('win-sound');
            if (winSound) {winSound.play();
            }
        }, 1000);
    }

    if (state.totalTime > 100) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped');
            selectors.win.innerHTML = `
                <span class="game-over">Game Over!</span><br />
                <span class="win-text">
                    You took too long!<br />
                    with <span class="highlight">${state.totalFlips}</span> moves<br />
                    Total Points: <span class="highlight">${state.points}</span>
                </span>
            `;
            clearInterval(state.loop);
        }, 1000);
    }
}

const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped')
    });
    state.flippedCards = 0;
}

const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const card = event.target.closest('.card');
        const startButton = event.target.closest('.start');
        const restartButton = event.target.closest('.restart');
        const pauseButton = event.target.closest('.pause');
        const quitButton = event.target.closest('.quit');

        if (card && !card.classList.contains('flipped')) {
            flipCard(card);
        }

        if (startButton && !startButton.classList.contains('disabled')) {
            startGame();
        }

        if (pauseButton) {
            pauseGame();
        }

        if (quitButton) {
            quitGame();
        }
    });
}

generateGame()
attachEventListeners()
 