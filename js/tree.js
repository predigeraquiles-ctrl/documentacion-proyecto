/* Bracket dinámico de eliminación simple para N participantes.
   seeds[] define el orden de sorteo. Rondas con byes (pase directo) si el
   conteo es impar. Compatible con rewards.js vía tournamentPlayers.champion. */
let bracket = { seeds: [], rounds: [], champion: "" };

function roundName(index, total) {
    // index 0-based, total = cantidad de rondas del torneo
    if (total <= 1 || index === total - 1) return "GRAN FINAL";
    if (index === total - 2) return "Semifinal";
    return `Ronda ${index + 1}`;
}

function makeRound(participants, name) {
    const matches = [];
    for (let i = 0; i < participants.length; i += 2) {
        if (i + 1 < participants.length) {
            matches.push({ a: participants[i], b: participants[i + 1], winner: "" });
        } else {
            matches.push({ a: participants[i], b: null, winner: participants[i], bye: true });
        }
    }
    return { name, matches };
}

function countRounds(n) {
    let rounds = 0, p = n;
    while (p > 1) { p = Math.ceil(p / 2); rounds++; }
    return rounds;
}

function buildBracket(seedList) {
    const total = Math.max(countRounds(seedList.length), 1);
    bracket = {
        seeds: [...seedList],
        rounds: [makeRound(seedList, roundName(0, total))],
        champion: "",
        totalRounds: total
    };
    // Si hay un solo participante, es campeón directo
    if (seedList.length === 1) {
        bracket.champion = seedList[0];
        tournamentPlayers.champion = seedList[0];
    }
    renderBracket();
    setupCurrentVersus();
}

function allDecided(round) {
    return round.matches.every(m => m.winner);
}

function advancers(round) {
    return round.matches.map(m => m.winner).filter(Boolean);
}

function getCurrentMatch() {
    for (let r = 0; r < bracket.rounds.length; r++) {
        for (let m = 0; m < bracket.rounds[r].matches.length; m++) {
            const match = bracket.rounds[r].matches[m];
            if (match.a && match.b && !match.winner) {
                return { roundIndex: r, matchIndex: m, match };
            }
        }
    }
    return null;
}

function setupCurrentVersus() {
    const title = document.getElementById("versusTitle");
    const hint = document.getElementById("roundHint");
    const panel = document.getElementById("versusPanel");
    if (bracket.champion) {
        if (title) title.textContent = "CAMPEÓN: " + bracket.champion;
        if (hint) hint.textContent = "Torneo terminado. ¡Felicidades al campeón!";
        if (panel) panel.style.display = "flex";
        document.getElementById("btn-f1").textContent = bracket.champion;
        document.getElementById("btn-f2").textContent = "🏆";
        return;
    }
    const cur = getCurrentMatch();
    if (!cur) {
        if (title) title.textContent = "Armando bracket...";
        return;
    }
    const matchNo = cur.matchIndex + 1;
    const roundName_ = bracket.rounds[cur.roundIndex].name;
    const label = roundName_ === "GRAN FINAL" ? "GRAN FINAL" : `${roundName_} · Pelea ${matchNo}`;
    setupVersus(label, cur.match.a, cur.match.b);
}

function setupVersus(title, f1, f2) {
    document.getElementById("versusTitle").textContent = title;
    document.getElementById("btn-f1").textContent = f1;
    document.getElementById("btn-f2").textContent = f2;
    const h = document.getElementById("roundHint");
    if (h) {
        h.textContent = title.startsWith("GRAN FINAL")
            ? "Gran final: el ganador es el CAMPEÓN. ¡Sin presión!"
            : "Tocá al ganador para avanzar. O usá el dado para elegir al azar.";
    }
}

