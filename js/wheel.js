let availablePlayers = [];
const colors = ["#ef4444", "#3b82f6", "#eab308", "#10b981", "#8b5cf6"];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const startTournamentBtn = document.getElementById("startTournamentBtn");

const center = canvas.width / 2;
const radius = center - 10;

let currentAngle = 0;
let isSpinning = false;

// seeds: orden de sorteo de la ruleta (reemplaza al viejo n0..n4 fijo).
// tournamentPlayers.champion se mantiene por compatibilidad con rewards.js.
let seeds = [];

let tournamentPlayers = {
    champion: ""
};

function drawWheel() {
    const totalSlices = availablePlayers.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (totalSlices === 0) {
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "#0f172a";
        ctx.fill();
        ctx.fillStyle = "#38bdf8";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 16px sans-serif";
        const done = (typeof seeds !== "undefined") && seeds.length > 0;
        ctx.fillText(done ? "¡Cuadro Completo!" : "Agregá participantes", center, center);
        return;
    }

    const sliceAngle = (2 * Math.PI) / totalSlices;

    for (let i = 0; i < totalSlices; i++) {
        const angle = currentAngle + i * sliceAngle;
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, angle, angle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = "#0a0e17";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.save();
        ctx.translate(center, center);

        const currentSliceAngle = angle + sliceAngle / 2;
        ctx.rotate(currentSliceAngle);

        const normalizedAngle = (currentSliceAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

        ctx.font = "bold 15px sans-serif";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "round";

        if (normalizedAngle > Math.PI / 2 && normalizedAngle < (3 * Math.PI) / 2) {
            ctx.rotate(Math.PI);
            ctx.textAlign = "left";
            
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 3;
            ctx.strokeText(availablePlayers[i], -radius + 15, 0);

            ctx.fillStyle = "#ffffff";
            ctx.fillText(availablePlayers[i], -radius + 15, 0);
        } else {
            ctx.textAlign = "right";
            
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 3;
            ctx.strokeText(availablePlayers[i], radius - 15, 0);

            ctx.fillStyle = "#ffffff";
            ctx.fillText(availablePlayers[i], radius - 15, 0);
        }

        ctx.restore();
    }
}

function spin() {
    if (isSpinning || availablePlayers.length === 0) return;
    const min = window.MIN_PLAYERS || 2;
    if (!isDrawStarted?.() && totalPlayers?.() < min) {
        alert(`Se necesitan al menos ${min} participantes para girar.`);
        return;
    }
    // Con 1 restante no hay nada que sortear: se asigna directo, sin animación.
    if (isDrawStarted?.() && availablePlayers.length === 1) {
        assignLastInstant();
        return;
    }
    isSpinning = true;
    spinBtn.disabled = true;
    document.querySelector(".wheel-container")?.classList.add("spinning");

    const startAngle = currentAngle;
    const extraRotations = (Math.floor(Math.random() * 5) + 5) * 2 * Math.PI;
    const targetAngle = startAngle + extraRotations + Math.random() * 2 * Math.PI;

    const duration = 2800;
    const startTime = performance.now();

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 4);
        currentAngle = startAngle + (targetAngle - startAngle) * easeOut;

        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            document.querySelector(".wheel-container")?.classList.remove("spinning");
            determineWinner();
        }
    }
    requestAnimationFrame(animate);
}

function determineWinner() {
    const totalSlices = availablePlayers.length;
    const sliceAngle = (2 * Math.PI) / totalSlices;
    const normalizedAngle = (currentAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const pointerAngle = (3 * Math.PI / 2 - normalizedAngle + 2 * Math.PI) % (2 * Math.PI);
    const selectedIndex = Math.floor(pointerAngle / sliceAngle);

    const selectedPlayer = availablePlayers[selectedIndex];

    seeds.push(selectedPlayer);
    availablePlayers.splice(selectedIndex, 1);

    window.saveState && window.saveState();
    window.renderPlayerList && window.renderPlayerList();
    renderSeedList();

    const total = seeds.length + availablePlayers.length;
    const isLast = availablePlayers.length === 0;
    showDrawModal(selectedPlayer, `Puesto ${seeds.length} de ${total}`, isLast);

    if (isLast) {
        setTimeout(() => {
            drawWheel();
            spinBtn.style.display = "none";
            startTournamentBtn.style.display = "block";
            window.saveState && window.saveState();
            window.renderPlayerList && window.renderPlayerList();
        }, 600);
    } else {
        drawWheel();
        spinBtn.disabled = false;
    }
    window.updateSpinAvailability && window.updateSpinAvailability();
}

// Último restante: asignación directa sin girar (girar con 1 no sortea nada).
function assignLastInstant() {
    if (availablePlayers.length !== 1 || isSpinning) return;
    const last = availablePlayers.pop();
    seeds.push(last);

    window.saveState && window.saveState();
    window.renderPlayerList && window.renderPlayerList();
    renderSeedList();
    drawWheel();

    spinBtn.style.display = "none";
    startTournamentBtn.style.display = "block";
    window.saveState && window.saveState();
    window.updateSpinAvailability && window.updateSpinAvailability();

    showDrawModal(last, `Puesto ${seeds.length} de ${seeds.length}`, true);
}
window.assignLastInstant = assignLastInstant;

function renderSeedList() {
    const list = document.getElementById("seedList");
    if (!list) return;
    list.innerHTML = "";
    seeds.forEach((name, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>#${i + 1}</strong> ${escapeHtml(name)}`;
        list.appendChild(li);
    });
    const empty = document.getElementById("seedEmpty");
    if (empty) empty.style.display = seeds.length ? "none" : "block";
}

function escapeHtml(s) {    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function showDrawModal(name, slot, isLast) {
    const modal = document.getElementById("drawModal");
    if (!modal) return;
    document.getElementById("drawModalName").textContent = name;
    document.getElementById("drawModalSub").textContent = isLast
        ? `Último participante. ¡Cuadro completo con ${seeds.length}!`
        : `Ocupa el puesto: ${slot}`;
    document.getElementById("drawModalTitle").textContent = isLast ? "¡Cuadro completo!" : "¡Sorteado!";
    const goArena = document.getElementById("drawModalGoArena");
    if (goArena) goArena.style.display = isLast ? "block" : "none";
    modal.style.display = "flex";
}

function hideDrawModal() {
    const modal = document.getElementById("drawModal");
    if (modal) modal.style.display = "none";
}

if (spinBtn) {
    spinBtn.addEventListener("click", spin);
}

if (startTournamentBtn) {
    startTournamentBtn.addEventListener("click", () => {
        if (!seeds.length) return;
        window.buildBracket && window.buildBracket([...seeds]);
        window.saveState && window.saveState();
        window.switchView("view-arena");
        window.setupCurrentVersus && window.setupCurrentVersus();
    });
}

drawWheel();

// Wiring del modal (el restore del estado lo hace app.js al final, cuando
// todos los módulos —incluido el bracket— ya están cargados).
(function initDrawUI() {
    renderSeedList();
    window.renderPlayerList && window.renderPlayerList();
    document.getElementById("drawModalContinue")?.addEventListener("click", hideDrawModal);
    document.getElementById("drawModal")?.addEventListener("click", (e) => {
        if (e.target.id === "drawModal") hideDrawModal();
    });
    document.getElementById("drawModalGoArena")?.addEventListener("click", () => {
        hideDrawModal();
        document.getElementById("startTournamentBtn")?.click();
    });
})();