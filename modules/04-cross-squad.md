# Module 4 — Advanced Comms: @copilot, Presets, Cross-Squad & Sub-Squads

> Extend the team beyond one machine and one repo: hand work to GitHub's @copilot, reuse rosters with presets, delegate across squads, and scale with sub-squads. All optional, all real v0.11 capabilities.

← Back to [Workshop Index](../README.md) · [← Module 3 (Advanced)](03-advanced.md)

---

> **Facilitator note:** Module 4 is optional and advanced. It builds on Module 3's autonomy concepts. None of it is needed for daily interactive use — it's for teams scaling Squad across people, repos, and machines.

## At a glance

**⏱️ ~30 min** · extend the team across agents, repos, and machines.

| Step | What you do |
|---|---|
| 13 | Add @copilot to your team (optional) |
| 14 | Presets & upstreams, cross-squad delegation, sub-squads, and cloud/cluster references |

---

## Prerequisites

- You completed [Module 3](03-advanced.md), or at least [Module 1](01-basic.md), and have a working `reading-list-squad-lab/` repo with a populated `.squad/` directory.
- A GitHub repo with `gh auth status` healthy — steps 13 and 14b both create GitHub issues.
- For step 13 (@copilot): permission to add a repo secret, plus a classic PAT if you want auto-assignment.

---

## Step 13: Add @copilot to your team (optional)

Ralph's `--execute` mode spawns a *local* Copilot session per issue (with the [#1081 specialist-charter caveat](https://github.com/bradygaster/squad/issues/1081) noted in Module 3). GitHub's **@copilot coding agent** is the other autonomous path: it runs in GitHub's own infrastructure, claims a labeled issue, and opens a pull request you review — bounded autonomy, no local process to babysit.

### 13a. Add @copilot to the roster

```powershell
squad copilot --auto-assign
```

This adds an `@copilot` (🤖 Coding Agent) entry to `.squad/team.md`, writes `.github/copilot-instructions.md`, and marks the team for auto-assignment. Remove it any time with `squad copilot --off`.

> **Prerequisite for auto-assign:** GitHub needs a token to assign issues to the agent. Add a classic PAT (repo scope) as a repo secret named `COPILOT_ASSIGN_TOKEN`:
> ```powershell
> gh secret set COPILOT_ASSIGN_TOKEN
> ```

### 13b. Hand it a well-scoped issue

Label a small, clearly-specified issue `squad:copilot` (or let `squad watch` apply it when auto-assign is on). GitHub assigns the `copilot-swe-agent` actor, it works the issue in the cloud, and opens a PR — typically a few minutes later.

```powershell
gh issue create --title "Add a created-at timestamp to books" `
  --body "Add a server-generated createdAt field to the book model, expose it in the API response, and show it in the UI. Add a test." `
  --label "squad:copilot"
```

### 13c. Review the PR

Watch the **Pull requests** tab. When @copilot opens a PR, review it exactly like a teammate's — the whole point of bounded autonomy is that nothing merges without your eyes on it.

### @copilot vs Ralph `--execute` — when to use which

