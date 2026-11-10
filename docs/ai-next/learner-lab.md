# AI NEXT: build with a repository-resident AI team

**One day · 180 minutes · four labs · 126 minutes hands-on**

[Prerequisites](prerequisites.md) · [Instructor guide](instructor.md)

## What you will be able to demonstrate

By the end, you should be able to:

1. Initialize a small Squad team in a **separate participant repository** and
   explain which specialist owns each change.
2. Coordinate bounded backend, frontend, and test work in parallel, rather than
   asking one chat to do everything without a plan.
3. Record an invariant and test whether a **fresh session retrieves and applies
   it** during a second feature.
4. Make a human accept/change decision from executable checks and an independent
   review, with an honest evidence bundle.

The app is the vehicle: a prepared **.NET 10 minimal API + React + TypeScript +
SQLite Personal Reading List**. You will add marking books as read, then
filtering. We are not rebuilding the starter from a blank folder in three hours.

## Agenda: exactly 180 minutes

| Clock | Minutes | Activity | Observable outcome |
|---|---:|---|---|
| 00–12 | 12 | Framing: context loss, an alternative, the team mental model | Explain the difference between chat context and repo artifacts |
| 12–22 | 10 | Instructor demo | Recognize routing, permission stops, and human acceptance |
| 22–52 | 30 | **Lab 1: initialize and understand** | Healthy participant team, running baseline, role ownership |
| 52–60 | 8 | Debrief | Separate observed behavior from agent claims |
| 60–95 | 35 | **Lab 2: parallel feature delivery** | Mark-as-read feature plus targeted regression checks |
| 95–105 | 10 | **Break** | No unattended agent work |
| 105–140 | 35 | **Lab 3: memory experiment** | Fresh-session decision retrieval applied to filtering |
| 140–166 | 26 | **Lab 4: review and evidence** | Independent review, human gate, inspected export |
| 166–180 | 14 | Wrap-up and next steps | Explain results, limits, and a safe next experiment |

Lab time is **30 + 35 + 35 + 26 = 126 minutes**, or **70% of the 180-minute
wall clock**, including the break in the denominator. The original workshop's
90/45/60-minute modules remain a separate, longer learning path.

## Mental model and working agreement

```text
Your bounded request
        |
        v
Lead: scope + ownership + dependencies
        |
        +----> Backend author ----+
        +----> Frontend author ---+--> integrated change --> independent reviewer
        +----> Tester ------------+                              |
        |                                                       v
        +----> Scribe: decisions/history                  YOU accept or request changes
                         |
                  a later fresh session retrieves evidence
```

Parallelism helps when tasks have an agreed contract and separate file
ownership. It is not permission for several agents to edit the same file.
Agent names depend on the cast; roles and responsibilities matter more than
the theme.

**Throughout this course:**

- Work only in your participant directory. Never initialize Squad in the
  workshop checkout or edit another participant's repository.
- Approve tools and permissions individually or through a legitimate,
  narrowly scoped policy you understand. Do not use blanket approval,
  unattended autonomy, or a permission-bypass flag.
- Stop for unexpected network access, package-source changes, credential access,
  destructive edits, or work outside the lab. Read commands before approval.
- Do not create a remote, push, open a real PR, start a polling loop, or deploy.
  Lab 4 is a **local PR-style review**, not publication.
- Keep secrets, databases, raw conversations, and account details out of
  evidence. Agent assertions are not test results.
- Do not change the workshop's validation scripts or the prepared baseline to
  make a result pass. Author extra tests only inside your participant directory;
  the course's external regression harness is an independent check.

## Before the clock starts

Complete the [readiness gates](prerequisites.md), including a live model request.
From the **workshop repository root**, create the starter once if you have not
already done so:

```powershell
.\scripts\New-AiNextLab.ps1 -Checkpoint starter -Destination .\reading-list-squad-lab
.\scripts\Test-AiNextLab.ps1 -LabPath .\reading-list-squad-lab -Feature starter
```

