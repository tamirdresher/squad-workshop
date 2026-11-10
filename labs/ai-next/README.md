# AI NEXT reading-list lab code

Original workshop implementation; no private application source is used.
The course repository retains its existing Apache-2.0 license and attribution.

## Requirements and feeds

Use PowerShell 7, Node.js **22.12.0+**, npm, and .NET SDK **10.0.0+**.
Vite 7 requires a higher Node floor than the older workshop's 22.5.0.
Validated with Node 22.23.4, npm 11.8.0 and .NET SDK 10.0.403.

Only these package entry points are used:

- npm: `https://packagefeedproxy.microsoft.io/npm/`
- NuGet: `https://packagefeedproxy.microsoft.io/nuget/v3/index.json`

Generated labs receive their own `.npmrc` and `NuGet.Config`; they do not
depend on copying a participant's credentials or the course root configuration.
Versions and integrity hashes are locked. The npm lock intentionally omits
registry-resolved URLs: `npm ci` resolves locked packages through CFS, rather
than recording CFS's redirected backend URLs or a public registry.
NuGet restore uses `--locked-mode`. Do not replace these feeds with public
registries when a restore fails; resolve the CFS access problem.

## Materialize a checkpoint

Run from the course worktree root:

```powershell
.\scripts\New-AiNextLab.ps1 -Checkpoint starter -Destination .\reading-list-squad-lab
.\scripts\Test-AiNextLab.ps1 -LabPath .\reading-list-squad-lab -Feature starter
```

The destination must be NEW and inside this worktree. Existing directories,
course source directories, paths outside the worktree and reparse points are
rejected. No directory is overwritten or automatically removed on failure.
Recover by inspecting the failed directory and choosing another NEW name:

```powershell
.\scripts\New-AiNextLab.ps1 -Checkpoint read -Destination .\reading-list-squad-read-recovery
.\scripts\New-AiNextLab.ps1 -Checkpoint filter -Destination .\reading-list-squad-filter-recovery
```

These are **prepared manual fallbacks**, not proof that Squad built a feature.
The starter provides common persistence and UI scaffolding; its feature routes,
validation of filter queries, and UI controls are enabled by the small
`api\Features.cs` / `frontend\src\features.ts` checkpoint overlays.
`read` adds required-boolean, idempotent PATCH and the toggle; `filter` retains
PATCH and adds strict query validation and filtering.
There is one shared application, not three duplicated applications.

The script never runs `git init`, `squad init`, commits, pushes or publishes.
If the course tells you to initialize the participant repository, run these
**inside the generated lab**, never in the course repository:

```powershell
Set-Location .\reading-list-squad-lab
git init
# Follow the learner guide for Squad initialization in this lab only.
```

No baseline commit is required: `.ai-next\baseline` holds the materialized
checkpoint source for the local evidence diff. It is not tamper-proof.

## Run manually

The test script installs locked dependencies and builds both projects. To
restore/build manually from the generated lab:

```powershell
dotnet restore .\api\ReadingList.Api.csproj --configfile .\NuGet.Config --locked-mode
dotnet build .\api\ReadingList.Api.csproj --no-restore
Set-Location .\frontend
npm ci --registry=https://packagefeedproxy.microsoft.io/npm/ --ignore-scripts --no-audit --no-fund
npm run build
```

API terminal, from the generated lab:

```powershell
dotnet run --project .\api\ReadingList.Api.csproj --no-launch-profile --urls http://127.0.0.1:5080
```

Frontend terminal, from the generated lab:

```powershell
Set-Location .\frontend
npm run dev
```

Open the Vite address printed in the terminal (normally
`http://127.0.0.1:5173`). `/api` is proxied to API port 5080.
The default manual database is `books.db` in the API process working directory;
`BOOKS_DB` overrides it. Do not point automated tests at your manual database.
Stop manual processes with Ctrl+C in their own terminals.

## API contract

All checkpoints:

- `GET /api/books`: ordered by ascending `id`.
- `POST /api/books` with `{ "title": "...", "author": "..." }`: trims both
  fields; each must contain 1–120 characters after trimming. Missing, null,
  whitespace-only, non-string or overlong values return 400.
- Successful POST returns **201**, a Location header, and
  `{ "id": 1, "title": "...", "author": "...", "isRead": false }`.

Read and filter checkpoints:

- `PATCH /api/books/{id}/read` with `{ "isRead": true }` or `false` returns
  200 Book; repeated identical calls are idempotent.
- Missing, null or non-boolean `isRead` returns 400. Unknown numeric id returns 404.

Filter checkpoint:

- `GET /api/books?status=all|read|unread`, default `all` only when missing.
- Invalid, empty, differently cased or repeated status values return 400.
- Schema and id ordering are unchanged. Filtering never mutates storage.

## Test the feature you actually implemented

From the course root:

```powershell
.\scripts\Test-AiNextLab.ps1 -LabPath .\reading-list-squad-lab -Feature read
.\scripts\Test-AiNextLab.ps1 -LabPath .\reading-list-squad-lab -Feature filter
```

Without `-Feature`, the script tests only the materialized checkpoint. A green
starter suite **does not** prove read/filter implementation. Each later selector
also checks all earlier contracts.

The script restores locked dependencies from CFS, compiles API and TypeScript,
builds Vite, then runs `tests\http.mjs` using Node's built-in assertions/fetch.
The runner starts the compiled API at an ephemeral loopback port with a unique
SQLite database, sends actual HTTP requests, restarts the API, checks persistence,
stops its exact child process and deletes only its exact UUID test directory.
It never uses/deletes a participant database or kills processes by name.
Any build, HTTP assertion or cleanup failure returns a nonzero exit.

`.ai-next\test-receipt.json` is overwritten for every run. Failed runs invalidate
previous evidence. Receipts contain named actual checks, the tested feature,
source hash and known local versions, not server logs.
**Browser interaction is not automated**: manually add a book, toggle it twice,
switch all/read/unread views, reload, and confirm the visible state and errors.

## Local evidence

```powershell
.\scripts\Export-AiNextEvidence.ps1 -LabPath .\reading-list-squad-lab -Feature filter
```

Export runs fresh builds/tests and refuses a failed receipt. It writes:

- `.ai-next\evidence.json`: actual receipt, version information and limitations.
- `.ai-next\source.diff`: checkpoint-relative, full-file unified source hunks.

Only API C#/project/JSON and frontend source/config/manifests are diffed.
Optional `AI-NEXT-EVIDENCE.md` at lab root is included as a **user-reported,
unverified narrative** (32,000-character limit). Add manually inspected role/file
routing, decision excerpts, fresh-session citations and reviewer dispositions there.
The exporter does not read `.squad` histories, raw chat, logs, databases,
environment variables, credentials or arbitrary files.
Memory, routing, independent review and browser behavior are explicitly
**not verified** by automated evidence.

Sensitive-looking lines are redacted; sanitization is best effort, not a
security guarantee. Inspect both outputs locally before sharing. Nothing is
uploaded or published. Source hashes detect edits since the test run but are
not signed attestations.

## Maintainer validation

```powershell
.\labs\ai-next\tests\Validate-Checkpoints.ps1
```

This performs all three real checkpoint builds/HTTP suites, evidence checks,
negative feature/regression tests and materialization/path-guard tests. It uses
NEW `labs\ai-next\validation-*` directories and removes only directories it
created, after exact child processes have exited. A failure is never reported as
success. Build outputs and validation directories are ignored.
