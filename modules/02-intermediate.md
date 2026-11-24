# Module 2 — Intermediate: Compound the Memory and Inspect the Artifacts

> The point of this module: see whether the second feature goes faster because the repo *remembers*, or whether the team retraces the same steps. Then look inside `.squad/` and judge for yourself.

← Back to [Workshop Index](../README.md) · [← Module 1 (Basic)](01-basic.md)

---

## At a glance

**⏱️ ~45 min** · add a second feature and test whether the repo's memory compounds.

| Step | What you do |
|---|---|
| 7 | Add a second-wave feature |
| 8 | Commit and push |
| 9 | Look inside `.squad/` and judge the artifacts |
| 9.5 | Install a skill and watch the team use it (optional) |

---

## Prerequisites

- You completed [Module 1](01-basic.md) and have a working Reading List app under `reading-list-squad-lab/`.
- The team is already cast, decisions are recorded in `.squad/decisions.md`, and at least one architectural decision was made.
- A Copilot CLI session is running with the Squad agent (`copilot --agent squad`). If you closed it, just relaunch from inside the project directory — you don't need to re-init.

If you closed and came back later:

```powershell
cd reading-list-squad-lab
squad doctor     # confirm squad is active and healthy
copilot --agent squad
```

---

## Step 7: Add a second-wave feature

Now build something slightly annoying:

```
Add these features and update everything accordingly:
1. Filter books by unread/read status (both API and UI)
2. Validation rule: title is required, author is required
3. Update all existing tests and add new ones for the filter and validation
4. Update the UI to show a filter toggle (All / Unread / Read)
```

**What to watch for:**
- Do the agents reuse prior decisions and skills cleanly?
- Does the second feature go faster because the repo memory helped?
- Does the team avoid re-explaining things that were already decided?
- Does the Tester catch the regression risk on the existing tests instead of writing brand new ones in isolation?

If the team structure reduces re-explaining, you will feel the difference here. If you find yourself pasting context the team should already have, that's a real signal — note it.

---

## Step 8: Commit and push

Ask the team to wrap up:

```
Commit all changes with a clear commit message summarizing what was built.
Push to origin.
```

Or do it manually in a separate terminal:

```powershell
git add -A
git commit -m "feat: reading list app with CRUD, filtering, validation, and tests"
git push
```

> Both work. The interesting question is which one *feels* more correct to you. If you trust the team to commit on their own, that's information about how the workshop went.

---

## Step 9: Look inside `.squad/`

Before celebrating, inspect the team's artifacts. Open each file and evaluate whether it looks like real work or pleasant-sounding filler:

```powershell
# Decisions — were they useful?
Get-Content .squad/decisions.md

# Routing — does it reflect the actual team?
Get-Content .squad/routing.md

# Team — who's on it?
Get-Content .squad/team.md

# Skills — did anything get captured?
if (Test-Path .github/skills) {
    Get-ChildItem -Recurse .github/skills/
} elseif (Test-Path .copilot/skills) {
    Get-ChildItem -Recurse .copilot/skills/
} else {
    Write-Host "No repo-level skills directory found."
}

# Agent histories — did they learn?
Get-ChildItem .squad/agents/ -Recurse -Include history.md | ForEach-Object {
    Write-Host "`n=== $($_.FullName) ===" -ForegroundColor Yellow
    Get-Content $_
}

