# Setup automático para compañeros — Torneo CESMI
# Qué hace solo: verifica Git, clona o actualiza el repo, y verifica la sincronización.
# Uso: pegarle este archivo a la IA de tu PC y decirle "guardalo como setup-companero.ps1 y ejecutalo".
# Si Git pide contraseña, usar un Personal Access Token (GitHub → Settings → Developer settings → Tokens classic, scope "repo").

$ErrorActionPreference = "Stop"
$RepoUrl = "https://github.com/predigeraquiles-ctrl/documentacion-proyecto.git"
$Destino = Join-Path ([Environment]::GetFolderPath("MyDocuments")) "TORNEO\documentacion-proyecto"

Write-Host "=== Setup Torneo CESMI ===" -ForegroundColor Cyan

# 1. Verificar Git
try {
    $gitVer = git --version 2>$null
    Write-Host "OK Git: $gitVer" -ForegroundColor Green
} catch {
    Write-Host "NO tenes Git instalado." -ForegroundColor Red
    Write-Host "Instalalo desde https://git-scm.com/download/win y volve a correr este script." -ForegroundColor Yellow
    Start-Process "https://git-scm.com/download/win"
    exit 1
}

# 2. Clonar o actualizar
if (Test-Path (Join-Path $Destino ".git")) {
    Write-Host "El repo ya existe, actualizando..." -ForegroundColor Cyan
    git -C $Destino pull origin main
} else {
    $padre = Split-Path $Destino -Parent
    if (-not (Test-Path $padre)) { New-Item -ItemType Directory -Force -Path $padre | Out-Null }
    Write-Host "Clonando en $Destino ..." -ForegroundColor Cyan
    git clone $RepoUrl $Destino
}

# 3. Verificar que llegó todo
Set-Location $Destino
git log --oneline -3
$trampa = Join-Path $Destino "docs\Prueba de sincronización.md"
if (Test-Path $trampa) {
    Write-Host "OK: ves la nota trampa, el pull funciona." -ForegroundColor Green
} else {
    Write-Host "FALLO: no se ve docs/Prueba de sincronización.md. Avisale al equipo." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Te falta solo lo manual (2 min) ===" -ForegroundColor Cyan
Write-Host "1. Abri Obsidian → Open vault → $Destino"
Write-Host "2. Activa Community plugins si lo pide. El plugin Obsidian Git ya viene instalado, dejalo en ON."
Write-Host "3. Settings → Obsidian Git: Pull on startup ON, Push after commit ON, auto cada 10 min, push al cerrar ON."
Write-Host "4. Firma la nota trampa con tu nombre y hora, Ctrl+P → 'Obsidian Git: Commit all changes' → Push."
Write-Host "Listo. Avisale al equipo que terminaste."
