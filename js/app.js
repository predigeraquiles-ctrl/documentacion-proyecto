// CONTROLADOR DE NAVEGACIÓN Y DASHBOARD
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const navButtons = document.querySelectorAll('.nav-btn');
    const viewSections = document.querySelectorAll('.view-section');

    // 1. Abrir/Cerrar Sidebar Hamburguesa
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // 2. Cerrar sidebar si se hace clic afuera en pantallas chicas
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    // 3. Cambiar de Vista (Pestañas)
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetView = button.getAttribute('data-view');

            // Actualizar botones activos
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Mostrar sección seleccionada
            viewSections.forEach(section => {
                if (section.id === targetView) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });

            // Cerrar menú en móvil tras seleccionar
            sidebar.classList.remove('open');
        });
    });
});