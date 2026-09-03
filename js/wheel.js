let availablePlayers = ["Nacho", "Giovanni", "Franquito", "Nico", "Rolo"];
const colors = ["#ef4444", "#3b82f6", "#eab308", "#10b981", "#8b5cf6"];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const startTournamentBtn = document.getElementById("startTournamentBtn");

const center = canvas.width / 2;
const radius = center - 10;

let currentAngle = 0;
let isSpinning = false;
let currentSlotIndex = 0;

let tournamentPlayers = {
    n0: "", n1: "", n2: "", n3: "", n4: "",
    p1_win: "", p2_win: "", shikamaru_win: "", champion: ""
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
        ctx.fillText("¡Cuadro Completo!", center, center);
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
    if (window.REQUIRED_PLAYERS && !isDrawStarted?.() && availablePlayers.length !== window.REQUIRED_PLAYERS) {
        alert(`Se necesitan ${window.REQUIRED_PLAYERS} participantes para girar.`);
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

    const node = document.getElementById(`node-${currentSlotIndex}`);
    node.textContent = selectedPlayer;
    node.classList.add("active");

    tournamentPlayers[`n${currentSlotIndex}`] = selectedPlayer;

    availablePlayers.splice(selectedIndex, 1);
    currentSlotIndex++;

    window.saveState && window.saveState();
    window.renderPlayerList && window.renderPlayerList();

    const slotNames = ["P1 - A", "P1 - B", "P2 - A", "P2 - B", "As (pase directo)"];
    showDrawModal(selectedPlayer, slotNames[currentSlotIndex - 1] || `Puesto ${currentSlotIndex}`);

    if (availablePlayers.length === 1) {
        const lastPlayer = availablePlayers[0];
        const lastNode = document.getElementById("node-4");
        setTimeout(() => {
            lastNode.textContent = lastPlayer;
            lastNode.classList.add("active");
            tournamentPlayers.n4 = lastPlayer;
            availablePlayers.pop();
            drawWheel();
            spinBtn.style.display = "none";
            startTournamentBtn.style.display = "block";
            window.saveState && window.saveState();
            window.renderPlayerList && window.renderPlayerList();
            showDrawModal(lastPlayer, "As (pase directo)", true);
        }, 600);
    } else {
        drawWheel();
        spinBtn.disabled = false;
    }
    window.updateSpinAvailability && window.updateSpinAvailability();
}

function showDrawModal(name, slot, isLast) {
    const modal = document.getElementById("drawModal");
    if (!modal) return;
    document.getElementById("drawModalName").textContent = name;
    document.getElementById("drawModalSub").textContent = isLast
        ? "Último participante → As con pase directo. ¡Cuadro completo!"
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
        window.switchView("view-arena");
        window.setupVersus("Pelea 1", tournamentPlayers.n0, tournamentPlayers.n1);
    });
}

drawWheel();

// Restaurar progreso guardado (Fase 1: localStorage)
(function initFromStorage() {
    const saved = window.loadState && window.loadState();
    if (saved && (saved.tournamentPlayers?.n0 || saved.tournamentPlayers?.champion || (saved.availablePlayers && saved.availablePlayers.length !== 5))) {
        window.restoreUIFromState(saved);
    } else {
        window.updateSaveIndicator && window.updateSaveIndicator();
    }
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