# AI NEXT validation receipts

Validation date: **2026-11-10**, rerun by **Data** in the course worktree on branch
`tamirdresher-squad-course-refresh`. These are directly observed local results,
not a clean classroom image, independent review, or entitled live Copilot rehearsal.
Commands below were run from the course repository root.
This receipt includes the targeted review corrections after `cfc8c45`.

## Completed checks

| Command/check | Result |
|---|---|
| `.\labs\ai-next\tests\Validate-Checkpoints.ps1` | Review rerun exit 0: **16 cases passed**, `completed=True`; exact created directories cleaned. Includes new locked-output refusal/release regression |
| `npm view @bradygaster/squad-cli dist-tags versions engines --json --registry https://packagefeedproxy.microsoft.io/npm/` | First-pass receipt (not repeated this review): exit 0; `latest` 1.1.0, Node engine `>=22.5.0`, `2.0.0-preview.4` absent from inspected versions |
| `squad --help`; `squad init --help`; `squad doctor --help`; `squad triage --help`; `squad loop --help` | First-pass receipts: each exit 0. Review corrected the loop claim using tagged source; help alone was not execution-gate evidence |
| `node .\scripts\qa\check-deck.cjs` | Review rerun exit 0 using installed Edge: **21 slides, 21 notes, 126 lab minutes, 84 slide/viewport checks**; no horizontal overflow/page errors. Explicit filter acceptance/export and read fallback assertions passed |
| Presentation interactions | Buttons, jump selector, Home/End, arrows, hash/deep link, notes, theme parameter/toggle, all-slides view and print visibility passed |
| `python .\scripts\qa\check-links.py --range cfc8c45` | Exit 0: **11 documents, 55 local targets**, including newly staged QA documentation. Fixed-base scope is repeatable with a clean worktree; the post-commit recheck is reported with the final SHA. No fragment/external validation implied |
| `python .\scripts\qa\check-links.py --tracked` | Exit 0: **27 documents, 174 local targets**; inline code examples are not live links |
| `python -m unittest discover -s .\scripts\qa -p test_*.py` | Exit 0: **2 regression tests** passed (nonempty tracked scope from another working directory; empty-range refusal) |
| `python .\scripts\qa\check-consistency.py` | Review rerun exit 0: **nine matching schedule blocks**, 180 total, 10 break, labs **30+35+35+26=126**. Canonical upstream, CFS configuration/lock, personal-isolation wording, onboarding correction and removed unavailable GitHub links passed |
| `node .\scripts\qa\check-app.cjs` | Review rerun exit 0: real Edge **starter and final (`filter`)** UI, actual API/Vite, no mocks. Running API/Vite and Vite-only refusal, stop → fresh validation/export → restart → browser, and exact child/browser cleanup passed |
| `git diff --check` | Exit 0 after removing one Markdown trailing-space violation |

The checkpoint suite built the .NET API and TypeScript/Vite frontend for
`starter`, `read` and `filter`, exercised real HTTP/SQLite behavior, restarted the
API to verify persistence, and checked validation, idempotent PATCH, exact ordered
filters and invalid-filter rejection. It also checked safe destination boundaries,
junction rejection, incomplete-feature rejection, injected regression detection,
sanitized evidence, stale-hash refusal and invalidation on bad feed configuration.
The new case holds the compiled API DLL exclusively, confirms validation refuses
before rebuilding, releases the handle and confirms the stop guard clears.
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
node .\scripts\qa\check-app.cjs
```

Both apps passed empty-state display, adding two books, trimmed input, rejection
of a whitespace title with a visible error, recovery on a valid submission,
cleared inputs and reload persistence. Starter showed no premature read/filter
controls. Final passed read/unread toggling, all/read/unread views, and retained
read status after reload. The API suite, separately, verified database persistence
across process restarts. No browser page errors were observed.

Before `cfc8c45`, the first browser attempt passed starter but timed out on the QA helper's overly
strict `getByLabel("Show", { exact: true })` selector. The helper was corrected to
select the combobox by role, its databases reset, and both checkpoints rerun
successfully. No app change was needed for that harness failure.

The review's lifecycle helper confirmed both servers reachable, then attempted
validation while they ran: it refused with the actionable stop message. With
only Vite running it also refused. Both remained responsive after refusal
(API through Vite's proxy, then Vite alone). It then stopped only its exact children,
successfully exported freshly validated evidence, restarted both servers on
dynamic loopback ports and exercised the UI. No arbitrary process was killed.
An added post-refusal liveness probe initially hit `ECONNRESET` after a
synchronous validator call. Probes now use fresh, fully consumed HTTP
connections; the complete starter/filter lifecycle and UI check was rerun and
exited 0. No application/server-killing fix was needed.

Browser checks used an existing global Playwright installation and installed Edge
in headless mode; no browser/package installation was required. Screenshots were
captured locally, but **no new manual visual sign-off is claimed**. The ignored
`.course-validation` logs/screenshots/generated labs remain excluded. Portable
helper **source is committed under `scripts\qa`**, with reproducible commands and
dependency-discovery options in [the QA guide](../../scripts/qa/README.md).

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

Before `cfc8c45`, the initial additional lab-directory lint found two naming warnings. Internal
helpers were renamed to `Assert-Failure` and `Assert-Feed`, callers updated, and
both lint and the full 15-case checkpoint suite rerun successfully.
For this review, the same commands again passed all seven scripts, including the
new stop guard and locked-output test; PSScriptAnalyzer was actually run.

### Participant isolation rehearsal

The following commands ran in a disposable generated lab only, never the course
root. `squad init` and `squad doctor` exited 0:

```powershell
.\scripts\New-AiNextLab.ps1 -Checkpoint starter -Destination .\.course-validation\isolation-rehearsal
$env:SQUAD_NO_PERSONAL='1'
Push-Location .\.course-validation\isolation-rehearsal
git init --quiet
squad init --roles --no-workflows --state-backend local
Get-Content .\.squad\config.json
Get-Content .\.github\agents\squad.agent.md -TotalCount 28
squad doctor
Pop-Location
```

Observed config: `version: 1`, `stateBackend: local`, **no `teamRoot` or external
redirect**. The generated participant `.github\agents\squad.agent.md` was stamped
1.1.0; its root-resolution instructions select local `.squad` when no redirect
exists. Doctor reported **10 passed, 0 failed, 0 warnings, 2 info**.
This verifies isolated scaffolding/configuration, **not which profile Copilot
actually loads**: no Copilot live/agent-discovery session was launched.
Same-name user-level-agent precedence remains an explicit participant gate.

Tagged `init.ts` and `loop.ts` were read directly during this review. Init can
link a personal team independently of the local state backend; loop's
false/missing `configured` selects onboarding and continues execution.

### Link-check scope and negative controls

The initial all-tracked audit reported five apparent missing targets in an
archived plan's **inline-code examples**, not live links. The helper now ignores
inline code as well as fenced code; no unrelated historical document was edited.
An actually empty range (`--range HEAD..HEAD`) correctly exits **1**, refusing
zero documents/targets. `--range HEAD` while dirty is not an empty range.
The portable link-check regression tests exercise tracked nonempty scope from
another working directory and empty-range rejection.

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
- Copilot's actual loaded agent-profile origin; local init/doctor and an agent's own statement are insufficient proof.
- Manual visual/accessibility sign-off, non-Edge browser coverage, or validation of every external link/fragment anchor.
- Publication, a real submitted PR, remote execution, push or merge.

For teaching boundaries, pinned source evidence and the remaining gate owners, see [upstream and provenance](upstream-and-provenance.md).
