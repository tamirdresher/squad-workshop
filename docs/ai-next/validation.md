# AI NEXT validation receipts

Validation date: **2026-11-10**, rerun by **Data** in the course worktree on branch
`tamirdresher-squad-course-refresh`. These are directly observed local results,
not a clean classroom image, independent review, or entitled live Copilot rehearsal.
Commands below were run from the course repository root.

## Completed checks

| Command/check | Result |
|---|---|
| `.\labs\ai-next\tests\Validate-Checkpoints.ps1` | Exit 0 on initial run and final rerun after lint fixes: **15 cases passed**, `completed=True`; exact created directories cleaned |
| `npm view @bradygaster/squad-cli dist-tags versions engines --json --registry https://packagefeedproxy.microsoft.io/npm/` | Exit 0; `latest` 1.1.0, Node engine `>=22.5.0`, `2.0.0-preview.4` absent from inspected versions |
| `squad --help`; `squad init --help`; `squad doctor --help`; `squad triage --help`; `squad loop --help` | Each exit 0; relevant flags and behavior recorded in the source/provenance record |
| `node .\.course-validation\check-deck.cjs` | Exit 0 using installed Edge: **21 slides, 21 notes, 126 lab minutes, 84 slide/viewport checks**; no horizontal overflow or page errors |
| Presentation interactions | Buttons, jump selector, Home/End, arrows, hash/deep link, notes, theme parameter/toggle, all-slides view and print visibility passed |
| `python .\.course-validation\check-links.py` | Exit 0 after updating historical-document navigation: **22 changed documents, 170 local targets**; targets exist and Markdown fences balance. This check does **not** validate fragment anchors or external links |
| `python .\.course-validation\check-consistency.py` | Exit 0: all **nine schedule blocks match** in instructor guide, learner lab and deck; 180 total, 10 break, labs **30+35+35+26=126**. No stale product-source/docs URLs in documents/GitHub YAML; root feeds and starter npm lockfile use only CFS |
| `node .\.course-validation\check-app.cjs` | Exit 0 on corrected rerun: **starter and final (`filter`) checkpoints interacted with through real Edge**, actual API and Vite proxy, no mocked requests; exact API/Vite/browser cleanup passed |
| `git diff --check` | Exit 0 after removing one Markdown trailing-space violation |

The checkpoint suite built the .NET API and TypeScript/Vite frontend for
`starter`, `read` and `filter`, exercised real HTTP/SQLite behavior, restarted the
API to verify persistence, and checked validation, idempotent PATCH, exact ordered
filters and invalid-filter rejection. It also checked safe destination boundaries,
junction rejection, incomplete-feature rejection, injected regression detection,
sanitized evidence, stale-hash refusal and invalidation on bad feed configuration.
The six deliberate `FAIL` lines and one unreachable-code warning in the injected
regression runs are **expected negative controls**, not failed acceptance cases.

### Browser preparation and observed interactions

The following exact preparation commands each completed successfully; each
`Test-AiNextLab.ps1` exited 0 with API/frontend builds and real HTTP checks:

```powershell
.\scripts\New-AiNextLab.ps1 -Checkpoint starter -Destination .\.course-validation\browser-starter
.\scripts\Test-AiNextLab.ps1 -LabPath .\.course-validation\browser-starter -Feature starter
.\scripts\New-AiNextLab.ps1 -Checkpoint filter -Destination .\.course-validation\browser-filter
.\scripts\Test-AiNextLab.ps1 -LabPath .\.course-validation\browser-filter -Feature filter
node .\.course-validation\check-app.cjs
```

Both apps passed empty-state display, adding two books, trimmed input, rejection
of a whitespace title with a visible error, recovery on a valid submission,
cleared inputs and reload persistence. Starter showed no premature read/filter
controls. Final passed read/unread toggling, all/read/unread views, and retained
read status after reload. The API suite, separately, verified database persistence
across process restarts. No browser page errors were observed.

The first browser attempt passed starter but timed out on the QA helper's overly
strict `getByLabel("Show", { exact: true })` selector. The helper was corrected to
select the combobox by role, its databases reset, and both checkpoints rerun
successfully. No app change was needed for that harness failure.

Browser checks used an existing global Playwright installation and installed Edge
in headless mode; no browser/package installation was required. Screenshots were
captured locally, but **no new manual visual sign-off is claimed**. The ignored
`.course-validation` helpers/logs/screenshots are local QA aids, not committed
course dependencies or learner setup. Disposable browser lab directories were
removed after checking.

### PowerShell validation

These exact commands passed with **zero parser errors across seven scripts** and
**zero PSScriptAnalyzer warnings/errors** (installed analyzer **1.24.0**):

```powershell
$files = @(Get-ChildItem scripts,labs\ai-next -Filter *.ps1 -Recurse)
foreach ($file in $files) {
    $errors = $null
    $null = [System.Management.Automation.Language.Parser]::ParseFile(
        $file.FullName, [ref]$null, [ref]$errors)
    if ($errors) { throw ($errors | Out-String) }
}
$findings = @(@('scripts','labs\ai-next') | ForEach-Object {
    Invoke-ScriptAnalyzer -Path $_ -Recurse -Settings scripts\PSScriptAnalyzerSettings.psd1
})
if ($findings.Count) { throw 'Script analyzer failed' }
```

The initial additional lab-directory lint found two naming warnings. Internal
helpers were renamed to `Assert-Failure` and `Assert-Feed`, callers updated, and
both lint and the full 15-case checkpoint suite rerun successfully.

### Environment and upstream navigation

Observed versions: `node --version` → `v22.23.4`; `npm --version` → `11.8.0`;
`dotnet --version` → `10.0.403`; `squad --version` → `1.1.0`;
`copilot --version` → `1.0.109-1`. Each exited 0.

The six current documentation paths `docs/guide`, `docs/sample-prompts`,
`docs/guide/faq`, `docs/cookbook/recipes`, `docs/guide/build-autonomous-agent` and
`docs/guide/building-resilient-agents` each returned **HTTP 200** using:

```powershell
$paths = @('docs/guide','docs/sample-prompts','docs/guide/faq','docs/cookbook/recipes','docs/guide/build-autonomous-agent','docs/guide/building-resilient-agents')
foreach ($p in $paths) {
    curl.exe -L -s -o NUL --max-time 20 -w "$p %{http_code}\n" "https://github.github.com/squad/$p"
}
```

Archived May reports retain historical findings and fork identifiers as history,
not current-source recommendations. Navigation now targets `github/squad` and
`github.github.com/squad`; historical issue numbers were not silently remapped to
potentially unrelated canonical issues. Proposed but absent documents are labeled
as proposals rather than linked as existing deliverables.

## Not claimed

- Independent Picard/Q approval: parent-owned review is requested, not self-approved.
- Clean-machine classroom rehearsal or observed completion within 180 minutes.
- Participant Copilot entitlement, a successful live model request, live specialist routing or fresh-session decision retrieval.
- Manual visual/accessibility sign-off, non-Edge browser coverage, or validation of every external link/fragment anchor.
- Publication, a real submitted PR, remote execution, push or merge.

For teaching boundaries, pinned source evidence and the remaining gate owners, see [upstream and provenance](upstream-and-provenance.md).
