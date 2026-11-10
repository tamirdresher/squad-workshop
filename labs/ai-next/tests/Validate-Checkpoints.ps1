[CmdletBinding()]
param()

. (Join-Path $PSScriptRoot '..\tools\LabTools.ps1')
$root = $script:CourseRoot
$new = Join-Path $root 'scripts\New-AiNextLab.ps1'
$test = Join-Path $root 'scripts\Test-AiNextLab.ps1'
$export = Join-Path $root 'scripts\Export-AiNextEvidence.ps1'
$runner = Join-Path $PSScriptRoot 'http.mjs'
$created = [Collections.Generic.List[string]]::new()
$cases = [Collections.Generic.List[object]]::new()

function Check {
    param([string]$Name, [scriptblock]$Action)
    & $Action
    $cases.Add(@{ name = $Name; result = 'passed' })
    Write-Output "PASS validation: $Name"
}

function Assert-Failure {
    param([scriptblock]$Action)
    $failed = $false
    try {
        & $Action
    } catch {
        $failed = $true
    }

    if (!$failed) {
        throw 'Expected failure was not observed.'
    }
}

function Invoke-HttpFailure {
    param([string]$Lab, [string]$Feature)
    & node $runner $Lab $Feature
    if ($LASTEXITCODE -eq 0) {
        throw 'Feature omission/regression unexpectedly passed.'
    }

    $receipt = Get-Content (Join-Path $Lab '.ai-next\test-receipt.json') -Raw | ConvertFrom-Json
    if ($receipt.result -ne 'failed' -or $receipt.cleanup -ne 'completed') {
        throw 'Failed run did not record failure with exact-process cleanup.'
    }
}

