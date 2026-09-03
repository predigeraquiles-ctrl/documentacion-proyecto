---
tags: [torneo, git, github, obsidian, workflow]
fecha: 2026-09-03
estado: guia
relacionado: ["[[00 - Indice Torneo CESMI]]"]
---

# 🔀 Git y GitHub con Obsidian Git

> [!tldr] Resumen
> La carpeta `docs/` vive dentro del mismo repo (`ruletaTorneoPoke`, remote `origin`). Con el plugin **Obsidian Git** la bóveda se sincroniza sola a un repo privado de GitHub al abrir/cerrar Obsidian.

## 1. Situación actual (2026-09-03)

- Repo local: `ruletaTorneoPoke`, rama `main`, remote `origin → https://github.com/FacundoFranco18/ruletaTorneoPoke.git`
- Sin `docs/` commiteado aún: `docs/`, `js/storage.js`, `js/participants.js` están como `??` (untracked), más `M` en `index.html`, `js/*`, `css/*`.
- Sin `.gitignore`.

## 2. Crear el repositorio privado en GitHub

Si usás el **mismo repo del proyecto** (recomendado, ya existe):

1. Nada que crear: ya tenés `origin`. Si lo querés privado: GitHub → repo → Settings → General → Danger Zone → Change visibility → Private.

Si querés una **bóveda separada solo para docs**:

1. GitHub → New repository → nombre ej. `torneo-cesmi-docs` → **Private** → sin README → Create.
2. Copiá la URL HTTPS.

## 3. Instalar el plugin Obsidian Git

> [!done] Pre-instalado por el asistente (2026-09-03)
> Versión **2.39.0** descargada del release oficial en `.obsidian/plugins/obsidian-git/` (`main.js`, `manifest.json`, `styles.css`) y activada en `.obsidian/community-plugins.json`. Al abrir el vault en Obsidian el plugin ya aparece — solo falta habilitarlo si Obsidian lo pide y configurar el auto-sync del punto 5.
> Instalación manual alternativa: Settings (⚙️) → Community plugins → Turn on → Browse → buscar **Obsidian Git** → Install → Enable.

## 4. Vincular la bóveda al repo

**Caso A — vault = carpeta del proyecto (recomendado):**

```bash
git status --short --branch   # verificar que estás en ruletaTorneoPoke
git remote -v                 # debe mostrar origin
```

Ya está vinculado. Solo falta commitear `docs/` (ver punto 6).

**Caso B — vault separado:**

```bash
git remote add origin https://github.com/TU_USUARIO/torneo-cesmi-docs.git
git branch -M main
git push -u origin main
```

Autenticación HTTPS: usá un **Personal Access Token** (GitHub → Settings → Developer settings → PAT classic con scope `repo`) como contraseña. O mejor:

```bash
gh auth login
```

## 5. Configurar auto-pull / auto-push en Obsidian Git

Settings → **Obsidian Git**:

| Opción | Valor sugerido |
|--------|----------------|
| Pull updates on startup | ✅ ON |
| Push after commit | ✅ ON |
| Auto commit + push cada X min | `10` min, mensaje `vault backup: {{date}}` |
| Auto pull + push on window close / Obsidian close | ✅ ON |
| Commit message on manual commit | `docs: {{date}} - {{files}}` |

Flujo resultante: abrís Obsidian → pull automático → editás → cada 10 min o al cerrar → commit + push solos.

> [!warning] No edites lo mismo en dos PCs sin sincronizar
> Si hay conflicto, Obsidian Git lo marca. Resolver: abrir terminal → `git status` → editar el archivo en conflicto → `git add` → commit desde el plugin (icono Git → Commit).

## 6. Primer commit de `docs/` (pendiente)

Desde terminal en `ruletaTorneoPoke`:

```bash
git add docs/ js/storage.js js/participants.js index.html js/wheel.js js/tree.js js/rewards.js css/styles.css
git status --short
git commit -m "docs: suma documentacion Obsidian + frontend ruleta/participantes/bracket"
git push origin main
```

## 7. `.gitignore` sugerido para Obsidian

Crear `.gitignore` en la raíz:

```gitignore
.obsidian/workspace.json
.obsidian/hotkeys.json
.obsidian/workspaces.json
.trash/
.DS_Store
Thumbs.db
```

El resto de `.obsidian/` (plugins, appearance) **sí** se commitea para que tus compañeros tengan la misma config.

## 8. Para tus compañeros

1. Instalar Obsidian + abrir el repo clonado como vault.
2. Instalar y activar Obsidian Git (el plugin ya viene listado en `.obsidian/community-plugins.json` si lo commiteaste).
3. Hacer pull al abrir, push al cerrar. Listo.

## 🔗 Referencias

- Plugin: Obsidian Community → `Obsidian Git` por denoleth.
- Estado del repo: `git status --short --branch`, `git remote -v`.
