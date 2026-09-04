const cells = document.querySelectorAll(".cell");

const boardElement = document.getElementById("board");

const turnText = document.getElementById("turnText");
const moveCount = document.getElementById("moveCount");

const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");

const streakX = document.getElementById("streakX");
const streakO = document.getElementById("streakO");

const playerX = document.getElementById("playerX");
const playerO = document.getElementById("playerO");

const restartButton = document.getElementById("restartButton");
const resetButton = document.getElementById("resetButton");

const winnerModal = document.getElementById("winnerModal");
const winnerTitle = document.getElementById("winnerTitle");
const winnerDescription = document.getElementById("winnerDescription");

const modalWinner = document.getElementById("modalWinner");
const modalMoves = document.getElementById("modalMoves");

const playAgain = document.getElementById("playAgain");

const winningLine = document.getElementById("winningLine");

const themeButton = document.getElementById("themeButton");
const soundButton = document.getElementById("soundButton");

const toast = document.getElementById("toast");


let board = ["", "", "", "", "", "", "", "", ""];

let currentPlayer = "X";

let gameActive = true;

let moves = 0;

let soundEnabled = true;

let scores = JSON.parse(
    localStorage.getItem("nexusScores")
) || {
    X: 0,
    O: 0
};

let streaks = {
    X: 0,
    O: 0
};


const winningPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 6],
    [2, 4, 6]
];


const audioContext =
    new (window.AudioContext ||
        window.webkitAudioContext)();


function playSound(
    frequency = 500,
    duration = 0.08,
    type = "sine"
) {

    if (!soundEnabled) return;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type = type;

    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(
        0.05,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
    );

    oscillator.connect(gain);

    gain.connect(audioContext.destination);

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + duration
    );
}


cells.forEach(cell => {

    cell.addEventListener(
        "click",
        () => {

            const index =
                Number(cell.dataset.index);

            makeMove(index);
        }
    );

});


function makeMove(index) {

    if (!gameActive || board[index] !== "") {
        return;
    }

    board[index] = currentPlayer;

    const cell = cells[index];

    cell.textContent = currentPlayer;

    cell.classList.add(
        "filled",
        currentPlayer.toLowerCase()
    );

    moves++;

    updateMoveCount();

    playSound(
        currentPlayer === "X" ? 650 : 420,
        0.1
    );

    checkGame();
}


function checkGame() {

    for (const pattern of winningPatterns) {

        const [a, b, c] = pattern;

        if (
            board[a] &&
            board[a] === board[b] &&
            board[b] === board[c]
        ) {

            handleWin(pattern);

            return;
        }
    }

    if (!board.includes("")) {

        handleDraw();

        return;
    }

    switchPlayer();
}


function handleWin(pattern) {

    gameActive = false;

    pattern.forEach(index => {

        cells[index].classList.add("win");

    });

    drawWinningLine(pattern);

    scores[currentPlayer]++;

    streaks[currentPlayer]++;

    const opponent =
        currentPlayer === "X" ? "O" : "X";

    streaks[opponent] = 0;

    saveScores();

    updateScores();

    playVictorySound();

    createConfetti();

    setTimeout(() => {

        showWinner();

    }, 650);
}


function handleDraw() {

    gameActive = false;

    playSound(280, 0.15);

    setTimeout(() => {

        winnerTitle.textContent =
            "DRAW GAME";

        winnerDescription.textContent =
            "Nobody conquered the board.";

        modalWinner.textContent =
            "DRAW";

        modalMoves.textContent =
            moves;

        winnerModal.classList.add("show");

    }, 350);
}


function switchPlayer() {

    currentPlayer =
        currentPlayer === "X"
            ? "O"
            : "X";

    turnText.textContent =
        `PLAYER ${currentPlayer}`;

    if (currentPlayer === "X") {

        playerX.classList.add("active");

        playerO.classList.remove("active");

    } else {

        playerO.classList.add("active");

        playerX.classList.remove("active");
    }

    updateTurnColor();
}


function updateTurnColor() {

    const dot =
        document.querySelector(".turn-dot");

    if (currentPlayer === "X") {

        dot.style.background =
            "var(--x)";

        dot.style.boxShadow =
            "0 0 15px var(--x)";

    } else {

        dot.style.background =
            "var(--o)";

        dot.style.boxShadow =
            "0 0 15px var(--o)";
    }
}


function updateMoveCount() {

    moveCount.textContent =
        `${moves} / 9`;
}


function updateScores() {

    scoreX.textContent =
        scores.X;

    scoreO.textContent =
        scores.O;

    streakX.textContent =
        streaks.X;

    streakO.textContent =
        streaks.O;
}


function saveScores() {

    localStorage.setItem(
        "nexusScores",
        JSON.stringify(scores)
    );
}


