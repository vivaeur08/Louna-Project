const targetDate = new Date("December 25, 2025 00:00:00").getTime();
const gift = document.getElementById('gift');
const errorMsg = document.getElementById('click-message');
let isUnlocked = false;

// Mise à jour du compteur
const timer = setInterval(() => {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
        clearInterval(timer);
        isUnlocked = true;
        document.getElementById("countdown").innerHTML = "<h2>C'est enfin l'heure !</h2>";
        document.getElementById("surprise-link").classList.remove("hidden");
        gift.style.cursor = "pointer";
    } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById("days").innerText = d;
        document.getElementById("hours").innerText = h;
        document.getElementById("minutes").innerText = m;
        document.getElementById("seconds").innerText = s;
    }
}, 1000);

// Gestion du clic sur le cadeau
gift.addEventListener('click', () => {
    if (!isUnlocked) {
        errorMsg.classList.add('show');
        setTimeout(() => {
            errorMsg.classList.remove('show');
        }, 2000);
    } else {
        // Animation d'ouverture si débloqué
        gift.style.transform = "translateY(100px) rotateX(90deg)";
        gift.style.opacity = "0";
        setTimeout(() => gift.style.display = "none", 500);
    }
});