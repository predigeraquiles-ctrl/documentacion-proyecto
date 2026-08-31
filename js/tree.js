// MÓDULO DE ÁRBOL Y LÓGICA DE COMBATES
const versusTitle = document.getElementById('versusTitle');
const btnF1 = document.getElementById('btn-f1');
const btnF2 = document.getElementById('btn-f2');

// Estado interno de la competencia
let tournamentState = {
    step: 0, // 0: Pelea 1 (P1-A vs P1-B), 1: Pelea 2 (P2-A vs P2-B), 2: Semifinal Shikamaru, 3: Gran Final
    fighters: {
        node0: "Jugador 1",
        node1: "Jugador 2",
        node2: "Jugador 3",
        node3: "Jugador 4",
        node4: "As (Shikamaru)"
    },
    winners: {}
};

// Renderizar nombres en los nodos visibles
function updateTreeUI() {
    document.getElementById('node-0').innerText = tournamentState.fighters.node0;
    document.getElementById('node-1').innerText = tournamentState.fighters.node1;
    document.getElementById('node-2').innerText = tournamentState.fighters.node2;
    document.getElementById('node-3').innerText = tournamentState.fighters.node3;
    document.getElementById('node-4').innerText = tournamentState.fighters.node4;
}

// Cargar el panel Versus según la fase actual
function loadMatch() {
    const s = tournamentState;
    if (s.step === 0) {
        versusTitle.innerText = "Pelea 1 (Cuartos)";
        btnF1.innerText = s.fighters.node0;
        btnF2.innerText = s.fighters.node1;
    } else if (s.step === 1) {
        versusTitle.innerText = "Pelea 2 (Cuartos)";
        btnF1.innerText = s.fighters.node2;
        btnF2.innerText = s.fighters.node3;
    } else if (s.step === 2) {
        versusTitle.innerText = "Semifinal (vs As)";
        btnF1.innerText = s.winners.match1;
        btnF2.innerText = s.fighters.node4;
    } else if (s.step === 3) {
        versusTitle.innerText = "¡GRAN FINAL!";
        btnF1.innerText = s.winners.matchSemi;
        btnF2.innerText = s.winners.match2;
    }
}

// Elección de ganador
function selectWinner(winnerName) {
    const s = tournamentState;

    if (s.step === 0) {
        s.winners.match1 = winnerName;
        document.getElementById('node-shikamaru-match').innerText = winnerName;
        s.step = 1;
    } else if (s.step === 1) {
        s.winners.match2 = winnerName;
        document.getElementById('node-final-2').innerText = winnerName;
        s.step = 2;
    } else if (s.step === 2) {
        s.winners.matchSemi = winnerName;
        document.getElementById('node-final-1').innerText = winnerName;
        s.step = 3;
    } else if (s.step === 3) {
        s.winners.champion = winnerName;
        document.getElementById('node-champion').innerText = "🏆 " + winnerName;
        versusTitle.innerText = "¡CAMPEÓN: " + winnerName + "!";
        btnF1.style.display = 'none';
        btnF2.style.display = 'none';
        
        // Ir a Recompensas tras consagración
        setTimeout(() => {
            document.querySelector('[data-view="view-reward"]').click();
        }, 1500);
        return;
    }

    loadMatch();
}

// Event Listeners de botones de combate
btnF1.addEventListener('click', () => selectWinner(btnF1.innerText));
btnF2.addEventListener('click', () => selectWinner(btnF2.innerText));

// Inicializar estado del árbol
updateTreeUI();
loadMatch();