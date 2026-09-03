/* Gestión de participantes (estado local + localStorage) — roster libre de 2 a 16 */
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 16;

function totalPlayers() {
    const drawn = (typeof seeds !== "undefined") ? seeds.length : 0;
    return drawn + availablePlayers.length;
}

function isDrawStarted() {
    return ((typeof seeds !== "undefined") && seeds.length > 0) ||
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

    // Jugadores ya sorteados (solo lectura, en orden de sorteo)
    if (locked && typeof seeds !== "undefined") {
        seeds.forEach((val, i) => {
            const li = document.createElement("li");
            li.className = "player-item drawn";
            const span = document.createElement("span");
            span.textContent = `#${i + 1} ✓ ${val}`;
            li.appendChild(span);
            list.appendChild(li);
        });
    }
    // Compat: torneos viejos guardados con formato n0..n4
    else if (locked && typeof tournamentPlayers !== "undefined" && tournamentPlayers.n0) {
        for (let i = 0; i <= 4; i++) {
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

    if (count) count.textContent = totalPlayers();
    if (form) form.style.opacity = locked ? "0.4" : "1";
    const input = document.getElementById("newPlayerName");
    if (input) input.disabled = locked;
    if (hint) {
        const total = totalPlayers();
        hint.textContent = locked
            ? "Sorteo en curso: la lista está bloqueada. Reiniciá para editar."
            : (total < MIN_PLAYERS
                ? `Agregá al menos ${MIN_PLAYERS} participantes para girar (van ${total}).`
                : "Lista lista. ¡Girá la ruleta!");
    }
    if (progress) {
        const drawn = (typeof seeds !== "undefined") ? seeds.length : 0;
        progress.textContent = drawn > 0 || locked
            ? `Sorteados: ${drawn} / ${totalPlayers()}`
            : `Participantes: ${totalPlayers()}`;
    }
    updateSpinAvailability();
}

function updateSpinAvailability() {
    if (!spinBtn) return;
    const total = totalPlayers();
    const ready = !isDrawStarted()
        ? (total >= MIN_PLAYERS && total <= MAX_PLAYERS)
        : availablePlayers.length > 0;
    spinBtn.disabled = !ready || isSpinning;
    // Con 1 restante no hay sorteo posible: el botón asigna directo.
    const lastOne = isDrawStarted() && availablePlayers.length === 1;
    if (spinBtn.textContent !== undefined) {
        spinBtn.textContent = lastOne ? "Asignar último participante" : "Girar Ruleta";
    }
    if (!isDrawStarted() && total < MIN_PLAYERS) {
        spinBtn.title = `Agregá al menos ${MIN_PLAYERS} participantes para girar`;
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
    if (totalPlayers() >= MAX_PLAYERS) {
        alert(`Máximo ${MAX_PLAYERS} participantes (la ruleta se vuelve ilegible).`);
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
window.MIN_PLAYERS = MIN_PLAYERS;
window.MAX_PLAYERS = MAX_PLAYERS;
