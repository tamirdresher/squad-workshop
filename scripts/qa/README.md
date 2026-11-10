# Portable AI NEXT QA

Run from the workshop root. Helpers derive the root from their own path; no
machine-specific module path is built in. Python needs only its standard
library. Browser checks require an **already installed** Playwright module and
browser; no helper installs packages or downloads browsers.

Playwright resolution: `PLAYWRIGHT_MODULE_PATH` if set, otherwise Node module
resolution, then `npm root --global`. Windows defaults to installed Edge;
other platforms use installed Playwright Chromium. Set
`PLAYWRIGHT_BROWSER_CHANNEL` for another installed supported channel.
Any required package installation must use
`https://packagefeedproxy.microsoft.io/npm/`; .NET restores use the supplied
Microsoft CFS `NuGet.Config`. Browser installation follows organizational policy.

```powershell
.\labs\ai-next\tests\Validate-Checkpoints.ps1
node .\scripts\qa\check-deck.cjs
python .\scripts\qa\check-consistency.py
python .\scripts\qa\check-links.py --tracked
python -m unittest discover -s .\scripts\qa -p test_*.py
```

For a review delta, `python .\scripts\qa\check-links.py --range cfc8c45`
compares that commit with the current worktree/HEAD, including after a new
commit. Stage newly added documents first so Git includes them. Default link
scope is all tracked files; no documents/targets is an error, not a green check.
Checks cover **local** link targets and fences, not external URL availability.
Fenced and inline code examples are not interpreted as Markdown links.

## Real app browser and owned-server lifecycle

These are disposable **prepared** labs, not evidence of live agent work.
Creation refuses existing destinations; do not overwrite a lab containing work.
Use new destinations on a new clone or remove only these exact generated QA
directories after their processes are stopped. Keep all generated QA output
under ignored `.course-validation`; never commit it.

```powershell
.\scripts\New-AiNextLab.ps1 -Checkpoint starter -Destination .\.course-validation\browser-starter
.\scripts\Test-AiNextLab.ps1 -LabPath .\.course-validation\browser-starter -Feature starter
.\scripts\New-AiNextLab.ps1 -Checkpoint filter -Destination .\.course-validation\browser-filter
.\scripts\Test-AiNextLab.ps1 -LabPath .\.course-validation\browser-filter -Feature filter
node .\scripts\qa\check-app.cjs
```

The browser helper starts exact API/Vite children with dynamic loopback ports,
checks readiness, and on Windows confirms refusal with both servers and Vite
alone running. It stops only its children, runs fresh validation/export, restarts
both, exercises the UI, and closes its exact children/browser in `finally`.
Non-Windows process-discovery refusal assertions are explicitly skipped.
The production guard also checks locked API outputs, but cannot detect every
custom launch; participants must always stop both owned terminals themselves.
The helper resets only its generated `browser.db`, not learner data.