$stamp = [Guid]::NewGuid().ToString('N')
$labs = @{}
$succeeded = $false
Push-Location $root
try {
    foreach ($checkpoint in @('starter', 'read', 'filter')) {
        $lab = Join-Path $root "labs\ai-next\validation-$stamp-$checkpoint"
        & $new -Checkpoint $checkpoint -Destination $lab
        $created.Add($lab)
        $labs[$checkpoint] = $lab
        Check "$checkpoint materialization and real suite" {
            & $test -LabPath $lab -Feature $checkpoint
            $receipt = Get-Content (Join-Path $lab '.ai-next\test-receipt.json') -Raw | ConvertFrom-Json
            if ($receipt.result -ne 'passed' -or $receipt.feature -ne $checkpoint) {
                throw 'Expected actual passing checkpoint receipt.'
            }

            if ((Test-Path (Join-Path $lab '.git')) -or (Test-Path (Join-Path $lab '.squad'))) {
                throw 'Materializer initialized a team or Git repository.'
            }

            if (@(Get-ChildItem (Join-Path $lab '.ai-next') -Directory -Filter 'test-*').Count -ne 0) {
                throw 'HTTP test directory was not cleaned.'
            }
        }
    }

    Check 'existing destination rejected without modifying source' {
        $file = Join-Path $labs.starter 'api\Program.cs'
        $before = (Get-FileHash $file).Hash
        Assert-Failure {
            & $new -Destination $labs.starter
        }

        if ($before -ne (Get-FileHash $file).Hash) {
            throw 'Existing destination was modified.'
        }
    }

    Check 'worktree root, outside worktree and course source destinations rejected' {
        foreach ($target in @($root, (Join-Path (Split-Path $root) "outside-$stamp"),
            (Join-Path $root "scripts\unsafe-$stamp"),
            (Join-Path $root "labs\ai-next\starter\unsafe-$stamp"))) {
            Assert-Failure {
                & $new -Destination $target
            }
        }
    }

    Check 'unmarked directory rejected' {
        Assert-Failure {
            & $test -LabPath (Join-Path $root 'labs\ai-next')
        }
    }

    Check 'junction destination rejected without following it' {
        $junction = Join-Path $labs.starter 'linked'
        $null = New-Item -ItemType Junction -Path $junction -Target $labs.read
        try {
            Assert-Failure {
                & $new -Destination (Join-Path $junction 'child')
            }
            Assert-Failure {
                & $test -LabPath $labs.starter
            }
        } finally {
            [IO.Directory]::Delete($junction)
        }
    }

    Check 'starter cannot pass read or filter selector' {
        Invoke-HttpFailure $labs.starter 'read'
        Invoke-HttpFailure $labs.starter 'filter'
    }
    Check 'read cannot pass filter selector' {
        Invoke-HttpFailure $labs.read 'filter'
    }

    $featureFile = Join-Path $labs.filter 'api\Features.cs'
    $original = Get-Content $featureFile -Raw
    Check 'missing boolean validation regression fails' {
        try {
            $regressed = $original.Replace('if (input.IsRead is null)', 'if (false)')
            $regressed = $regressed.Replace('input.IsRead.Value', 'input.IsRead ?? false')
            Set-Content $featureFile -Value $regressed -Encoding utf8
            Invoke-Checked dotnet @('build', (Join-Path $labs.filter 'api\ReadingList.Api.csproj'), '--no-restore', '--verbosity', 'quiet')
            Invoke-HttpFailure $labs.filter 'filter'
        } finally {
            Set-Content $featureFile -Value $original -Encoding utf8 -NoNewline
        }
    }

    Check 'non-idempotent PATCH regression fails' {
        try {
            $regressed = $original.Replace('store.SetRead(id, input.IsRead.Value)',
                'store.SetRead(id, !(store.List("all").FirstOrDefault(book => book.Id == id)?.IsRead ?? false))')
            Set-Content $featureFile -Value $regressed -Encoding utf8
            Invoke-Checked dotnet @('build', (Join-Path $labs.filter 'api\ReadingList.Api.csproj'), '--no-restore', '--verbosity', 'quiet')
            Invoke-HttpFailure $labs.filter 'filter'
        } finally {
            Set-Content $featureFile -Value $original -Encoding utf8 -NoNewline
        }
    }

    Check 'invalid filter accepted regression fails' {
        try {
            $regressed = $original.Replace('return values.Count <= 1 && status is "all" or "read" or "unread";', 'return true;')
            Set-Content $featureFile -Value $regressed -Encoding utf8
            Invoke-Checked dotnet @('build', (Join-Path $labs.filter 'api\ReadingList.Api.csproj'), '--no-restore', '--verbosity', 'quiet')
            Invoke-HttpFailure $labs.filter 'filter'
        } finally {
            Set-Content $featureFile -Value $original -Encoding utf8 -NoNewline
        }
    }

    Check 'fresh evidence captures sanitized checkpoint-relative source and narrative' {
        $ui = Join-Path $labs.filter 'frontend\src\features.ts'
        Add-Content $ui -Value "`n// visible workshop change`n// api_key=synthetic-secret-sentinel" -Encoding utf8
        Set-Content (Join-Path $labs.filter 'AI-NEXT-EVIDENCE.md') -Value "Unverified learner statement.`npassword=synthetic-narrative-sentinel"
        Set-Content (Join-Path $labs.filter 'private-excluded.txt') -Value 'excluded-private-sentinel'
        & $export -LabPath $labs.filter -Feature filter
        $evidencePath = Join-Path $labs.filter '.ai-next\evidence.json'
        $evidenceText = Get-Content $evidencePath -Raw
        $evidence = $evidenceText | ConvertFrom-Json
        $diff = Get-Content (Join-Path $labs.filter '.ai-next\source.diff') -Raw
        if ($evidence.testReceipt.result -ne 'passed' -or
            $diff -notmatch 'participant/frontend/src/features.ts' -or
            $diff -notmatch 'visible workshop change' -or
            $evidenceText -notmatch 'Unverified learner statement' -or
            $evidence.memory -notmatch 'not verified') {
            throw 'Evidence contract was not satisfied.'
        }

        if (($evidenceText + $diff) -match 'synthetic-secret-sentinel|synthetic-narrative-sentinel|excluded-private-sentinel' -or
            ($evidenceText + $diff).Contains($root)) {
            throw 'Evidence exposed an excluded or unsanitized value.'
        }
    }

    Check 'stale source hash refused by direct exporter' {
        Add-Content (Join-Path $labs.filter 'frontend\src\features.ts') -Value '// edit after receipt'
        & node (Join-Path $PSScriptRoot 'evidence.mjs') $labs.filter 2>$null
        if ($LASTEXITCODE -eq 0) {
            throw 'Exporter accepted stale source.'
        }
    }

    Check 'bad CFS config fails and invalidates prior evidence and receipt' {
        $npmConfig = Join-Path $labs.filter '.npmrc'
        $config = Get-Content $npmConfig -Raw
        try {
            Set-Content $npmConfig -Value 'registry=https://invalid.example.invalid/'
            Assert-Failure {
                & $export -LabPath $labs.filter -Feature filter
            }

            $receipt = Get-Content (Join-Path $labs.filter '.ai-next\test-receipt.json') -Raw | ConvertFrom-Json
            if ($receipt.result -ne 'failed' -or
                (Test-Path (Join-Path $labs.filter '.ai-next\evidence.json')) -or
                (Test-Path (Join-Path $labs.filter '.ai-next\source.diff'))) {
                throw 'Failed export left success-shaped evidence.'
            }
        } finally {
            Set-Content $npmConfig -Value $config -Encoding utf8 -NoNewline
        }
    }

    $succeeded = $true
} finally {
    foreach ($lab in $created) {
        $safe = Assert-SafePath $lab
        if ((Split-Path $safe -Leaf) -notlike "validation-$stamp-*") {
            throw 'Cleanup path mismatch.'
        }

        foreach ($item in Get-ChildItem -LiteralPath $safe -Recurse -Force) {
            if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
                throw 'Refusing recursive cleanup while a reparse point remains.'
            }
        }

        Remove-Item -LiteralPath $safe -Recurse -Force
    }

    Pop-Location
    Write-Output "Validation: $($cases.Count) cases passed; completed=$succeeded; exact created directories cleaned."
}
