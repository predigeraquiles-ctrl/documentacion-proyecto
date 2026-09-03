/* Persistencia local del torneo (localStorage)
   v2: formato dinámico para N participantes { availablePlayers, seeds, bracket, reward }.
   Migra torneos v1 (formato fijo n0..n4) a seeds automáticamente. */
const TORNEO_KEY = "torneoCESMI_v2";
const TORNEO_KEY_V1 = "torneoCESMI_v1";
// Arranque vacío a propósito: los participantes se cargan 1 a 1 en la UI.
const DEFAULT_PLAYERS = [];

function getInitialState() {
    return {
        availablePlayers: [...DEFAULT_PLAYERS],
        seeds: [],
        bracket: { seeds: [], rounds: [], champion: "", totalRounds: 0 },
        reward: null, // { name, file }
        updatedAt: Date.now()
    };
}

function saveState() {
    try {
        const state = {
            availablePlayers: (typeof availablePlayers !== "undefined") ? availablePlayers : [...DEFAULT_PLAYERS],
            seeds: (typeof seeds !== "undefined") ? seeds : [],
            bracket: (typeof bracket !== "undefined") ? bracket : getInitialState().bracket,
            reward: window._selectedReward || null,
            updatedAt: Date.now()
        };
        localStorage.setItem(TORNEO_KEY, JSON.stringify(state));
        updateSaveIndicator();
        // Fase 2: espejo a Supabase (debounced, no bloquea). Todo editable.
        try { window.CloudPush && window.CloudPush(); } catch {}
    } catch (e) {
        console.warn("No se pudo guardar el torneo:", e);
    }
}

function loadState() {
    try {
        const raw = localStorage.getItem(TORNEO_KEY);
        if (raw) return JSON.parse(raw);
        return migrateV1();
    } catch (e) {
        console.warn("Estado corrupto, se ignora:", e);
        return null;
    }
}

// Convierte un guardado v1 (n0..n4) al formato v2. Si el torneo v1 estaba
// a mitad de camino, se conservan las seeds sorteadas y el campeón/recompensa,
// pero el bracket arranca de cero (el motor de llaves cambió).
function migrateV1() {
    try {
        const raw = localStorage.getItem(TORNEO_KEY_V1);
        if (!raw) return null;
        const old = JSON.parse(raw);
        const tp = old.tournamentPlayers || {};
        const seeds = [tp.n0, tp.n1, tp.n2, tp.n3, tp.n4].filter(Boolean);
        if (!seeds.length && !tp.champion) return null;
        const avail = (old.availablePlayers || []).filter(n => !seeds.includes(n));
        return {
            availablePlayers: avail,
            seeds,
            bracket: { seeds: [], rounds: [], champion: tp.champion || "", totalRounds: 0 },
            reward: old.reward || null,
            updatedAt: Date.now(),
            _migratedFromV1: true
        };
    } catch {
        return null;
    }
}

function clearState() {
    localStorage.removeItem(TORNEO_KEY);
    localStorage.removeItem(TORNEO_KEY_V1);
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
    seeds = s.seeds || [];
    if (s.bracket) bracket = s.bracket;
    tournamentPlayers.champion = (s.bracket && s.bracket.champion) || "";
    window._selectedReward = s.reward || null;

    // 2. Si hay seeds sorteadas pero el bracket está vacío, generarlo.
    // (Pasa al migrar un v1 a mitad de torneo: se conservan las seeds y el
    // campeón/recompensa, pero las llaves arrancan de cero con el motor nuevo.)
    if (!bracket.rounds.length && !bracket.champion && seeds.length && availablePlayers.length === 0) {
        window.buildBracket && window.buildBracket([...seeds]);
    }

    // 3. Restaurar sorteo / botones
    renderSeedList();
    drawWheel();
    if (availablePlayers.length === 0 && seeds.length) {
        spinBtn.style.display = "none";
        startTournamentBtn.style.display = "block";
    } else {
        spinBtn.style.display = "block";
        spinBtn.disabled = false;
        startTournamentBtn.style.display = "none";
    }

    // 4. Restaurar bracket y versus
    if (bracket.rounds && bracket.rounds.length) {
        window.renderBracket && window.renderBracket();
        window.setupCurrentVersus && window.setupCurrentVersus();
    }

    // 5. Restaurar recompensa si ya fue reclamada
    if (window._selectedReward) {
        showReward(window._selectedReward, true);
    }

    updateSaveIndicator();
    window.renderPlayerList && window.renderPlayerList();
    window.updateSpinAvailability && window.updateSpinAvailability();
}

window.saveState = saveState;
window.loadState = loadState;
window.getInitialState = getInitialState;
window.clearState = clearState;
window.restoreUIFromState = restoreUIFromState;
window.updateSaveIndicator = updateSaveIndicator;
window.DEFAULT_PLAYERS = DEFAULT_PLAYERS;
