let currentStep = 1;

function setupVersus(title, f1, f2) {
    document.getElementById("versusTitle").textContent = title;
    document.getElementById("btn-f1").textContent = f1;
    document.getElementById("btn-f2").textContent = f2;
}

function selectWinner(winnerIndex) {
    if (currentStep === 1) {
        const winner = winnerIndex === 1 ? tournamentPlayers.n0 : tournamentPlayers.n1;
        const loserNode = document.getElementById(winnerIndex === 1 ? "node-1" : "node-0");
        loserNode.classList.add("loser");

        tournamentPlayers.p1_win = winner;
        const target = document.getElementById("node-shikamaru-match");
        target.textContent = winner;
        target.classList.add("active");

        currentStep = 2;
        setupVersus("Cruce Retador Impar", winner, tournamentPlayers.n4);
    }
    else if (currentStep === 2) {
        const winner = winnerIndex === 1 ? tournamentPlayers.p1_win : tournamentPlayers.n4;
        const loserNode = document.getElementById(winnerIndex === 1 ? "node-4" : "node-shikamaru-match");
        loserNode.classList.add("loser");

        tournamentPlayers.shikamaru_win = winner;
        const target = document.getElementById("node-final-1");
        target.textContent = winner;
        target.classList.add("active");

        currentStep = 3;
        setupVersus("Pelea 2", tournamentPlayers.n2, tournamentPlayers.n3);
    }
    else if (currentStep === 3) {
        const winner = winnerIndex === 1 ? tournamentPlayers.n2 : tournamentPlayers.n3;
        const loserNode = document.getElementById(winnerIndex === 1 ? "node-3" : "node-2");
        loserNode.classList.add("loser");

        tournamentPlayers.p2_win = winner;
        const target = document.getElementById("node-final-2");
        target.textContent = winner;
        target.classList.add("active");

        currentStep = 4;
        setupVersus("GRAN FINAL", tournamentPlayers.shikamaru_win, tournamentPlayers.p2_win);
    }
    else if (currentStep === 4) {
        const winner = winnerIndex === 1 ? tournamentPlayers.shikamaru_win : tournamentPlayers.p2_win;
        tournamentPlayers.champion = winner;

        const loserNode = document.getElementById(winnerIndex === 1 ? "node-final-2" : "node-final-1");
        loserNode.classList.add("loser");

        const championNode = document.getElementById("node-champion");
        championNode.textContent = winner;
        championNode.classList.add("champion-node");

        setTimeout(() => {
            window.renderPokeballGrid();
            window.switchView("view-reward");
        }, 1500);
    }
}

document.getElementById("btn-f1").addEventListener("click", () => selectWinner(1));
document.getElementById("btn-f2").addEventListener("click", () => selectWinner(2));

window.setupVersus = setupVersus;