An existing destination is intentionally refused. If yours already contains
your prepared work, do not rerun creation against it. Tests operate on the
specified lab; read their output, not just the command's presence in a transcript.

Use three terminals:

| Terminal | Working directory | Purpose |
|---|---|---|
| A | Participant root: `reading-list-squad-lab` | Git, Squad, API, and local inspection |
| B | Participant `frontend` | React development server |
| C | Workshop repository root | Validation and evidence scripts |

Use another participant-root terminal for Copilot while the API is running.
In **every participant PowerShell terminal**, including fresh/recovery Copilot
terminals, set `$env:SQUAD_NO_PERSONAL='1'` before launching Squad or Copilot.
Every code block below identifies its working directory. Commands inside
plain-text prompt blocks are instructions **to Squad**, not shell commands.

### Run the prepared application

**Terminal A, participant root:**

```powershell
dotnet run --project .\api\ReadingList.Api.csproj --no-launch-profile --urls http://127.0.0.1:5080
```

**Terminal B, participant root initially:**

```powershell
Set-Location .\frontend
npm ci
npm run dev
```

Open the frontend URL printed by Vite, normally `http://localhost:5173`.
The development proxy forwards `/api` requests to `http://127.0.0.1:5080`.
Use an instructor-approved alternative if the ports are occupied; changing the
API port without updating the proxy will break UI/API connectivity.
Do not terminate a process that is not yours.

### Required stop → validate/export → restart cycle

Before **every** `Test-AiNextLab.ps1` or `Export-AiNextEvidence.ps1` command,
stop your API in Terminal A **and** Vite in Terminal B with `Ctrl+C`.
The validator builds the API and runs `npm ci`; running servers can lock Windows
binaries or dependencies. `dotnet run` without watch does not reload new builds.
The validator refuses identifiable lab processes/locked API outputs and never
kills them. That guard cannot prove every server is stopped (especially outside
Windows); you remain responsible for stopping both owned terminals.

After validation/export succeeds, restart **both** using the commands above
(Terminal B is already in `frontend`, so run `npm run dev` there). Only then do
browser checks/reload. Keep this cycle inside each lab's validation timebox.
If you cannot identify a server as yours, ask the instructor; do not kill it.

**Another participant-root PowerShell terminal:**

```powershell
Invoke-RestMethod http://127.0.0.1:5080/api/books
```

Add a book through the UI. Stop **your API** with `Ctrl+C`, run the same API
command again, and reload: the book should persist in SQLite. This manual UI
and persistence observation is separate from the test script's isolated checks.

## Contract card: agree before anyone edits

Every book has `id`, `title`, `author`, and `isRead`. Preserve the same JSON
shape across all endpoints.

| Stage | Contract |
|---|---|
| Starter | `GET /api/books`; `POST /api/books` accepts `title` and `author`; successful create is **201** |
| Validation invariant | Both title and author are trimmed, required, and at most **120 characters after trimming**; invalid create is **400** |
| Lab 2 | `PATCH /api/books/{id}/read` requires `{ "isRead": true }` or `{ "isRead": false }`; **200 + Book**, missing book **404**, missing/non-boolean `isRead` **400** |
| Idempotence invariant | Repeating the same valid PATCH does not toggle state or create another book |
| Lab 3 | `GET /api/books?status=all|read|unread`, default `all`; invalid status **400**; stable ascending ID order and unchanged Book schema |
| Read-only invariant | Filtering never changes `isRead`, creates a book, or mutates storage |
| UI | Baseline add/list; Lab 2 read toggle; Lab 3 all/read/unread selector |

## Lab 1 — Initialize and understand (30 minutes, clock 22–52)

### Goal

Establish a real team and a passing baseline before requesting a feature.

### Steps

**1. Orient and initialize — 8 minutes.** In a participant-root terminal,
confirm where you are:

