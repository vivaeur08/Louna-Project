const gameArea = document.getElementById('game-area');
const basket = document.getElementById('basket');
const scoreDisplay = document.getElementById('score');
const bestDisplay = document.getElementById('best');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');

let score = 0;
let bestScore = localStorage.getItem('lounaCatchBest') || 0;
let gameActive = true;
let speed = 3;
let frequency = 1000;
bestDisplay.innerText = bestScore;

// Déplacement du panier (Souris et Tactile)
function moveBasket(e) {
    if (!gameActive) return;
    let x;
    if (e.type === 'touchstart' || e.type === 'touchmove') {
        x = e.touches[0].clientX;
    } else {
        x = e.clientX;
    }
    // Centrer le panier sur le doigt/souris
    let basketWidth = basket.offsetWidth;
    let newX = x - basketWidth / 2;
    
    // Limites de l'écran
    if (newX < 0) newX = 0;
    if (newX > window.innerWidth - basketWidth) newX = window.innerWidth - basketWidth;
    
    basket.style.left = newX + 'px';
    basket.style.transform = 'translateX(0)';
}

document.addEventListener('mousemove', moveBasket);
document.addEventListener('touchmove', moveBasket, {passive: false});

// Création des objets qui tombent
function createItem() {
    if (!gameActive) return;

    const item = document.createElement('div');
    item.classList.add('falling-item');
    
    const types = ['❤️', '🎁', '🎂', '⭐', '19'];
    const rand = Math.random();
    let type;
    
    if (rand < 0.05) type = '19'; // 5% de chance d'avoir le bonus 19
    else type = types[Math.floor(Math.random() * (types.length - 1))];
    
    if (type === '19') item.classList.add('bonus-19');
    item.innerText = type;
    
    item.style.left = Math.random() * (window.innerWidth - 30) + 'px';
    item.style.top = '-50px';
    gameArea.appendChild(item);

    let top = -50;
    let fallInterval = setInterval(() => {
        if (!gameActive) {
            clearInterval(fallInterval);
            item.remove();
            return;
        }

        top += speed;
        item.style.top = top + 'px';

        // Collision avec le panier
        const basketRect = basket.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();

        if (
            itemRect.bottom >= basketRect.top &&
            itemRect.right >= basketRect.left &&
            itemRect.left <= basketRect.right &&
            itemRect.top <= basketRect.bottom
        ) {
            if (type === '19') {
                score += 100; // Super Bonus
                createFloatingText("+100 !");
            } else {
                score += 10;
            }
            
            scoreDisplay.innerText = score;
            speed += 0.05; // Augmente la vitesse
            clearInterval(fallInterval);
            item.remove();
        }

        // Sortie de l'écran (Défaite)
        if (top > window.innerHeight) {
            clearInterval(fallInterval);
            item.remove();
            if (type !== '19') endGame(); // On perd si on rate un objet normal
        }
    }, 10);

    setTimeout(createItem, frequency > 400 ? frequency -= 5 : frequency);
}

function endGame() {
    gameActive = false;
    gameOverScreen.classList.remove('hidden');
    finalScoreDisplay.innerText = score;
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('lounaCatchBest', bestScore);
        bestDisplay.innerText = bestScore;
    }
}

function resetGame() {
    score = 0;
    speed = 3;
    frequency = 1000;
    scoreDisplay.innerText = 0;
    gameActive = true;
    gameOverScreen.classList.add('hidden');
    createItem();
}

function createFloatingText(txt) {
    const t = document.createElement('div');
    t.innerText = txt;
    t.style.position = 'absolute';
    t.style.left = basket.style.left;
    t.style.bottom = '80px';
    t.style.color = 'white';
    t.style.fontWeight = 'bold';
    t.style.transition = 'all 0.5s';
    gameArea.appendChild(t);
    setTimeout(() => { t.style.bottom = '150px'; t.style.opacity = '0'; }, 50);
    setTimeout(() => t.remove(), 600);
}

// Lancement
createItem();