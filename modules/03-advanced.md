# Module 3 — Advanced: Hand the Wheel to Ralph

> Autonomous mode without giving up your Saturday. Ralph is Squad's polling agent — this module is your introduction to letting the team pick up GitHub Issues on its own, starting in safe triage-only mode before you ever let it write code.

← Back to [Workshop Index](../README.md) · [← Module 2 (Intermediate)](02-intermediate.md)

---

> **Facilitator note:** Module 3 is optional. PMs can learn the core value without autonomous execution. Run Ralph `--execute` only when branch protection and review expectations are clear.

## At a glance

**⏱️ ~30 min** · autonomous mode — let Ralph watch your issue tracker and act.

| Step | What you do |
|---|---|
| 10 | Try Ralph — watch mode (`squad watch`), safe in triage-only |
| 11 | Prompt-driven loops (`squad loop`) — optional |

> **Next:** ready to scale past one machine and one repo? [Module 4 — Advanced Comms](04-cross-squad.md) adds @copilot, presets, cross-squad delegation, and sub-squads.

---

## Prerequisites

- You completed [Module 1](01-basic.md) (module 2 strongly recommended) and have a working `reading-list-squad-lab/` repo with a populated `.squad/` directory.
- For steps 10–11 (Ralph): a GitHub repo with `gh auth status` healthy, and a willingness to read what an autonomous agent does to your code.

> If you're short on time, do **step 10 in triage-only mode** — it's the most useful and lowest-risk way to see autonomous mode without letting it touch your code.

---

## Step 10: Try Ralph — Watch Mode (optional, safe in triage-only)

Ralph is Squad's polling agent. He's the named persona for `squad watch` (also available as `squad triage`) — a daemon that polls **GitHub Issues**, builds a context snapshot, and either triages them (labels + comments) or dispatches a Copilot session to actually do the work.

### What Ralph reads — and what he doesn't

Ralph's queue is **GitHub Issues**, full stop. He does not:

- Read your `copilot --agent squad` chat history
- Scan code for `TODO` comments
- Invent work for himself
- Take instructions from `decisions.md` as work items

He *does* read team state (`decisions.md`, `routing.md`, agent histories) as **context** for the LLM that decides which issue to pick. But the queue is the issue tracker.

### 10a. Set up the labels Ralph expects

```powershell
gh label create squad --color "0E8A16" --description "Squad inbox — Lead will triage"
gh label create "squad:lead" --color "1D76DB"
gh label create "squad:backend" --color "1D76DB"
gh label create "squad:frontend" --color "1D76DB"
gh label create "squad:tester" --color "1D76DB"
```

> If a label already exists, `gh` will tell you and skip it. That's fine.

### 10b. File a real issue against the Reading List app

```powershell
gh issue create --title "Add a 'notes' field to books" `
  --body "Users should be able to add personal notes to each book in their reading list. Update the API model, validation, persistence, and UI form. Add tests." `
  --label squad
```

The `squad` label puts it in Ralph's inbox.

### 10c. Run Ralph in triage-only mode first

This is the safe one — Ralph polls, reads issues, applies `squad:{member}` labels, and comments triage notes. **No code is written.** Use it to verify routing works the way you expect *before* you let him execute.

```powershell
squad watch --interval 1
```

`--interval 1` polls every minute (default is 10). Watch the output — Ralph should pick up your issue, decide which member should own it, apply a `squad:{member}` label, and add a comment.

When you've seen what you needed:

```powershell
# In another terminal — clean shutdown:
New-Item -Path .squad/ralph-stop -ItemType File
```

Ralph finishes the current round and exits. Delete `ralph-stop` afterward so the next run isn't immediately blocked.

### 10d. Run Ralph with execution (fully autonomous)

Now the real thing — Ralph will spawn a Copilot session to actually work on issues he finds.

**Pre-flight:**