```powershell
Get-Location
$env:SQUAD_NO_PERSONAL='1'
git init
squad init --roles --no-workflows --state-backend local
$config = Get-Content .\.squad\config.json -Raw | ConvertFrom-Json
if ($config.teamRoot -or $config.stateLocation -eq 'external' -or $config.stateBackend -ne 'local') {
    throw 'Stop: this lab redirects team/state outside the expected local setup.'
}
$teamRoot = (Resolve-Path .\.squad).Path
$agentProfile = (Resolve-Path .\.github\agents\squad.agent.md).Path
"Expected TEAM_ROOT: $teamRoot"
"Expected agent profile: $agentProfile"
squad cast
squad doctor
```

`git init` creates the participant's own local repository; the provisioning
script does **not** initialize Git or Squad. No remote or commit is required.
`--no-workflows` keeps this exercise from introducing GitHub workflow automation.
`--state-backend local` selects storage, **not personal-Squad isolation**.
Without `SQUAD_NO_PERSONAL=1`, init can link an existing personal Squad through
`config.teamRoot`. The environment variable must be set **before** init; it does
not undo an earlier redirect. If this check fails, stop and use a new destination
with instructor help; never delete or modify your personal Squad to fix the lab.
For this no-redirect configuration, the resolved team root is the printed local
`.squad` directory. Inspect the printed profile file before starting Copilot.
`squad cast` displays the cast; do not assume scaffolding alone guarantees an
already personalized team.

Read `squad doctor`'s actual checks. Resolve failed required checks; its exit
status must be successful. Do **not** expect the original `0.9.4` workshop's
exact check counts from `1.1.0`.

**2. Establish the cast and ownership — 10 minutes.**

```powershell
$env:SQUAD_NO_PERSONAL='1'
copilot --agent squad
```

**Profile-origin gate:** matching user-level custom agents can override a
repository agent with the same name. Inspect agent-discovery diagnostics or the
agent selector's source information, where supported, and compare the selected
profile's origin with the lab-local path printed above. Check for a same-name
agent in your user-level agent configuration; do not remove global agents.
Have the first session report its effective `TEAM_ROOT` and profile source,
then verify them against the local config/file and discovery information.
The name “Squad”, an AI claim, and `squad doctor` alone do not prove which
profile was loaded. If your CLI cannot establish that origin, stop the live
route and record **profile origin unverified**; use prepared/manual work.

Paste this bounded prompt:

```text
We are doing a local Reading List workshop, in this participant repository only.
First report your effective TEAM_ROOT and selected agent-profile source.
Stop if either is outside this lab or its origin cannot be verified.
Inspect the existing starter; do not implement a feature yet.

Use the existing roster, or finish initial casting if it is still needed.
Map named members to Lead, Backend, Frontend, Tester, Scribe, and an independent
Reviewer. Keep the team small; do not create extra specialists without a reason.
The Reviewer must not author the feature they later review.

Lead: report the actual API/frontend/test paths and the present API contract.
Give each author a non-overlapping file area, and state who integrates changes.
Tester: explain which existing checks establish the starter baseline.
Scribe: explain where team decisions and role histories live in this repository.
Reviewer: identify the later review gate; do not approve anything now.

Show the plan and roster before editing any source. No remote creation, push,
PR publication, deployments, autonomous loops, package-source changes, or
blanket permissions. Stop and ask before anything outside this scope.
```

If casting requires a choice, choose a small theme and confirm the resulting
named roster. This is participant-team setup, not an instruction to replace
the workshop's own agents.

**3. Verify and inspect — 7 minutes.** Stop your API and Vite if running.
In **Terminal C, workshop root**:

```powershell
.\scripts\Test-AiNextLab.ps1 -LabPath .\reading-list-squad-lab -Feature starter
```

Restart both servers using the commands above and check the app in the browser.
In the participant root, inspect the actual artifacts:

```powershell
Get-Content .\.squad\team.md
Get-Content .\.squad\routing.md
Get-Content .\.squad\decisions.md
Get-ChildItem .\.squad\agents
```

