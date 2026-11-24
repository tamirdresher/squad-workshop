<#
.SYNOPSIS
    Verifies all tools required for the Squad Workshop are installed.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'SilentlyContinue'
$pass = 0
$fail = 0
$onWindows = -not ($IsMacOS -or $IsLinux)

function Get-Fix {
    param([string]$Tool, [string]$WindowsCommand)
    if ($onWindows) { $WindowsCommand } else { "Install $Tool — see docs/prerequisites.md for the macOS/Linux command" }
}

function Test-Result {
    param(
        [string]$Tool,
        [bool]$Ok,
        [string]$Found,
        [string]$Required,
        [string]$Fix
    )

    $status = if ($Ok) { 'PASS' } else { 'FAIL' }
    $color = if ($Ok) { 'Green' } else { 'Red' }
    Write-Host ("{0,-8} {1,-22} {2}" -f $status, $Tool, $Found) -ForegroundColor $color

    if (-not $Ok -and $Fix) {
        Write-Host "         Required: $Required" -ForegroundColor DarkYellow
        Write-Host "         Fix: $Fix" -ForegroundColor DarkYellow
    }

    return [PSCustomObject]@{ Tool = $Tool; Ok = $Ok; Found = $Found; Required = $Required }
}

Write-Host ""
Write-Host "=== Squad Workshop — Prerequisites Check ===" -ForegroundColor Cyan
Write-Host ""
Write-Host ("{0,-8} {1,-22} {2}" -f "Status", "Tool", "Found") -ForegroundColor DarkGray
Write-Host ("-" * 72) -ForegroundColor DarkGray

$nodeRaw = (node --version 2>&1) -join ''
$nodeOk = $false
if ($nodeRaw -match 'v(\d+)\.(\d+)\.(\d+)') {
    $major = [int]$Matches[1]
    $minor = [int]$Matches[2]
    $patch = [int]$Matches[3]
    $nodeOk = ($major -gt 22) -or ($major -eq 22 -and $minor -gt 5) -or ($major -eq 22 -and $minor -eq 5 -and $patch -ge 0)
}
$r = Test-Result 'Node.js' $nodeOk $nodeRaw '22.5.0+' `
    (Get-Fix 'Node.js' 'winget install OpenJS.NodeJS.22 --accept-source-agreements --accept-package-agreements')
if ($r.Ok) { $pass++ } else { $fail++ }

$dotnetRaw = (dotnet --version 2>&1) -join ''
$dotnetOk = $false
if ($dotnetRaw -match '^(\d+)\.') { $dotnetOk = [int]$Matches[1] -ge 10 }
$r = Test-Result '.NET SDK' $dotnetOk $dotnetRaw '10.0.0+' `
    (Get-Fix '.NET SDK' 'winget install Microsoft.DotNet.SDK.10 --accept-source-agreements --accept-package-agreements')
if ($r.Ok) { $pass++ } else { $fail++ }

$gitRaw = (git --version 2>&1) -join ''
$gitOk = $gitRaw -match 'git version'
$r = Test-Result 'Git' $gitOk $gitRaw 'any recent' `
    (Get-Fix 'Git' 'winget install Git.Git --accept-source-agreements --accept-package-agreements')
if ($r.Ok) { $pass++ } else { $fail++ }

$ghRaw = (gh version 2>&1 | Select-Object -First 1) -join ''
$ghOk = $false
if ($ghRaw -match 'gh version (\d+)\.(\d+)\.(\d+)') {
    $major = [int]$Matches[1]
    $minor = [int]$Matches[2]
    $ghOk = ($major -gt 2) -or ($major -eq 2 -and $minor -ge 89)
}
$r = Test-Result 'GitHub CLI' $ghOk $ghRaw '2.89.0+' `
    (Get-Fix 'GitHub CLI' 'winget install GitHub.cli --accept-source-agreements --accept-package-agreements')
if ($r.Ok) { $pass++ } else { $fail++ }

$ghAuthRaw = gh auth status 2>&1
$ghAuthOk = $null -ne ($ghAuthRaw | Select-String 'Logged in to')
$hasProjectScope = $null -ne ($ghAuthRaw | Select-String "'project'")
$ghAuthFound = if ($ghAuthOk) { (($ghAuthRaw | Select-String 'Logged in to' | Select-Object -First 1).ToString().Trim()) } else { 'not authenticated' }
$r = Test-Result 'GH auth' ($ghAuthOk -and $hasProjectScope) $ghAuthFound 'logged in; project scope recommended' 'gh auth login -s project'
if ($r.Ok) { $pass++ } else { $fail++ }

$copilotRaw = (copilot --version 2>&1) -join ' '
$copilotOk = $copilotRaw -match '\d+\.\d+\.\d+'
$copilotHelpRaw = (copilot --help 2>&1) -join ' '
$copilotAgentOk = $copilotHelpRaw -match '--agent'
$copilotFound = if ($copilotOk) { $copilotRaw } else { 'copilot not found or version unavailable' }
$r = Test-Result 'Copilot CLI' ($copilotOk -and $copilotAgentOk) $copilotFound 'GitHub Copilot CLI with --agent support' `
    (Get-Fix 'Copilot CLI' 'npm install -g @github/copilot')
if ($r.Ok) { $pass++ } else { $fail++ }

$squadRaw = (squad --version 2>&1) -join ' '
$squadOk = $false
if ($squadRaw -match '(\d+)\.(\d+)\.(\d+)') {
    $major = [int]$Matches[1]
    $minor = [int]$Matches[2]
    $squadOk = ($major -gt 1) -or ($major -eq 1 -and $minor -ge 1)
}
$r = Test-Result 'Squad CLI' $squadOk $squadRaw '1.1.0+' 'npm install -g @bradygaster/squad-cli'
if ($r.Ok) { $pass++ } else { $fail++ }

if ($onWindows) {
    $policy = Get-ExecutionPolicy
    $policyOk = $policy -in @('RemoteSigned', 'Unrestricted', 'Bypass')
    $r = Test-Result 'PS ExecPolicy' $policyOk $policy.ToString() 'RemoteSigned' `
        'Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force'
    if ($r.Ok) { $pass++ } else { $fail++ }
}

Write-Host ("-" * 72) -ForegroundColor DarkGray
$summaryColor = if ($fail -eq 0) { 'Green' } else { 'Red' }
Write-Host ""
Write-Host "Summary: $pass passed, $fail failed" -ForegroundColor $summaryColor

if ($fail -gt 0) {
    Write-Host ""
    Write-Host "Fix the FAIL items above, then re-run this script before proceeding." -ForegroundColor Yellow
    Write-Host "See docs/prerequisites.md for detailed install instructions." -ForegroundColor Yellow
}

Write-Host ""
if ($fail -gt 0) { exit 1 }
