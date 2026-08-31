// MODULO RULETA
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const startTournamentBtn = document.getElementById('startTournamentBtn');

const fightersList = ["Jugador 1", "Jugador 2", "Jugador 3", "Jugador 4", "As (Shikamaru)"];
const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

let currentAngle = 0;
let isSpinning = false;
let drawnFighters = [];

// Dibujar la ruleta en el canvas
function drawWheel() {
    const numSegments = fightersList.length;
    const arcSize = (2 * Math.PI) / numSegments;
    const radius = canvas.width / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numSegments; i++) {
        const angle = currentAngle + i * arcSize;
        ctx.beginPath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, angle, angle + arcSize);
        ctx.lineTo(radius, radius);
        ctx.fill();

        // Texto del luchador
        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(angle + arcSize / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText(fightersList[i], radius - 15, 5);
        ctx.restore();
    }
}

// Giro con física simple
spinBtn.addEventListener('click', () => {
    if (isSpinning) return;
    isSpinning = true;
    spinBtn.disabled = true;

    let speed = Math.random() * 0.3 + 0.4;
    const friction = 0.985;

    function animate() {
        speed *= friction;
        currentAngle += speed;
        drawWheel();

        if (speed > 0.002) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            spinBtn.disabled = false;
            startTournamentBtn.style.display = 'inline-block';
        }
    }
    animate();
});

// Transición a la Arena
startTournamentBtn.addEventListener('click', () => {
    // Cambiar a la pestaña de la arena
    document.querySelector('[data-view="view-arena"]').click();
});

// Render inicial
drawWheel();