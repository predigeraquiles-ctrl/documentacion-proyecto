---
tags: [torneo, fase-2, plan, supabase]
fecha: 2026-09-03
estado: en-curso
relacionado: ["[[00 - Indice Torneo CESMI]]", "[[Fase 1 - Persistencia localStorage]]"]
---

# 🌐 Fase 2 — Supabase y modo espectador (todo editable)

> [!note] En curso
> Implementado espejo a nube con realtime, sin bloqueo (decisión 2026-09-04: todo editable, last-write-wins).

## Objetivo

- El torneo vive en la nube (`tournaments.data` jsonb, formato v2).
- Todos los que abren el link ven y pueden editar; los cambios llegan en vivo (realtime + polling 8s).
- Sin nube configurada, la app sigue 100% local (Fase 1).

## Proyecto

- URL: `https://kuuwrdsleoavonpkzhqi.supabase.co`
- Tabla: `tournaments` (endpoint `/rest/v1/tournaments`)
- Clave: `js/db.js` → `SUPABASE_ANON_KEY` (**falta pegarla**: Dashboard > Project Settings > API > anon public).

## Esquema v2 (tabla propia)

> 2026-09-04: la `tournaments` existente era de otra herramienta (solo `id bigint` + `created_at`, sin `data`). Se usa tabla propia `torneo_estado`.

```sql
create table if not exists torneo_estado (
  id uuid default gen_random_uuid() primary key,
  name text default 'Torneo CESMI PvP 1',
  status text default 'en_curso',
  data jsonb,          -- formato v2: availablePlayers + seeds + bracket + reward + updatedAt
  champion text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Realtime para el canal postgres_changes
alter publication supabase_realtime add table torneo_estado;

-- RLS modo todo-editable (torneo entre amigos)
alter table torneo_estado enable row level security;
drop policy if exists "lectura publica" on torneo_estado;
create policy "lectura publica" on torneo_estado for select using (true);
drop policy if exists "insert publico" on torneo_estado;
create policy "insert publico" on torneo_estado for insert with check (true);
drop policy if exists "update publico" on torneo_estado;
create policy "update publico" on torneo_estado for update using (true) with check (true);
```

## Implementación (2026-09-04)

- `js/db.js` (NUEVO): `getClient/queuePush/pushState/pullOnce/subscribeState/ensureRow`, debounce 800ms, flag `_applyingRemote` anti-loops, `TOURNAMENT_ID` por `?torneo=` o primera fila (autocrea si no hay).
- `js/storage.js`: `saveState()` llama a `window.CloudPush()` después de guardar local.
- `js/app.js`: al arrancar hace `CloudPull()` + `CloudSubscribe()`; sin clave muestra `☁️ solo local`.
- `index.html`: CDN `@supabase/supabase-js@2` + `js/db.js` + `<span id="cloudStatus">` en la save-bar.
- `css/styles.css`: estilo `#cloudStatus`.

## Pasos

1. [x] Crear proyecto gratis en supabase.com
2. [x] Crear tabla `tournaments` con el SQL de arriba
3. [x] Activar RLS: lectura pública, escritura solo admin
4. [x] Crear `js/db.js` con cliente Supabase + funciones `pushState()` / `subscribeState()`
5. [x] Llamar `pushState()` donde hoy se llama `saveState()`
6. [ ] Pegar `SUPABASE_ANON_KEY` en `js/db.js` y probar: abrir 2 navegadores, girar en uno, ver en el otro (<8s)
7. [ ] Publicar en Vercel / Netlify / GitHub Pages y pasar el link

## Reutiliza Fase 1

El objeto guardado en `localStorage` (`torneoCESMI_v2`) es el mismo que va en `data jsonb`. Se compara por `updatedAt` (last-write-wins).

## 🛠️ Reset con nube (2026-09-04)

- **Bug:** Reiniciar solo borraba `localStorage`; al recargar, el pull traía el sorteo viejo de la nube y la lista quedaba bloqueada.
- **Fix:** `doReset()` en `js/rewards.js` pisa local con `getInitialState()` y llama a `CloudReset()` (`js/db.js`) que hace update de la fila con el estado fresco antes del `reload`. Así todas las PCs reciben el torneo en cero por realtime.