function showWinner() {

    winnerTitle.textContent =
        `PLAYER ${currentPlayer}`;

    winnerDescription.textContent =
        "Dominated the board.";

    modalWinner.textContent =
        currentPlayer;

    modalMoves.textContent =
        moves;

    winnerModal.classList.add("show");
}


function drawWinningLine(pattern) {

    const first =
        cells[pattern[0]];

    const last =
        cells[pattern[2]];

    const boardRect =
        boardElement.getBoundingClientRect();

    const firstRect =
        first.getBoundingClientRect();

    const lastRect =
        last.getBoundingClientRect();

    const x1 =
        firstRect.left +
        firstRect.width / 2 -
        boardRect.left;

    const y1 =
        firstRect.top +
        firstRect.height / 2 -
        boardRect.top;

    const x2 =
        lastRect.left +
        lastRect.width / 2 -
        boardRect.left;

    const y2 =
        lastRect.top +
        lastRect.height / 2 -
        boardRect.top;

    const distance =
        Math.sqrt(
            Math.pow(x2 - x1, 2) +
            Math.pow(y2 - y1, 2)
        );

    const angle =
        Math.atan2(
            y2 - y1,
            x2 - x1
        ) * 180 / Math.PI;

    winningLine.style.width =
        `${distance}px`;

    winningLine.style.left =
        `${x1}px`;

    winningLine.style.top =
        `${y1}px`;

    winningLine.style.transform =
        `rotate(${angle}deg)`;

    winningLine.classList.add("show");
}


function clearWinningLine() {

    winningLine.classList.remove("show");

    winningLine.style.width = "0";
}


function restartGame() {

    board = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
    ];

    currentPlayer = "X";

    gameActive = true;

    moves = 0;

    turnText.textContent =
        "PLAYER X";

    updateMoveCount();

    playerX.classList.add("active");

    playerO.classList.remove("active");

    updateTurnColor();

    clearWinningLine();

    cells.forEach(cell => {

        cell.textContent = "";

        cell.classList.remove(
            "filled",
            "x",
            "o",
            "win"
        );

    });

    winnerModal.classList.remove("show");
}


function resetScore() {

    scores = {
        X: 0,
        O: 0
    };

    streaks = {
        X: 0,
        O: 0
    };

    saveScores();

    updateScores();

    restartGame();

    showToast();

    playSound(300, 0.1);
}


function showToast() {

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2200);
}


restartButton.addEventListener(
    "click",
    restartGame
);


resetButton.addEventListener(
    "click",
    resetScore
);


playAgain.addEventListener(
    "click",
    restartGame
);


themeButton.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light"
        );

        const light =
            document.body.classList.contains(
                "light"
            );

        localStorage.setItem(
            "nexusTheme",
            light ? "light" : "dark"
        );

        playSound(550, 0.06);
    }
);


soundButton.addEventListener(
    "click",
    () => {

        soundEnabled =
            !soundEnabled;

        soundButton.textContent =
            soundEnabled ? "🔊" : "🔇";

        if (soundEnabled) {
            playSound(600, 0.08);
        }
    }
);


function loadTheme() {

    const theme =
        localStorage.getItem(
            "nexusTheme"
        );

    if (theme === "light") {

        document.body.classList.add(
            "light"
        );
    }
}


function playVictorySound() {

    if (!soundEnabled) return;

    playSound(600, 0.1);

    setTimeout(() => {
        playSound(800, 0.1);
    }, 100);

    setTimeout(() => {
        playSound(1000, 0.18);
    }, 200);
}


function createConfetti() {

    const pieces = 90;

    for (let i = 0; i < pieces; i++) {

        const confetti =
            document.createElement("div");

        confetti.style.position =
            "fixed";

        confetti.style.left =
            Math.random() * 100 + "vw";

        confetti.style.top =
            "-20px";

        confetti.style.width =
            Math.random() * 7 + 4 + "px";

        confetti.style.height =
            Math.random() * 12 + 6 + "px";

        confetti.style.background =
            Math.random() > 0.5
                ? "var(--x)"
                : "var(--o)";

        confetti.style.borderRadius =
            "2px";

        confetti.style.zIndex =
            "1000";

        confetti.style.pointerEvents =
            "none";

        document.body.appendChild(
            confetti
        );

        const duration =
            Math.random() * 2 + 2;

        confetti.animate(
            [
                {
                    transform:
                        `translateY(0) rotate(0deg)`
                },
                {
                    transform:
                        `translateY(110vh) rotate(${Math.random() * 900}deg)`
                }
            ],
            {
                duration:
                    duration * 1000,
                easing:
                    "cubic-bezier(.2,.8,.3,1)"
            }
        );

        setTimeout(() => {

            confetti.remove();

        }, duration * 1000);
    }
}


loadTheme();

updateScores();

updateTurnColor();