**4. Record — 5 minutes.** Create `AI-NEXT-EVIDENCE.md` in your participant
root. Use the evidence template below; record actual named roles, paths, command
outcomes, and any manual fallback.

### Checkpoint and failure timebox

Pass when the participant team is discoverable, doctor succeeds, the starter
checks pass, and the UI/API work. A generated roster alone does not demonstrate
live routing; record one actual routed response.

Timebox a tooling failure to **five minutes within the lab**. Ask the instructor
for diagnosis or pair with a consenting participant whose live gates passed.
You may inspect the prepared app manually, but label live routing **not
demonstrated** if no live request succeeds. Do not spend the rest of the day
reinstalling unrelated tools.

## Lab 2 — Parallel feature delivery (35 minutes, clock 60–95)

### Goal

Ship mark-as-read with coordinated specialist work and independent checks.

### Steps

**1. Agree the change — 4 minutes.** Paste into your Squad session:

```text
Implement only the mark-as-read feature on this prepared Reading List app.
First show the named owners, shared contract, dependencies, and file boundaries;
wait for my approval of that plan before source edits.

Backend: implement PATCH /api/books/{id}/read with required boolean isRead.
Return 200 plus the unchanged Book shape; 404 for a missing ID; 400 for missing
or non-boolean isRead. Persist to SQLite. Repeating the same PATCH is idempotent.
Preserve POST trimming, required title/author, and the 120-character limits.
Frontend: add an accessible read/unread toggle using that agreed endpoint.
Tester: add focused checks for both boolean values, repeat requests, missing
IDs, invalid payloads, and existing create/list validation.
Keep new tests in this participant directory; do not edit the workshop's
external validator, scripts, or prepared baseline to manufacture a pass.

After contract agreement, Backend and Frontend may work in parallel in separate
files; Tester can draft cases concurrently and execute after integration.
Lead owns integration. Stop on an ownership collision or contract disagreement.
The independent Reviewer must not author this feature.
Scribe records only actual decisions and outcomes, not invented test passes.

Use managed feeds. No extra feature, broad refactor, dependency/source changes,
remote writes, deployment, blanket permission, or unattended work.
```

Approve or correct the ownership plan yourself. **Parallel** means you observe
separate dispatched work or overlapping specialist tasks; a narrative saying
"we worked in parallel" is not sufficient evidence.

**2. Implement and integrate — 18 minutes.** Inspect permission prompts. If
two authors need the same file, stop, nominate one owner, and pass the other
author's proposed change to the integrator.

**3. Validate — 8 minutes.** Stop your owned API and Vite with `Ctrl+C`.
In **Terminal C, workshop root**:

```powershell
.\scripts\Test-AiNextLab.ps1 -LabPath .\reading-list-squad-lab -Feature read
```

Always select `-Feature read` after a live change to a starter. The default
checkpoint selection could otherwise validate only the starter.
Restart both API and Vite after validation. Check the read toggle in the browser,
then restart your API again and reload to check persistent state.
Record both automated and manual outcomes accurately.

**4. Capture — 5 minutes.** Add the named author ownership, observed
dispatch/parallelism, test command and result, and one representative source
change to `AI-NEXT-EVIDENCE.md`.

### Checkpoint and failure timebox

Pass when `-Feature read` succeeds and the UI toggles persistent read state
without breaking create/list validation. Stop agent work before the break.

If blocked for **five minutes**, preserve your current directory and use a
**new** recovery destination from the workshop root:

```powershell
.\scripts\New-AiNextLab.ps1 -Checkpoint read -Destination .\reading-list-squad-lab-read-recovery
.\scripts\Test-AiNextLab.ps1 -LabPath .\reading-list-squad-lab-read-recovery -Feature read
```

Switch all subsequent `-LabPath` values and terminal working directories to
that recovery directory. Initialize Git/Squad there as in Lab 1 if you will
continue live work; stop the old app before launching the new app on the same
ports. This is **prepared feature inspection, not proof your team delivered
the feature**. Record that limitation and re-establish your actual team context.

