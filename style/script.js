// Khai báo các phần tử
const openBtn = document.getElementById("openBtn");
const resetBtn = document.getElementById("resetBtn");
const envelope = document.getElementById("envelope");
const letterContainer = document.getElementById("letter-container");
const letterOverlay = document.getElementById("letter-overlay");
const audio = document.getElementById("sound");
const petalsContainer = document.getElementById("petals-container");
const fwCanvas = document.getElementById("fireworks-canvas");
const ctx = fwCanvas ? fwCanvas.getContext("2d") : null;

let hasPlayed = false;
let fireworkInterval = null;
function playAudioOnce() {
    if (!hasPlayed && audio) {
        audio.play().then(() => {
            hasPlayed = true;
        }).catch((e) => {
            console.log("Không thể phát nhạc:", e);
        });
    }
}

function createPetal() {
    if (!petalsContainer) return;

    const petal = document.createElement("div");
    petal.classList.add("petal");

    const size = Math.random() * 15 + 10;
    petal.style.width = `${size}px`;
    petal.style.height = `${size * 0.8}px`;

    // Vị trí rơi ngẫu nhiên theo chiều ngang màn hình
    petal.style.left = `${Math.random() * 100}vw`;

    const sway = (Math.random() - 0.5) * 220;
    petal.style.setProperty("--sway", `${sway}px`);

    const duration = Math.random() * 4 + 3.5;
    petal.style.animationDuration = `${duration}s`;

    petalsContainer.appendChild(petal);

    setTimeout(() => {
        petal.remove();
    }, duration * 1000);
}

// Khởi tạo hoa rơi liên tục ngay khi vào trang
setInterval(createPetal, 320);
for (let i = 0; i < 12; i++) {
    setTimeout(createPetal, i * 180);
}
let particles = [];

function resizeCanvas() {
    if (!fwCanvas) return;
    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const fwColors = [
    "#ff6b8b", "#ff8e9e", "#ffd166", "#ff4d6d",
    "#f9c74f", "#e0aaff", "#ff99c8", "#ffffff"
];

class FireworkParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5.5 + 1.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.decay = Math.random() * 0.016 + 0.012;
        this.gravity = 0.045;
        this.size = Math.random() * 2.8 + 1.5;
    }

    update() {
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }

    draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = Math.max(this.alpha, 0);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }
}

function spawnFireworkBurst(x, y) {
    const count = 42;
    const baseColor = fwColors[Math.floor(Math.random() * fwColors.length)];
    for (let i = 0; i < count; i++) {
        const color = Math.random() > 0.35
            ? baseColor
            : fwColors[Math.floor(Math.random() * fwColors.length)];
        particles.push(new FireworkParticle(x, y, color));
    }
}

function launchSurroundingFirework() {
    if (!fwCanvas) return;
    const w = fwCanvas.width;
    const h = fwCanvas.height;

    const side = Math.random();
    let x, y;
    if (side < 0.4) {
        x = w * (0.08 + Math.random() * 0.2); 
        y = h * (0.15 + Math.random() * 0.55);
    } else if (side < 0.8) {
        x = w * (0.72 + Math.random() * 0.2); 
        y = h * (0.15 + Math.random() * 0.55);
    } else {
        x = w * (0.25 + Math.random() * 0.5); 
        y = h * (0.08 + Math.random() * 0.18);
    }
    spawnFireworkBurst(x, y);
}

function animateFireworks() {
    if (ctx && fwCanvas) {
        ctx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
            }
        }
    }
    requestAnimationFrame(animateFireworks);
}
animateFireworks();

function openLetter() {
    if (envelope) {
        envelope.classList.remove("close");
        envelope.classList.add("open");
    }

    if (openBtn) openBtn.style.display = "none";
    if (resetBtn) resetBtn.style.display = "inline-block";

    playAudioOnce();

    // Bắn loạt pháo hoa chào mừng ngay khi bấm Mở
    for (let i = 0; i < 5; i++) {
        setTimeout(launchSurroundingFirework, i * 260);
    }

    if (fireworkInterval) clearInterval(fireworkInterval);
    fireworkInterval = setInterval(launchSurroundingFirework, 1200);

    setTimeout(() => {
        if (letterContainer) letterContainer.classList.add("show");
        if (letterOverlay) letterOverlay.classList.add("active");
    }, 150);
}
function closeLetter() {
    if (letterContainer) letterContainer.classList.remove("show");
    if (letterOverlay) letterOverlay.classList.remove("active");
    if (fireworkInterval) {
        clearInterval(fireworkInterval);
        fireworkInterval = null;
    }

    setTimeout(() => {
        if (envelope) {
            envelope.classList.remove("open");
            envelope.classList.add("close");
        }
    }, 200);

    if (openBtn) openBtn.style.display = "inline-block";
    if (resetBtn) resetBtn.style.display = "none";
}

if (openBtn) {
    openBtn.addEventListener("click", openLetter);
}

if (envelope) {
    envelope.addEventListener("click", function () {
        if (envelope.classList.contains("close")) {
            openLetter();
        }
    });
}

if (resetBtn) {
    resetBtn.addEventListener("click", closeLetter);
}

if (letterOverlay) {
    letterOverlay.addEventListener("click", closeLetter);
}