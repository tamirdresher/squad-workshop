# AI NEXT source, provenance and delivery gates

Verification date: **2026-11-10**. This record distinguishes source checks, code checks, live agent behavior and instructor rehearsal. None substitutes for the others.

## Canonical product and managed-feed baseline

| Item | Evidence and result |
|---|---|
| Product repository | [github/squad](https://github.com/github/squad), linked by the official documentation site |
| Preferred documentation | [github.github.com/squad](https://github.github.com/squad/); landing page reports stable v1.1.0 |
| Official stable release | [v1.1.0](https://github.com/github/squad/releases/tag/v1.1.0); public `releases/latest` API returned `prerelease: false`, published `2026-10-20T14:49:09Z` |
| Tagged source | [v1.1.0 CLI manifest](https://github.com/github/squad/blob/v1.1.0/packages/squad-cli/package.json): package `@bradygaster/squad-cli`, version `1.1.0` |
| CFS npm metadata | `npm view @bradygaster/squad-cli dist-tags versions engines --json --registry https://packagefeedproxy.microsoft.io/npm/` completed with exit 0: `latest` is `1.1.0`, Node engine is `>=22.5.0`; inspected versions do not include `2.0.0-preview.4` |
| Active tools | `node --version`: `v22.23.4`; `npm --version`: `11.8.0`; `dotnet --version`: `10.0.403`; `copilot --version`: `1.0.109-1`; `squad --version`: `1.1.0` |
| Package feeds | Root and participant npm/NuGet configuration select Microsoft CFS. No preview or public-registry bypass is part of the course. |

The package name did **not** move with the product source. `bradygaster/squad` is a fork, not a redirect to `github/squad`. The separate participant course is [tamirdresher/squad-workshop](https://github.com/tamirdresher/squad-workshop).

The GitHub CLI metadata attempt returned **HTTP 403, organization SAML enforcement**. A normal public web fetch of the official release endpoint succeeded; this does not repair or certify the CLI token's SSO authorization. No authenticated GitHub mutation was attempted.

`Get-Command squad` resolved the active 1.1.0 executable through WinGet, while `npm list -g --depth=0` also listed an older Squad installation. Therefore check the **active executable**, not just package inventory. The app frontend's Node minimum can be higher than Squad's Node minimum; follow [course prerequisites](prerequisites.md).

## Help was checked, not inferred from old modules

The installed commands below completed with exit 0:

```powershell
squad --help
squad init --help
squad doctor --help
squad triage --help
squad loop --help
```

Relevant 1.1.0 contracts:

- `init` supports `--roles`, `--no-workflows` and `--state-backend local|orphan|two-layer`. That backend flag does not isolate team identity: [tagged init source](https://github.com/github/squad/blob/v1.1.0/packages/squad-cli/src/cli/core/init.ts#L342-L359) can set `config.teamRoot` to an existing personal Squad. Set `SQUAD_NO_PERSONAL=1` before init and all participant sessions, verify local config/root and the loaded lab-local agent profile, and never initialize in the course root.
- `doctor` checks structure/configuration and reachable Copilot CLI; it is not proof of subscription entitlement or a successful model request.
- `triage` polls by default (10 minutes), documents Ctrl+C to stop, and adds execution with `--execute`. Execution supports `--max-concurrent` and per-issue `--timeout`.
- `loop` uses a prompt file (`loop.md` by default) and does not require an issue queue. In [tagged loop source](https://github.com/github/squad/blob/v1.1.0/packages/squad-cli/src/cli/commands/loop.ts#L293-L299), `configured: true` selects normal flow; false/missing selects onboarding and **continues execution**. It is not an execution or authorization gate. Historical descriptions saying Ralph can only read issues do not describe this mode.

The core class starts neither recurring command. Exact doctor counts and historical bug numbers are not current compatibility promises.

## Provenance and redistribution boundary

The existing public repository carries the [Apache-2.0 license](../../LICENSE) and original joslat attribution. Those notices remain. Modified existing files carry a refresh notice.

The new lab, scripts, learner material and presentation are original contributions. **No content was copied from `squad-workshop-clean` or `squad-workshop-private`.** Their licenses and redistribution rights were not inspected because no material from them was needed or imported. Any later import requires a separate provenance/license review before copying.

The provided local Aspire HTML and Squad agenda Word document were read as teaching references. The presentation follows the Aspire teaching rhythm: outcome/agenda, problem, mental model, concept-before-lab, objective/actions/checkpoint/follow-along lab cards, short debrief, break, controlled agent workflow and takeaways. It does not redistribute reference text, branded assets, scripts or external slide dependencies.

The original Squad agenda's advanced breadth is mapped explicitly: team/routing, feature flow and decision reuse are core labs; autonomous loops, Aspire observation, presets, cross-squad/sub-squads and ACA/AKS remain an advanced briefing or follow-on. They are not represented as additional hands-on labs inside the 180-minute clock.

## Validation and review

See [validation receipts](validation.md) for exact executed app, script and presentation checks. The class schedule is **180 minutes**, including a **10-minute break** and **126 minutes of dedicated hands-on work (70%)**. This is a timed design, not an observed class-duration measurement.

The following remain separate delivery gates:

| Gate | Owner | Required evidence |
|---|---|---|
| Independent workflow/code review | Parent coordinator's Picard reviewer | Findings and disposition against the actual changed files |
| Independent upstream accuracy review | Parent coordinator's Q reviewer | Canonical source, stable release, installed help and CFS checks |
| Instructor rehearsal | Instructor | Clean-machine or class-image run of exact commands, timeboxes and recovery |
| Live Copilot route | Instructor and each participant | Entitled, policy-allowed model request plus observed routing and decision retrieval |

Prepared/manual checkpoints can demonstrate implementation, tests and review. They do **not** prove autonomous work, live specialist routing or fresh-session memory retrieval. A local diff review is not an actual submitted GitHub PR.

## Ownership

Seven owns the timed learner, instructor and preflight documentation. Data owns the original runnable lab/checkpoints and safe materialization/test/export scripts. The course coordinator owns the presentation, public-course integration and verification record. Existing Seven/Data runtime assignments were confirmed unavailable before restoring these same bounded responsibilities; no duplicate app session or competing writer was created.

Concrete next action: the parent coordinator assigns independent Picard/Q review; the instructor records a rehearsal and live-session result before advertising the live route as classroom-ready.
