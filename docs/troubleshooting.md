# Troubleshooting

Common failure patterns across all modules, with exact error text and fixes.

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

**Cause:** npm's global bin directory isn't on PATH in the current terminal session yet.

**Fix:** Close and reopen your terminal. If it still fails:

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
npm install -g @bradygaster/squad-cli@latest
```

Re-run `squad doctor` — you should see `9 passed, 0 failed, 0 warnings, 2 info`.

---

### `gh auth status` shows not logged in

**Symptom:** `You are not logged into any GitHub hosts.`

**Fix:**

```powershell
gh auth login -s project
```

Select `GitHub.com` → `HTTPS` → authenticate via browser. Then verify:

```powershell
gh auth status
```

Should show `✓ Logged in to github.com account <your-username>`.

---

## Module 3 — Ralph

### `ralph-stop` file blocks the next Ralph run

**Symptom:** `squad watch` or `squad loop` exits immediately on the next run with a message about a stop file.

**Cause:** You stopped Ralph cleanly last time by creating `.squad/ralph-stop`, and the file wasn't deleted.

**Fix:**

```powershell
Remove-Item .squad/ralph-stop -ErrorAction SilentlyContinue
```

Then re-run your `squad watch` or `squad loop` command.

---

### `gh auth` failing inside a Ralph execution round

**Symptom:** Ralph logs an auth error during a round, and the 4-tier escalation eventually backs off.

**Fix:**

```powershell
gh auth login -s project
gh auth status   # confirm it shows logged in
```

Then wait for Ralph's next round (or restart with a fresh triage run).

---

## General

### `.squad/` gets noisy or too large

**Symptom:** Decisions, histories, logs, or inbox files are growing, and agents start carrying too much old context.

**Fix:** Preview cleanup first, then run the normal cleanup:

```powershell
squad nap --dry-run
squad nap
```

Use `squad nap --deep --dry-run` only when a facilitator explicitly wants a more aggressive archive/prune pass.

---

### The team retraces steps it should already know

**Symptom:** In Module 2, the agents re-explain or re-propose things that were decided in Module 1 (storage choice, folder layout, etc.).

**This is a data point, not a bug.** It means the Scribe didn't capture the decisions usefully, or the agents aren't reading the memory files. Check:

```powershell
Get-Content .squad/decisions.md
Get-Content .squad/identity/wisdom.md
```

If these are thin or generic, the team's memory is decorative. That's valuable information about whether Squad is earning its keep for your use case. See Module 2, Step 9 for the full artifact inspection.

---

## Known Squad bugs and workarounds

These are historical upstream reports that workshop participants may recognize. Numbered links below retain their original repository URLs so their issue identities remain accurate; they do not establish current 1.1.0+ behavior. Check [github/squad issues](https://github.com/github/squad/issues) for current status.

---

### `ERR_MODULE_NOT_FOUND` — `vscode-jsonrpc/node` on Windows

**Symptom:**

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
  '.../node_modules/vscode-jsonrpc/node'
  imported from .../node_modules/@github/copilot-sdk/dist/session.js
Did you mean to import "vscode-jsonrpc/node.js"?
```

**Cause:** `@github/copilot-sdk` 0.1.32 had a broken import path that failed on Windows. This was fixed upstream — upgrade to Squad CLI 0.9.4+ to resolve. ([issue #1062](https://github.com/bradygaster/squad/issues/1062) — closed)

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

**Cause:** The 92KB coordinator file (`squad.agent.md`) was silently dropped from the Copilot context budget due to pressure from a prior long session's summary. When this happens, Squad degrades to vanilla Copilot with no warning and no error message. This was fixed upstream — upgrade to Squad CLI 0.9.4+ to resolve. ([issue #1017](https://github.com/bradygaster/squad/issues/1017) — closed)

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

**Cause:** `squad init` writes a `.gitattributes` file. On Windows, git re-normalizes line endings for all tracked files when `.gitattributes` is read, which stages them as modified. Your file content is unchanged. Upstream [issue #1026](https://github.com/bradygaster/squad/issues/1026).

**Fix:** Discard the false-positive staging:

```powershell
git checkout -- .
```

Then verify your real changes are still there and commit normally. The `.gitattributes` file Squad added is intentional and should be committed.

---

### `squad watch --execute` agents don't behave like the assigned specialist

**Symptom:** You labeled an issue `squad:backend` (or `squad:bishop`, etc.) and Ralph's `--execute` mode picked it up — but the spawned agent behaves like a generic assistant, not like your Backend agent with its specific charter and personality.

**Cause:** `squad watch --execute` uses the `squad:{member}` label only as a routing filter. When it spawns a Copilot session to work on the issue, it uses a **generic Ralph prompt** — the specialist's charter is never injected into the spawn prompt. This is by design in the current release (upstream [issue #1081](https://github.com/bradygaster/squad/issues/1081) — closed).

**Workaround:** For work that requires specialist quality (code architecture, nuanced review, expert domain knowledge), use interactive mode instead:

```powershell
copilot --agent squad
```

Then ask directly: `Backend agent, implement the feature from issue #42.`

Use `--execute` only for small, well-scoped tasks where specialist nuance doesn't matter much.

---

### `squad watch --monitor-teams` / `--monitor-email` don't work

**Symptom:** You run one of the monitor flags and get no useful intake, or the command complains about missing prerequisites.

**Cause:** The public v0.11 docs mark both capabilities as requiring **a Teams/email MCP bridge**. Without that bridge, Ralph can still watch GitHub issues, but he cannot scan Teams or email.

**Verified commands:**

```powershell
squad watch --monitor-teams --interval 5
squad watch --monitor-email --interval 5
```

**Fix:** Either configure a Teams/email MCP bridge first, or drop back to GitHub-only workflows and remove the monitor flags for this workshop run.

---

### Agents fail mid-task with model rate-limit errors

**Symptom:**

```
[agent] error: model rate limit reached
Lane completed with a model rate-limit failure
```

**Cause:** Copilot Pro+ plans include 1,500 premium requests per month. Heavy multi-agent sessions — especially with concurrent spawns — can exhaust this budget quickly. Upstream [issue #992](https://github.com/bradygaster/squad/issues/992).

**Fix options:**

1. Wait for the monthly rate limit to reset.
2. Reduce concurrent agents: add `--max-concurrent 1` to triage/watch commands.
3. Use smaller tasks per session — batching large work into many small issues burns more requests than one well-scoped task.
4. Check your remaining budget at `github.com/settings/copilot`.

---

### `squad upgrade` destroys your `.github/agents/squad.agent.md` customizations

**Symptom:** After running `squad upgrade`, any customizations you made to `.github/agents/squad.agent.md` (custom agent names, removed sections, team-specific rules) are overwritten with the upstream version.

**Cause:** `squad upgrade` replaces `squad.agent.md` with no merge strategy. Upstream [issue #1052](https://github.com/bradygaster/squad/issues/1052).

**Workaround:** Before running `squad upgrade`, save your customizations:

```powershell
Copy-Item .github/agents/squad.agent.md .github/agents/squad.agent.md.backup
squad upgrade
# Then re-apply your changes manually by diffing against the backup
```