function selectWinner(winnerIndex) {
    if (bracket.champion) return;
    const cur = getCurrentMatch();
    if (!cur) return;
    const winner = winnerIndex === 1 ? cur.match.a : cur.match.b;
    cur.match.winner = winner;

    // ¿Ronda completa? ¿Torneo completo?
    const lastRound = bracket.rounds[bracket.rounds.length - 1];
    if (bracket.rounds.every(allDecided)) {
        const adv = advancers(lastRound);
        if (adv.length <= 1) {
            return crownChampion(adv[0] || winner);
        }
        const idx = bracket.rounds.length; // 0-based de la ronda nueva
        bracket.rounds.push(makeRound(adv, roundName(idx, bracket.totalRounds || (idx + 1))));
    }

    renderBracket();
    setupCurrentVersus();
    window.saveState && window.saveState();
}

function crownChampion(winner) {
    bracket.champion = winner;
    tournamentPlayers.champion = winner;
    renderBracket();
    setupCurrentVersus();
    window.saveState && window.saveState();
    setTimeout(() => {
        window.renderPokeballGrid && window.renderPokeballGrid();
        window.switchView && window.switchView("view-reward");
    }, 1500);
}

function randomWinner() {
    const cur = getCurrentMatch();
    if (!cur || bracket.champion) return;
    const pick = Math.random() < 0.5 ? 1 : 2;
    const btn = document.getElementById("randomWinnerBtn");
    if (btn) {
        btn.disabled = true;
        btn.textContent = "🎲 ...";
        setTimeout(() => {
            btn.disabled = false;
            btn.textContent = "🎲 Ganador aleatorio";
            selectWinner(pick);
        }, 500);
    } else {
        selectWinner(pick);
    }
}

function renderBracket() {
    const view = document.getElementById("bracketView");
    if (!view) return;
    view.innerHTML = "";
    if (!bracket.rounds.length) {
        view.innerHTML = `<p class="hint">Completá el sorteo y tocá "¡Ir a la Arena!" para generar las llaves.</p>`;
        return;
    }
    const wrap = document.createElement("div");
    wrap.className = "bracket-rounds";
    bracket.rounds.forEach((round) => {
        const col = document.createElement("div");
        col.className = "bracket-round";
        const h = document.createElement("h4");
        h.textContent = round.name;
        col.appendChild(h);
        round.matches.forEach((m) => {
            const card = document.createElement("div");
            card.className = "match-card" + (m.bye ? " bye" : "") + (m.winner ? " decided" : "");
            if (m.bye) {
                card.innerHTML = `<span class="fighter winner">${escapeHtmlBracket(m.a)}</span><span class="bye-tag">pase directo</span>`;
            } else {
                const aCls = m.winner ? (m.winner === m.a ? "winner" : "loser") : "";
                const bCls = m.winner ? (m.winner === m.b ? "winner" : "loser") : "";
                card.innerHTML =
                    `<span class="fighter ${aCls}">${escapeHtmlBracket(m.a)}</span>` +
                    `<span class="vs-mini">vs</span>` +
                    `<span class="fighter ${bCls}">${escapeHtmlBracket(m.b)}</span>` +
                    (m.winner ? `<span class="win-tag">✓ ${escapeHtmlBracket(m.winner)}</span>` : "");
            }
            col.appendChild(card);
        });
        wrap.appendChild(col);
    });
    view.appendChild(wrap);
    if (bracket.champion) {
        const c = document.createElement("div");
        c.className = "node champion-node bracket-champion";
        c.textContent = "🏆 " + bracket.champion;
        view.appendChild(c);
    }
}

function escapeHtmlBracket(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

document.getElementById("btn-f1").addEventListener("click", () => selectWinner(1));
document.getElementById("btn-f2").addEventListener("click", () => selectWinner(2));
document.getElementById("randomWinnerBtn")?.addEventListener("click", randomWinner);

window.buildBracket = buildBracket;
window.renderBracket = renderBracket;
window.setupVersus = setupVersus;
window.setupCurrentVersus = setupCurrentVersus;
window.selectWinner = selectWinner;
window.randomWinner = randomWinner;
