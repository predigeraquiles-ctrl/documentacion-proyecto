---
aliases: [Torneo CESMI, Ruleta Torneo Poke]
tags: [torneo, indice, cesmi]
fecha: 2026-09-03
estado: en-curso
---

# 🎰 Torneo Pokémon CESMI — Índice

Documentación viva del proyecto para compartir con los compañeros.
Cada modificación del código **debe** venir con su nota en esta carpeta.

## 🗺️ Mapa

- [[Fase 1 - Persistencia localStorage]] — autoguardado, restauración, reinicio controlado (2026-09-03)
- [[Frontend - Ruleta Participantes Bracket]] — modal sorteo, gestión participantes, ganador manual/aleatorio (2026-09-03)
- [[Git y GitHub con Obsidian Git]] — vincular bóveda a repo privado + auto-sync (2026-09-03)
- [[Fase 2 - Supabase y modo espectador]] — plan pendiente: tabla `tournaments`, realtime, link público
- [[Decisiones técnicas]] — por qué localStorage primero, por qué Supabase después
- [[Cómo probar]] — checklist manual para validar cada fase

## 🧩 Estado actual del sistema

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| Sorteo | `js/wheel.js` | Ruleta, `tournamentPlayers.n0..n4` |
| Llaves | `js/tree.js` | `currentStep` 1-4, finalistas, campeón |
| Premio | `js/rewards.js` | Pokébola elegida (`window._selectedReward`) |
| Persistencia | `js/storage.js` | `saveState / loadState / clearState / restoreUIFromState` |
| Navegación | `js/app.js` | `switchView` |
| UI | `index.html`, `css/styles.css` | Barra `.save-bar`, `#saveStatus`, `#resetBtn` |

## 📏 Regla de trabajo

> [!important] Regla Obsidian
> Cada vez que se modifique código, crear o actualizar la nota correspondiente en `docs/` con: **qué cambió, por qué, archivos tocados y cómo probarlo**. Enlazar con `[[wikilinks]]`.

## 📝 Changelog

- **2026-09-03** — [[Fase 1 - Persistencia localStorage|Fase 1]] implementada.
- **2026-09-03** — [[Frontend - Ruleta Participantes Bracket|Módulos frontend]] implementados.
