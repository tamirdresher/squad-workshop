<#
.SYNOPSIS
    Checks learner-facing Markdown files for broken local links.
#>

[CmdletBinding()]
param(
    [string[]]$Path = @(
        'README.md',
        'CONTRIBUTING.md',
        'docs/prerequisites.md',
        'docs/troubleshooting.md',
        'docs/cheat-sheet.md',
        'docs/budget-and-models.md',
        'docs/pm-track.md',
        'docs/facilitator-guide.md',
        'modules'
    )
)

$ErrorActionPreference = 'Stop'
$linkPattern = '(?<!!)\[[^\]]+\]\((?<url>[^)\s]+)(?:\s+["''][^)]*["''])?\)'
$failures = [System.Collections.Generic.List[string]]::new()

function Get-MarkdownFile {
    param([string[]]$InputPath)

    foreach ($item in $InputPath) {
        if (Test-Path $item -PathType Leaf) {
            Get-Item $item
            continue
        }

        if (Test-Path $item -PathType Container) {
            Get-ChildItem $item -Recurse -Filter '*.md'
            continue
        }

        $failures.Add("Configured path does not exist: $item")
    }
}

$files = Get-MarkdownFile -InputPath $Path | Sort-Object FullName -Unique

foreach ($file in $files) {
    $content = Get-Content -Raw -Encoding UTF8 $file.FullName
    foreach ($match in [regex]::Matches($content, $linkPattern)) {
        $url = $match.Groups['url'].Value.Trim('<', '>')

        if ($url -match '^(https?:|mailto:|tel:|#)') {
            continue
        }

        $target = ($url -replace '#.*$', '') -replace '\?.*$', ''
        if ([string]::IsNullOrWhiteSpace($target)) {
            continue
        }

        $target = [System.Uri]::UnescapeDataString($target)
        $candidate = Join-Path -Path $file.DirectoryName -ChildPath $target
        if (-not (Test-Path $candidate)) {
            $relativeFile = Resolve-Path -Path $file.FullName -Relative
            $failures.Add("${relativeFile}: broken local link '$url'")
        }
    }
}

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    exit 1
}

Write-Host "Markdown local link check OK ($($files.Count) files)." -ForegroundColor Green
