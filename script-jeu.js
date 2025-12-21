// --- CONFIGURATION ---
const candies = ['❤️', '💎', '⭐', '🌸', '🍬'];
const bonusEmoji = '🎁'; 
const width = 8;
let grid = [];
let score = 0;
let level = 1;
let moves = 25;
let coins = 0;
let targetScore = 500;
let playerName = "";
let isActionProcessing = false; 

// Sélecteurs
const gridDisplay = document.getElementById('grid');
const scoreDisplay = document.getElementById('score');
const movesDisplay = document.getElementById('moves');
const levelDisplay = document.getElementById('level-num');
const targetDisplay = document.getElementById('target');
const coinsDisplay = document.getElementById('coins-display');
const errorMsg = document.getElementById('error-msg');

// --- 1. CONNEXION MANUELLE ---
document.getElementById('start-game-btn').addEventListener('click', () => {
    const inputVal = document.getElementById('player-name-input').value.trim().toLowerCase();
    
    if (inputVal === "louna" || inputVal === "test") {
        playerName = inputVal;
        loadData();
        
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');
        document.getElementById('shop-sidebar').classList.remove('hidden');
        
        startLevel();
    } else {
        errorMsg.style.display = 'block';
        setTimeout(() => { errorMsg.style.display = 'none'; }, 2000);
    }
});

function loadData() {
    const savedLevel = localStorage.getItem('louna_save_level_' + playerName);
    const savedCoins = localStorage.getItem('louna_save_coins_' + playerName);
    level = savedLevel ? parseInt(savedLevel) : 1;
    coins = savedCoins ? parseInt(savedCoins) : 0;
    updateUI();
}

function saveData() {
    localStorage.setItem('louna_save_level_' + playerName, level);
    localStorage.setItem('louna_save_coins_' + playerName, coins);
}

// --- 2. LE JEU ---
function startLevel() {
    isActionProcessing = false;
    score = 0;
    targetScore = 500 + (level * 250);
    // Difficulté progressive
    moves = Math.max(12, 30 - Math.floor(level / 4));
    
    updateUI();
    createBoard();
}

function updateUI() {
    scoreDisplay.innerText = score;
    levelDisplay.innerText = level;
    targetDisplay.innerText = targetScore;
    movesDisplay.innerText = moves;
    coinsDisplay.innerText = coins;
}

function createBoard() {
    gridDisplay.innerHTML = '';
    grid = [];
    for (let i = 0; i < width * width; i++) {
        const square = document.createElement('div');
        square.setAttribute('id', i);
        square.setAttribute('draggable', true);
        square.innerText = getRandomCandy();
        
        // Events
        square.addEventListener('dragstart', dragStart);
        square.addEventListener('dragover', (e) => e.preventDefault());
        square.addEventListener('drop', dragDrop);
        square.addEventListener('touchstart', touchStart, {passive: false});
        square.addEventListener('touchend', touchEnd, {passive: false});

        gridDisplay.appendChild(square);
        grid.push(square);
    }
}

function getRandomCandy() {
    // 2% de chance d'avoir un bonus, n'augmente PAS avec le niveau
    const isBonus = Math.random() < 0.02; 
    return isBonus ? bonusEmoji : candies[Math.floor(Math.random() * candies.length)];
}

// --- 3. MOUVEMENTS ---
let colorBeingDragged, colorBeingReplaced, squareIdBeingDragged, squareIdBeingReplaced;
let startX, startY;

function dragStart() {
    if(isActionProcessing) return;
    colorBeingDragged = this.innerText;
    squareIdBeingDragged = parseInt(this.id);
}

function dragDrop() {
    if(isActionProcessing) return;
    colorBeingReplaced = this.innerText;
    squareIdBeingReplaced = parseInt(this.id);
    executeMove();
}

function touchStart(e) {
    if(isActionProcessing) return;
    e.preventDefault();
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    squareIdBeingDragged = parseInt(e.target.id);
    colorBeingDragged = e.target.innerText;
}

function touchEnd(e) {
    if(isActionProcessing) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - startX;
    const diffY = endY - startY;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
        squareIdBeingReplaced = diffX > 0 ? squareIdBeingDragged + 1 : squareIdBeingDragged - 1;
    } else {
        squareIdBeingReplaced = diffY > 0 ? squareIdBeingDragged + width : squareIdBeingDragged - width;
    }
    
    if (squareIdBeingReplaced >= 0 && squareIdBeingReplaced < 64) {
        colorBeingReplaced = grid[squareIdBeingReplaced].innerText;
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

        setTimeout(() => {
            let matchFound = checkMatches();
            if (!matchFound) {
                grid[squareIdBeingReplaced].innerText = colorBeingReplaced;
                grid[squareIdBeingDragged].innerText = colorBeingDragged;
            } else {
                moves--;
                updateUI();
                // Si plus de coups après ce mouvement valide mais pas gagnant
                if (moves === 0 && score < targetScore) checkWinCondition();
            }
        }, 100);
    }
}