- Confirm `gh auth status` is green.
- Confirm `main` is protected on GitHub (Settings → Branches → require review). Ralph will push branches and open PRs; branch protection is your last safety net.
- Plan to walk away. Watch mode is meant to run while you're doing something else; sitting and staring at it defeats the point.
- Cap the cost with flags that are actually in `squad watch --help`: `--max-concurrent 1`, `--timeout 20`, and `--two-pass` if you want lighter issue scanning.

**Run it:**

```powershell
squad watch --execute --interval 5 `
  --max-concurrent 1 `
  --timeout 20 `
  --two-pass `
  --log-file ./ralph.log
```

> **Known limitation — specialists don't act like specialists in `--execute` mode** (upstream [issue #1081](https://github.com/bradygaster/squad/issues/1081), closed — routing behaviour is by design): When Ralph spawns a session for a `squad:bishop`-labeled issue, the spawned agent receives a **generic Ralph prompt**, not Bishop's actual charter. The `squad:{member}` label is used only as a routing filter — it is never injected into the spawn prompt as a role assignment. The spawned agent has no specialist knowledge of who it's supposed to be. For quality specialist work, use interactive `copilot --agent squad` sessions instead. `--execute` is most useful for small, well-defined tasks where specialist nuance doesn't matter much.

What happens each round:

1. Ralph polls GitHub for triage-eligible issues.
2. Builds a context snapshot (issue list + decisions + team state).
3. Builds the agent prompt in memory — the issue list plus Ralph's charter.
4. Invokes Copilot for execution with the flags you passed.
5. The agent picks an issue and works on it — code, tests, branch, PR.
6. Ralph monitors execution, updates issue labels/status, and logs everything to `ralph.log`.

### 10e. Monitor a running Ralph

```powershell
squad watch --health
```

Shows PID, uptime, the `gh` auth account (with drift detection), poll interval, repo, and enabled capabilities.

### 10f. Stop Ralph cleanly

```powershell
New-Item -Path .squad/ralph-stop -ItemType File
```

He finishes the current round and exits. `Ctrl+C` also works but may leave scratch directories around.

### 10g. Practical Teams / email bridge patterns (verified in v0.11 docs + help)

The upstream v0.11 docs and `squad watch --help` both verify two opt-in bridge capabilities:

- `--monitor-teams` — scan Teams for actionable messages each round
- `--monitor-email` — scan email for actionable items each round

Both require **a Teams/email MCP bridge** to be available. Start simple:

```powershell
# Support / escalation channel intake
squad watch --monitor-teams --interval 5

# CI / security / notification inbox intake
squad watch --monitor-email --interval 5
```

If you already trust `--execute`, combine them into one operator-friendly monitor:

```powershell
squad watch --execute --board --two-pass `
  --monitor-teams --monitor-email `
  --max-concurrent 1 --timeout 20 --interval 15
```

**Use cases that map cleanly to the documented behavior:**

- **Teams-only** — product/support channel, on-call room, or stakeholder requests that should become GitHub issues.
- **Email-only** — Dependabot, CI, security alerts, or approval mailboxes that should be turned into actionable backlog.
- **Both** — when GitHub Issues is not your only intake source, but GitHub is still your execution queue.

> **Honest tradeoff:** Ralph is most useful when you have a backlog of small, well-scoped issues that you'd file anyway. He's least useful — and most expensive — when issues are vague, when the repo doesn't have a strong test suite to give him a "did it work?" signal, or when you sit and watch him work. If you find yourself watching, you should be running `copilot --agent squad` instead.

> **Try if interested** — pick one if curious:
> - **Read `ralph.log` line by line.** For one round, can you reconstruct which issue Ralph picked and how he routed it? (`ralph.log` captures Ralph's own polling and decisions, not the spawned agent's full reasoning.) Where would you have decided differently?
> - **Mislabel an issue on purpose.** Apply `squad:frontend` to a backend task and watch how Ralph routes it. Does the label filter help, or get in the way?

---

### 10h. The full `squad watch --execute` capability tour

Everything above used a handful of flags. Here is the complete, verified capability surface from `squad watch --help` (v0.11) so you know what the tool can actually do. **Every capability below is opt-in** — Ralph does nothing surprising unless you turn it on (via the flag, or a matching key in `.squad/config.json`). Any capability can be turned back off with `--no-<capability>`.

