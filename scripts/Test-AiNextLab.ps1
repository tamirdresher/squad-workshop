[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$LabPath,
    [ValidateSet('starter', 'read', 'filter')][string]$Feature
)

. (Join-Path $PSScriptRoot '..\labs\ai-next\tools\LabTools.ps1')
$lab = Get-Lab $LabPath
if (!$Feature) {
    $Feature = (Get-Content (Join-Path $lab '.ai-next-checkpoint.json') -Raw | ConvertFrom-Json).checkpoint
}

$state = Assert-SafePath (Join-Path $lab '.ai-next')
$null = New-Item -ItemType Directory -Path $state -Force
$receipt = Assert-SafePath (Join-Path $state 'test-receipt.json')
@{ result = 'failed'; feature = $Feature; stage = 'build'; timestamp = [DateTime]::UtcNow.ToString('o') } |
    ConvertTo-Json | Set-Content -LiteralPath $receipt -Encoding utf8
foreach ($artifact in @('evidence.json', 'source.diff')) {
    $old = Assert-SafePath (Join-Path $state $artifact)
    if (Test-Path -LiteralPath $old -PathType Leaf) {
        Remove-Item -LiteralPath $old
    }
}

Assert-Feed $lab

Push-Location $lab
try {
    $nodeVersion = (& node --version).Trim().TrimStart('v')
    if ([version]$nodeVersion -lt [version]'22.12.0') {
        throw 'Node.js 22.12.0 or newer is required.'
    }

    Invoke-Checked dotnet @('restore', '.\api\ReadingList.Api.csproj', '--configfile', '.\NuGet.Config', '--locked-mode', '--verbosity', 'quiet')
    Invoke-Checked dotnet @('build', '.\api\ReadingList.Api.csproj', '--no-restore', '--verbosity', 'quiet')
    Push-Location (Join-Path $lab 'frontend')
    try {
        Invoke-Checked npm @('ci', '--registry=https://packagefeedproxy.microsoft.io/npm/', '--ignore-scripts', '--no-audit', '--no-fund', '--loglevel=error')
        Invoke-Checked npm @('run', 'build')
    } finally {
        Pop-Location
    }

    Invoke-Checked node @((Join-Path $script:CourseRoot 'labs\ai-next\tests\http.mjs'), $lab, $Feature)
} finally {
    Pop-Location
}
