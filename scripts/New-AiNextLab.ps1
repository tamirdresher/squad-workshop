[CmdletBinding()]
param(
    [ValidateSet('starter', 'read', 'filter')][string]$Checkpoint = 'starter',
    [Parameter(Mandatory)][string]$Destination
)

. (Join-Path $PSScriptRoot '..\labs\ai-next\tools\LabTools.ps1')
$destinationPath = Assert-SafePath $Destination
foreach ($reserved in @('scripts', 'docs', '.git', '.github', 'modules',
    'labs\ai-next\starter', 'labs\ai-next\checkpoints', 'labs\ai-next\tests', 'labs\ai-next\tools')) {
    $reservedPath = Join-Path $script:CourseRoot $reserved
    if ($destinationPath -eq $reservedPath -or
        $destinationPath.StartsWith($reservedPath + '\', [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Choose a new participant directory, not a course content directory.'
    }
}

if (Test-Path -LiteralPath $destinationPath) {
    throw 'Destination already exists. Choose a NEW directory; nothing was overwritten.'
}

$source = Join-Path $script:CourseRoot 'labs\ai-next'
foreach ($file in $script:LabSources) {
    if (!(Test-Path -LiteralPath (Join-Path $source "starter\$file") -PathType Leaf)) {
        throw "Course source missing: $file"
    }
}

$null = New-Item -ItemType Directory -Path $destinationPath
foreach ($file in $script:LabSources) {
    $from = Join-Path $source "starter\$file"
    foreach ($overlay in @('read', 'filter')) {
        if (($overlay -eq 'read' -and $Checkpoint -in @('read', 'filter')) -or
            ($overlay -eq 'filter' -and $Checkpoint -eq 'filter')) {
            $candidate = Join-Path $source "checkpoints\$overlay\$file"
            if (Test-Path -LiteralPath $candidate -PathType Leaf) {
                $from = $candidate
            }
        }
    }

    $to = Join-Path $destinationPath $file
    $baseline = Join-Path $destinationPath ".ai-next\baseline\$file"
    $null = New-Item -ItemType Directory -Path (Split-Path $to) -Force
    $null = New-Item -ItemType Directory -Path (Split-Path $baseline) -Force
    Copy-Item -LiteralPath $from -Destination $to
    Copy-Item -LiteralPath $from -Destination $baseline
}

Set-Content -LiteralPath (Join-Path $destinationPath '.npmrc') -Encoding utf8 -Value 'registry=https://packagefeedproxy.microsoft.io/npm/'
Set-Content -LiteralPath (Join-Path $destinationPath 'NuGet.Config') -Encoding utf8 -Value @'
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <clear />
    <add key="MicrosoftCFS" value="https://packagefeedproxy.microsoft.io/nuget/v3/index.json" />
  </packageSources>
</configuration>
'@
@{ checkpoint = $Checkpoint; schemaVersion = 1 } | ConvertTo-Json |
    Set-Content -LiteralPath (Join-Path $destinationPath '.ai-next-checkpoint.json') -Encoding utf8
Write-Output "Created $Checkpoint lab. No Git or Squad initialization was performed."