**Core execution flags:**

| Flag | Default | What it does |
|---|---|---|
| `--execute` | off | Actually spawn Copilot sessions to work issues (without it, Ralph only scans and labels) |
| `--interval <minutes>` | `10` | How often to poll for work each round |
| `--max-concurrent N` | `1` | How many issues Ralph works in parallel — **keep at 1 for the workshop** |
| `--timeout N` | `30` | Minutes per issue before Ralph moves on |
| `--copilot-flags "..."` | — | Pass flags straight through to the spawned Copilot session (e.g. model/allow flags) |
| `--log-file <path>` | — | Tee all output to a timestamped log file |
| `--health` | — | Watch-only: print running-instance status (PID, uptime, account, capabilities) and exit |

**Opt-in capabilities (each is `--<name>` on, `--no-<name>` off):**

| Capability | What it adds to each round |
|---|---|
| `--self-pull` | `git fetch`/`pull` at the start of every round so Ralph works on the latest `main` |
| `--board` | Project-board lifecycle: move cards across columns and reconcile board state with issues |
| `--board-project N` | Which project board number to use (default `1`) |
| `--monitor-teams` | Scan Microsoft Teams for actionable messages (needs a Teams/email MCP bridge) |
| `--monitor-email` | Scan email for actionable items (needs a Teams/email MCP bridge) |
| `--two-pass` | Cheap pass first (list issues), then hydrate only the actionable ones — lighter on tokens |
| `--wave-dispatch` | Dispatch independent sub-tasks in parallel "waves" instead of strictly one-at-a-time |
| `--retro` | Enforce retrospective checks (Ralph verifies its own work against retro criteria) |
| `--decision-hygiene` | Auto-merge the decision inbox (`.squad/decisions/inbox/`) into `decisions.md` each round |

A "kitchen-sink" operator command — turn on the pieces you trust, disable the ones you don't:

```powershell
squad watch --execute `
  --self-pull `
  --board --board-project 1 `
  --two-pass `
  --decision-hygiene `
  --no-retro `
  --max-concurrent 1 --timeout 20 --interval 15 `
  --log-file ./ralph.log
```

> **Honesty check:** don't cargo-cult the whole flag list. Start with `--execute --two-pass --max-concurrent 1 --timeout 20` and add one capability at a time only when you understand what it changes. `--self-pull` and `--board` are the two most useful in a real team; `--wave-dispatch` and `--retro` matter only once you have real parallel throughput.

> **Try if interested:** run `squad watch --help` yourself and diff it against this table. If a flag exists in your install that isn't here, that's a version difference worth noting — the whole workshop is built on "only teach flags the tool actually has."

### 10i. How issue routing actually works (the label lifecycle)

Ralph's labeling isn't magic — it's a simple, inspectable lifecycle you can follow on the Issues tab:

1. **`squad`** — the untriaged inbox. Any issue with the bare `squad` label is "work the team should look at, but nobody owns yet."
2. **Lead triage** — the Lead reads the issue, decides who should own it, applies a **`squad:{member}`** label (e.g. `squad:bishop`), and leaves a short triage comment explaining the routing.
3. **`squad:{member}`** — the named member picks it up in their next session. This is the label Ralph's `--execute` mode filters on.
4. **Reassignment** — routing isn't permanent. A member who realizes an issue belongs elsewhere reassigns it by **removing their label and adding another member's** (`squad:bishop` → `squad:ripley`). No special command — it's just label surgery.

```powershell
# See the whole board by owner:
gh issue list --label "squad" --json number,title,labels

# Manually route (what the Lead does during triage):
gh issue edit 42 --add-label "squad:bishop"

