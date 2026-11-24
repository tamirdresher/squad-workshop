# Squad Workshop — Copilot Instructions

This is the **Squad Workshop** repository: a hands-on, self-contained workshop for learning **Squad CLI through the GitHub Copilot CLI**.

When answering questions in this repo, be accurate, direct, and immediately useful.

---

## What this repository is

A workshop in four modules plus an orientation. Learners build a **Personal Reading List** app — a .NET 10 minimal API + React + TypeScript + SQLite full-stack app — through Squad's team model.

- **Module 0 — Orientation** (`modules/00-orientation.md`): Steps 0.1–0.5 — verify Copilot CLI and GitHub auth, understand the entrypoint, pick a path, choose the lab repo location, and optionally set up MCP servers and skills.
- **Module 1 — Basic** (`modules/01-basic.md`): build the app from scratch end-to-end.
- **Module 2 — Intermediate** (`modules/02-intermediate.md`): add filtering/validation and inspect whether memory compounded.
- **Module 3 — Advanced** (`modules/03-advanced.md`): optional/facilitator-led Step 10 (`squad watch` triage-only mode, `--execute`, and monitoring flags) and Step 11 (`squad loop` prompt-driven scheduled housekeeping).
- **Module 4 — Advanced Comms** (`modules/04-cross-squad.md`): optional Step 13 (add `@copilot` via `squad copilot --auto-assign`) and Step 14 (presets, `squad discover` / `squad delegate` cross-squad delegation, and sub-squads).

The companion browser slides are `presentations/squad-workshop.html`; the module documents remain the step-by-step source.

The lab repo created during the workshop is **`reading-list-squad-lab`**. It is separate from this repo.

---

## Key Squad + Copilot concepts

### Team model

`squad init` scaffolds a resident team in `.squad/` and `.github/`. Each team member is an AI agent with a role and persistent memory. The canonical workshop entrypoint is:

```powershell
copilot --agent squad
```

This is the canonical, primary entrypoint for all Squad work in this workshop.

### Core commands

| Command | What it does |
|---|---|
| `copilot --agent squad` | Start an interactive Copilot CLI session with the Squad agent attached. |
| `copilot --agent squad-coach` | Start the workshop coach after installing it into the lab repo. |
| `squad init` | Scaffold the team workspace in a new repo. |
| `squad doctor` | Validate `.squad/` structure and Node.js version. |
| `squad watch` | Run Ralph in polling mode. |
| `squad loop` | Run scheduled prompt-driven housekeeping. |
| `squad copilot --auto-assign` | Add GitHub's `@copilot` coding agent to `.squad/team.md`. |

### Decisions flow

Agents write draft decisions to `.squad/decisions/inbox/<agent>-<topic>.md`. The Scribe merges them into `.squad/decisions.md` and clears the inbox. An empty inbox after a step is expected.

### Ralph

Ralph is the polling persona for `squad watch` / `squad loop`. His queue is GitHub Issues. He does not read chat history, scan TODO comments, or invent work.

---

## Minimum tool versions

| Tool | Minimum |
|---|---|
| Node.js | 22.5.0 |
| .NET SDK | 10.0.0 |
| GitHub CLI | 2.89.0 |
| GitHub Copilot CLI | current |
| Squad CLI | 1.1.0 |

If a learner says `copilot` is missing, tell them to install the GitHub Copilot CLI (`npm install -g @github/copilot`) and verify `copilot --version`.

---

## How to answer learner questions

- **Install questions** → point to `docs/prerequisites.md` and `./prereqs.ps1`.
- **Stuck on a step** → ask for exact command/output and `./scripts/Verify-Prerequisites.ps1` output.
- **Copilot starts but GitHub fails** → check `gh auth status`, then `gh auth login -s project`.
- **PM/product confusion** → ask Lead to restate product goal, acceptance criteria, user-facing changes, and risks in plain English.
- **Empty decisions inbox** → expected; check `.squad/decisions.md`.

## Tone

Direct and honest. Do not oversell Squad or Copilot. When something can go wrong, say exactly how to check and fix it.
