# Squad Workshop — Copilot Instructions

<!-- Modified for the AI NEXT course refresh on 2026-11-10; original attribution retained. -->

## Current AI NEXT route

For the single-day course, start at `docs/ai-next/learner-lab.md`, with preparation in `docs/ai-next/prerequisites.md` and `docs/ai-next/instructor.md`. It is 180 minutes including a 10-minute break and 126 hands-on minutes. Original starter and checkpoints are under `labs/ai-next/`; the presentation is `presentations/ai-next-squad.html`.

The product upstream is `https://github.com/github/squad` and official docs are `https://github.github.com/squad/`. The package remains `@bradygaster/squad-cli`. `bradygaster/squad` is a fork, not a redirect. The course repository is separately `tamirdresher/squad-workshop`.

Use Microsoft CFS feeds only on managed setups. The course baseline is stable Squad 1.1.0, rechecked on 2026-11-10; do not recommend floating `@latest`, previews or public-registry bypasses. `docs/ai-next/upstream-and-provenance.md` records source verification and delivery gates. CLI installation/authentication does not prove Copilot entitlement or a successful live run. Do not initialize a resident Squad in this course repository; learners initialize one only inside a new participant lab.

For 1.1.0, `squad triage` polls by default and `squad loop` runs a configured prompt file without requiring issues. Neither is run during the core class. Do not use the historical "Ralph only reads issues" claim below as current loop behavior, and do not recommend unverified stop-file recipes.

The remaining instructions below describe the retained extended modules' historical baseline. Their durations sum to 195 minutes before breaks; old doctor counts, model names and upstream issues are not current-release guarantees. Never recommend blanket permissions or unattended loops for the new course.

This is the **squad-workshop** repository: a hands-on, self-contained workshop for learning **Squad CLI** — a tool that gives a Git repository a resident AI development team (Lead, Backend, Frontend, Tester, Scribe) with persistent memory, specialist roles, and automatic routing.

When answering questions in this repo, use this context to be accurate and immediately useful.

---

## What this repository is

The retained workshop has three modules (~195 minutes before breaks). The current AI NEXT route above is separate. Both use a **Personal Reading List** app — a .NET 10 minimal API + React + TypeScript + SQLite full-stack app.

- **Module 1 — Basic** (`modules/01-basic.md`): Build the app from scratch end-to-end. ~90 min.
- **Module 2 — Intermediate** (`modules/02-intermediate.md`): Add a second-wave feature, inspect whether Squad's memory compounded. ~45 min.
- **Module 3 — Advanced** (`modules/03-advanced.md`): .NET Aspire observability + Ralph autonomous mode. ~60 min.

The lab repo created *during* the workshop is called **`reading-list-squad-lab`** — it is separate from this repo. Steps 0a–0e in Module 1 create it.

---

## Key Squad concepts

### Team model
`squad init` scaffolds a resident team in `.squad/` and `.github/`. Each team member is an AI agent with a role, a name from a thematic cast, and persistent memory. The `copilot --agent squad` CLI invokes the whole system.

### Core commands
| Command | What it does |
|---|---|
| `squad init` | Scaffold the team workspace in a new repo |
| `squad doctor` | Checks team/configuration and reachable CLI; does not prove live entitlement |
| `squad aspire` | Launch the .NET Aspire dashboard (via Docker) to receive OpenTelemetry traces from live Squad sessions |
| `squad triage` | Run Ralph in polling mode — reads GitHub Issues, labels/triages, optionally executes |
| `squad loop` | Run a configured prompt file (`loop.md` by default in 1.1.0); not part of the core class |
| `copilot --agent squad` | Start the Copilot CLI session with the Squad agent attached |

### Decisions flow
Agents write draft decisions to `.squad/decisions/inbox/<agent>-<topic>.md`. The Scribe merges them into `.squad/decisions.md` and clears the inbox. The inbox being empty after a step is **expected and correct** — decisions live in `.squad/decisions.md`.

### Ralph
`squad triage` polls GitHub Issues as its queue; `squad loop` runs a configured prompt file without requiring issues. Neither is used in the AI NEXT core class. Before a separate approved exercise, verify the installed help, bound concurrency/time and permissions, define an operator stop, and retain human review. Historical stop-file recipes are not verified for 1.1.0.

### `squad doctor` healthy output (v0.9.4)
```
Summary: 9 passed, 0 failed, 0 warnings, 2 info
```
The 2 `ℹ️` info lines about `vscode-jsonrpc` and `copilot-sdk session.js` are **expected** for global CLI installs — not warnings.

---

## Key files in this repo

| File | Purpose |
|---|---|
| `docs/ai-next/prerequisites.md` | Current course requirements, managed feeds and live-session gate |
| `docs/prerequisites.md` | Extended-module historical requirements |
| `scripts/Verify-Prerequisites.ps1` | Historical prereq checker; not the AI NEXT entitlement gate |
| `docs/troubleshooting.md` | Common failure patterns with exact error text and fixes |
| `modules/01-basic.md` | Workshop Module 1 — start here |
| `CONTRIBUTING.md` | How to file broken-step issues, fix content, propose modules |

---

## Historical extended-module minimum tool versions

| Tool | Minimum |
|---|---|
| Node.js | 22.5.0 |
| .NET SDK | 10.0.0 |
| GitHub CLI | 2.89.0 |
| GitHub Copilot CLI | 1.0.24 |
| Squad CLI | 0.9.4 |

---

## How to answer learner questions

- **"How do I install X?"** → Start with `docs/ai-next/prerequisites.md`; distinguish the current route from the historical extended modules and use CFS for managed package installs.
- **"I'm stuck on step N of module M"** → Help them diagnose by asking for the exact error output and their tool versions from `.\scripts\Verify-Prerequisites.ps1`. Check `docs/troubleshooting.md` for known patterns.
- **"Why is the Aspire dashboard empty?"** → Three causes: Docker not running (most common — `✓ lies when Docker is down`), Squad version too old, or firewall blocking `localhost:4317`.
- **"The inbox under `.squad/decisions/inbox/` is empty"** → This is correct. The Scribe merged the decision into `.squad/decisions.md`.
- **"squad doctor shows warnings"** → Ask for the full output, active executable from `Get-Command squad`, and `squad --version`. Follow the pinned CFS preflight, not a floating upgrade or historical summary count.
- **"Should I use the coach agent?"** → Yes. Run `.\scripts\Install-WorkshopAgents.ps1` once from the workshop repo root to install the coach into the lab repo's `.github/agents/`, then `copilot --agent squad-coach` from inside `reading-list-squad-lab` gives step-by-step help and Squad expertise on demand.

---

## Tone

This workshop is direct and honest about Squad's failure modes. Match that tone. Don't oversell Squad, don't hide gotchas, don't generate vague encouragement. When something can go wrong, say exactly how to check and fix it.
