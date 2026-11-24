# Squad — Quick Reference Cheat Sheet

> Compact prompt patterns and CLI commands from this workshop. Commands verified for the Squad CLI v0.11 workshop track.

← Back to [Workshop Index](../README.md)

---

## Prompts you'll say to your team

| What you want | What to say |
|---|---|
| Hire the team | "I'm building X. Use a lean team: Lead, Backend, Frontend, Tester, Scribe. Stack: Y. Set up the team now." |
| PM acceptance criteria | "Before coding, write acceptance criteria from the user's point of view and ask me to approve them." |
| Plan before coding | "Before building anything, explore the repo, propose a folder structure, capture one architecture decision, and explain the implementation plan. No code yet." |
| Build a feature | "Build the first vertical slice: backend X, frontend Y, tests Z. Keep it minimal but production-clean." |
| Force a decision | "Lead, decide whether we should use A or B. Record the decision with rationale in `decisions.md`." |
| Run a code review | "Lead, review all changes as if this were a real PR. Be specific about what's good and what needs improvement." |
| Product recap | "Summarize what changed as user-facing behavior, not implementation details. Tell me how to verify it manually." |
| Get unstuck | Ask the coach: `copilot --agent squad-coach` after `./scripts/Install-WorkshopAgents.ps1`. |

## CLI commands

| Command | What it does |
|---|---|
| `copilot --agent squad` | Start an interactive Copilot session with the Squad agent — the primary interface. |
| `/allow-all` | Type inside Copilot to approve workshop tool calls. |
| `copilot --agent squad -- --yolo` | Start with tool auto-approval; use only when you understand the blast radius. |
| `copilot --agent squad-coach` | Launch the workshop coach after installing it into the lab repo. |
| `squad init` | Cast / initialize the team in the current repo. |
| `squad init --preset <name>` | Initialize, then apply a curated preset roster. |
| `squad init --mode remote <path>` | Point the project at an external team root (writes `.squad/config.json`). |
| `squad status` | Show which squad is active and why. |
| `squad roles` | List built-in Squad roles (`--category`, `--search`). |
| `squad cost` | Report token usage from orchestration logs (`--all`, `--agent`). |
| `squad sync` | Push/pull the `squad-state` branch (`--push`/`--pull`); no-op for local/worktree backends. |
| `squad doctor` | Health-check `.squad/` structure, Node.js, `node:sqlite`. |
| `squad watch` | Run Ralph in polling mode — reads GitHub Issues, labels / triages. |
| `squad watch --interval N` | Poll every N minutes (default 10); use triage-only first. |
| `squad watch --execute` | Autonomous execution; facilitator-led unless branch protection and review gates are clear. |
| `squad watch --max-concurrent N` | Work up to N issues in parallel (default 1). |
| `squad watch --timeout N` | Max minutes per issue before moving on (default 30). |
| `squad watch --self-pull` | `git fetch/pull` at the start of each round. |
| `squad watch --board` | Reconcile project board lifecycle (`--board-project N` sets the project number). |
| `squad watch --monitor-teams` | Scan Teams each round for actionable messages (requires a Teams/email MCP bridge). |
| `squad watch --monitor-email` | Scan email each round for alerts/action items (requires a Teams/email MCP bridge). |
| `squad watch --two-pass` | Lightweight scan first, then hydrate only actionable issues. |
| `squad watch --wave-dispatch` | Dispatch sub-tasks in parallel waves. |
| `squad watch --retro` | Enforce retrospective checks each round. |
| `squad watch --decision-hygiene` | Auto-merge the decision inbox each round. |
| `squad watch --no-<capability>` | Disable a capability enabled in `config.json` (e.g. `--no-board`). |
| `squad watch --health` | Print watcher status and exit (no scanning). |
| `squad watch --log-file <path>` | Tee timestamped output to a log file. |
| `squad triage …` | Alias for `squad watch` — identical flags. |
| `squad loop --init` | Create a starter `./loop.md` at the repo root. |
| `squad loop` | Run the `./loop.md` prompt on a schedule. |
| `squad preset list` | Show reusable agent rosters available on this machine. |
| `squad preset show <name>` | Print the roster/config a preset would apply. |
| `squad preset save <name>` | Save the current team as a reusable preset. |
| `squad preset apply <name>` | Apply a saved preset to the current repo (`--force` to overwrite). |
| `squad preset init --remote` | Back presets with a private `squad-home` GitHub repo. |
| `squad preset install <source>` | Install a preset from a GitHub URL, SSH URL, or local path (`--name` to rename, `--force` to overwrite). |
| `squad preset install https://github.com/org/repo#preset-name` | Install one named preset from a shared GitHub preset repo. |
| `squad discover` | List known peer squads and their capabilities. |
| `squad delegate <squad> "<work>"` | Open a cross-squad issue in another squad's repo. |
| `squad registry add <name> <path>` | Register a peer squad for discovery/delegation (no inheritance). |
| `squad registry list` / `squad registry remove <name>` | Inspect or remove known peer squads. |
| `squad upstream add <source>` | Add an upstream Squad source (`--name`, `--ref`) to inherit shared config. |
| `squad upstream sync [name]` | Pull the latest shared config from upstream sources. |
| `squad subsquads list` | List SubSquads for multi-Codespace scaling (`status`, `activate <name>`). |
| `squad copilot` | Add GitHub's `@copilot` coding agent to the team. |
| `squad economy on` / `squad economy off` | Toggle cheaper auto-selected models vs standard quality-first selection. |
| `squad nap --dry-run` / `squad nap` | Preview and run context hygiene when `.squad/` state gets noisy. |

> Stop Ralph cleanly: `New-Item -Path .squad/ralph-stop -ItemType File`; delete that file before the next run.

## Files you should know

| Path | What it holds |
|---|---|
| `.squad/team.md` | Team roster — add yourself as `👤 Human — Project Owner`. |
| `.squad/decisions.md` | Merged architectural decisions. |
| `.squad/decisions/inbox/` | Draft decisions before Scribe merges them; empty is expected. |
| `.squad/agents/{name}/history.md` | Per-agent working memory. |
| `./loop.md` | Prompt `squad loop` runs each cycle — repo root, not `.squad/`. |
| `.squad/ralph-stop` | Sentinel file that stops Ralph after the current round. |
| `ralph.log` | Ralph's run log when you pass `--log-file ./ralph.log`. |
| `~/.squad/machine-capabilities.json` | Per-machine capability manifest; Ralph skips `needs:*` issues this box can't run. Project override: `.squad/machine-capabilities.json`. |
| `.squad/config.json` | State backend + external team-root pointer (created by `init --mode remote`). |

---

← Back to [Workshop Index](../README.md)
