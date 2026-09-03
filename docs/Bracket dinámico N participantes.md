---
tags: [torneo, frontend, bracket, participantes, dinamico]
fecha: 2026-09-04
estado: implementado
relacionado: ["[[00 - Indice Torneo CESMI]]", "[[Frontend - Ruleta Participantes Bracket]]", "[[Fase 1 - Persistencia localStorage]]", "[[Cómo probar]]"]
---

# ⚔️ Bracket dinámico — N participantes (2 a 16)

> [!tldr] Resumen
> Se eliminó el bracket fijo de 5. Ahora el roster es libre (2-16), el sorteo genera seeds en orden, y las llaves se arman solas con rondas y byes (pase directo) hasta coronar campeón.

## 🎯 Problema anterior

Todo estaba hardcodeado a 5: `REQUIRED_PLAYERS` en `js/participants.js:2`, slots `n0..n4` en `js/wheel.js:16`, pasos 1-4 con el "As" especial en `js/tree.js`, y nodos fijos `node-0..4` en `index.html`. Agregar un 6to participante rompía el bracket.

## ✅ Diseño nuevo

- **Seeds:** cada giro de ruleta agrega a `seeds[]` en orden de sorteo (reemplaza `n0..n4`).
- **Rondas:** al terminar el sorteo, `buildBracket(seeds)` arma la Ronda 1 pareando en orden (1v2, 3v4...). Si el conteo es impar, el último recibe **bye** (pase directo, generaliza al viejo "As").
- **Avance:** cada ganador pasa a la ronda siguiente; si vuelve a sobrar uno, otro bye. Cuando queda 1 → campeón.
- **Nombres de ronda:** última = `GRAN FINAL`, anteúltima = `Semifinal`, resto = `Ronda X`. Ejemplos verificados:
  - 2 → Final directa | 3-4 → Semifinal + Final | 5-8 → Ronda 1 + Semifinal + Final | 16 → 4 rondas.
- `tournamentPlayers.champion` se mantiene sincronizado por compatibilidad con `rewards.js`.

## 🔧 Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `js/participants.js` | `MIN_PLAYERS=2`, `MAX_PLAYERS=16`; adiós `REQUIRED_PLAYERS`; hints y contador dinámicos; rama compat que lee `n0..n4` de guardados viejos |
| `js/wheel.js` | `seeds[]` en vez de `n0..n4`; sin nodos fijos (nueva `renderSeedList()` + `escapeHtml`); modal con `Puesto i de N`; botón arena llama a `buildBracket` |
| `js/tree.js` | Reescrito: `buildBracket`, `makeRound` (con byes), `getCurrentMatch`, `setupCurrentVersus`, `selectWinner`, `crownChampion`, `renderBracket`, `randomWinner` |
| `index.html` | Árbol fijo → `<div id="bracketView">`; nuevo panel `Orden de sorteo` (`#seedList`); header de participantes sin `/5` |
| `js/storage.js` | Clave nueva `torneoCESMI_v2` (`{availablePlayers, seeds, bracket, reward}`); `migrateV1()` convierte guardados viejos (conserva seeds, campeón y recompensa; las llaves se regeneran) |
| `js/app.js` | Restore centralizado en `DOMContentLoaded` (antes corría en `wheel.js`, **antes** de que existiera `buildBracket` — bug de orden corregido) |
| `css/styles.css` | `.bracket-rounds`, `.match-card` (estados decided/bye/winner/loser), `.seed-list` |

## ⚠️ Decisiones y límites

- **Migración v1→v2 con torneo a mitad:** se conservan seeds/campeón/recompensa, pero las llaves se regeneran con el motor nuevo (el orden de peleas cambia respecto al viejo flujo del "As"). La v1 queda intacta en `localStorage` hasta reiniciar.
- **Máximo 16:** más porciones vuelven la ruleta ilegible.
- **Mínimo 2:** con 1 no hay torneo.

## 🧪 Verificación

- `node --check` OK en los 6 JS.
- Harness en `bracket-test.js` (temporal): `buildBracket` + `selectWinner(1)` hasta campeón para N = 2,3,4,5,6,7,8,16 → todos coronan y los nombres de ronda son correctos.
