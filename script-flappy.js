
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const msgEl = document.getElementById('love-message');
const startScreen = document.getElementById('start-screen');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

let bird, pipes, frame, score, gameRunning;
const messages = ["❤️", "Je", "T'aime", "Louna", "✨", "Mon Cœur", "💍", "Pour", "Toujours"];

const lounaImg = new Image();
lounaImg.src = 'louna-head.png'; 

function init() {
    const birdSize = Math.min(canvas.width, canvas.height) * 0.12;
    bird = { x: 50, y: canvas.height / 2, w: birdSize, h: birdSize, gravity: 0.4, lift: -7, velocity: 0 };
    pipes = [];
    frame = 0;
    score = 0;
    gameRunning = false;
    scoreEl.innerText = score;
}

// FONCTION START CORRIGÉE
window.startGame = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation(); // Empêche le saut immédiat au clic
    }
    init();
    startScreen.style.display = 'none';
    gameRunning = true;
    animate();
};

function createPipe() {
    let gap = canvas.height * 0.32; 
    let minPipeHeight = 50;
    let pipeTopHeight = Math.floor(Math.random() * (canvas.height - gap - (minPipeHeight * 2))) + minPipeHeight;
    pipes.push({ x: canvas.width, top: pipeTopHeight, bottom: canvas.height - pipeTopHeight - gap, passed: false });
}

function animate() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (lounaImg.complete) {
        ctx.drawImage(lounaImg, bird.x, bird.y, bird.w, bird.h);
    } else {
        ctx.fillStyle = "#d4af37";
        ctx.beginPath();
        ctx.arc(bird.x + bird.w/2, bird.y + bird.h/2, bird.w/2, 0, Math.PI * 2);
        ctx.fill();
    }

    if (frame % 100 === 0) createPipe();

    for (let i = pipes.length - 1; i >= 0; i--) {
        let p = pipes[i];
        p.x -= (canvas.width < 600) ? 2.8 : 4; 

        ctx.fillStyle = "#d4af37";
        ctx.fillRect(p.x, 0, 60, p.top);
        ctx.fillRect(p.x, canvas.height - p.bottom, 60, p.bottom);

        if (!p.passed && p.x < bird.x) {
            p.passed = true;
            score++;
            scoreEl.innerText = score;
            showLoveMessage();
        }

        if (bird.x + bird.w * 0.7 > p.x && bird.x < p.x + 60) {
            if (bird.y + bird.h * 0.2 < p.top || bird.y + bird.h * 0.8 > canvas.height - p.bottom) {
                gameOver();
            }
        }
        if (p.x < -60) pipes.splice(i, 1);
    }

    if (bird.y + bird.h > canvas.height || bird.y < 0) gameOver();

    frame++;
    requestAnimationFrame(animate);
}

function showLoveMessage() {
    msgEl.innerText = messages[score % messages.length];
    msgEl.style.opacity = "1";
    setTimeout(() => { msgEl.style.opacity = "0"; }, 700);
}

function gameOver() {
    gameRunning = false;
    startScreen.style.display = 'block';
    startScreen.innerHTML = `
        <h1>Oups ! ❤️</h1>
        <p>Score : ${score}</p>
        <div class="game-over-buttons">
            <button onclick="startGame(event)" class="btn-retry">Réessayer</button>
            <button onclick="window.location.href='index.html'" class="btn-quit">Quitter</button>
        </div>
    `;
}

// CONTRÔLES UNIFIÉS - CORRIGÉS POUR ÉVITER LES BUGS BOUTONS
const handleInput = (e) => {
    // Si on touche un bouton, on ne fait rien ici
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

    if (gameRunning) {
        bird.velocity = bird.lift;
    }
};

window.addEventListener('mousedown', handleInput);
window.addEventListener('touchstart', (e) => {
    if (gameRunning) {
        if (e.cancelable) e.preventDefault();
        handleInput(e);
    }
}, { passive: false });

init();
