---
tags: [torneo, testing, checklist]
fecha: 2026-09-03
relacionado: ["[[Fase 1 - Persistencia localStorage]]", "[[Frontend - Ruleta Participantes Bracket]]"]
---

# 🧪 Cómo probar

Checklist manual para validar la [[Fase 1 - Persistencia localStorage|Fase 1]] y los [[Frontend - Ruleta Participantes Bracket|módulos frontend]]. Marcar con `x` en Obsidian (`- [x]`).

## Fase 1

- [x] Abrir `index.html`, girar ruleta 2-3 veces
- [ ] Recargar con F5 → nombres en `node-0`, `node-1` siguen, ruleta con menos porciones
- [x] Ver `● Guardado automático HH:MM:SS` en la barra superior
- [x] Completar hasta campeón → elegir Pokébola → recargar → sigue `¡INSIGNIA RECLAMADA!`
- [x] Botón `↺ Reiniciar` → pide confirmación → vuelve a cero
- [x] Abrir DevTools → Application → Local Storage → existe clave `torneoCESMI_v1`
- [x] Corromper el valor a mano (ej. escribir `xxx`) → recargar → la app arranca de cero sin romperse

## Frontend — ruleta, participantes y bracket

- [ ] Borrar guardado (`↺ Reiniciar`), agregar un 6to nombre → bloquea con aviso de bracket de 5
- [ ] Quitar un nombre → contador `4/5`, `spinBtn` deshabilitado con tooltip
- [ ] Agregar duplicado (ej. `nacho` existiendo `Nacho`) → aviso de duplicado
- [ ] Con 5/5 → girar → aparece modal `¡Sorteado!` con nombre + puesto → Continuar
- [ ] En el último sorteo → modal `¡Cuadro completo!` + botón `⚔️ Ir a la Arena` → lleva a `view-arena` con `Pelea 1`
- [ ] Recargar a mitad del sorteo → lista bloqueada con hint "Sorteo en curso", sorteados como `✓ nombre`
- [ ] En arena → click manual en un luchador avanza la llave y marca `loser` al otro
- [ ] Botón `🎲 Ganador aleatorio` → avanza solo tras ~500 ms
- [ ] Completar hasta campeón → `GRAN FINAL` → recompensa

## Para compañeros no técnicos

1. Abrí la página.
2. Jugá un poco.
3. Recargá. Si sigue todo igual, funciona.
4. Si algo se ve raro, botón `↺ Reiniciar` y avisar.
