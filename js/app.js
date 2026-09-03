function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.dataset.view === viewId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

window.switchView = switchView;

const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const viewId = btn.dataset.view;
        if (!viewId) return; // botones sin vista (ej: Soporte) tienen su propio handler
        switchView(viewId);
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });
});

// Restore centralizado: corre último, con todos los módulos cargados
// (storage, db, wheel, participants, tree, rewards).
window.addEventListener("DOMContentLoaded", () => {
    const saved = window.loadState && window.loadState();
    const defaultLen = (window.DEFAULT_PLAYERS || []).length;
    const hasProgress = saved && (
        (saved.seeds && saved.seeds.length) ||
        (saved.bracket && (saved.bracket.rounds?.length || saved.bracket.champion)) ||
        (saved.availablePlayers && saved.availablePlayers.length !== defaultLen)
    );
    if (hasProgress) {
        window.restoreUIFromState(saved);
    } else {
        window.updateSaveIndicator && window.updateSaveIndicator();
        window.renderBracket && window.renderBracket();
    }
    // Fase 2: si hay nube configurada, traer lo último y suscribirse.
    // Si la nube es más nueva, pisa lo local (last-write-wins).
    if (window.cloudConfigured && window.cloudConfigured()) {
        window.CloudPull && window.CloudPull();
        window.CloudSubscribe && window.CloudSubscribe();
    } else {
        const el = document.getElementById("cloudStatus");
        if (el) el.textContent = "☁️ solo local (falta ANON_KEY)";
    }

    // Soporte: modal FAQ (botón en sidebar, sin data-view)
    const btnSoporte = document.getElementById('btnSoporte');
    const modalSoporte = document.getElementById('modalSoporte');
    const btnCerrarSoporte = document.getElementById('btnCerrarSoporte');
    if (btnSoporte && modalSoporte && btnCerrarSoporte) {
        // Abrir el modal de soporte
        btnSoporte.addEventListener('click', (e) => {
            e.preventDefault();
            modalSoporte.style.display = 'flex';
            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });

        // Cerrar con el botón de la X
        btnCerrarSoporte.addEventListener('click', () => {
            modalSoporte.style.display = 'none';
        });

        // Cerrar haciendo clic fuera del contenido
        window.addEventListener('click', (e) => {
            if (e.target === modalSoporte) {
                modalSoporte.style.display = 'none';
            }
        });
    }
});