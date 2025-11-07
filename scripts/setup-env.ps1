# Pavement Performance Suite Environment Bootstrap (PowerShell)
# ------------------------------------------------------------------
# This script materializes developer-friendly environment files by copying
# the curated blueprint (.env.example), optionally hydrating secrets from
# a configured secrets manager, and verifying the resulting configuration.

[CmdletBinding()]
param(
    [ValidateSet("development", "test", "staging", "production")]
    [string]$Environment = "development",

    [switch]$SkipVerify,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

Write-Host "Pavement Performance Suite :: Environment Bootstrap" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

$targetFile = if ($Environment -eq "development") { ".env.local" } else { ".env.$Environment" }
$exampleFile = ".env.example"

if (-not (Test-Path $exampleFile)) {
    throw "Blueprint file '$exampleFile' is missing. Run git pull or regenerate Phase 2 assets."
}

if (Test-Path $targetFile) {
    Write-Host "Existing $targetFile detected. It will be updated in-place." -ForegroundColor Yellow
} else {
    Write-Host "Creating $targetFile from $exampleFile" -ForegroundColor Cyan
    if (-not $DryRun) {
        Copy-Item $exampleFile $targetFile
    }
}

if ($DryRun) {
    Write-Host "[dry-run] No changes were written. Inspect $targetFile manually if needed." -ForegroundColor Yellow
    return
}

# Stamp the environment values
(Get-Content $targetFile) | ForEach-Object {
    $_ -replace '^ENVIRONMENT=.*$', "ENVIRONMENT=$Environment" `
       -replace '^NODE_ENV=.*$', "NODE_ENV=$Environment" `
       -replace '^VITE_APP_ENV=.*$', "VITE_APP_ENV=$Environment"
} | Set-Content $targetFile

Write-Host "Blueprint copied. To hydrate secrets, run your chosen vault tooling:" -ForegroundColor Cyan
Write-Host "  aws secretsmanager get-secret-value --secret-id pps/app/$Environment ..." -ForegroundColor DarkCyan
Write-Host "  doppler secrets download --project pavement-performance-suite --config $Environment" -ForegroundColor DarkCyan

if (-not $SkipVerify) {
    if (Get-Command npx -ErrorAction SilentlyContinue) {
        Write-Host "Verifying $targetFile with scripts/verify-env.ts" -ForegroundColor Cyan
        try {
            npx --yes tsx scripts/verify-env.ts --file $targetFile --allow-vault-placeholders | Out-Null
            Write-Host "$targetFile passed verification." -ForegroundColor Green
        } catch {
            Write-Warning "$targetFile failed verification. Address the reported issues above."
        }
    } else {
        Write-Warning "npx not available; skipping verification. Run `npm run env:verify -- --file $targetFile` after installing dependencies."
    }
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Pull secrets from your vault provider into $targetFile." -ForegroundColor White
Write-Host "  2. Run scripts/install_dependencies.ps1 to install toolchains." -ForegroundColor White
Write-Host "  3. Execute npm run db:migrate && npm run db:seed once Supabase is running." -ForegroundColor White
Write-Host "  4. Launch the dev server (npm run dev) and refresh your existing browser session." -ForegroundColor White
