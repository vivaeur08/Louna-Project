// On attend que la page soit prête
document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const selectionScreen = document.getElementById('selection-screen');
    const gameArea = document.getElementById('game-area');
    const victoryScreen = document.getElementById('victory-screen');

    let selectedImage = '';
    const size = 3;
    let currentOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    // On rend la fonction accessible globalement pour le onclick du HTML
    window.startGame = function(imgSrc) {
        console.log("Jeu démarré avec : " + imgSrc); // Pour vérifier dans la console
        selectedImage = imgSrc;
        
        // Cache la sélection, montre le jeu
        selectionScreen.classList.add('hidden');
        gameArea.classList.remove('hidden');
        
        // Mélange et affiche
        shuffleOrder();
        renderBoard();
    };

    function shuffleOrder() {
        // Mélange simple (Fisher-Yates)
        for (let i = currentOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentOrder[i], currentOrder[j]] = [currentOrder[j], currentOrder[i]];
        }
        // Si par chance c'est déjà rangé, on remélange une fois
        if (isFinished()) shuffleOrder();
    }

    function renderBoard() {
        board.innerHTML = '';
        currentOrder.forEach((tileIdx, pos) => {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            
            if (tileIdx === 8) {
                tile.classList.add('empty');
            } else {
                tile.style.backgroundImage = `url('${selectedImage}')`;
                const row = Math.floor(tileIdx / size);
                const col = tileIdx % size;
                
                // On utilise des % pour le background position pour plus de flexibilité
                tile.style.backgroundPosition = `${(col * 50)}% ${(row * 50)}%`;
                tile.style.backgroundSize = "300px 300px";
                
                tile.onclick = () => moveTile(pos);
            }
            board.appendChild(tile);
        });
    }

    function moveTile(pos) {
        const emptyPos = currentOrder.indexOf(8);
        
        // Calcul des positions X et Y
        const x = pos % size;
        const y = Math.floor(pos / size);
        const ex = emptyPos % size;
        const ey = Math.floor(emptyPos / size);

        // Distance de Manhattan (doit être égale à 1 pour être adjacent)
        const distance = Math.abs(x - ex) + Math.abs(y - ey);

        if (distance === 1) {
            [currentOrder[pos], currentOrder[emptyPos]] = [currentOrder[emptyPos], currentOrder[pos]];
            renderBoard();
            
            if (isFinished()) {
                setTimeout(victory, 500);
            }
        }
    }

    function isFinished() {
        return currentOrder.every((val, index) => val === index);
    }

    function victory() {
        victoryScreen.classList.remove('hidden');
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }
});