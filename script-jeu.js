// --- CONFIGURATION ---
const candies = ['❤️', '💎', '⭐', '🌸', '🍬'];
const width = 8;
let grid = [];
let score = 0;
let level = 1;
let moves = 25;
let targetScore = 500;
let playerName = "";

// Variables pour le Drag & Swipe
let colorBeingDragged, colorBeingReplaced, squareIdBeingDragged, squareIdBeingReplaced;
let startX, startY, endX, endY;

const gridDisplay = document.querySelector('.grid');
const scoreDisplay = document.getElementById('score');
const movesDisplay = document.getElementById('moves');
const levelDisplay = document.getElementById('level-num');
const targetDisplay = document.getElementById('target');

// --- CONNEXION ET SAUVEGARDE ---
document.getElementById('start-game-btn').addEventListener('click', () => {
    const input = document.getElementById('player-name').value.trim();
    if (input.toLowerCase() === "louna") {
        playerName = "louna";
        // Charger le niveau spécifique à Louna
        level = parseInt(localStorage.getItem('lounaCrush_level')) || 1;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');
        startLevel();
    } else {
        alert("Accès réservé à Louna ❤️");
    }
});

function startLevel() {
    score = 0;
    scoreDisplay.innerText = score;
    levelDisplay.innerText = level;
    
    // Difficulté croissante : +200 points par niveau, coups limités
    targetScore = 500 + (level * 200);
    moves = Math.max(8, 25 - Math.floor(level / 8));
    
    targetDisplay.innerText = targetScore;
    movesDisplay.innerText = moves;
    
    createBoard();
}

function createBoard() {
    gridDisplay.innerHTML = '';
    grid = [];
    for (let i = 0; i < width * width; i++) {
        const square = document.createElement('div');
        square.setAttribute('draggable', true);
        square.setAttribute('id', i);
        let randomCandy = candies[Math.floor(Math.random() * candies.length)];
        square.innerText = randomCandy;
        
        // --- ÉVÉNEMENTS DESKTOP (SOURIS) ---
        square.addEventListener('dragstart', dragStart);
        square.addEventListener('dragover', (e) => e.preventDefault());
        square.addEventListener('drop', dragDrop);
        
        // --- ÉVÉNEMENTS MOBILE (TACTILE) ---
        square.addEventListener('touchstart', touchStart, {passive: true});
        square.addEventListener('touchend', touchEnd, {passive: true});
        
        gridDisplay.appendChild(square);
        grid.push(square);
    }
}

// --- LOGIQUE DE MOUVEMENT (DESKTOP) ---
function dragStart() {
    colorBeingDragged = this.innerText;
    squareIdBeingDragged = parseInt(this.id);
}

function dragDrop() {
    squareIdBeingReplaced = parseInt(this.id);
    colorBeingReplaced = this.innerText;
    executeMove();
}

// --- LOGIQUE DE MOUVEMENT (MOBILE) ---
function touchStart(e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    squareIdBeingDragged = parseInt(e.target.id);
    colorBeingDragged = e.target.innerText;
}

function touchEnd(e) {
    endX = e.changedTouches[0].clientX;
    endY = e.changedTouches[0].clientY;
    
    const diffX = endX - startX;
    const diffY = endY - startY;
    let targetId;

    if (Math.abs(diffX) > Math.abs(diffY)) { // Swipe horizontal
        targetId = diffX > 0 ? squareIdBeingDragged + 1 : squareIdBeingDragged - 1;
    } else { // Swipe vertical
        targetId = diffY > 0 ? squareIdBeingDragged + width : squareIdBeingDragged - width;
    }

    if (targetId >= 0 && targetId < width * width) {
        squareIdBeingReplaced = targetId;
        colorBeingReplaced = grid[targetId].innerText;
        executeMove();
    }
}

function executeMove() {
    const validMoves = [
        squareIdBeingDragged - 1, squareIdBeingDragged + 1,
        squareIdBeingDragged - width, squareIdBeingDragged + width
    ];

    if (validMoves.includes(squareIdBeingReplaced)) {
        grid[squareIdBeingReplaced].innerText = colorBeingDragged;
        grid[squareIdBeingDragged].innerText = colorBeingReplaced;
        
        moves--;
        movesDisplay.innerText = moves;
        
        // Laisser un petit délai pour que checkMatches s'occupe de la suite
        setTimeout(checkGameStatus, 500);
    }
}

// --- LOGIQUE MATCHES & CHUTE ---
function checkMatches() {
    // Horizontal
    for (let i = 0; i < 62; i++) {
        let row = [i, i + 1, i + 2];
        let decidedColor = grid[i].innerText;
        if (i % 8 > 5) continue; 
        if (decidedColor !== '' && row.every(index => grid[index].innerText === decidedColor)) {
            score += 30;
            scoreDisplay.innerText = score;
            row.forEach(index => grid[index].innerText = '');
        }
    }
    // Vertical
    for (let i = 0; i < 47; i++) {
        let col = [i, i + width, i + width * 2];
        let decidedColor = grid[i].innerText;
        if (decidedColor !== '' && col.every(index => grid[index].innerText === decidedColor)) {
            score += 30;
            scoreDisplay.innerText = score;
            col.forEach(index => grid[index].innerText = '');
        }
    }
    moveDown();
}

function moveDown() {
    // Faire descendre les bonbons existants
    for (let i = 0; i < 56; i++) {
        if (grid[i + width].innerText === '') {
            grid[i + width].innerText = grid[i].innerText;
            grid[i].innerText = '';
        }
    }
    // Remplir la ligne du haut
    for (let i = 0; i < 8; i++) {
        if (grid[i].innerText === '') {
            grid[i].innerText = candies[Math.floor(Math.random() * candies.length)];
        }
    }
}

function checkGameStatus() {
    if (score >= targetScore) {
        showModal(true);
    } else if (moves <= 0) {
        showModal(false);
    }
}

function showModal(win) {
    const overlay = document.getElementById('overlay');
    const title = document.getElementById('modal-title');
    const msg = document.getElementById('modal-msg');
    overlay.classList.remove('hidden');

    if (win) {
        if (level >= 100) {
            title.innerText = "INCROYABLE !";
            msg.innerText = "Tu as fini les 100 niveaux. Je t'aime à l'infini Louna. ❤️";
        } else {
            title.innerText = "Niveau Réussi !";
            msg.innerText = `Bravo Louna, prête pour le niveau ${level + 1} ?`;
            level++;
            localStorage.setItem('lounaCrush_level', level);
        }
    } else {
        title.innerText = "Oups !";
        msg.innerText = "Plus de coups... Réessaie pour ton amoureux !";
    }
}

// --- BOUTONS ---
document.getElementById('next-btn').addEventListener('click', () => {
    document.getElementById('overlay').classList.add('hidden');
    startLevel();
});

document.getElementById('reset-btn').addEventListener('click', startLevel);

document.getElementById('hard-reset-btn').addEventListener('click', () => {
    if (confirm("Louna, veux-tu vraiment recommencer l'aventure au niveau 1 ?")) {
        level = 1;
        localStorage.setItem('lounaCrush_level', level);
        startLevel();
    }
});

// --- BOUCLE DE JEU (Chute et Matches permanents) ---
window.setInterval(function() {
    checkMatches();
}, 100);