/* Fase 2 — Nube Supabase (todo editable, realtime).
   Formato v2: { availablePlayers, seeds, bracket, reward, updatedAt }.
   Se guarda en tournaments.data (jsonb). Sin bloqueo: last-write-wins. */

const SUPABASE_URL = "https://kuuwrdsleoavonpkzhqi.supabase.co";
// Pegar anon public key: Supabase Dashboard > Project Settings > API > anon public.
// También se puede pasar por ?key=... (solo local, no se guarda en git) o localStorage.
const SUPABASE_ANON_KEY = "sb_publishable_eFtFWLrkEv7Pk_Y3ALIpNA_dI7B_LNo";

// ID de la fila del torneo. Null = usa la primera fila que encuentre (o crea una).
// Override por URL: ?torneo=<uuid>
function resolveTournamentId() {
    try {
        const q = new URLSearchParams(location.search).get("torneo");
        if (q) { localStorage.setItem("torneoId", q); return q; }
        return localStorage.getItem("torneoId") || null;
    } catch { return null; }
}
let TOURNAMENT_ID = resolveTournamentId();

let _client = null;
let _pushTimer = null;
let _pollTimer = null;
let _lastPushedAt = 0;
window._applyingRemote = false;

function cloudConfigured() {
    return SUPABASE_URL &&
        SUPABASE_ANON_KEY &&
        !SUPABASE_ANON_KEY.includes("PEGA_TU_") &&
        window.supabase;
}

function getClient() {
    if (_client) return _client;
    if (!cloudConfigured()) return null;
    _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _client;
}

function getStateSnapshot() {
    const defBracket = { seeds: [], rounds: [], champion: "", totalRounds: 0 };
    return {
        availablePlayers: (typeof availablePlayers !== "undefined") ? availablePlayers : [...(window.DEFAULT_PLAYERS || [])],
        seeds: (typeof seeds !== "undefined") ? seeds : [],
        bracket: (typeof bracket !== "undefined") ? bracket : defBracket,
        reward: window._selectedReward || null,
        updatedAt: Date.now()
    };
}

function setCloudStatus(txt, ok) {
    const el = document.getElementById("cloudStatus");
    if (!el) return;
    el.textContent = txt;
    el.style.color = ok === false ? "#f87171" : ok === true ? "#22c55e" : "#94a3b8";
}

// Push con debounce 800ms. Se llama desde saveState().
function queuePush() {
    if (!cloudConfigured()) return;
    clearTimeout(_pushTimer);
    _pushTimer = setTimeout(pushState, 800);
}

async function ensureRow(client) {
    if (TOURNAMENT_ID) return TOURNAMENT_ID;
    const { data, error } = await client.from("tournaments").select("id").limit(1).maybeSingle();
    if (error) throw error;
    if (data?.id) {
        TOURNAMENT_ID = data.id;
        try { localStorage.setItem("torneoId", TOURNAMENT_ID); } catch {}
        return TOURNAMENT_ID;
    }
    // No hay filas: crear una (requiere policy de insert pública)
    const seed = getStateSnapshot();
    const { data: created, error: insErr } = await client.from("tournaments")
        .insert({ name: "Torneo CESMI PvP 1", status: "en_curso", data: seed, champion: seed.bracket?.champion || "" })
        .select("id").single();
    if (insErr) throw insErr;
    TOURNAMENT_ID = created.id;
    try { localStorage.setItem("torneoId", TOURNAMENT_ID); } catch {}
    return TOURNAMENT_ID;
}

async function pushState() {
    if (!cloudConfigured() || window._applyingRemote) return;
    const client = getClient();
    if (!client) return;
    try {
        setCloudStatus("☁️ subiendo…");
        const id = await ensureRow(client);
        const state = getStateSnapshot();
        const { error } = await client.from("tournaments").update({
            data: state,
            champion: state.bracket?.champion || "",
            status: state.bracket?.champion ? "finalizado" : "en_curso"
        }).eq("id", id);
        if (error) throw error;
        _lastPushedAt = state.updatedAt;
        setCloudStatus("☁️ sincronizado", true);
    } catch (e) {
        console.warn("Cloud push falló:", e);
        setCloudStatus("☁️ sin conexión", false);
    }
}

// Trae la nube una vez; si es más nueva que lo local, restaura.
async function pullOnce() {
    if (!cloudConfigured()) return false;
    const client = getClient();
    if (!client) return false;
    try {
        const id = await ensureRow(client);
        let q = client.from("tournaments").select("data, champion, updated_at");
        const { data, error } = id
            ? await q.eq("id", id).maybeSingle()
            : await q.limit(1).maybeSingle();
        if (error) throw error;
        const remote = data?.data;
        if (!remote || !remote.updatedAt) return false;
        const local = window.loadState && window.loadState();
        if (!local || (remote.updatedAt > (local.updatedAt || 0) && remote.updatedAt !== _lastPushedAt)) {
            window._applyingRemote = true;
            try {
                // remote ya viene en formato v2; guardar local y pintar
                localStorage.setItem("torneoCESMI_v2", JSON.stringify(remote));
                window.restoreUIFromState && window.restoreUIFromState(remote);
                setCloudStatus("☁️ sincronizado", true);
            } finally {
                setTimeout(() => { window._applyingRemote = false; }, 500);
            }
            return true;
        }
        setCloudStatus("☁️ sincronizado", true);
        return false;
    } catch (e) {
        console.warn("Cloud pull falló:", e);
        setCloudStatus("☁️ sin conexión", false);
        return false;
    }
}

function subscribeState() {
    if (!cloudConfigured()) {
        setCloudStatus("☁️ solo local (falta ANON_KEY)");
        return;
    }
    const client = getClient();
    if (!client) return;
    try {
        client.channel("torneo-realtime")
            .on("postgres_changes",
                { event: "*", schema: "public", table: "tournaments" },
                (payload) => {
                    const remote = payload.new?.data;
                    if (!remote || !remote.updatedAt) return;
                    if (remote.updatedAt === _lastPushedAt) return; // eco de mi propio push
                    if (window._applyingRemote) return;
                    const local = window.loadState && window.loadState();
                    if (local && remote.updatedAt <= (local.updatedAt || 0)) return;
                    window._applyingRemote = true;
                    try {
                        localStorage.setItem("torneoCESMI_v2", JSON.stringify(remote));
                        window.restoreUIFromState && window.restoreUIFromState(remote);
                        setCloudStatus("☁️ sincronizado", true);
                    } finally {
                        setTimeout(() => { window._applyingRemote = false; }, 500);
                    }
                })
            .subscribe((status) => {
                if (status === "SUBSCRIBED") setCloudStatus("☁️ en vivo", true);
            });
    } catch (e) {
        console.warn("Realtime no disponible, uso polling:", e);
    }
    // Fallback polling cada 8s
    clearInterval(_pollTimer);
    _pollTimer = setInterval(pullOnce, 8000);
}

window.CloudPush = queuePush;
window.CloudPull = pullOnce;
window.CloudSubscribe = subscribeState;
window.cloudConfigured = cloudConfigured;
