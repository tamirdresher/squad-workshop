[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$LabPath,
    [ValidateSet('starter', 'read', 'filter')][string]$Feature
)

. (Join-Path $PSScriptRoot '..\labs\ai-next\tools\LabTools.ps1')
$lab = Get-Lab $LabPath
$parameters = @{ LabPath = $lab }
if ($Feature) {
    $parameters.Feature = $Feature
}

& (Join-Path $PSScriptRoot 'Test-AiNextLab.ps1') @parameters
Invoke-Checked node @((Join-Path $script:CourseRoot 'labs\ai-next\tests\evidence.mjs'), $lab)
