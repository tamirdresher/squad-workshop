# Squad Workshop

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Check links](https://github.com/tamirdresher/squad-workshop/actions/workflows/check-links.yml/badge.svg)](https://github.com/tamirdresher/squad-workshop/actions/workflows/check-links.yml)
[![Verify script](https://github.com/tamirdresher/squad-workshop/actions/workflows/verify-script.yml/badge.svg)](https://github.com/tamirdresher/squad-workshop/actions/workflows/verify-script.yml)

> Workshop: assemble your AI product-and-engineering squad with the **GitHub Copilot CLI**, then ship a full-stack app in a guided lab.

> **Targets Squad CLI `1.1.0+` and the current GitHub Copilot CLI.** If `squad doctor` reports `0 failed`, you're fine even if the `passed` / `info` counts differ from the examples.

**Squad + the GitHub Copilot CLI** gives your repo a resident team — Lead, Backend Engineer, Frontend Engineer, Tester, and Scribe — with persistent memory, specialist roles, and a routing layer that sends work to the right agent automatically.

This workshop is written for engineers **and PMs**. Engineers can inspect and edit code. PMs can drive product goals, acceptance criteria, tradeoffs, and behavior review while the agents write the code.

---

## Prerequisites

Before the workshop, make sure your machine has:

- [ ] **Node.js 22.5.0+** — required by Squad CLI for the built-in `node:sqlite` module. Download: https://nodejs.org/en/download. Install: Windows `winget install OpenJS.NodeJS.22`; macOS `brew install node@22`.
- [ ] **.NET SDK 10.0.0+** — used for the workshop backend. Install guide: https://learn.microsoft.com/dotnet/core/install/. Install: Windows `winget install Microsoft.DotNet.SDK.10`; macOS `brew install --cask dotnet-sdk`.
- [ ] **Git** — required for cloning and source control. Download: https://git-scm.com/downloads. Install: Windows `winget install Git.Git`; macOS `brew install git`.
- [ ] **GitHub CLI 2.89.0+** — required for repository and project access. Download: https://cli.github.com/. Install: Windows `winget install GitHub.cli`; macOS `brew install gh`.
- [ ] **GitHub CLI auth with project scope** — run `gh auth login -s project`, then confirm with `gh auth status`.
- [ ] **GitHub Copilot CLI** — required for the Squad agent sessions in this workshop. Install: `npm install -g @github/copilot`; then verify with `copilot --version`.
- [ ] **Squad CLI 1.1.0+** — required for the resident squad workspace. Package metadata: https://registry.npmjs.org/@bradygaster/squad-cli/latest. Install or upgrade: `npm install -g @bradygaster/squad-cli`.
- [ ] **PowerShell 7** — use `pwsh` for cross-platform scripts. Download: https://github.com/PowerShell/PowerShell/releases/latest. Install: Windows `winget install Microsoft.PowerShell`; macOS `brew install powershell`.

Verify everything from the repo root before opening the modules:

```powershell
pwsh ./scripts/Verify-Prerequisites.ps1
```

All checks should show `PASS`. For install commands, OS-specific notes, and troubleshooting, see the full [prerequisites guide](docs/prerequisites.md).


---

## Helpful links

| Need | Link |
|---|---|
| Full prerequisites | [docs/prerequisites.md](docs/prerequisites.md) |
| Troubleshooting | [docs/troubleshooting.md](docs/troubleshooting.md) |
| Cheat sheet | [docs/cheat-sheet.md](docs/cheat-sheet.md) |
| PM track | [docs/pm-track.md](docs/pm-track.md) |
| Facilitator guide | [docs/facilitator-guide.md](docs/facilitator-guide.md) |
| Companion slides | [presentations/squad-workshop.html](presentations/squad-workshop.html) |
| Module 0 — orientation | [modules/00-orientation.md](modules/00-orientation.md) |
| Module 1 — basic | [modules/01-basic.md](modules/01-basic.md) |
| Module 2 — intermediate | [modules/02-intermediate.md](modules/02-intermediate.md) |
| Module 3 — advanced | [modules/03-advanced.md](modules/03-advanced.md) |
| Module 4 — advanced comms | [modules/04-cross-squad.md](modules/04-cross-squad.md) |

---

## What you'll build

A **Personal Reading List** app:

- .NET 10 minimal API backend
- React + TypeScript frontend
- SQLite storage
- At least one architectural decision recorded by the team
- A review pass that checks behavior against acceptance criteria

The app is a vehicle. The point is to experience the team model, not to ship the next unicorn.

---

## Modules

| # | Module | What you do | Time | Extra prerequisites |
|---|---|---|---|---|
| 0 | [Orientation](modules/00-orientation.md) | Verify the GitHub Copilot CLI, GitHub auth, repo access, and the PM/engineer mental model. | 15–20 min | GitHub Copilot CLI + GitHub CLI |
| 1 | [Basic](modules/01-basic.md) | Build a working .NET 10 + React reading-list app with one architectural decision and a review pass. | ~90–120 min | None beyond the prereqs below. |
| 2 | [Intermediate](modules/02-intermediate.md) | Add filtering and validation, then inspect whether the repo's memory actually compounded. | ~45 min | Completed module 1. |
| 3 | [Advanced](modules/03-advanced.md) | Optional/facilitator-led tour: Ralph work-monitor modes (`squad watch`), Teams/email bridges, and prompt-driven loops (`squad loop`). | ~45 min | Branch protection for execution. |
| 4 | [Advanced comms](modules/04-cross-squad.md) | Optional/advanced: add GitHub's @copilot as a teammate, reuse rosters with presets, cross-squad delegation, and sub-squads for multi-machine scale. | ~30 min | Completed module 1; module 3 recommended. |

> **Recommended PM path:** Module 0 + Module 1, then the artifact-review section of Module 2. Modules 3 and 4 are optional and best run as facilitator demos. See [docs/pm-track.md](docs/pm-track.md).

---

## Quick start

### Prerequisites

| Tool | Minimum version | Check command |
|---|---|---|
| Node.js | 22.5.0 | `node --version` |
| .NET SDK | 10.0.0 | `dotnet --version` |
| Git | any recent | `git --version` |
| GitHub CLI | 2.89.0 | `gh version` |
| GitHub CLI auth | logged in with `project` scope | `gh auth status` |
| GitHub Copilot CLI | current | `copilot --version` |
| Squad CLI | 1.1.0 | `squad --version` |
| PowerShell 7 | 7.x | `pwsh --version` |

### Verify everything in one pass

```powershell
./prereqs.ps1
# or
pwsh ./scripts/Verify-Prerequisites.ps1
```

All lines should show `PASS`. Fix any that don't before opening Module 1.

### Start

```powershell
git clone https://github.com/tamirdresher/squad-workshop.git
cd squad-workshop
./prereqs.ps1
```

Then open [modules/00-orientation.md](modules/00-orientation.md) and continue to [Module 1](modules/01-basic.md).

---

## Getting help

**Stuck on a step?** Use the Squad Coach agent — it knows every module step, workshop setup, and the failure modes of Squad itself.

One-time setup from this workshop repo root:

```powershell
./scripts/Install-WorkshopAgents.ps1
```

Then from inside the lab repo:

```powershell
copilot --agent squad-coach
```

Ask anything: "I'm on Module 1 Step 4 and the team isn't generating tests" or "Copilot starts but GitHub access fails."

Other help surfaces:

- [Prompt: debug a stuck step](.github/prompts/debug-step.prompt.md)
- [Prompt: inspect Squad artifacts](.github/prompts/inspect-squad-artifacts.prompt.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Cheat sheet](docs/cheat-sheet.md)
- [Budget & model tiers](docs/budget-and-models.md)
- [PM track](docs/pm-track.md)
- [Facilitator guide](docs/facilitator-guide.md)

---

## Contributing

Spotted a broken step? Tool version changed? Want to propose a module?

See [CONTRIBUTING.md](CONTRIBUTING.md) or open an issue in this repo.

---

## Acknowledgements

This workshop is adapted from **[joslat/squad-workshop](https://github.com/joslat/squad-workshop)** by Jose Luis Latorre Millas and contributors, licensed under MIT.

Additional thanks:

- **[Brady Gaster](https://github.com/bradygaster)** — creator of the [Squad CLI](https://github.com/github/squad).
- **[Tamir Dresher](https://github.com/tamirdresher)** — co-creator of Squad and author of the [`squad-skills`](https://github.com/tamirdresher/squad-skills) marketplace and companion material.

---

## License

This workshop is licensed under the [MIT License](LICENSE).
Copyright © 2026 Jose Luis Latorre Millas and contributors