// --- 4. LOGIQUE MATCH & GRAVITÉ ---
function checkMatches() {
    let matches = new Set();

    // Horizontal
    for (let i = 0; i < 64; i++) {
        if (i % width > width - 3) continue;
        let row = [i, i+1, i+2];
        let color = grid[i].innerText;
        if (color === '') continue;
        
        if (row.every(index => grid[index].innerText === color || (grid[index].innerText === bonusEmoji && color !== ''))) {
            let k = i + 3;
            while(k % width !== 0 && grid[k].innerText === color) { row.push(k); k++; }
            row.forEach(idx => matches.add(idx));
        }
    }

    // Vertical
    for (let i = 0; i < 48; i++) {
        let col = [i, i+width, i+width*2];
        let color = grid[i].innerText;
        if (color === '') continue;

        if (col.every(index => grid[index].innerText === color || (grid[index].innerText === bonusEmoji && color !== ''))) {
             let k = i + width * 3;
             while(k < 64 && grid[k].innerText === color) { col.push(k); k += width; }
            col.forEach(idx => matches.add(idx));
        }
    }

    if (matches.size > 0) {
        processMatches(Array.from(matches));
        return true;
    }
    return false;
}

function processMatches(indices) {
    isActionProcessing = true;
    let bonusCount = 0;

    indices.forEach(index => {
        if (grid[index].innerText === bonusEmoji) bonusCount++;
        grid[index].innerText = ''; // Disparition
    });

    if (bonusCount > 0) {
        moves += (bonusCount * 5); // +5 coups par cadeau
        updateUI();
    }

    // Calcul score
    let points = indices.length * 10;
    if (indices.length > 3) points += (indices.length - 3) * 20;
    score += points;
    updateUI();

    // Délai pour la chute
    setTimeout(() => {
        moveDown();
    }, 250);
}

// --- CORRECTION DU BUG DE DISPARITION ---
function moveDown() {
    // On répète l'opération 4 fois pour s'assurer que tout tombe bien jusqu'en bas
    // C'est une méthode bruteforce mais très efficace pour les petits jeux
    for(let x = 0; x < 4; x++) {
        for (let i = 0; i < 56; i++) {
            if (grid[i + width].innerText === '') {
                grid[i + width].innerText = grid[i].innerText;
                grid[i].innerText = '';
            }
        }
        // Remplissage de la première ligne si vide
        for (let i = 0; i < width; i++) {
            if (grid[i].innerText === '') {
                grid[i].innerText = getRandomCandy();
            }
        }
    }

    // Vérification finale : est-ce qu'il reste des trous ?
    let hasEmpty = false;
    for(let i=0; i<64; i++) {
        if(grid[i].innerText === '') {
            grid[i].innerText = getRandomCandy(); // Remplissage de secours
            hasEmpty = true;
        }
    }

    // Une fois stabilisé, on revérifie les matchs
    setTimeout(() => {
        if (checkMatches()) {
            // Ça re-boucle tant qu'il y a des matchs
        } else {
            isActionProcessing = false;
            checkWinCondition();
        }
    }, 300);
}

// --- 5. FIN DU JEU ---
function checkWinCondition() {
    if (score >= targetScore) {
        coins += 50;
        level++;
        saveData();
        showModal("Niveau Réussi !", `Bravo ${playerName} ! Tu as gagné 50 pièces.`, true);
    } else if (moves <= 0) {
        showModal("Oups !", "Achète des coups au shop ou recommence !", false);
    }
}

function showModal(titleText, msgText, isWin) {
    const overlay = document.getElementById('overlay');
    document.getElementById('modal-title').innerText = titleText;
    document.getElementById('modal-msg').innerText = msgText;
    
    const nextBtn = document.getElementById('next-btn');
    nextBtn.innerText = isWin ? "Niveau Suivant" : "Réessayer";
    nextBtn.onclick = () => {
        overlay.classList.add('hidden');
        startLevel();
    };
    overlay.classList.remove('hidden');
}

// --- BOUTONS RESET & SHOP ---
document.getElementById('buy-moves-btn').addEventListener('click', () => {
    if (coins >= 100) {
        coins -= 100;
        moves += 5;
        saveData();
        updateUI();
    } else {
        alert("Pas assez de pièces !");
    }
});

document.getElementById('reset-btn').addEventListener('click', startLevel);
document.getElementById('hard-reset-btn').addEventListener('click', () => {
    if (confirm("Tout effacer et retourner au niveau 1 ?")) {
        level = 1;
        saveData();
        startLevel();
    }
});
