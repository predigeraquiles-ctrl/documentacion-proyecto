// MÓDULO DE RECOMPENSAS Y TROFEO
const pokeballGrid = document.getElementById('pokeballGrid');
const rewardResult = document.getElementById('rewardResult');
const rewardImg = document.getElementById('rewardImg');
const rewardName = document.getElementById('rewardName');
const rewardTitle = document.getElementById('rewardTitle');
const resetBtn = document.getElementById('resetBtn');

// Lista de Pokébolas disponibles
const pokeballs = [
    { id: 1, name: "Poké Ball Clásica", src: "../pokebolas/pokeball.png" },
    { id: 2, name: "Super Ball", src: "../pokebolas/superball.png" },
    { id: 3, name: "Ultra Ball", src: "../pokebolas/ultraball.png" },
    { id: 4, name: "Master Ball", src: "../pokebolas/masterball.png" },
    { id: 5, name: "Honor Ball", src: "../pokebolas/honorball.png" }
];

// Generar grilla de selección
function renderPokeballs() {
    pokeballGrid.innerHTML = '';
    
    pokeballs.forEach(ball => {
        const item = document.createElement('div');
        item.className = 'pokeball-item';
        item.innerHTML = `
            <img src="../logoOficialPvP1.png" alt="Insignia Tapada" class="hidden-ball">
            <p>?</p>
        `;
        
        item.addEventListener('click', () => claimReward(ball));
        pokeballGrid.appendChild(item);
    });
}

// Revelar premio seleccionado
function claimReward(ball) {
    pokeballGrid.style.display = 'none';
    rewardTitle.innerText = "¡FELICITACIONES AL CAMPEÓN!";
    
    // Asignar imagen (usamos el logo oficial o la pokébola elegida)
    rewardImg.src = "../logoOficialPvP1.png";
    rewardName.innerText = ball.name;
    rewardResult.style.display = 'flex';
    rewardResult.style.flexDirection = 'column';
    rewardResult.style.alignItems = 'center';
}

// Reiniciar torneo
resetBtn.addEventListener('click', () => {
    location.reload(); // Recarga limpia para nuevo torneo
});

// Inicializar grilla
renderPokeballs();