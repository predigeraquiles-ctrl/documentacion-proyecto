---
tags: [torneo, frontend, ruleta, participantes, bracket]
fecha: 2026-09-03
estado: implementado
relacionado: ["[[00 - Indice Torneo CESMI]]", "[[Fase 1 - Persistencia localStorage]]", "[[Cómo probar]]"]
---

# 🎨 Módulos Frontend — Ruleta, Participantes y Bracket

> [!tldr] Resumen
> Interfaz 100% lista antes del backend: modal de sorteo, gestión de participantes con `localStorage` y bracket 1v1 con ganador manual o aleatorio.

## 1. 🎰 Ruleta interactiva

**Archivos:** `index.html` (sección `view-draw`), `js/wheel.js`, `css/styles.css`

- Animación de giro existente (`spin()` con `requestAnimationFrame` + `easeOut`, 2800 ms) + nuevo brillo durante el giro (`.wheel-container.spinning #wheel` con `wheelGlow`).
- Validación: si la lista no tiene exactamente 5, `spin()` bloquea con `alert`.
- Lógica aleatoria en `determineWinner()`: calcula el índice bajo el puntero y asigna a `tournamentPlayers.n0..n4`.
- **Nuevo modal** `#drawModal`:
  - `showDrawModal(name, slot, isLast)` — muestra nombre + puesto (`P1-A … As`).
  - Si es el último sorteo muestra `¡Cuadro completo!` + botón `⚔️ Ir a la Arena`.
  - `hideDrawModal()` — cierra con botón Continuar o click fuera.
  - Progreso visible: `#drawProgress` (`Sorteados: X / 5`).

## 2. 👥 Gestión de participantes

**Archivos:** `js/participants.js` (NUEVO), `index.html` (`.participants-panel`), `js/storage.js`

| Función | Qué hace |
|---------|----------|
| `renderPlayerList()` | Pinta la lista, contador `X/5`, bloquea edición si `isDrawStarted()`, muestra sorteados como `✓ nombre` solo lectura |
| `addPlayer(name)` | Valida: no vacío, no duplicado (case-insensitive), máximo 5, bloqueado si el sorteo empezó |
| `removePlayer(name)` | Quita de `availablePlayers`, redibuja ruleta, guarda |
| `isDrawStarted()` | `currentSlotIndex > 0` o ya existe `tournamentPlayers.n0` |
| `updateSpinAvailability()` | Habilita `spinBtn` solo con 5 participantes |

- Persistencia: cada alta/baja llama a `saveState()` → misma clave `torneoCESMI_v1`. Al recargar, `restoreUIFromState()` + `renderPlayerList()` reponen todo.
- Límite de diseño: el bracket está hecho para **exactamente 5** (`n0..n4` + llaves fijas). Por eso el formulario exige 5/5 para girar.

> [!warning] Decisión
> Si se quiere bracket de 4/8/16, hay que reescribir `tree.js` con bracket dinámico. Por ahora 5 fijos.

## 3. ⚔️ Torneo y llaves (bracket visual)

**Archivos:** `index.html` (sección `view-arena`), `js/tree.js`

- Vista 1v1 generada tras la ruleta: `startTournamentBtn` → `setupVersus("Pelea 1", n0, n1)`.
- Flujo: `Pelea 1 → Cruce Retador Impar (vs As) → Pelea 2 → GRAN FINAL → campeón`.
- **Manual:** click en `btn-f1` / `btn-f2` → `selectWinner(1|2)`, marca `loser` al perdedor, avanza `currentStep`, autoguardado.
- **Automático (nuevo):** botón `🎲 Ganador aleatorio` → `randomWinner()` elige 1 o 2 al azar con delay de 500 ms para efecto dado.
- **Nuevo hint** `#roundHint`: explica cada ronda (`setupVersus` lo actualiza).

## 🔧 Archivos tocados (2026-09-03)

- `index.html` — panel participantes, `#drawModal`, `#drawProgress`, `#roundHint`, `#randomWinnerBtn`, `<script js/participants.js>`
- `js/wheel.js` — validación 5 jugadores, clase `spinning`, `showDrawModal/hideDrawModal`, hooks a `renderPlayerList/updateSpinAvailability`
- `js/participants.js` — NUEVO
- `js/tree.js` — `randomWinner()`, hints por ronda
- `js/storage.js` — `restoreUIFromState` ahora refresca lista y spin
- `css/styles.css` — `.panel`, `.player-list`, `.modal-overlay/card`, `.btn-random`, `.wheelGlow`

## 🧪 Probar

Ver [[Cómo probar#Frontend — ruleta, participantes y bracket]].

## 🛠️ Fix layout sorteo (2026-09-04)

- **Problema:** `view-draw` era una sola columna (participantes → ruleta → seeds → botones). Al agregar participantes la lista empujaba la ruleta y el botón `Girar Ruleta` se iba para abajo, lejos de la ruleta.
- **Qué cambió:** `index.html` agrupa en `.draw-layout` de 2 columnas: `.draw-panels` (participantes + orden de sorteo) y `.draw-stage` (ruleta + `#drawProgress` + `.wheel-actions` con `spinBtn`/`startTournamentBtn`). `css/styles.css` suma flex + `position: sticky` en desktop y apila con ruleta primero (`order: -1`) en móvil. Listas con `max-height` + scroll para que no estiren la página.
- **Archivos:** `index.html`, `css/styles.css`
- **Probar:** agregar 10-16 participantes, verificar que la ruleta y Girar quedan fijos al lado; achicar a <768px y verificar que ruleta + botón quedan arriba.
