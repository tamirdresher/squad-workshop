Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$script:CourseRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..'))
$script:LabSources = @(
    '.gitignore', 'api\ReadingList.Api.csproj', 'api\packages.lock.json',
    'api\Program.cs', 'api\Features.cs', 'frontend\package.json',
    'frontend\package-lock.json', 'frontend\tsconfig.json',
    'frontend\vite.config.ts', 'frontend\index.html',
    'frontend\src\main.tsx', 'frontend\src\features.ts', 'frontend\src\style.css'
)

function Assert-SafePath {
    param([Parameter(Mandatory)][string]$Path)
    $full = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Path)
    $prefix = $script:CourseRoot + [IO.Path]::DirectorySeparatorChar
    if (!$full.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Path must be a strict descendant of this course worktree.'
    }

    $cursor = $full
    while ($cursor -and $cursor -ne $script:CourseRoot) {
        if (Test-Path -LiteralPath $cursor) {
            $item = Get-Item -LiteralPath $cursor -Force
            if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
                throw 'Reparse points are not allowed in lab paths.'
            }
        }

        $cursor = Split-Path $cursor -Parent
    }

    return $full
}

function Get-Lab {
    param([string]$LabPath)
    $lab = Assert-SafePath $LabPath
    $marker = Assert-SafePath (Join-Path $lab '.ai-next-checkpoint.json')
    if (!(Test-Path -LiteralPath $marker -PathType Leaf)) {
        throw 'Not an AI NEXT lab: checkpoint marker missing.'
    }

    $metadata = Get-Content -LiteralPath $marker -Raw | ConvertFrom-Json
    if ($metadata.checkpoint -notin @('starter', 'read', 'filter')) {
        throw 'Invalid checkpoint marker.'
    }

    foreach ($directory in @('api', 'frontend', '.ai-next', '.ai-next\baseline')) {
        $null = Assert-SafePath (Join-Path $lab $directory)
    }

    foreach ($file in $script:LabSources) {
        $null = Assert-SafePath (Join-Path $lab $file)
        $null = Assert-SafePath (Join-Path $lab ".ai-next\baseline\$file")
    }

    foreach ($item in Get-ChildItem -LiteralPath $lab -Recurse -Force) {
        if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
            throw 'Reparse points are not allowed anywhere in the generated lab.'
        }
    }

    return $lab
}

function Invoke-Checked {
    param([string]$Command, [string[]]$Arguments)
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Command failed (exit $LASTEXITCODE)."
    }
}

function Assert-LabStopped {
    param([string]$Lab)
    $instruction = 'Stop your API and Vite servers with Ctrl+C before validation/export; restart both before browser checks. No process was terminated.'
    if ($IsWindows) {
        $processes = Get-CimInstance -ClassName Win32_Process `
            -Filter "Name = 'dotnet.exe' OR Name = 'node.exe' OR Name = 'ReadingList.Api.exe'"
        foreach ($process in $processes) {
            if ($process.CommandLine -and
                $process.CommandLine.IndexOf($Lab + '\', [StringComparison]::OrdinalIgnoreCase) -ge 0) {
                throw $instruction
            }
        }
    }

    foreach ($name in @('ReadingList.Api.dll', 'ReadingList.Api.exe')) {
        $file = Join-Path $Lab "api\bin\Debug\net10.0\$name"
        if (Test-Path -LiteralPath $file -PathType Leaf) {
            try {
                $handle = [IO.File]::Open($file, [IO.FileMode]::Open,
                    [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
                $handle.Dispose()
            } catch {
                throw $instruction
            }
        }
    }
}

function Assert-Feed {
    param([string]$Lab)
    $npm = Assert-SafePath (Join-Path $Lab '.npmrc')
    $nuget = Assert-SafePath (Join-Path $Lab 'NuGet.Config')
    if ((Get-Content $npm -Raw).Trim() -ne 'registry=https://packagefeedproxy.microsoft.io/npm/') {
        throw 'Lab .npmrc must use only the course CFS registry.'
    }

    [xml]$config = Get-Content $nuget -Raw
    $sources = @($config.configuration.packageSources.add)
    if ($null -eq $config.configuration.packageSources.SelectSingleNode('clear')) {
        throw 'NuGet.Config must clear inherited sources.'
    }

    if ($sources.Count -ne 1 -or $sources[0].value -ne 'https://packagefeedproxy.microsoft.io/nuget/v3/index.json') {
        throw 'Lab NuGet.Config must use only the course CFS source.'
    }

    $lock = Get-Content (Join-Path $Lab 'frontend\package-lock.json') -Raw
    $urls = [regex]::Matches($lock, '"resolved"\s*:\s*"([^"]+)"')
    foreach ($url in $urls) {
        if (!$url.Groups[1].Value.StartsWith('https://packagefeedproxy.microsoft.io/npm/')) {
            throw 'Non-CFS package URL in npm lockfile.'
        }
    }
}
