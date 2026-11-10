# AI NEXT: instructor runbook

[Learner lab](learner-lab.md) · [Prerequisites](prerequisites.md) ·
[Presentation](../../presentations/ai-next-squad.html)

**Format:** one 180-minute class, including a ten-minute break; four labs total
126 minutes, **70% hands-on by wall clock**. Setup happens before class.

**Audience:** developers comfortable reading an HTTP API and a small React
application. The goal is to evaluate repository-resident AI teamwork, not teach
.NET, React, Git, and package administration from scratch in the same session.

## Teaching contract

Teach a short concept, demonstrate a bounded interaction, then let learners
produce evidence. Every lab has a goal, steps, an observable checkpoint, and a
failure timebox. Ask what learners **observed**, not whether the agent sounded
confident.

The public Reading List starter makes four experiments feasible:

1. Initialize/cast a small team and establish a running baseline.
2. Coordinate mark-as-read across backend/frontend/testing.
3. Record an invariant, then test retrieval and reuse in a fresh session.
4. Conduct non-author review and make a human accept/change decision.

Do not advertise a blank-repository full-stack build, all advanced Squad
features, or autonomous production delivery as completed three-hour outcomes.
The original workshop remains a separate **90 + 45 + 60 = 195 minute** path
before adding breaks.

## Authoritative baseline and version discipline

As verified for course preparation on **10 November 2026**:

