param(
    [string]$RepoPath = (Get-Location).Path
)

$ErrorActionPreference = 'Stop'
Set-Location $RepoPath

Write-Host "== GreenNet repository audit ==" -ForegroundColor Cyan
Write-Host "Path: $((Get-Location).Path)"

if (Test-Path .git) {
    Write-Host "`n-- Git --" -ForegroundColor Yellow
    git branch --show-current
    git status --short
    git log -1 --oneline
} else {
    Write-Warning "No .git directory found at this path."
}

Write-Host "`n-- Project manifests --" -ForegroundColor Yellow
Get-ChildItem -Force -File -Include package.json,pnpm-lock.yaml,yarn.lock,package-lock.json,bun.lockb,deno.json,pyproject.toml,requirements.txt,Cargo.toml,go.mod -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty Name

if (Test-Path package.json) {
    Write-Host "`n-- Package scripts --" -ForegroundColor Yellow
    $package = Get-Content package.json -Raw | ConvertFrom-Json
    if ($package.scripts) {
        $package.scripts.PSObject.Properties | Sort-Object Name | ForEach-Object {
            "{0}: {1}" -f $_.Name, $_.Value
        }
    }
}

Write-Host "`n-- Environment files --" -ForegroundColor Yellow
Get-ChildItem -Force -File -Filter ".env*" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name

Write-Host "`n-- Possible logo assets --" -ForegroundColor Yellow
Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match '(?i)(logo|brand|mark|favicon)' -and $_.Extension -match '(?i)\.(svg|png|jpg|jpeg|webp|ico)$' } |
    Select-Object -First 100 -ExpandProperty FullName

Write-Host "`n-- Source placeholders and suspicious claims --" -ForegroundColor Yellow
$patterns = 'lorem ipsum|TODO|FIXME|\[insert|example\.com|000[- ]?000|99%|100% satisfaction|industry-leading|award-winning'
$extensions = '*.ts','*.tsx','*.js','*.jsx','*.md','*.json','*.html','*.css','*.scss'
Get-ChildItem -Recurse -File -Include $extensions -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '[\\/](node_modules|\.next|dist|build|coverage|\.git)[\\/]' } |
    Select-String -Pattern $patterns -CaseSensitive:$false -ErrorAction SilentlyContinue |
    Select-Object -First 200 Path,LineNumber,Line

Write-Host "`nAudit complete. Review findings before editing." -ForegroundColor Green
