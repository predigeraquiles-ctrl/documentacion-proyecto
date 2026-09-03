/* Gestión de participantes (estado local + localStorage) */
const REQUIRED_PLAYERS = 5;

function isDrawStarted() {
    return (typeof currentSlotIndex !== "undefined" && currentSlotIndex > 0) ||
        !!(typeof tournamentPlayers !== "undefined" && tournamentPlayers.n0);
}

function renderPlayerList() {
    const list = document.getElementById("playerList");
    const count = document.getElementById("playerCount");
    const form = document.getElementById("addPlayerForm");
    const hint = document.getElementById("rosterHint");
    const progress = document.getElementById("drawProgress");
    if (!list) return;

    const locked = isDrawStarted();
    list.innerHTML = "";
    availablePlayers.forEach((name) => {
        const li = document.createElement("li");
        li.className = "player-item";
        const span = document.createElement("span");
        span.textContent = name;
        li.appendChild(span);
        const del = document.createElement("button");
        del.type = "button";
        del.className = "btn-mini-danger";
        del.textContent = "✕";
        del.title = locked ? "Sorteo en curso: reiniciá para editar" : `Quitar a ${name}`;
        del.disabled = locked;
        del.onclick = () => removePlayer(name);
        li.appendChild(del);
        list.appendChild(li);
    });

    // Jugadores ya sorteados (solo lectura)
    if (locked && typeof tournamentPlayers !== "undefined") {
        for (let i = 0; i < currentSlotIndex; i++) {
            const val = tournamentPlayers[`n${i}`];
            if (!val) continue;
            const li = document.createElement("li");
            li.className = "player-item drawn";
            const span = document.createElement("span");
            span.textContent = `✓ ${val}`;
            li.appendChild(span);
            list.appendChild(li);
        }
    }

    if (count) count.textContent = locked ? currentSlotIndex + availablePlayers.length : availablePlayers.length;
    if (form) form.style.opacity = locked ? "0.4" : "1";
    const input = document.getElementById("newPlayerName");
    if (input) input.disabled = locked;
    if (hint) {
        hint.textContent = locked
            ? "Sorteo en curso: la lista está bloqueada. Reiniciá para editar."
            : (availablePlayers.length === REQUIRED_PLAYERS
                ? "Lista lista. ¡Girá la ruleta!"
                : `Se necesitan exactamente ${REQUIRED_PLAYERS} para girar (faltan ${REQUIRED_PLAYERS - availablePlayers.length}).`);
    }
    if (progress) progress.textContent = `Sorteados: ${currentSlotIndex} / ${REQUIRED_PLAYERS}`;
    updateSpinAvailability();
}

function updateSpinAvailability() {
    if (!spinBtn) return;
    const ready = !isDrawStarted()
        ? availablePlayers.length === REQUIRED_PLAYERS
        : availablePlayers.length > 0;
    spinBtn.disabled = !ready || isSpinning;
    if (!isDrawStarted() && availablePlayers.length !== REQUIRED_PLAYERS) {
        spinBtn.title = `Agregá ${REQUIRED_PLAYERS} participantes para girar`;
    } else {
        spinBtn.title = "";
    }
}

function addPlayer(name) {
    name = (name || "").trim();
    if (!name) return;
    if (isDrawStarted()) {
        alert("El sorteo ya empezó. Reiniciá el torneo para cambiar participantes.");
        return;
    }
    if (availablePlayers.length >= REQUIRED_PLAYERS) {
        alert(`El bracket es de ${REQUIRED_PLAYERS}. Quitá uno para agregar otro.`);
        return;
    }
    if (availablePlayers.some(p => p.toLowerCase() === name.toLowerCase())) {
        alert("Ese nombre ya está en la lista.");
        return;
    }
    availablePlayers.push(name);
    drawWheel();
    renderPlayerList();
    window.saveState && window.saveState();
}

function removePlayer(name) {
    if (isDrawStarted()) {
        alert("El sorteo ya empezó. Reiniciá el torneo para cambiar participantes.");
        return;
    }
    availablePlayers = availablePlayers.filter(p => p !== name);
    drawWheel();
    renderPlayerList();
    window.saveState && window.saveState();
}

document.getElementById("addPlayerForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("newPlayerName");
    addPlayer(input.value);
    input.value = "";
    input.focus();
});

window.renderPlayerList = renderPlayerList;
window.updateSpinAvailability = updateSpinAvailability;
window.addPlayer = addPlayer;
window.removePlayer = removePlayer;
window.REQUIRED_PLAYERS = REQUIRED_PLAYERS;