# Identity — current focus and wisdom
Get-Content .squad/identity/now.md
Get-Content .squad/identity/wisdom.md
```

**The honest test:** for each file, ask "would I write this if I were taking notes for myself?" If yes, the team is doing real work. If the files read like AI-generated meeting minutes nobody will ever consult again, you learned something equally valuable.

### PM artifact review rubric

If you are taking the PM path, inspect artifacts through these questions:

- Does `.squad/decisions.md` explain product tradeoffs, not just implementation detail?
- Did the Tester map tests back to acceptance criteria?
- Does the Scribe preserve enough context for a future PM to understand why the team made each choice?
- Can you verify the feature behavior through the UI without reading code?

Engineers can go deeper into test code and implementation. PMs should focus on behavior, risks, decisions, and acceptance criteria.

### What "good" looks like

- `decisions.md` has decisions that reference each other across step 5 and step 7 — i.e., the second-feature work *cited* the storage decision from earlier.
- `agents/<name>/history.md` contains specific, useful project facts (file paths, conventions, why things are the way they are) — not "I am the Backend agent and I write backend code."
- `wisdom.md` has at least one pattern that would survive being applied to a different project.
- `routing.md` matches the actual cast and not the placeholder template.

### What "AI confetti" looks like

- Decisions are bullet lists of generic best practices with no project-specific rationale.
- Agent histories say variations of "completed the task successfully."
- Wisdom is platitudes ("write clean code, test edge cases").
- Skills folders contain auto-generated boilerplate nobody referenced during the work.

Either outcome is data. The point of inspecting is to know which one you're getting *before* you decide whether to use Squad on real work.

---

## Step 9.5: Skills — extend what the team knows (optional)

Squad agents draw on **skills** — small, portable markdown modules (sometimes with scripts) that encode reusable knowledge: review protocols, test discipline, error recovery, git conventions. On current releases, `squad init` installs the curated set into `.github/skills/` so every Copilot surface can see them. Older repos may still have `.copilot/skills/`. This step makes them visible and asks the only question that matters — do they actually change behavior?

### 9.5a. See what's installed

```powershell
if (Test-Path .github/skills) {
    Get-ChildItem .github/skills/
} else {
    Get-ChildItem .copilot/skills/
}
```

You should see directories such as `squad-conventions`, `reviewer-protocol`, `test-discipline`, `error-recovery`, `git-workflow`, `secret-handling`, `session-recovery`, and `agent-collaboration`. Each is a skill any agent can read and apply.

> **Version quirk to know:** v0.11 moved bundled skills from `.copilot/skills/` to `.github/skills/`. If you're inspecting an older lab repo or migrated team, check both locations before assuming a skill is missing.

### 9.5b. Read one — is it real guidance or boilerplate?

```powershell
$skillPath = if (Test-Path .github/skills/reviewer-protocol/SKILL.md) {
    ".github/skills/reviewer-protocol/SKILL.md"
} else {
    ".copilot/skills/reviewer-protocol/SKILL.md"
}
Get-Content $skillPath
```

Read it as if you were the Lead agent about to do a review. Would you actually want this applied — or is it generic filler?

### 9.5c. Put it to the test

Ask the team to do something the skill governs, and watch whether its guidance surfaces:

```
Lead, do a focused review of the filter + validation changes from Step 7, following our reviewer protocol. Call out the specific checks you applied.
```

**The honest test:** did the review visibly apply the protocol's checks (or get noticeably more rigorous), or did it review exactly as it would have anyway? If the skill changed nothing observable, it's decoration — note that. If it sharpened the output, you've found a real lever for real work.

### 9.5d. (Optional) Pull in an external skill

The community publishes skills in the APM (`owner/repo`) format. You can add one with:

```powershell
squad skill install <owner>/<repo>/<skill-name>
```

Tamir Dresher's [`squad-skills`](https://github.com/tamirdresher/squad-skills) marketplace is one source — note it's a community snapshot, not officially maintained, so vendor or fork it if you come to depend on it. In current workshop runs, bundled skills live under `.github/skills/`; if you install extras, verify the destination path the CLI prints and inspect that folder directly.

---

### 9.6. (Optional) Choose where state lives — the two-layer backend

Everything you built in this module — decisions, agent history, session logs — lives under `.squad/` as plain files on your working branch. That's the **local** backend: simple, visible, and the right default for a solo workshop repo. It has one well-known failure mode at team scale: when several people (or worktrees, or Ralph running autonomously) write `.squad/` state on different branches, those files collide and you get merge conflicts in your *memory*.

The **two-layer** backend fixes that by splitting state across two git-native layers that never touch your feature branch:

- **Git notes** — commit-scoped annotations that ride along with the code they describe, out of the working tree.
- **An orphan branch** — a dedicated, out-of-line branch that holds durable decisions and history, so it never conflicts with feature-branch code.

Configure it fresh at init, or migrate this lab to it:

```powershell
squad init --state-backend two-layer      # new repos
squad upgrade --state-backend two-layer    # migrate an existing squad
```

You don't need this for a single-person workshop repo — local is fine here. Reach for two-layer the moment more than one writer touches the same repo's state. Background reading:

- [Scaling AI agents, Part 7 — Enterprise state](https://www.tamirdresher.com/blog/2026/03/22/scaling-ai-part7-enterprise-state) — why file-on-branch state breaks at team scale
- [Scaling AI agents, Part 7b — Git notes](https://www.tamirdresher.com/blog/2026/03/23/scaling-ai-part7b-git-notes) — how the git-notes layer works under the hood

---

## You can stop here

Modules 1 and 2 together are a complete, honest evaluation of Squad's core value proposition: a repo-native team that builds, decides, and remembers. If the artifacts in step 9 are useful, you have your answer.

If you want to see the riskier corner — Squad's autonomous mode (Ralph) — continue to **[Module 3 — Advanced](03-advanced.md)**. That module is more "guided tour of optional capabilities" than "build something." Treat it accordingly.

---

## Learn more

- [Squad cookbook — recipes](https://github.github.com/squad/docs/cookbook/recipes) — practical patterns for common Squad workflows
- [Building resilient agents](https://github.github.com/squad/docs/guide/building-resilient-agents) — handling failure, retries, and partial work
- [Context budget optimization](https://github.com/bradygaster/squad/issues/1037) — historical issue reference: how `.squad/` memory grows and what to do when it bloats

---

← Back to [Workshop Index](../README.md) | ← [Module 1 — Basic](01-basic.md) | Next: [Module 3 — Advanced →](03-advanced.md)
