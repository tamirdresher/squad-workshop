# Troubleshooting

## Current AI NEXT: participant identity and running servers

- Set `$env:SQUAD_NO_PERSONAL='1'` before init and in **every** participant
  PowerShell/Copilot session, including fresh/recovery sessions.
  `--state-backend local` selects storage, not identity isolation; init can
  otherwise link a personal Squad through `config.teamRoot`.
- Follow [Lab 1's root/profile checks](ai-next/learner-lab.md): verify no external
  redirect and a lab-local resolved team root **and loaded agent profile**.
  Same-name user-level custom agents can override repository agents. Do not
  remove global agents; if source discovery cannot establish profile origin,
  stop the live route and record the blocker. An agent's own claim is not proof.
- Before validation/export, stop **your** API and Vite with `Ctrl+C`.
  The validator rebuilds API binaries and reinstalls dependencies, which can
  conflict with Windows locks. Its non-destructive guard is best effort, not a
  substitute for stopping both terminals. Restart both afterward before browser
  checks; `dotnet run` without watch does not reload rebuilt code.
- If an earlier init already wrote a personal/external `teamRoot`, setting the
  environment variable afterward does not undo it. Preserve that directory and
  ask the instructor about a fresh lab; never delete the personal Squad.

<!-- Modified for the AI NEXT course refresh on 2026-11-10; original attribution retained. -->

> **Historical extended-module troubleshooting.** For the current class use [AI NEXT prerequisites](ai-next/prerequisites.md). The old fork issue numbers and doctor counts below are version-specific observations, not current-release guarantees. Historical issue numbers have not been mapped to the canonical [github/squad issue tracker](https://github.com/github/squad/issues). Do not use blanket approval or stop-file recipes as a current operational runbook.

Common failure patterns across all three modules, with exact error text and fixes.

---

## Installation and setup

### `UnauthorizedAccess` when running `squad`

**Symptom:**

```
squad : File C:\...\squad.ps1 cannot be loaded because running scripts is disabled on this system.
```

**Cause:** PowerShell execution policy is `Restricted` or `AllSigned`.

**Fix:**

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

Restart your terminal and retry.

---

### `copilot` command not found after install

**Symptom:** `copilot: The term 'copilot' is not recognized...`

**Cause:** The installer updated PATH but the current terminal session doesn't see it yet.

**Fix:** Close and reopen your terminal (PowerShell 7+ required — the installer adds it if missing). If it still fails:

```powershell
# Confirm where it installed to:
Get-Command copilot -ErrorAction SilentlyContinue

# Or find it manually:
where.exe copilot
```

If `where.exe` finds it but `Get-Command` doesn't, your `$env:PATH` in the current session is stale. Restart the terminal.

---

### `squad doctor` reports warnings on version 0.9.1

**Symptom (v0.9.1 only):**

```
⚠️  casting/registry.json missing
⚠️  <some other warning>
```

**Cause:** `squad init` in v0.9.1 doesn't scaffold `casting/registry.json`. Both warnings are false positives fixed in v0.9.4.

**Fix:**

```powershell
npm install -g @bradygaster/squad-cli@1.1.0 --registry https://packagefeedproxy.microsoft.io/npm/
```

Re-run `squad doctor` and inspect actual errors against installed help. The old `9 passed, 0 failed, 0 warnings, 2 info` summary is not the expected count for 1.1.0.

---

### `gh auth status` shows not logged in

**Symptom:** `You are not logged into any GitHub hosts.`

**Fix:**

```powershell
gh auth login
```

Select `GitHub.com` → `HTTPS` → authenticate via browser. Then verify:

```powershell
gh auth status
```

Should show `✓ Logged in to github.com account <your-username>`.

---

## Module 3 — Aspire and Ralph

### `squad aspire` shows `✓` but dashboard is empty or unreachable

**Symptom:** The command prints `✓ Aspire dashboard launching` but `http://localhost:18888` returns a connection error.

**Cause:** Docker Desktop is not running. The `✓` line is printed even when Docker fails — it's a known gotcha in the current Squad version.

**Fix:**

1. Stop the command (`Ctrl+C`)
2. Start Docker Desktop from the Start menu
3. Wait for the whale icon to stop animating
4. Confirm Docker is healthy:
   ```powershell
   docker info | Select-String "Server Version"
   ```
5. Re-run `squad aspire`

---

### Aspire dashboard stays empty during a Squad session

**Symptom:** You're running `copilot --agent squad` and the agents are clearly doing work, but the Aspire dashboard at `http://localhost:18888` shows no traces.

**Possible causes:**

1. **Aspire wasn't actually running** — see above.
2. **Squad version too old** — v0.9.0+ auto-wires OpenTelemetry. If you're on an older version, run `squad upgrade` and restart the session.
3. **Firewall blocking `localhost:4317`** — Windows Firewall may block the OTLP gRPC port. Allow it once for the session.

---

### `ralph-stop` file blocks the next Ralph run

**Symptom:** `squad triage` or `squad loop` exits immediately on the next run with a message about a stop file.

**Cause:** You stopped Ralph cleanly last time by creating `.squad/ralph-stop`, and the file wasn't deleted.

**Fix:**

```powershell
Remove-Item .squad\ralph-stop -ErrorAction SilentlyContinue
```

Then re-run your `squad triage` or `squad loop` command.

---

### `gh auth` failing inside a Ralph execution round

**Symptom:** Ralph logs an auth error during a round, and the 4-tier escalation eventually backs off.

**Fix:**

```powershell
gh auth login
gh auth status   # confirm it shows logged in
```

Then wait for Ralph's next round (or restart with a fresh triage run).

---

## General

### The team retraces steps it should already know

**Symptom:** In Module 2, the agents re-explain or re-propose things that were decided in Module 1 (storage choice, folder layout, etc.).

**This is a data point, not a bug.** It means the Scribe didn't capture the decisions usefully, or the agents aren't reading the memory files. Check:

```powershell
Get-Content .squad\decisions.md
Get-Content .squad\identity\wisdom.md
```

If these are thin or generic, the team's memory is decorative. That's valuable information about whether Squad is earning its keep for your use case. See Module 2, Step 9 for the full artifact inspection.

---

## Known Squad bugs and workarounds

These are historical bug reports, not a confirmed list for the current Squad release. Check [github/squad issues](https://github.com/github/squad/issues) for current status.

---

### `ERR_MODULE_NOT_FOUND` — `vscode-jsonrpc/node` on Windows

**Symptom:**

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
  '.../node_modules/vscode-jsonrpc/node'
  imported from .../node_modules/@github/copilot-sdk/dist/session.js
Did you mean to import "vscode-jsonrpc/node.js"?
```

**Historical cause:** `@github/copilot-sdk` 0.1.32 had a broken import path that failed on Windows (fork issue #1062; current-release status not verified).

**Fix:** Add an override to your lab repo's `package.json` (create one in the root of `reading-list-squad-lab` if it doesn't exist):

```json
{
  "overrides": {
    "@github/copilot-sdk": "0.3.0"
  }
}
```

Then run `npm install` in the lab repo. This forces the patched version to be used.

---

### Squad behaves like vanilla Copilot — no team routing, no governance

**Symptom:** Squad stops dispatching to team members. Work gets done inline by the coordinator. Commits go directly to `main` without branch creation or PR workflow. The session "feels like regular Copilot."

**Historical cause:** The 92KB coordinator file (`squad.agent.md`) was silently dropped from the Copilot context budget due to pressure from a prior long session's summary. The report described degradation to vanilla Copilot without a warning (fork issue #1017; current-release status not verified).

**Fix:** Start a completely fresh Copilot CLI session:

```powershell
# Exit the current session first:
/quit

# Then relaunch:
copilot --agent squad
```

The coordinator file will be fully loaded again in the fresh session. If it happens again quickly, your prior session summaries may be unusually large — consider starting the next session with `/clear`.

---

### All files marked as modified after `squad init` in an existing project

**Symptom:** After running `squad init` inside a project that already had files, `git status` shows every file as modified (even files you didn't touch).

**Historical cause:** `squad init` wrote a `.gitattributes` file that triggered line-ending renormalization on Windows (fork issue #1026; current-release status not verified). Inspect the actual diff rather than assuming every change is harmless.

**Fix:** Discard the false-positive staging:

```powershell
git checkout -- .
```

Then verify your real changes are still there and commit normally. The `.gitattributes` file Squad added is intentional and should be committed.

---

### `squad triage --execute` agents don't behave like the assigned specialist (formerly `squad watch`)

**Symptom:** You labeled an issue `squad:backend` (or `squad:bishop`, etc.) and Ralph's `--execute` mode picked it up — but the spawned agent behaves like a generic assistant, not like your Backend agent with its specific charter and personality.

**Historical cause:** `squad triage --execute` (formerly `squad watch`) used the `squad:{member}` label only as a routing filter and spawned a **generic Ralph prompt** without the specialist's charter (fork issue #1081; current-release status not verified).

**Workaround:** For work that requires specialist quality (code architecture, nuanced review, expert domain knowledge), use interactive mode instead:

```powershell
copilot --agent squad
```

Then ask directly: `Backend agent, implement the feature from issue #42.`

Use `--execute` only for small, well-scoped tasks where specialist nuance doesn't matter much.

---

### Agents fail mid-task with model rate-limit errors

**Symptom:**

```
[agent] error: model rate limit reached
Lane completed with a model rate-limit failure
```

**Historical cause:** Heavy multi-agent sessions exhausted the then-current plan budget (fork issue #992). Current allowances, billing and model policies have not been verified by this course; inspect your own plan rather than relying on the historical 1,500-request figure.

**Fix options:**

1. Wait for the monthly rate limit to reset.
2. Reduce concurrent agents: add `--max-concurrent 1` to triage/watch commands.
3. Use smaller tasks per session — batching large work into many small issues burns more requests than one well-scoped task.
4. Check your remaining budget at `github.com/settings/copilot`.

---

### `squad upgrade` destroys your `.github/agents/squad.agent.md` customizations

**Symptom:** After running `squad upgrade`, any customizations you made to `.github/agents/squad.agent.md` (custom agent names, removed sections, team-specific rules) are overwritten with the upstream version.

**Historical cause:** `squad upgrade` replaced `squad.agent.md` without a merge strategy (fork issue #1052; current-release status not verified).

**Workaround:** Before running `squad upgrade`, save your customizations:

```powershell
Copy-Item .github\agents\squad.agent.md .github\agents\squad.agent.md.backup
squad upgrade
# Then re-apply your changes manually by diffing against the backup
```