- Canonical product: [github/squad](https://github.com/github/squad).
- Canonical docs: [github.github.com/squad](https://github.github.com/squad/).
- [Release 1.1.0](https://github.com/github/squad/releases/tag/v1.1.0) is stable.
- Package name: `@bradygaster/squad-cli`; classroom pin: **1.1.0**.
- Node course floor: **22.12.0 in the Node 22 line**, because the frontend
  uses Vite 7. Squad's own 22.5.0 floor is lower.
- .NET: **10.0 SDK**. The app persists books in SQLite.
- Package sources: managed Microsoft CFS, retained in both workshop and
  generated participant projects. No `@latest`, prerelease, public-source,
  or identity-switch workaround.

Preparation receipts report Node `22.23.4`, npm `11.8.0`, .NET `10.0.403`,
Squad `1.1.0`, and Copilot `1.0.109-1`. Installed `1.1.0` help was inspected
successfully. **Neither those receipts nor application tests establish that
a complete live AI rehearsal succeeded.** Record that separately.

**Implementation handoff, 10 November 2026:** Data reported that
[`Validate-Checkpoints.ps1`](../../labs/ai-next/tests/Validate-Checkpoints.ps1)
was run from the workshop root as
`.\labs\ai-next\tests\Validate-Checkpoints.ps1` and passed with exit code **0**,
covering **15 cases**: real builds and HTTP/SQLite
restart suites for all three checkpoints; negative feature-level checks;
missing-boolean, non-idempotent PATCH, and invalid-filter mutation detection;
path/junction guards; sanitized evidence; stale source hashes; and failed-export
invalidation. This is a reported application/guardrail receipt, not a second
independent run by the documentation author. **Browser UI behavior and a
complete live-agent rehearsal remain unverified by that receipt.** No analyzer
result is implied. Re-run the gates below for the actual classroom environment.

Current installed help supports:

```powershell
$env:SQUAD_NO_PERSONAL='1'
squad init --roles --no-workflows --state-backend local
squad cast
squad doctor
copilot --agent squad
```

Use the init command **only inside a participant repository**, never this
workshop checkout. `--roles` supports the role-based scaffold; initial
personalization/casting may still need a prompt. Inspect the resulting roster.
`squad cast` displays it. Doctor failures are real gate failures; a reachable
Copilot executable is not proof of entitlement or model availability.

Set `SQUAD_NO_PERSONAL=1` **before** init and in every participant-session terminal,
including fresh/recovery sessions. Local storage does not prevent personal-Squad
linking. Follow Lab 1's checks: no `teamRoot`/external redirect, resolved local
`.squad`, and lab-local loaded `.github\agents\squad.agent.md`. Matching
user-level agents can override same-name repository agents; a matching name or
doctor success is not profile-origin proof. If source discovery cannot establish
the loaded profile, keep the live route blocked and record that gap.

Before every validation/export, stop only owned API and Vite servers with
`Ctrl+C`. The scripts rebuild/reinstall and refuse identifiable running lab
servers or locked outputs; they do not kill processes or detect every possible
launch. Restart both after validation/export, before browser checks.
`dotnet run` without watch does not reload rebuilt code. Rehearse this sequence
on the classroom Windows machines; retain it inside existing validation slots.

Record `squad --version` and actual help in rehearsal. If an npm inventory
shows an old insider installation while the command reports another version,
resolve the active executable rather than assuming the inventory is decisive:

```powershell
Get-Command squad -All
squad --version
npm list --global --depth=0
```

Do not remove global packages or alter another user's PATH without legitimate
approval. Multiple installations are a diagnostic clue, not permission to
change the environment.

## Pre-class gates: complete before learners arrive

### Materials and machine

- Read all three AI NEXT guides and open the
  [standalone presentation](../../presentations/ai-next-squad.html).
- Have the public workshop's attribution and license available.
- Confirm each learner has a writable, separate participant directory.
- Confirm approved CFS npm/NuGet access and the exact installed versions.
- Inspect script parameters before the rehearsal:

  ```powershell
  Get-Help .\scripts\New-AiNextLab.ps1 -Detailed
  Get-Help .\scripts\Test-AiNextLab.ps1 -Detailed
  Get-Help .\scripts\Export-AiNextEvidence.ps1 -Detailed
  ```

- Do not use the older `Verify-Prerequisites.ps1` result as the complete AI NEXT
  gate: its legacy floors do not establish Node 22.12, pinned Squad 1.1.0, or
  working live-model entitlement.
- Docker, Aspire, Azure, GitHub Issues/remotes, and GitHub CLI auth are not
  prerequisites for the four core labs.

### Rehearse all three application checkpoints

From the workshop root, choose unused destinations:

```powershell
.\scripts\New-AiNextLab.ps1 -Checkpoint starter -Destination .\ai-next-rehearsal-starter
.\scripts\Test-AiNextLab.ps1 -LabPath .\ai-next-rehearsal-starter -Feature starter
.\scripts\New-AiNextLab.ps1 -Checkpoint read -Destination .\ai-next-rehearsal-read
.\scripts\Test-AiNextLab.ps1 -LabPath .\ai-next-rehearsal-read -Feature read
.\scripts\New-AiNextLab.ps1 -Checkpoint filter -Destination .\ai-next-rehearsal-filter
.\scripts\Test-AiNextLab.ps1 -LabPath .\ai-next-rehearsal-filter -Feature filter
.\scripts\Export-AiNextEvidence.ps1 -LabPath .\ai-next-rehearsal-filter -Feature filter
```

Creation must refuse existing destinations. Keep previous attempts; choose
new names rather than overwrite or delete work. Generated destinations stay
inside the current workshop worktree. Check that participant `.npmrc` and
`NuGet.Config` retain the approved sources.

The validator restores/builds and exercises an isolated SQLite-backed API,
including restart behavior, on an ephemeral test port. Its lab-relative
receipt is `.ai-next\test-receipt.json`. A feature selector matters:

- `-Feature starter` establishes only create/list and baseline validation.
- `-Feature read` checks the PATCH contract and the earlier behavior.
- `-Feature filter` checks filtering and earlier regressions.

After live changes to a starter, specify the intended feature explicitly.
The default follows the materialized checkpoint; it must not silently become
your evidence for a newer feature.

Implementation agents stay inside their participant repository. Do not let them
edit the workshop's external validation scripts or the prepared baseline to
manufacture passing results. Extra authored tests belong in the participant
directory. The local baseline is useful review context, not tamper-proof proof.

Export performs fresh validation and writes `.ai-next\evidence.json` and
`.ai-next\source.diff`. Inspect both and record the actual command/results.
Exported memory/review fields can remain **not verified** even when application
tests pass. User narrative is not machine-certified live evidence.

### Rehearse the UI and live team separately

Follow the [learner startup commands](learner-lab.md#run-the-prepared-application):
API project `api\ReadingList.Api.csproj`, API `http://127.0.0.1:5080`,
frontend in `frontend` with Vite normally on port `5173`.

1. Add books, toggle read status, and exercise each filter at the appropriate
   checkpoint.
2. Restart your own API and verify persistence.
3. Confirm browser traffic reaches the API through the development proxy.
4. In a separate participant rehearsal repository, initialize Git and Squad
   using the learner commands.
5. Run doctor, inspect the cast, and submit a real bounded request.
6. Observe specialist dispatch, a permission stop, a decision being
   consolidated, fresh-session retrieval, and an independent reviewer.
7. Record results and failures honestly. Do not copy a working prepared
   checkpoint's result into the live-rehearsal column.

| Readiness surface | Record before class |
|---|---|
| Version and help | Exact versions, active executable, command/result |
| Managed restores | Feed configuration and actual restore/test outcome |
| Starter/read/filter | Exact test commands and actual feature-level outcomes |
| Browser/persistence | Actual manual checks, not inferred from build success |
| Live model | Request date/model/result; no credentials |
| Squad routing | Actual named dispatch and permission handling |
| Fresh memory | Prior decision, first retrieved excerpt, applied consequence |
| Review/export | Non-author review, human disposition, inspected export |

If live gates remain blocked, choose an explicitly labeled demonstration,
consenting-pair arrangement, or manual inspection path. Tell the class which
outcomes cannot be demonstrated. A prepared checkpoint is not offline AI.

## Minute-by-minute facilitation and speaker notes

| Clock | Block | Facilitation and speaker note |
|---|---|---|
| 00–12 | Framing, 12 min | Start with repeated context loss and inconsistent handoffs. Contrast a one-chat approach with a repo-resident team. Draw request → Lead → specialists → evidence → non-author review → human gate. Ask what evidence would falsify a memory claim. |
| 12–22 | Demo, 10 min | Use a separate prepared demo lab. Show the real roster/routing and one small routed request. Stop at a permission prompt, inspect the command, and decide. Point to a real decision and a test receipt. Do not spend the demo building the entire feature. |
| 22–52 | Lab 1, 30 min | Learners confirm participant directory, initialize/cast, run doctor and starter checks. Ask two pairs to identify their actual Backend and Reviewer. Diagnose at most five blocked minutes before choosing a labeled fallback. |
| 52–60 | Debrief, 8 min | Compare agent claim versus actual file/result. Ask what initialization did and did not prove. Establish API contract and file ownership before parallel editing. |
| 60–95 | Lab 2, 35 min | Require plan approval, named authors, non-overlapping files, agreed PATCH contract. Observe real dispatch. Insist on `-Feature read`, not a starter-only pass. Stop implementation at minute 95. |
| 95–105 | Break, 10 min | Pause agents; no unattended loops or background feature work. Let participants step away rather than silently consuming quota. |
| 105–140 | Lab 3, 35 min | Consolidate the invariant, close the conversation, start fresh, and capture the first retrieval before edits. Do not coach learners by pasting the answer. Require the exact `-Feature filter` check. |
| 140–166 | Lab 4, 26 min | Freeze code, inspect baseline diff, route to non-author reviewer, and let the human record accept/change. Unfixed blockers remain request-changes. Re-export and inspect; do not publish. |
| 166–180 | Wrap, 14 min | Share one result, one limitation, and one next experiment. Use the breadth map below without implying those advanced topics were completed. Collect only sanitized evidence through an approved channel if separately authorized. |

### Demo pacing: ten minutes, not an open-ended build

- **Minutes 0–2:** show prepared app and active participant path.
- **Minutes 2–4:** show named roster and who owns which files.
- **Minutes 4–7:** make one bounded request, observe routing and a permission stop.
- **Minutes 7–9:** connect a real test result to a decision/diff.
- **Minute 9–10:** show the independent-review and human-accept boundary; hand
  control to learners.

If the live request fails, name the failed gate, show the prepared evidence as
prepared, and continue. Do not say the demonstration succeeded live.

### Concept-to-lab prompts

**Before Lab 1:** “Which information belongs in the repository instead of a
conversation? Which generated artifacts are merely scaffolding?”

**Before Lab 2:** “Can these specialists work in parallel without editing the
same file? What HTTP contract lets the frontend start before backend integration?”

**Before Lab 3:** “How would you distinguish actual retrieval from the agent
repeating the requirement you just pasted?”

**Before Lab 4:** “What evidence would make you reject a plausible-looking
implementation? Who is allowed to accept it?”

## Recovery without erasing evidence

Every lab contains a five-minute troubleshooting timebox **inside** its
scheduled duration. Recover by provisioning a new destination, never by
overwriting the participant's work:

```powershell
.\scripts\New-AiNextLab.ps1 -Checkpoint read -Destination .\reading-list-squad-lab-read-recovery
.\scripts\New-AiNextLab.ps1 -Checkpoint filter -Destination .\reading-list-squad-lab-filter-recovery
```

Pick whichever checkpoint is needed; do not run both by habit. If a name already
exists, choose a new one. Validate the selected checkpoint, switch every
terminal and `-LabPath`, stop the old app before reusing its ports, and initialize
Git/Squad in the new lab if continuing live work.

| Situation | Safe response | What must remain unclaimed |
|---|---|---|
| Missing tool or blocked CFS restore | Diagnose approved configuration/access, or pair with a ready participant | Individual executable readiness |
| Copilot entitlement/policy/quota blocked | Resolve through proper authorization, pair by consent, or inspect manually | Live model/routing success |
| Feature implementation stalls | Inspect a new prepared read/filter checkpoint | Learner/agent authored that feature |
| Decision exists but fresh retrieval fails | Record failure, then optionally help locate it as a separate assisted attempt | Unassisted memory reuse |
| Multiple agents touch one file | Stop, nominate one owner, re-integrate and test | Collision-free parallelism |
| Non-author reviewer unavailable | Partner review, or leave gate incomplete | Independent approval |
| Test/export fails near end | Preserve failure, record request-changes and next owner | Review-ready delivery |
| GitHub 403/SAML | Stay local; publication is a separate authorized operation | Successful GitHub API access |

Do not ask learners to disable security controls, switch identities, use public
feeds, change whole-machine settings, kill processes by name, or enable blanket
permissions to keep the schedule.

## Evidence and assessment

The [learner rubric](learner-lab.md#assessment-evidence-not-confidence) scores
five areas from 0 to 2: team model, parallel delivery, functionality, memory,
and human gate. Use it as an observation guide, not an automated certification.

Look for:

- An actual named ownership plan and dispatched specialist work, not only
  headings in an agent's answer.
- Explicit feature-level commands and outcomes; browser checks are separate.
- A prior consolidated decision, fresh-session procedure, first accurate
  citation, and a concrete preserved behavior/test.
- A reviewer who did not author the feature; findings and human dispositions.
- A diff against the prepared baseline. Since the lab needs no baseline
  commit, ordinary `git diff` may miss untracked files; inspect the exported
  `.ai-next\source.diff`.
- Clear distinctions among verified application behavior, user-reported
  observations, prepared checkpoint content, and unverified agent behavior.

The export is allowlisted evidence, not a bulk archive or an automatic
publication mechanism. Its output and `AI-NEXT-EVIDENCE.md` still require
manual content inspection. Do not collect secrets, `.env`, databases, raw
transcripts, full `.squad` histories/charters, package caches, or build outputs.
Keep minimal sanitized decision excerpts in the learner's narrative rather than
requesting their entire team memory.

**Hard gate:** open blockers, missing required tests, or absent independent
review mean “request changes / incomplete,” regardless of score. A human
chooses the disposition; the authoring agent cannot self-approve.

## Breadth map: core experience vs follow-on

This map preserves the broader Squad learning goals without pretending all
topics fit into the four hands-on labs.

| Topic | What the three-hour course actually does | Separate brief or follow-on |
|---|---|---|
| Overview, initialization, cast | Core framing and Lab 1 | Compare alternate team compositions |
| Specification and routing | Core bounded prompts, named ownership, specialist dispatch | Larger dependency graphs and routing customization |
| Issue → PR → review | Core uses a local change, independent PR-style review, human acceptance | Create an issue/remote PR only in an explicitly authorized exercise |
| Decisions, role history, tiered memory | Core records a decision and tests fresh retrieval/reuse | Inspect tiering, consolidation, retention, and failure cases in depth |
| State backends | Core selects `local` explicitly | Compare `local`, `orphan`, `two-layer` with current documented behavior |
| Watch, triage, loops, autonomy | Instructor explains boundaries only; no loop is started | Disposable-repo exercise with explicit scope, stop mechanism, concurrency, budget, and permissions |
| Aspire observability | Instructor explains that telemetry helps inspect activity, not prove correctness | Separate Docker/telemetry setup and live trace exercise |
| `@copilot` and presets | Brief orientation to concepts; not a promised integrated workflow | Verify available commands/policy and run a separately scoped example |
| Cross-squad and subsquads | Architecture discussion only | Explicit coordination experiment with ownership and information boundaries |
| ACA/AKS and cloud execution | Conceptual deployment/execution options only | Provisioning, identity, network, policy, budget, cleanup, and deployment lab |

### Current autonomy facts: do not repeat legacy assumptions

The installed **1.1.0** help and tagged-source receipts establish these distinctions.
They are an instructor brief, **not instructions to start autonomy in class**:

- `triage` polls GitHub Issues, with a default polling interval of **ten
  minutes**. Its help includes `--execute`, `--max-concurrent N`, and
  `--timeout N`. The documented interactive stop is **Ctrl+C**.
- `loop` uses a prompt file whose default is **`loop.md`**; do not assume the
  default is `.squad\loop.md`. `configured: true` frontmatter selects normal
  flow; false/missing selects onboarding and **continues execution**. It is not
  an execution or authorization gate. It does **not** require GitHub Issues as its queue.
- Do not conflate an issue-triage queue with arbitrary prompt-driven recurring
  work. Neither is permission to infer authorization from a chat.
- Do not teach an undocumented `ralph-stop` file as the stop contract for this
  baseline. Recheck installed help before any separate autonomy lab.
- `init --state-backend` accepts `local`, `orphan`, or `two-layer`. A main-help
  note about worktree-backend synchronization being a no-op does **not** make
  `worktree` an accepted init value.

For any follow-on, verify the current official docs and installed help, define
one disposable scope, obtain legitimate permissions, test stopping, and name
a human owner before starting.

## End-of-class handoff

Each learner leaves with:

- Their preserved participant directory, including failed attempts if any.
- A real feature-level validation receipt, or an explicit blocked result.
- An honest memory comparison and non-author review record.
- A human accept/change disposition and next bounded action with an owner.
- An inspected local evidence export; **nothing automatically published**.

Ask the learner to finish: “Next I would authorize ___, within ___, and require
___ before acceptance.” Do not turn that reflection into permission to execute.

## Sources and attribution

Use the public [Squad repository](https://github.com/github/squad),
[official documentation](https://github.github.com/squad/), and
[1.1.0 release](https://github.com/github/squad/releases/tag/v1.1.0) for product
claims. Revalidate release/help behavior before a future delivery.

The original Reading List workshop is
[joslat/squad-workshop](https://github.com/joslat/squad-workshop),
copyright © 2026 joslat, distributed under
[Apache License 2.0](../../LICENSE). This course's runbook, sequence, prompts,
assessment, and timing are original adaptations around that public exercise.
Retain the original attribution/license. Match a concept → lab → checkpoint →
takeaway teaching structure; do not copy private course text or assets.
