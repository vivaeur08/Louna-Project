const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const msgEl = document.getElementById('love-message');
const startScreen = document.getElementById('start-screen');

// Ajustement de la taille du canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables du jeu
let bird, pipes, frame, score, gameRunning;
const messages = [" ","Je", "T'aime", "À la", "Folie", "Louna", "❤️", "Pour", "Toujours", "Mon", "Amour"];

// Chargement de l'image de Louna
const lounaImg = new Image();
lounaImg.src = 'louna-head.png'; 

function init() {
    bird = { x: 50, y: canvas.height / 2, w: 50, h: 50, gravity: 0.5, lift: -8, velocity: 0 };
    pipes = [];
    frame = 0;
    score = 0;
    gameRunning = false;
    scoreEl.innerText = score;
}

// Fonction de lancement appelée par le bouton
window.startGame = function() {
    init(); // Réinitialise tout
    startScreen.style.display = 'none';
    gameRunning = true;
    animate();
    console.log("Jeu démarré !");
};

function createPipe() {
    let gap = 180; // Espace pour passer
    let minPipeHeight = 50;
    let pipeTopHeight = Math.floor(Math.random() * (canvas.height - gap - (minPipeHeight * 2))) + minPipeHeight;
    pipes.push({ 
        x: canvas.width, 
        top: pipeTopHeight, 
        bottom: canvas.height - pipeTopHeight - gap, 
        passed: false 
    });
}

function animate() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- PHYSIQUE DE L'OISEAU ---
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // --- DESSIN DE L'OISEAU (Louna) ---
    if (lounaImg.complete && lounaImg.naturalWidth !== 0) {
        ctx.drawImage(lounaImg, bird.x, bird.y, bird.w, bird.h);
    } else {
        // Cercle de secours si l'image ne charge pas
        ctx.fillStyle = "#d4af37";
        ctx.beginPath();
        ctx.arc(bird.x + bird.w/2, bird.y + bird.h/2, bird.w/2, 0, Math.PI * 2);
        ctx.fill();
    }

    // --- GESTION DES TUYAUX (Roses/Cadeaux) ---
    if (frame % 90 === 0) createPipe();

    for (let i = pipes.length - 1; i >= 0; i--) {
        let p = pipes[i];
        p.x -= 3; // Vitesse de défilement

        // Dessin des obstacles
        ctx.fillStyle = "#d4af37";
        ctx.fillRect(p.x, 0, 60, p.top); // Tuyau du haut
        ctx.fillRect(p.x, canvas.height - p.bottom, 60, p.bottom); // Tuyau du bas

        // Score + Message
        if (!p.passed && p.x < bird.x) {
            p.passed = true;
            score++;
            scoreEl.innerText = score;
            showLoveMessage();
        }

        // Collision
        if (bird.x + bird.w > p.x && bird.x < p.x + 60) {
            if (bird.y < p.top || bird.y + bird.h > canvas.height - p.bottom) {
                gameOver();
            }
        }

        // Supprimer les tuyaux hors écran
        if (p.x < -60) pipes.splice(i, 1);
    }

    // Sortie d'écran
    if (bird.y + bird.h > canvas.height || bird.y < 0) {
        gameOver();
    }

    frame++;
    requestAnimationFrame(animate);
}

function showLoveMessage() {
    msgEl.innerText = messages[score % messages.length];
    msgEl.style.opacity = "1";
    setTimeout(() => { msgEl.style.opacity = "0"; }, 800);
}

function gameOver() {
    gameRunning = false;
    startScreen.style.display = 'block';
    
    // On crée une structure avec deux boutons
    startScreen.innerHTML = `
        <h1>Oups ! ❤️</h1>
        <p>Score : ${score}</p>
        <div class="game-over-buttons">
            <button onclick="startGame()" class="btn-retry">Réessayer</button>
            <button onclick="window.location.href='index.html'" class="btn-quit">Menu</button>
        </div>
    `;
}

// Contrôles
const jump = (e) => {
    if (gameRunning) {
        bird.velocity = bird.lift;
    }
};

window.addEventListener('mousedown', jump);
window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
}, {passive: false});

// Initialisation au chargement
init();