<#
  .SYNOPSIS
    Idempotent dependency bootstrapper for Pavement Performance Suite (PowerShell).

  .USAGE
    pwsh -ExecutionPolicy Bypass -File scripts/install_dependencies.ps1

  .NOTES
    Mirrors the Bash variant for Windows and PowerShell-first developer setups.
#>
[CmdletBinding()]
param(
    [switch]$SkipPlaywright,
    [switch]$SkipPython
)

$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $scriptRoot '..')
Set-Location $projectRoot

Write-Host "[deps] Repository root => $projectRoot" -ForegroundColor Cyan

if (Get-Command corepack -ErrorAction SilentlyContinue) {
    Write-Host "[deps] Enabling Corepack" -ForegroundColor DarkCyan
    try { corepack enable | Out-Null } catch { }
}

function Invoke-NodeInstall {
    if ((Test-Path "pnpm-lock.yaml") -and (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Host "[deps] Installing via pnpm (lockfile detected)" -ForegroundColor Cyan
        pnpm install --frozen-lockfile
        return
    }

    if ((Test-Path "bun.lockb") -and (Get-Command bun -ErrorAction SilentlyContinue)) {
        Write-Host "[deps] Installing via bun (lockfile detected)" -ForegroundColor Cyan
        bun install
        return
    }

    if ((Test-Path "yarn.lock") -and (Get-Command yarn -ErrorAction SilentlyContinue)) {
        Write-Host "[deps] Installing via yarn (lockfile detected)" -ForegroundColor Cyan
        yarn install --immutable
        return
    }

    if (Get-Command npm -ErrorAction SilentlyContinue) {
        Write-Host "[deps] Installing via npm (legacy peer deps)" -ForegroundColor Cyan
        npm install --legacy-peer-deps
        return
    }
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        Write-Host "[deps] Installing via pnpm (no lockfile; flexible install)" -ForegroundColor Cyan
        pnpm install --no-frozen-lockfile
        return
    }

    throw "No supported Node.js package manager detected. Install npm, pnpm, yarn, or bun."
}

function Invoke-PythonInstall {
    if ($SkipPython) { return }
    if ((Get-Command python -ErrorAction SilentlyContinue) -and (Get-Command pip -ErrorAction SilentlyContinue)) {
        if (Test-Path "ml/pyproject.toml") {
            Write-Host "[deps] Installing ML toolkit (editable)" -ForegroundColor Cyan
            try { python -m pip install --upgrade pip | Out-Null } catch { }
            python -m pip install -e ./ml
        }
    }
}

function Test-SupabaseCli {
    if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
        Write-Warning "[deps] npx unavailable; skipping Supabase CLI validation"
        return
    }

    Write-Host "[deps] Validating Supabase CLI availability" -ForegroundColor Cyan
    try {
        npx --yes supabase --version | Out-Null
    }
    catch {
        Write-Warning "[deps] Supabase CLI not found via npx; installing local dev dependency"
        try { npm install --save-dev supabase | Out-Null } catch { Write-Warning "[deps] Failed to install Supabase CLI: $($_.Exception.Message)" }
    }
}

function Invoke-VerifyEnvBlueprint {
    if (-not (Get-Command npx -ErrorAction SilentlyContinue)) { return }
    Write-Host "[deps] Verifying environment blueprint (.env.example)" -ForegroundColor Cyan
    try {
        npx --yes tsx scripts/verify-env.ts --file .env.example --allow-vault-placeholders | Out-Null
    } catch {
        Write-Warning "[deps] Environment blueprint verification reported issues. Review .env.example and rerun `npm run env:verify`."
    }
}

Write-Host "[deps] Installing Node dependencies" -ForegroundColor Cyan
Invoke-NodeInstall

Write-Host "[deps] Installing Python dependencies" -ForegroundColor Cyan
Invoke-PythonInstall

Test-SupabaseCli

if (-not $SkipPlaywright) {
    if (Get-Command npx -ErrorAction SilentlyContinue) {
        Write-Host "[deps] Installing Playwright browsers" -ForegroundColor Cyan
        try { npx playwright install --with-deps | Out-Null } catch { }
    }
}

Write-Host "[deps] Syncing tactical design assets" -ForegroundColor Cyan
try {
    if (Get-Command npx -ErrorAction SilentlyContinue) {
        npx --yes tsx scripts/sync_assets.ts | Out-Null
    }
    elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        npm run setup:assets --if-present | Out-Null
    }
    elseif (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm run setup:assets | Out-Null
    }
} catch {
    Write-Warning "[deps] Tactical asset sync skipped: $_"
}

if (Test-Path ".husky") {
    Write-Host "[deps] Initializing Husky hooks" -ForegroundColor Cyan
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        try { npm run prepare | Out-Null } catch { npx husky install | Out-Null }
    }
    elseif (Get-Command npx -ErrorAction SilentlyContinue) {
        try { npx husky install | Out-Null } catch { }
    }
}

Invoke-VerifyEnvBlueprint

Write-Host "[deps] Dependency setup complete" -ForegroundColor Green