# Reassign later:
gh issue edit 42 --remove-label "squad:bishop" --add-label "squad:ripley"
```

> **Why this matters for `--execute`:** remember the [#1081 caveat](https://github.com/bradygaster/squad/issues/1081) — the `squad:{member}` label is a **routing filter only**. It decides *which* issues Ralph picks up in a given run; it does **not** inject that member's charter into the spawned session. Routing and role-identity are two different things in `--execute` mode.

### 10j. Machine capabilities — let Ralph skip work this machine can't do

Not every machine can do every job. A laptop without a GPU shouldn't pick up "train the ML model"; a CI box without OneDrive shouldn't pick up "sync the lecture slides." Squad solves this with a **capability manifest** plus **`needs:*` labels** — a documented convention Ralph respects at scan time.

**1. Declare what this machine can do.** Drop a manifest at either scope:

- `~/.squad/machine-capabilities.json` — user-wide (applies to every repo on this machine)
- `.squad/machine-capabilities.json` — project-scoped (overrides for one repo)

```json
{
  "machine": "tamir-laptop",
  "capabilities": ["browser", "docker", "personal-gh", "onedrive"],
  "missing": ["gpu", "azure-cli"],
  "lastUpdated": "2026-07-04T00:00:00Z"
}
```

**2. Tag issues with what they require.** Add one or more `needs:*` labels to any issue that has a hard requirement:

| Label | Issue needs… |
|---|---|
| `needs:browser` | a real browser (Playwright/UI automation) |
| `needs:gpu` | GPU compute |
| `needs:personal-gh` | the personal GitHub account signed in |
| `needs:emu-gh` | the EMU/enterprise GitHub account signed in |
| `needs:azure-cli` | `az` CLI authenticated |
| `needs:docker` | a running Docker daemon |
| `needs:onedrive` | OneDrive mounted |
| `needs:teams-mcp` | the Teams/email MCP bridge |

Custom `needs:X` labels work too, as long as `X` appears in the machine's `capabilities` array.

**3. What Ralph does with it.** At startup Ralph loads the manifest, then for each issue extracts its `needs:*` labels and:

- **skips** the issue if it needs *any* capability this machine lacks, logging why:
  ```
  ⏭️  Skipping #42 "Train ML model" — missing: gpu
  ```
- **processes** the issue normally if all needs are satisfied — or if it has **no** `needs:*` labels at all (the feature is strictly opt-in; unlabeled issues are never skipped).

This is what lets you point **several machines at the same repo** and have each one naturally pick up only the work it's equipped for.

**Scaling to Kubernetes.** The same idea maps onto a cluster: label nodes with their capabilities (`node.squad.dev/gpu: "true"`), use a `nodeSelector` so capability-bound pods land on the right nodes, and let a DaemonSet auto-discover node capabilities into the manifest. The reference project [`github.com/tamirdresher/squad-on-aks`](https://github.com/tamirdresher/squad-on-aks) shows a full multi-node Ralph fleet wired this way.

> **Try if interested:** file two issues — one labeled `needs:gpu`, one with no `needs:*` label — then run `squad watch` (scan-only) on a machine whose manifest lists `"missing": ["gpu"]`. Confirm Ralph skips the first and considers the second.

---

## Step 11: Prompt-driven loops (`squad loop`) — optional

`squad loop` is a different beast: instead of polling issues, it reads a single prompt file (`./loop.md`) and runs that instruction every N minutes. Useful for **standing housekeeping jobs** — docs hygiene, dependency updates, lint sweeps — that you want done on a schedule, no issue tracker required.

> **Important:** `squad loop` is fire-and-forget — there is no chat. The terminal shows status logs only; you cannot type at it. To change Ralph's instructions, edit `./loop.md`. He re-reads it at the start of every cycle, so edits take effect on the next round automatically.

### 11a. Generate the boilerplate

```powershell
squad loop --init
```

This creates `./loop.md` with placeholders.

### 11b. Write a narrow, idempotent loop instruction

Open `./loop.md` and replace the placeholder with something specific:

```markdown
---
configured: true
---
# Loop: Test coverage hygiene

Every cycle:

1. Run the test suite (`dotnet test` and `npm test`) and capture failures.
2. If any test is failing, open an issue titled "test: <test name> failing" with the failure output. Do not attempt to fix it.
3. If all tests pass and any source file under `backend/` lacks a corresponding test file, draft tests and open a PR titled "test: cover <file>".
4. Do nothing else. Do not refactor. Do not touch unrelated files.
```

> **Set `configured: true` in the frontmatter.** The shipped `loop.md` template defaults to `configured: false`. While it stays `false`, `squad loop` runs **onboarding mode** — it walks you through setup and **ignores the loop instruction you wrote**. Flip the frontmatter to `configured: true` (as shown above) so the CLI actually runs your instruction each cycle.

Two rules of thumb the hard way:

- **Idempotent.** "Open an issue if X is missing" is good. "Improve the codebase" is a credit-card incident.
- **Narrow.** A loop that's allowed to do five things will eventually find a sixth.

### 11c. Run it on a sane schedule

```powershell
squad loop --interval 60 --timeout 15
```

Hourly tick, each round capped at 15 minutes. If the round needs more than 15 minutes once to do its job, the loop instruction is too broad — split it.

### 11d. Understanding interval vs. timeout

- `--interval N` — minimum gap between round *starts*, not a hard kill. If a round overruns, the next tick is skipped and Ralph waits.
- `--timeout N` — hard ceiling per spawned agent execution (default 30 min). When this elapses the agent process is killed; partial work that was already committed stays committed; nothing else is rolled back.
- `--max-concurrent N` (default 1) — how many rounds can overlap. With the default, rounds are strictly serial.
- **No checkpoint/resume across timeouts.** If a round dies mid-task, the next round starts fresh from `loop.md`. That's why idempotent prompts matter.

### 11e. Stop a loop

Same as triage:

```powershell
New-Item -Path .squad/ralph-stop -ItemType File
```

---

## Honest tradeoffs and when to walk away

A short, opinionated checklist before you commit Ralph to anything that matters:

| You should... | If... |
|---|---|
| Use `squad watch --execute` | You have a real issue backlog of small, well-scoped tickets, branch protection on `main`, and a CI pipeline that catches the obvious mistakes. |
| Use `squad watch` (no execute) | You want to see how Ralph routes work before letting him write code. Always start here. |
| Use `squad loop` | You have a recurring hygiene task that's idempotent and narrow. |
| Walk away | Issues are vague, tests are thin, you're sitting and watching, or you can't articulate what "done" looks like for a round. |

The fastest way to lose money with Squad is to point Ralph at a vague issue tracker on a repo with no tests and let him execute overnight. The fastest way to *gain* something is to use the team interactively (modules 1 and 2) until you have a real intuition for what they do well, then introduce Ralph for the narrow class of work where polling helps.

---

## You're done

You've now seen Squad's autonomous mode alongside the interactive core:

- **Interactive** (modules 1 and 2) — you drive, the team helps. Where the value lives.
- **Autonomous** (steps 10–11) — Ralph polls and acts. Useful for narrow problems, expensive for broad ones.

Whether to keep Squad on a real project is now a judgement call you can make with evidence instead of marketing. That's the whole point of the workshop.

> **Want to go further?** [Module 4 — Advanced Comms](04-cross-squad.md) covers adding GitHub's @copilot as a teammate, reusing rosters with presets, cross-squad delegation, and sub-squads for multi-machine scale.

---

## Learn more

- [Build autonomous agents with Squad](https://github.github.com/squad/docs/guide/build-autonomous-agent) — deep dive into Ralph's architecture and configuration
- [Building resilient agents](https://github.github.com/squad/docs/guide/building-resilient-agents) — patterns for agents that handle failure gracefully
- [Squad cookbook — recipes](https://github.github.com/squad/docs/cookbook/recipes) — practical patterns for loop instructions and triage workflows
- [Open issues on github/squad](https://github.com/github/squad/issues) — current known bugs and feature proposals; numbered legacy issue links above remain historical references.

---

← Back to [Workshop Index](../README.md) | ← [Module 2 — Intermediate](02-intermediate.md) | [Module 4 — Advanced Comms →](04-cross-squad.md)
