const pokeballs = [
    { name: "Poké Ball", file: "pokebolas/pokeball.png" },
    { name: "Super Ball", file: "pokebolas/superball.png" },
    { name: "Ultra Ball", file: "pokebolas/ultraball.png" },
    { name: "Master Ball", file: "pokebolas/masterball.png" },
    { name: "Safari Ball", file: "pokebolas/safariball.png" },
    { name: "Nivel Ball", file: "pokebolas/nivelaball.png" },
    { name: "Señuelo Ball", file: "pokebolas/señueloball.png" },
    { name: "Moon Ball", file: "pokebolas/moonball.png" },
    { name: "Friend Ball", file: "pokebolas/friendball.png" },
    { name: "Love Ball", file: "pokebolas/loveball.png" },
    { name: "Pesado Ball", file: "pokebolas/pesadoball.png" },
    { name: "Rapid Ball", file: "pokebolas/rapidball.png" },
    { name: "Competi Ball", file: "pokebolas/competiball.png" },
    { name: "Honor Ball", file: "pokebolas/honorball.png" },
    { name: "Malla Ball", file: "pokebolas/mallaball.png" },
    { name: "Nido Ball", file: "pokebolas/nidoball.png" },
    { name: "Acopio Ball", file: "pokebolas/acopioball.png" },
    { name: "Turno Ball", file: "pokebolas/turnoball.png" },
    { name: "Lujo Ball", file: "pokebolas/lujoball.png" },
    { name: "Sana Ball", file: "pokebolas/sanaball.png" },
    { name: "Ocaso Ball", file: "pokebolas/ocasoball.png" },
    { name: "Glory Ball", file: "pokebolas/gloryball.png" },
    { name: "Ente Ball", file: "pokebolas/enteball.png" },
    { name: "Ensueño Ball", file: "pokebolas/ensueñoball.png" },
    { name: "Veloz Ball", file: "pokebolas/velozball.png" },
    { name: "Buceo Ball", file: "pokebolas/buceoball.png" },
    { name: "Park Ball", file: "pokebolas/parkball.png" }
];

function renderPokeballGrid() {
    const title = document.getElementById("rewardTitle");
    if (tournamentPlayers && tournamentPlayers.champion) {
        title.textContent = `FELICIDADES, ${tournamentPlayers.champion.toUpperCase()}`;
    }
    
    const grid = document.getElementById("pokeballGrid");
    grid.innerHTML = "";
    grid.style.display = "flex";

    pokeballs.forEach(ball => {
        const btn = document.createElement("button");
        btn.className = "pokeball-item";

        const img = document.createElement("img");
        img.src = ball.file;
        img.alt = ball.name;

        btn.appendChild(img);

        btn.onclick = () => {
            const reward = { name: ball.name, file: ball.file };
            window._selectedReward = reward;
            window.saveState && window.saveState();
            showReward(reward, false);
        };

        grid.appendChild(btn);
    });
}

function showReward(reward, isRestore) {
    const grid = document.getElementById("pokeballGrid");
    grid.style.display = "none";
    document.getElementById("rewardImg").src = reward.file;
    const champName = (typeof tournamentPlayers !== "undefined" && tournamentPlayers.champion) ? tournamentPlayers.champion : "Campeón";
    document.getElementById("rewardName").textContent = `${champName} reclamó: ${reward.name}`;
    document.getElementById("rewardResult").style.display = "flex";
    if (!isRestore) {
        window.switchView && window.switchView("view-reward");
    }
}

const restartBtn = document.getElementById("restartBtn");
if (restartBtn) {
    restartBtn.addEventListener("click", () => {
        const champ = (typeof tournamentPlayers !== "undefined" && tournamentPlayers.champion) || "el campeón";
        if (confirm(`¿Reiniciar el torneo? Se borrará el progreso de ${champ} y volverá la ruleta a cero.`)) {
            window.clearState && window.clearState();
            location.reload();
        }
    });
}

function resetTournament() {
    if (confirm("¿Seguro? Se borra el torneo guardado y se empieza de cero.")) {
        window.clearState && window.clearState();
        location.reload();
    }
}

window.renderPokeballGrid = renderPokeballGrid;
window.showReward = showReward;
window.resetTournament = resetTournament;