## Lab 3 — Does memory change the next iteration? (35 minutes, clock 105–140)

### Goal

Compare a recorded invariant with what a **fresh session retrieves and applies**
while adding filters. File existence alone is not the experiment.

### Steps

**1. Consolidate a decision — 6 minutes.** Before closing the current session:

```text
Scribe: record one concise Reading List invariant decision from work we actually
validated. Include title/author trimming, required values and max 120 characters;
required-boolean, persistent, idempotent read PATCH; and read-only future filters.
State the rationale and actual supporting test command/result. Do not claim a
test ran if it did not. Use the team's normal decision inbox/consolidation flow.

Show me the final consolidated decision path and relevant excerpt. If an inbox
entry is consumed, point to the consolidated decision rather than recreating it.
Do not change source or start the filtering implementation.
```

Inspect `.squad\decisions.md` and the referenced source/test behavior yourself.
An empty `.squad\decisions\inbox` after consolidation is normal: the durable
decision belongs in the consolidated file. Preserve the relevant excerpt in
your evidence.

**2. Start a genuinely fresh session — 4 minutes.** Exit the current Copilot
session normally. Set `$env:SQUAD_NO_PERSONAL='1'` in the session terminal,
repeat Lab 1's local-root/profile-origin checks, then start `copilot --agent squad`
again from the **same participant root**. Do not resume the old conversation, paste its transcript,
or copy the decision into the new prompt. Use the same approved model if
available; record a model change as a confounding factor.

**3. Retrieve, then implement — 18 minutes.**

```text
This is a fresh workshop session in the existing Reading List repository.
Before proposing code, inspect the team's existing decisions and relevant role
history. Identify the prior decision that constrains the next feature.
Cite its real file path and a short relevant excerpt, then explain one concrete
implementation or regression-test consequence. If you cannot find it, say so;
do not reconstruct a decision from assumptions. Show this retrieval before edits.

After I review the retrieval and ownership plan, add only filtering:
GET /api/books?status=all|read|unread, default all; invalid status returns 400.
Keep the Book JSON shape and stable ascending ID order. Filtering is read-only.
UI gets all/read/unread controls. Preserve existing create and read behavior.

Lead sets separate Backend, Frontend, and Tester file ownership and integrates.
Use bounded parallel work only after agreeing the API contract.
Tester verifies each filter, default, invalid status, ordering, unchanged stored
state, and existing validation and PATCH idempotence.
Keep new tests in this participant directory; leave course validation and the
prepared baseline unchanged.
Scribe records actual outcomes. Keep the independent Reviewer out of authorship.
No remote operations, loops, deployment, feed changes, or blanket permissions.
```

Pause to compare the cited excerpt with the real file. If retrieval is absent
or wrong, record it as a failure **before** helping the team locate the file.
A second, prompted retrieval may be useful, but it is a separate observation.
Do not let the acceptance contract in your prompt masquerade as proof that
the agent remembered the earlier decision.

**4. Validate and compare — 7 minutes.** Stop your owned API and Vite.
In **Terminal C, workshop root**:

```powershell
.\scripts\Test-AiNextLab.ps1 -LabPath .\reading-list-squad-lab -Feature filter
```

Use your recovery path if you switched. Restart both servers, then exercise all
three UI filters. In
`AI-NEXT-EVIDENCE.md`, complete this comparison:

| Evidence field | Your actual observation |
|---|---|
| Earlier decision path + excerpt | What was recorded before closing the session? |
| Freshness | How did you exit/start? Was a transcript or decision pasted? |
| First retrieval | What path/excerpt did the fresh session cite before editing? |
| Accuracy | Does that excerpt actually exist and match the earlier invariant? |
| Applied consequence | Which real source change or test preserves the invariant? |
| Regression outcome | Exact `-Feature filter` command, result, and receipt |
| Limits | Was the decision manual/prepared, retrieval assisted, model changed, or live work blocked? |

