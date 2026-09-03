---
tags: [torneo, fase-2, plan, supabase]
fecha: 2026-09-03
estado: planificado
relacionado: ["[[00 - Indice Torneo CESMI]]", "[[Fase 1 - Persistencia localStorage]]"]
---

# 🌐 Fase 2 — Supabase y modo espectador (plan)

> [!note] Pendiente
> Esta fase aún no está implementada. Es el plan acordado: gestión tuya + vista en vivo para jugadores.

## Objetivo

- Vos gestionás desde tu PC (admin).
- Jugadores ven el progreso desde sus celulares (espectador, solo lectura, realtime).
- El torneo no depende de tu navegador: vive en la nube.

## Esquema propuesto (1 tabla para empezar)

```sql
create table tournaments (
  id uuid default gen_random_uuid() primary key,
  name text default 'Torneo CESMI PvP 1',
  status text default 'en_curso',
  data jsonb,          -- mismo objeto de Fase 1: tournamentPlayers + step + reward
  champion text,
  created_at timestamp default now()
);
```

## Pasos

1. [ ] Crear proyecto gratis en supabase.com
2. [ ] Crear tabla `tournaments` con el SQL de arriba
3. [ ] Activar RLS: lectura pública, escritura solo admin
4. [ ] Crear `js/db.js` con cliente Supabase + funciones `pushState()` / `subscribeState()`
5. [ ] Llamar `pushState()` donde hoy se llama `saveState()`
6. [ ] Modo URL: `?admin=1` gestiona, sin parámetro solo mira
7. [ ] Publicar en Vercel / Netlify / GitHub Pages y pasar el link

## Reutiliza Fase 1

El objeto guardado en `localStorage` es el mismo que irá en la columna `data jsonb`. La migración es directa.
