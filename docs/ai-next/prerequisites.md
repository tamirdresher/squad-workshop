# AI NEXT: prerequisites and readiness gates

[Learner lab](learner-lab.md) · [Instructor guide](instructor.md)

This is the preparation guide for the **single-day, 180-minute AI NEXT course**.
It does not replace the requirements of the original three-module workshop.
Complete setup **before** the teaching clock starts.

The course uses the public [Squad repository](https://github.com/github/squad)
and [official documentation](https://github.github.com/squad/). The verified
course baseline on **10 November 2026** is **Squad CLI 1.1.0**, a stable release.
The npm package name remains `@bradygaster/squad-cli`; the repository's move to
`github/squad` does not imply a package rename.

## What you need

| Requirement | Course baseline | Check |
|---|---|---|
| Windows with PowerShell | PowerShell 7 or later | `$PSVersionTable.PSVersion` |
| Node.js | **22.12.0 or later in the Node 22 line** | `node --version` |
| npm | Supplied with a supported Node installation | `npm --version` |
| .NET SDK | **10.0 SDK**, not only the runtime | `dotnet --list-sdks` |
| Git | Current supported installation | `git --version` |
| GitHub Copilot CLI | Instructor-validated build with Squad agent support | `copilot --version` |
| Squad CLI | **1.1.0**, pinned for the class | `squad --version` |
| Editor and browser | Any editor; browser for the local React UI | Open both before class |
| Copilot access | Correct account, entitlement, organizational policy, available model and quota | **A successful live request**, below |
| Package access | Organization-approved Microsoft CFS npm and NuGet feeds | Feed checks and actual restore below |

Squad itself requires Node 22.5.0 or later. This course raises the floor to
**22.12.0** for its Vite 7 frontend. Node 22.5.0 is therefore **not** sufficient
for this course.

Preparation-machine receipts supplied for this course recorded Node
`22.23.4`, npm `11.8.0`, .NET SDK `10.0.403`, Squad `1.1.0`, and Copilot CLI
`1.0.109-1`. These are version observations, **not a claim that a live AI
rehearsal passed**. The instructor must record the versions actually used.

Docker, Azure subscriptions, Aspire, GitHub Issues, a GitHub remote, and
GitHub CLI authentication are **not required for the four core labs**.
GitHub CLI is optional for a separately authorized follow-on publication
exercise; installing it or passing `gh auth status` does not validate Copilot.

## 1. Install through approved channels

Use your organization's managed installation process first. Where `winget`
is approved, the Windows tool-install examples are:

```powershell
winget install OpenJS.NodeJS.22
winget install Microsoft.DotNet.SDK.10
winget install Git.Git
winget install GitHub.Copilot
```

Read and approve installation prompts normally. Reopen PowerShell afterward.
Check the installed versions; a successful installer exit is not a readiness
receipt. If PowerShell 7 is unavailable, obtain it through your approved
software channel before using the lab scripts.

From the **workshop repository root**, inspect the managed feed configuration:

```powershell
Get-Content .\.npmrc
Get-Content .\NuGet.Config
npm config get registry
dotnet nuget list source --configfile .\NuGet.Config
```

The workshop npm registry is
`https://packagefeedproxy.microsoft.io/npm/`. `NuGet.Config` clears inherited
package sources and selects
`https://packagefeedproxy.microsoft.io/nuget/v3/index.json`.
Participant projects must retain the managed feed files supplied with the
checkpoint.

Install the exact classroom Squad version through CFS:

```powershell
npm install --global @bradygaster/squad-cli@1.1.0 --registry https://packagefeedproxy.microsoft.io/npm/
squad --version
```

**Expected:** Squad reports `1.1.0`. Do not replace the pin with `@latest`,
a prerelease, an old preview, or a public-registry override. If CFS access or
the pinned package fails, stop and ask the instructor to resolve access through
the approved feed. Do not disable TLS, remove managed sources, or use another
identity as a workaround.

If script execution is blocked, inspect your effective execution policy and
use the organization's approved remedy. Do not bypass centrally managed
policy to make the workshop run.

## 2. Prepare a separate participant repository

The workshop content repository and your **Reading List lab repository are
different directories**. Run the provisioning script from the workshop root:

```powershell
.\scripts\New-AiNextLab.ps1 -Checkpoint starter -Destination .\reading-list-squad-lab
.\scripts\Test-AiNextLab.ps1 -LabPath .\reading-list-squad-lab -Feature starter
```

The destination must be **new**. Do not point the command at this workshop
checkout, another participant's work, or an existing project. If the destination
already exists, choose another name; do not delete work to satisfy the script.

The starter contains a prepared .NET 10 + React + TypeScript + SQLite Reading
List application. The test command is the executable readiness check; inspect
its final result and preserve any failure text. It may need approved package
access on its first run. A passing starter does **not** prove the later
mark-as-read or filtering features exist.

Use the startup commands in the [learner guide](learner-lab.md#run-the-prepared-application)
to open the UI and confirm you can add a book. Restart the API and confirm the
book persists. Leave an empty or clearly labeled practice dataset for class.

## 3. Prove Copilot can answer a live request

From the participant directory, start the ordinary CLI:

```powershell
Set-Location .\reading-list-squad-lab
$env:SQUAD_NO_PERSONAL='1'
copilot
```

Authenticate using the supported interactive sign-in flow if requested.
Select an available, organization-approved model using the CLI's actual model
picker. Then submit:

```text
Readiness check only. Reply with READY and one sentence describing your role.
Do not invoke tools, read or write files, install anything, or contact services.
```

**Gate:** the model actually returns an answer. Record the date, selected model,
CLI version, and success or exact error in your readiness notes. Do not record
tokens, credentials, or account-identifying screenshots. Exit normally after
the response; the Squad session begins in Lab 1.

These are separate checks:

1. `copilot --version`: a binary is installed.
2. Sign-in: an identity authenticated.
3. Live request: that identity/model can execute a request under today's
   entitlement, organization policy, and quota.
4. Lab 1 Squad request: the local Squad agent is discovered and can route work.

Passing one does not imply the others. A quota, entitlement, unavailable-model,
or policy failure is a **blocked live-agent path**, not a coding failure.

## 4. Readiness decision

| Gate | Ready means | If blocked |
|---|---|---|
| Toolchain | Required versions actually reported | Repair through approved installs before class |
| Packages | Starter validation completes through managed feeds | Resolve feed access; no public-source fallback |
| Local app | UI/API work and SQLite survives an API restart | Keep the exact error; use instructor diagnosis |
| Live model | A real request returns successfully | Resolve policy/quota or join a consenting partner's live session |
| Squad | Initialized and healthy in Lab 1; first routed request succeeds | Timebox diagnosis and label any fallback |

A prepared checkpoint allows **manual application and artifact inspection**.
It does not provide offline AI, verify routing, or prove that Squad remembered
anything. Pairing is useful only if you observe and document a real permitted
session. Never claim a prerecorded or manually prepared result as your own live
execution.

## Troubleshooting boundaries

- **CFS restore fails:** verify the supplied feed configuration, connectivity,
  and approved access with the instructor. Keep the error; do not edit out the
  feed policy.
- **Copilot can sign in but cannot answer:** check entitlement, organization
  policy, selected model availability, and quota. Reinstalling Squad is not a
  general remedy.
- **`squad doctor` fails:** run it inside the participant repository, save the
  actual output, and fix failed required checks. Do not paste the old workshop's
  `0.9.4` counts as expected output for `1.1.0`.
- **Personal Squad or wrong custom agent:** set `SQUAD_NO_PERSONAL=1` before
  init and in every participant-session terminal. The local backend does not
  isolate team identity. Follow [Lab 1's root/profile-origin checks](learner-lab.md);
  matching user-level agents can override a same-name repository agent.
  If the loaded lab-local profile cannot be verified, keep live work blocked.
- **Locked files or stale UI after a feature:** stop only your API and Vite
  before validation/export, then restart both before browser checks. The scripts
  rebuild API binaries and reinstall frontend dependencies; `dotnet run`
  without watch does not reload new builds.
- **Squad versions disagree across tools:** run `Get-Command squad -All` and
  `squad --version` to identify the active command. An older installation in
  `npm list --global --depth=0` does not prove that the active executable is old.
  Resolve PATH/install ambiguity through approved changes, not blind uninstalls.
- **Port already occupied:** identify your own process and coordinate with the
  instructor. Do not kill processes by name or stop another participant's app.
- **GitHub API returns 403/SAML:** the core course needs no GitHub write.
  Leave publication blocked and obtain legitimate authorization separately.
- **Browser mock-up alone looks correct:** still run the API, regression tests,
  and persistence check. A screenshot is not functional validation.

## Sources and attribution

- [Official Squad repository](https://github.com/github/squad)
- [Official Squad documentation](https://github.github.com/squad/)
- [Pinned Squad release](https://github.com/github/squad/releases/tag/v1.1.0)
- [Original public workshop](https://github.com/joslat/squad-workshop),
  copyright © 2026 joslat, [Apache License 2.0](../../LICENSE).

This course guide is original teaching material adapted around that public
workshop's Reading List exercise. Retain its attribution and license when
redistributing. No private course text or assets are included.