### Checkpoint and failure timebox

Two outcomes are graded separately: **the filtering feature works** and
**memory reuse was observed**. A passing feature does not imply retrieval.
An accurate citation without an applied consequence is weaker than demonstrated
reuse. Even success in one exercise does not prove a general productivity gain.

After **five blocked minutes**, preserve your work and inspect a prepared filter:

```powershell
.\scripts\New-AiNextLab.ps1 -Checkpoint filter -Destination .\reading-list-squad-lab-filter-recovery
.\scripts\Test-AiNextLab.ps1 -LabPath .\reading-list-squad-lab-filter-recovery -Feature filter
```

Use the new path thereafter. The prepared checkpoint's content is **not live
memory evidence**. If you initialize a new team there, it does not inherit
untransferred decisions or the old conversation.

## Lab 4 — Human review gate and evidence (26 minutes, clock 140–166)

### Goal

Decide whether you would accept the change, without publishing anything.

### Steps

**1. Freeze and gather — 6 minutes.** Stop implementation and your API/Vite
servers. Leave both stopped through validation **and** export. In **Terminal C,
workshop root**, run the strongest feature actually being submitted:

```powershell
.\scripts\Test-AiNextLab.ps1 -LabPath .\reading-list-squad-lab -Feature filter
.\scripts\Export-AiNextEvidence.ps1 -LabPath .\reading-list-squad-lab -Feature filter
```

If you completed only mark-as-read, use `-Feature read` in **both** commands
and label filtering incomplete. Keep the recovery path if applicable.
The export performs fresh validation. Inspect the generated lab-relative
`.ai-next\test-receipt.json`, `.ai-next\evidence.json`, and
`.ai-next\source.diff`.

Restart both servers only after export if doing another browser review.

In a participant-root terminal:

```powershell
git status --short
git --no-pager diff
Get-Content .\.ai-next\source.diff
Get-Content .\.ai-next\test-receipt.json
Get-Content .\.ai-next\evidence.json
```

Without a baseline commit, ordinary `git diff` may be empty because source
files are untracked. That is **not** a clean-review verdict: use the exported
source diff against the prepared baseline. No commit is required for this lab.

**2. Independent review — 8 minutes.** Ask the named non-author reviewer:

```text
Review only; do not edit. You must not be an author of the changes under review.
If you authored them or cannot inspect the evidence, say so instead of approving.

Inspect the actual diff against the prepared baseline, source, relevant tests,
and current test receipt. Review the submitted feature level, not an assumed
completion of all labs. Check validation, required boolean PATCH, 404 handling,
idempotence, filter schema/order/read-only behavior, UI/API agreement, persistence,
file scope, and accidental credentials or unrelated changes.

For each real finding give severity, file/line, a reproducible case, and the
expected behavior. Distinguish blockers from suggestions. State checks you did
not perform. If none are found, say "no findings in the inspected scope", not
"guaranteed correct". Return a recommendation; only the human accepts.
No file edits, remote writes, PR posting, deployment, or automatic approval.
```

If your team cannot provide an independent reviewer, exchange local review
with a consenting partner. Record who reviewed and whether they authored any
part of the work. A self-review does not satisfy independence.

**3. Human decision — 7 minutes.** Inspect findings yourself. Record **accept**
or **request changes**, with a reason and each finding's disposition.
For a blocking issue, give a narrowly bounded fix to the responsible author,
then rerun the appropriate test and request review of the changed scope. If
time expires, leave it **request changes**; do not convert it to acceptance.

**4. Final evidence — 5 minutes.** Update `AI-NEXT-EVIDENCE.md`, rerun the
export command with the actual feature level, and inspect its contents before
sharing. Exporting is not publication. No script-generated receipt can certify
that a human review or a live memory experiment happened.

### Checkpoint and failure timebox

Within **five blocked minutes**, finish a candid review record using available
evidence. Missing tests or an unavailable independent reviewer produce
**request changes / incomplete**, not an invented pass.

## Evidence template and sharing rules