| Reach for @copilot when… | Reach for Ralph `--execute` when… |
|---|---|
| You want a reviewable PR from a well-scoped issue, with no local process running | You want fast, local iteration over a batch of small issues |
| You're fine waiting a few minutes for a cloud run | You want to watch it happen in your terminal |
| The task doesn't need a specific specialist's charter | (accepting the #1081 caveat — spawned agents get a generic prompt) |

> **Honest note:** @copilot is genuinely useful on small, well-bounded issues with clear acceptance criteria and a test suite that can check its work. It is *not* a senior engineer — scope tightly and review every PR.

---

## Step 14: Presets, cross-squad delegation, and sub-squads

This is the biggest public v0.11 jump beyond "Ralph can watch issues." Three things are now worth teaching explicitly:

1. **Presets** — reusable team rosters you can apply to new projects
2. **Cross-squad discovery + delegation** — create work in another squad's repo with `discover` / `delegate`
3. **Sub-squads** — scale one squad across multiple Codespaces/machines with `squad subsquads`, or run parallel branch-local squads with git worktrees

### 14a. Presets & upstreams — capture a roster once, reuse it everywhere (hands-on)

A **preset** is a saved snapshot of a squad's roster and agent charters that you can drop into any new repo. An **upstream** keeps a repo continuously aligned with a shared source of truth. In this hands-on you'll **create** a preset from the squad you built, **use** it to stand up a second repo, then **wire an upstream** so repos stay in sync.

**Step 1 — Save your current squad as a preset.** From inside `reading-list-squad-lab/`:

```powershell
squad preset save reading-list-team
```

This captures the current roster and agent charters under that name. Confirm it landed:

```powershell
squad preset list
squad preset show reading-list-team
```

**Step 2 — Use the preset in a brand-new repo.** Create a second project and apply the preset at init:

```powershell
cd ..
mkdir second-project-lab
cd second-project-lab
git init
squad init --preset reading-list-team
```

Your new repo now starts with the same roster you designed — no re-casting from scratch. (Already ran `squad init` without a preset? Apply it after the fact with `squad preset apply reading-list-team`.)

**Step 3 — Share the preset beyond your machine.** Back your preset library with a GitHub repo so teammates can pull the same roster:

```powershell
squad preset init --remote
```

Others then install it from the URL you share. The general shape is `squad preset install https://github.com/org/repo#preset-name`; for your workshop preset it looks like:

```powershell
squad preset install https://github.com/<you>/<squad-home-repo>#reading-list-team
```

**Step 4 — Create an upstream so repos stay in sync.** A preset copies a roster *once*; an **upstream** keeps a repo *continuously* aligned with a shared source (shared agents, skills, and config). Register one and pull from it:

```powershell
squad upstream add https://github.com/<you>/<squad-home-repo> --name home
squad upstream list
squad upstream sync
```

- **`upstream add <source> --name <n>`** registers a remote Squad source (GitHub URL, SSH, or local path); add `--ref <branch>` to pin a branch.
- **`upstream list`** shows what you're wired to.
- **`upstream sync`** pulls the latest shared config into this repo.

Re-run `squad upstream sync` whenever the source of truth changes — that's the difference between a one-time preset and a living upstream.

### 14b. Cross-squad communication — issue-based, not magical

First, register the peer squads you want to reach so `discover` can find them:

```powershell
squad registry add platform-squad ..\platform-squad
squad registry list
```

Then discover and delegate:

```powershell
squad discover
squad delegate platform-squad "Add monitoring dashboard for the auth service"
```

If the peer is no longer part of the exercise, remove it cleanly:

```powershell
squad registry remove platform-squad
```

What this gives you:

- **`squad registry add <name> <path>`** records a peer squad (no config inheritance — peers stay independent)
- **`squad discover`** lists known squads and their declared capabilities
- **`squad delegate`** creates a properly-labeled GitHub issue in the target squad's repo
- **`squad registry remove <name>`** removes stale peers so future delegation does not target the wrong repo
- The contract lives in the target repo's `.squad/manifest.json`

This is the clean workshop story for **upstream communication**: register and discover a peer squad, delegate work by issue, and keep repo boundaries explicit.

### 14c. Sub-squads — scale across machines, or branches

v0.11 ships a real `squad subsquads` command for **multi-Codespace scaling** — running one squad across several machines or Codespaces:

```powershell
squad subsquads list
squad subsquads status
squad subsquads activate <name>
```

- **`list`** shows the sub-squads configured for this repo
- **`status`** reports each sub-squad's current state
- **`activate <name>`** switches the active sub-squad

> The `workstreams` and `streams` names are deprecated aliases for `subsquads` — you may still see them in older docs.

For **local** parallelism on a single machine, pair sub-squads with a git **worktree** strategy — one checkout per branch, each able to carry its own squad state:

```powershell
git worktree add ..\reading-list-feature-a feature-a
git worktree add ..\reading-list-feature-b feature-b
```

Two verified worktree patterns:

- **worktree-local** — each worktree has its own `.squad/` state
- **main-checkout** — worktrees share the main checkout's `.squad/` state

So when learners ask for "sub-squads," you now have three honest answers: **`squad subsquads`** for multi-machine scaling, **peer squads** (`discover` / `delegate`) for cross-repo work, and **worktrees** for branch-local parallelism on one box.

### 14d. Where to run distributed squads — cloud & cluster references

Sub-squads and Ralph's `--execute` mode answer *how* Squad scales across machines. When you're ready to run those autonomous squads on real infrastructure instead of your laptop, these are the current, honest reference points:

- **Azure Container Apps (ACA)** — the most complete public write-up. A three-part series covers the architecture, dynamic sessions, and sandboxed workspaces:
  - [Deterministic LangGraph, non-deterministic Squad](https://www.tamirdresher.com/blog/2026/06/10/deterministic-langgraph-non-deterministic-squad)
  - [ACA dynamic sessions for Squad](https://www.tamirdresher.com/blog/2026/06/12/aca-dynamic-sessions-squad)
  - [ACA sandboxes for the Squad workspace](https://www.tamirdresher.com/blog/2026/06/12/aca-sandboxes-squad-workspace)
  - Reference implementation: [`haflidif/squad-on-aca`](https://github.com/haflidif/squad-on-aca)
- **Azure Kubernetes Service (AKS)** — for cluster-based fleets (the same pattern Module 3's Ralph fleet points at): [`tamirdresher/squad-on-aks`](https://github.com/tamirdresher/squad-on-aks).

None of this is required for the workshop — it's the "so where do I actually run this?" answer for teams past the laptop stage.

---

## You're done

You've now extended Squad beyond a single interactive session:

- **@copilot** (step 13) — bounded cloud autonomy: a labeled issue becomes a reviewable PR.
- **Presets & upstreams** (step 14a) — capture a known-good roster once and reuse it in any repo; wire an upstream to keep repos continuously in sync.
- **Cross-squad** (step 14b) — register and discover peer squads, delegate work by issue, keep repo boundaries explicit.
- **Sub-squads & worktrees** (step 14c) — scale one squad across machines, or run parallel branch-local squads on one machine.

Combined with Module 3's autonomy modes, you now have the full picture: **interactive → observed → autonomous → distributed**.

---

## Learn more

- [Build autonomous agents with Squad](https://github.github.com/squad/docs/guide/build-autonomous-agent) — deep dive into Ralph's architecture and configuration
- [Building resilient agents](https://github.github.com/squad/docs/guide/building-resilient-agents) — patterns for agents that handle failure gracefully
- [Squad cookbook — recipes](https://github.github.com/squad/docs/cookbook/recipes) — practical patterns for loop instructions and triage workflows
- [Open issues on github/squad](https://github.com/github/squad/issues) — current known bugs and feature proposals; the numbered legacy issue link above remains a historical reference.

---

← Back to [Workshop Index](../README.md) | ← [Module 3 — Advanced](03-advanced.md)
