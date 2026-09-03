---
tags: [torneo, decisiones, arquitectura]
fecha: 2026-09-03
relacionado: ["[[00 - Indice Torneo CESMI]]"]
---

# 🧠 Decisiones técnicas

## ¿Por qué localStorage primero y no base de datos directa?

| Opción | Costo | Requiere internet | Visible para otros | Esfuerzo |
|--------|-------|-------------------|--------------------|----------|
| localStorage (Fase 1) | 0 | No | No, solo tu PC | 30 min |
| Supabase (Fase 2) | 0 (free tier) | Sí | Sí, realtime | 2-3 hs |
| Servidor propio | Hosting + mantenimiento | Sí | Sí | Días |

Decisión: **Fase 1 primero** porque el dolor inmediato era perder el torneo al recargar. Fase 2 después para el modo espectador.

## ¿Por qué `js/storage.js` sin módulos?

El proyecto usa `<script>` clásicos sin `type="module"`. Para no reescribir todo, `storage.js` expone funciones en `window.*`. Simple y compatible.

## ¿Por qué una sola clave `torneoCESMI_v1`?

- El torneo actual es un solo objeto (`tournamentPlayers` + `currentStep`).
- Versionar la clave (`_v1`) permite migrar el formato en el futuro sin romper nada.
- En Fase 2 ese mismo objeto se guarda como `jsonb` en Postgres → migración trivial.

## ¿Por qué `confirm()` para reiniciar?

Evita borrados accidentales en vivo frente a los jugadores. Es feo pero efectivo; a futuro se puede reemplazar por un modal propio.