Create this file in your participant root as `AI-NEXT-EVIDENCE.md`.
Replace every prompt with actual observations; leave missing work explicitly
not demonstrated.

```markdown
# AI NEXT evidence

## Context
- Date, actual tool/model versions:
- Participant directory and submitted feature level:
- Live work, prepared checkpoint, pairing, or manual inspection:

## Team and parallel work
- Named roles; independent reviewer and authorship separation:
- Ownership plan; actual observed dispatch/overlap; collisions resolved:

## Validation
- Exact commands, actual pass/fail results, and receipt paths:
- Browser read-toggle/filter checks:
- SQLite restart check:
- Checks not run:

## Memory comparison
- Earlier decision path/excerpt and rationale:
- Fresh-session procedure; pasted context or assistance:
- First retrieved path/excerpt, and accuracy:
- Applied source/test consequence:
- Limits or failed retrieval:

## Review and human gate
- Diff inspected; reviewer; concrete findings:
- Human accept/request-changes decision and rationale:
- Finding dispositions, fixes, rerun/re-review results:

## Limitations
- Incomplete features, prepared material, unverified claims:
- Next bounded experiment and owner:
```

The exporter uses a selected evidence surface, not a whole-folder archive.
`AI-NEXT-EVIDENCE.md` is **user-reported narrative**, not automatically
verified live-agent, memory, or review evidence. Read its implementation and
the actual output before sharing. Manually check the entire exported diff and
narrative for secrets; an allowlist is not a content sanitizer.

**Share only inspected** source diffs, sanitized command receipts, the selected
feature/checkpoint identity, and minimal relevant decision/review excerpts.
Do not add `.env` files, tokens, private keys, account information, SQLite
databases, `node_modules`, build directories, raw chats, full agent histories,
or the whole `.squad` directory. Do not upload anything as part of this course.

## Assessment: evidence, not confidence

Score each area **0–2**: **0** = missing/blocked; **1** = partial, assisted, or
prepared-only inspection; **2** = directly observed and supported.

| Area | Evidence needed for 2 |
|---|---|
| Team model | Real named roster, correct ownership, actual routed work |
| Parallel delivery | Observed bounded specialist dispatch, separate authorship, integrated result |
| Functionality | Submitted feature's explicit tests pass; UI and persistence checks recorded |
| Memory | Fresh-session accurate retrieval plus an applied, checked consequence |
| Human gate | Non-author review, actual findings/dispositions, human decision, inspected evidence |

**10 points maximum.** A prepared working app can support application
inspection but cannot earn live-routing or fresh-memory credit by itself.
Open blockers prevent a readiness claim even if the numerical score is high.
The instructor evaluates your observations; an agent does not grade or approve
its own work.

## Wrap-up (14 minutes, clock 166–180)

Compare one implementation outcome, one memory observation, and one limitation
with a partner. Be ready to explain:

- Where did parallelism help, and where did coordination cost time?
- What was actually retrieved from durable memory, rather than supplied again?
- Which test or review finding changed your acceptance decision?
- What would you authorize next, and what remains a separate permission gate?

Advanced follow-ons include issue-to-PR automation, tiered memory and state
backends, watch/loop behavior, Aspire observability, and cross-squad/cloud
scenarios. These are **not completed hands-on outcomes of these four labs**.
Use the [instructor scope map](instructor.md#breadth-map-core-experience-vs-follow-on)
to choose a separate, bounded next exercise.

## Sources and attribution

Product references: [github/squad](https://github.com/github/squad),
[official docs](https://github.github.com/squad/),
[stable 1.1.0 release](https://github.com/github/squad/releases/tag/v1.1.0).

The Reading List exercise builds on the public
[joslat/squad-workshop](https://github.com/joslat/squad-workshop),
copyright © 2026 joslat, under [Apache License 2.0](../../LICENSE).
This AI NEXT sequence, prompts, schedule, and assessment are original course
material. Retain the original attribution/license when redistributing.
