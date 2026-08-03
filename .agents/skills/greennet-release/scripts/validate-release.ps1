param(
    [string]$RepoPath = (Get-Location).Path
)

$ErrorActionPreference = 'Continue'
Set-Location $RepoPath
$failures = 0

function Check($Condition, $Message) {
    if ($Condition) {
        Write-Host "PASS  $Message" -ForegroundColor Green
    } else {
        Write-Host "FAIL  $Message" -ForegroundColor Red
        $script:failures++
    }
}

Write-Host "== GreenNet supplemental release validation ==" -ForegroundColor Cyan

Check (Test-Path 'README.md') 'README.md exists'
Check (Test-Path 'HANDOVER.md') 'HANDOVER.md exists'
Check (Test-Path '.env.example') '.env.example exists'
Check (Test-Path 'CLIENT_APPROVAL_CHECKLIST.md') 'CLIENT_APPROVAL_CHECKLIST.md exists'
Check (Test-Path 'RELEASE_CHECKLIST.md') 'RELEASE_CHECKLIST.md exists'

$sourceFiles = Get-ChildItem -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx,*.md,*.html,*.json -ErrorAction SilentlyContinue |
    Where-Object {
        $_.FullName -notmatch '[\\/](node_modules|\.next|dist|build|coverage|\.git|\.agents|tests|test-results|playwright-report|artifacts|legacy-demo)[\\/]'
    }

$placeholderMatches = $sourceFiles | Select-String -Pattern 'lorem ipsum|\[insert|example\.com|TODO: public|FIXME: public' -CaseSensitive:$false -ErrorAction SilentlyContinue
Check (-not $placeholderMatches) 'No obvious public placeholder text found'
if ($placeholderMatches) { $placeholderMatches | Select-Object Path,LineNumber,Line }

$secretMatches = $sourceFiles | Select-String -Pattern '(?i)(service_role|private_key|secret_key)\s*[:=]\s*["''][^"'']{8,}' -ErrorAction SilentlyContinue
Check (-not $secretMatches) 'No obvious hard-coded secret patterns found'
if ($secretMatches) { $secretMatches | Select-Object Path,LineNumber,Line }

if (Test-Path package.json) {
    $package = Get-Content package.json -Raw | ConvertFrom-Json
    Check ($null -ne $package.scripts) 'package.json contains scripts'
    if ($package.scripts) {
        Write-Host "Available scripts:" -ForegroundColor Yellow
        $package.scripts.PSObject.Properties | Sort-Object Name | ForEach-Object { "  $($_.Name)" }
    }
}

Write-Host "`nSupplemental validation failures: $failures" -ForegroundColor Cyan
if ($failures -gt 0) { exit 1 }
