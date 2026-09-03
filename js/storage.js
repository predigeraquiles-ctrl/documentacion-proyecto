/* Fase 1 - Persistencia local del torneo (localStorage) */
const TORNEO_KEY = "torneoCESMI_v1";
const DEFAULT_PLAYERS = ["Nacho", "Giovanni", "Franquito", "Nico", "Rolo"];

function getInitialState() {
    return {
        availablePlayers: [...DEFAULT_PLAYERS],
        tournamentPlayers: { n0: "", n1: "", n2: "", n3: "", n4: "", p1_win: "", p2_win: "", shikamaru_win: "", champion: "" },
        currentSlotIndex: 0,
        currentStep: 1,
        reward: null, // { name, file }
        updatedAt: Date.now()
    };
}

function saveState() {
    try {
        const state = {
            availablePlayers: (typeof availablePlayers !== "undefined") ? availablePlayers : DEFAULT_PLAYERS,
            tournamentPlayers: (typeof tournamentPlayers !== "undefined") ? tournamentPlayers : getInitialState().tournamentPlayers,
            currentSlotIndex: (typeof currentSlotIndex !== "undefined") ? currentSlotIndex : 0,
            currentStep: (typeof currentStep !== "undefined") ? currentStep : 1,
            reward: window._selectedReward || null,
            updatedAt: Date.now()
        };
        localStorage.setItem(TORNEO_KEY, JSON.stringify(state));
        updateSaveIndicator();
    } catch (e) {
        console.warn("No se pudo guardar el torneo:", e);
    }
}

function loadState() {
    try {
        const raw = localStorage.getItem(TORNEO_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.warn("Estado corrupto, se ignora:", e);
        return null;
    }
}

function clearState() {
    localStorage.removeItem(TORNEO_KEY);
}

function updateSaveIndicator() {
    const el = document.getElementById("saveStatus");
    if (!el) return;
    const raw = localStorage.getItem(TORNEO_KEY);
    if (!raw) {
        el.textContent = "● Sin guardar";
        return;
    }
    try {
        const s = JSON.parse(raw);
        const d = new Date(s.updatedAt);
        el.textContent = "● Guardado automático " + d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
        el.textContent = "● Guardado automático";
    }
}

function restoreUIFromState(s) {
    // 1. Restaurar variables globales
    availablePlayers = s.availablePlayers || [...DEFAULT_PLAYERS];
    Object.assign(tournamentPlayers, s.tournamentPlayers || {});
    currentSlotIndex = s.currentSlotIndex || 0;
    currentStep = s.currentStep || 1;
    window._selectedReward = s.reward || null;

    // 2. Restaurar nodos del sorteo (node-0..4)
    for (let i = 0; i <= 4; i++) {
        const node = document.getElementById(`node-${i}`);
        const val = tournamentPlayers[`n${i}`];
        if (node) {
            node.textContent = val || node.dataset.defaultText || defaultNodeText(`node-${i}`);
            node.classList.toggle("active", !!val);
            node.classList.remove("loser");
        }
    }

    // 3. Restaurar llaves según currentStep (progresivo)
    const setNode = (id, val, cls) => {
        const n = document.getElementById(id);
        if (!n) return;
        if (val) { n.textContent = val; n.classList.add(cls || "active"); }
    };

    // Limpiar marcas previas
    ["node-shikamaru-match", "node-final-1", "node-final-2", "node-champion"].forEach(id => {
        const n = document.getElementById(id);
        if (n) { n.classList.remove("active", "loser", "champion-node"); }
    });
    document.getElementById("node-shikamaru-match").textContent = "Ganador P1";
    document.getElementById("node-final-1").textContent = "Finalista 1";
    document.getElementById("node-final-2").textContent = "Finalista 2";
    document.getElementById("node-champion").textContent = "CAMPEÓN";

    if (currentStep >= 2 || tournamentPlayers.p1_win) {
        setNode("node-shikamaru-match", tournamentPlayers.p1_win);
        markLoser("node-0", "node-1", tournamentPlayers.p1_win);
    }
    if (currentStep >= 3 || tournamentPlayers.shikamaru_win) {
        setNode("node-final-1", tournamentPlayers.shikamaru_win);
        if (tournamentPlayers.p1_win && tournamentPlayers.n4) {
            const loserId = tournamentPlayers.shikamaru_win === tournamentPlayers.p1_win ? "node-4" : "node-shikamaru-match";
            document.getElementById(loserId)?.classList.add("loser");
        }
    }
    if (currentStep >= 4 || tournamentPlayers.p2_win) {
        setNode("node-final-2", tournamentPlayers.p2_win);
        if (tournamentPlayers.n2 && tournamentPlayers.n3) {
            const loserId = tournamentPlayers.p2_win === tournamentPlayers.n2 ? "node-3" : "node-2";
            document.getElementById(loserId)?.classList.add("loser");
        }
    }
    if (tournamentPlayers.champion) {
        const c = document.getElementById("node-champion");
        c.textContent = tournamentPlayers.champion;
        c.classList.add("champion-node");
        const loserId = tournamentPlayers.champion === tournamentPlayers.shikamaru_win ? "node-final-2" : "node-final-1";
        document.getElementById(loserId)?.classList.add("loser");
    }

    // 4. Restaurar ruleta / botones
    drawWheel();
    if (availablePlayers.length === 0) {
        spinBtn.style.display = "none";
        startTournamentBtn.style.display = "block";
    } else {
        spinBtn.style.display = "block";
        spinBtn.disabled = false;
        startTournamentBtn.style.display = "none";
    }

    // 5. Restaurar versus actual
    restoreVersus();

    // 6. Restaurar recompensa si ya fue reclamada
    if (window._selectedReward) {
        showReward(window._selectedReward, true);
    }

    updateSaveIndicator();
    window.renderPlayerList && window.renderPlayerList();
    window.updateSpinAvailability && window.updateSpinAvailability();
}

function defaultNodeText(id) {
    const map = { "node-0": "P1 - A", "node-1": "P1 - B", "node-2": "P2 - A", "node-3": "P2 - B", "node-4": "As" };
    return map[id] || "";
}

function markLoser(idA, idB, winner) {
    const a = document.getElementById(idA), b = document.getElementById(idB);
    if (!a || !b) return;
    if (a.textContent === winner) b.classList.add("loser");
    else if (b.textContent === winner) a.classList.add("loser");
}

function restoreVersus() {
    if (!tournamentPlayers.n0) return;
    if (currentStep === 1) window.setupVersus("Pelea 1", tournamentPlayers.n0, tournamentPlayers.n1 || "?");
    else if (currentStep === 2) window.setupVersus("Cruce Retador Impar", tournamentPlayers.p1_win, tournamentPlayers.n4);
    else if (currentStep === 3) window.setupVersus("Pelea 2", tournamentPlayers.n2, tournamentPlayers.n3);
    else if (currentStep === 4) window.setupVersus("GRAN FINAL", tournamentPlayers.shikamaru_win, tournamentPlayers.p2_win);
    else if (tournamentPlayers.champion) window.setupVersus("CAMPEÓN: " + tournamentPlayers.champion, tournamentPlayers.shikamaru_win, tournamentPlayers.p2_win);
}

window.saveState = saveState;
window.loadState = loadState;
window.clearState = clearState;
window.restoreUIFromState = restoreUIFromState;
window.updateSaveIndicator = updateSaveIndicator;
window.DEFAULT_PLAYERS = DEFAULT_PLAYERS;
