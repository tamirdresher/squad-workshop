# Module 0 — Orientation and Setup

> Start here. This module makes sure the GitHub Copilot CLI, GitHub auth, and the workshop mental model are aligned before anyone asks agents to write code.

← Back to [Workshop Index](../README.md)

---

## At a glance

**⏱️ 15–20 min** · verify tools, identity, repo access, and PM/engineer roles.

| Step | What you do |
|---|---|
| 0.1 | Verify the GitHub Copilot CLI and GitHub CLI auth |
| 0.2 | Understand how the Squad agent runs on the Copilot CLI |
| 0.3 | Pick your learner path: PM, engineer, or facilitator |
| 0.4 | Decide where your lab repo will live |
| 0.5 | *(Optional)* Set up MCP servers and skills for your agents |

---

## 0.1 Verify Copilot CLI and GitHub auth

Run from the workshop repo root:

```powershell
./prereqs.ps1
```

If you prefer manual checks:

```powershell
copilot --version
copilot --help
gh auth status
```

If `gh auth status` is not healthy, authenticate with the `project` scope:

```powershell
gh auth login -s project
gh auth status
```

Verify the account shown by `gh auth status` is the account you intend to use for the lab.

---

## 0.2 The Copilot CLI is the workshop entrypoint

Use this command for interactive Squad work:

```powershell
copilot --agent squad
```

Inside the session, enable tool auto-approval when the module asks for it:

```text
/allow-all
```

The `copilot` command is what this workshop uses everywhere. If `copilot --version` fails, install the GitHub Copilot CLI before continuing (see [docs/prerequisites.md](../docs/prerequisites.md)).

---

## 0.3 Pick your path

### PM / product learner

You do not need to write code by hand. Your job is to state the product goal, approve acceptance criteria, ask the Lead to explain technical tradeoffs in product language, review the running app behavior, and check that the Scribe records useful decisions.

Keep [docs/pm-track.md](../docs/pm-track.md) open.

### Engineer learner

Let the agents do most of the work, but inspect generated code, tests, and commits. Treat the agents like a junior team that can move fast but still needs review.

### Facilitator

Prepare a known-good machine, a backup lab repo, and a pairing plan for PMs. See [docs/facilitator-guide.md](../docs/facilitator-guide.md).

---

## 0.4 Choose lab repo location

Module 1 creates a separate repo named `reading-list-squad-lab`. Options:

- **Personal/private repo:** safest default for learners.
- **Organization repo:** use only if participants have repo creation permission.
- **Facilitator-created repo:** recommended for PMs or anyone without repo creation rights.
- **Local-only repo:** okay for Module 1, but skip push/PR steps until remote access is available.

Do not paste tokens, passwords, or private secrets into Copilot prompts. If a step needs authentication, use the documented CLI login flow.

---

## 0.5 Set up MCP servers and skills

> **Optional but recommended.** None of the servers or skills below are required to finish Modules 01–04 — the Squad agent works out of the box. Set these up if you want your agents to reach beyond the local repo (browse the web, read PDFs, drive GitHub through natural language). If you're short on time, skip to Module 1 and come back.

The list is tiered so you're never blocked:

- **Core set** — small, high-value, worth installing for the workshop.
- **Real-work set** — role-specific tools that pay off once you take Squad back to your day job.

### What MCP servers and skills are

An **MCP server** (Model Context Protocol) is a small companion process the Copilot CLI launches and talks to over a standard protocol. It gives your agents *tools* they don't have natively — a GitHub server for issues and PRs, a browser server for navigating the web, a converter that turns a PDF into text. Squad agents benefit because most real work needs context that lives outside the current repo, and MCP is how the CLI safely hands that context to an agent.

A **Skill** is different: it's not a running process, it's a folder of Markdown instructions (a `SKILL.md`) that teaches an agent *how* to do something — a repeatable procedure, a checklist, a house style. An MCP server adds new *capabilities* (things the agent can do); a skill adds *know-how* (how the agent should do them). Skills cost nothing to run and load only when relevant.

### Where configuration lives

MCP servers are configured in JSON. The Copilot CLI reads two locations:

- **User-level (applies everywhere):** `~/.copilot/mcp-config.json` — on Windows, `%USERPROFILE%\.copilot\mcp-config.json`. This is the file the examples below use.
- **Project-level (scoped to one repo):** `.mcp.json` in the repo root. Use this to share a server set with everyone who clones the lab repo. If a key change here doesn't take effect, check the current [Copilot CLI docs](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli) for the exact project-config precedence.

Every server lives under a top-level `mcpServers` object. The shape is the same for all of them — here it is once:

```json
{
  "mcpServers": {
    "server-name": {
      "type": "local",
      "command": "the-executable",
      "args": ["arg1", "arg2"],
      "tools": ["*"]
    }
  }
}
```

For each server below, just add its entry inside `mcpServers` (a remote server uses `"type": "http"` and a `"url"` instead of a `command`).

> **⚠️ Gotcha — restart after editing.** The Copilot CLI loads MCP config at startup. After you edit `mcp-config.json` (or `.mcp.json`), **exit and restart the Copilot CLI session** or the change won't load. Inside a session, `/mcp` lists what actually loaded.

> Never commit a real token. Use an obvious placeholder in the doc, set the real value as an environment variable, and reference it from config (e.g. `${GITHUB_PERSONAL_ACCESS_TOKEN}`) — see [docs/prerequisites.md](../docs/prerequisites.md) for the tools these servers depend on (Node.js, Docker, Python).

---

### Core set — recommended for the workshop

#### 1. GitHub MCP — issue/PR/repo operations

The backbone of Squad's issue-to-PR lifecycle: create and triage issues, open PRs, read repo structure, in natural language.

> **You may already have it.** The GitHub MCP server ships **pre-installed** in the Copilot CLI with read-only tools enabled. Verify inside a session with `/mcp show github-mcp-server`. You only need the config below to add write access (your own PAT) or run it alongside the built-in server under a different name.

The simplest no-Docker path is the GitHub-hosted remote server:

```json
"github": {
  "type": "http",
  "url": "https://api.githubcopilot.com/mcp/",
  "headers": { "Authorization": "Bearer YOUR_GITHUB_PERSONAL_ACCESS_TOKEN" }
}
```

If you prefer to run it locally, use Docker:

```json
"github": {
  "type": "local",
  "command": "docker",
  "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"],
  "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}" },
  "tools": ["*"]
}
```

- **Prerequisite:** a [GitHub Personal Access Token](https://github.com/settings/personal-access-tokens/new); the Docker variant also needs Docker Desktop running.
- **PAT scopes:** `repo` for repository/issue/PR operations, plus `read:packages` if you use the Docker image. Add more only for the toolsets you enable.
- **Security:** set the token as the `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable and reference it — don't paste the literal token into the file, and never commit it.
- **Docs:** https://github.com/github/github-mcp-server

#### 2. Playwright MCP — browser automation

Lets an agent navigate pages, fill forms, click, screenshot, and scrape — using an accessibility tree rather than pixels, so it's fast and LLM-friendly.

```json
"playwright": {
  "type": "local",
  "command": "npx",
  "args": ["-y", "@playwright/mcp@latest"],
  "tools": ["*"]
}
```

- **Prerequisite:** Node.js (provides `npx`). See [docs/prerequisites.md](../docs/prerequisites.md).
- **Docs:** https://github.com/microsoft/playwright-mcp

By default Playwright MCP launches its *own* browser with a persistent profile. That means it starts logged out of everything.

##### Attach to your real Chrome/Edge with the browser extension

There's an official **Playwright browser extension** that lets the MCP server attach to your *existing, already-logged-in* Chrome or Edge tab instead of launching a fresh isolated browser.

**Why you'd want it:**

- Reuse the sessions, cookies, and SSO you're already signed in to — no re-login, no MFA dance for the agent.
- Work against sites behind corporate auth without handing credentials to a script.
- Watch what the agent does live, in a browser you control.

**How to install and connect** *(verified against the official docs on 2026-08-03 — flags change, so confirm at the links below if anything looks off):*

1. Install the **Playwright Extension** from the Chrome Web Store: https://chromewebstore.google.com/detail/playwright-extension/mmlmfjhmonkocbjadbfplnigmagldckm — it works in **Chrome, Edge, and other Chromium browsers** (Edge installs Chrome Web Store extensions; allow it when prompted).
2. Add the `--extension` flag to the Playwright MCP config so the server connects through the extension instead of launching its own browser:

   ```json
   "playwright-extension": {
     "type": "local",
     "command": "npx",
     "args": ["-y", "@playwright/mcp@latest", "--extension"],
     "tools": ["*"]
   }
   ```
3. Restart the Copilot CLI. The first time an agent touches the browser, Playwright opens a page where you pick which open tab it may control, then asks you to approve the connection.
4. *(Optional)* To skip the approval prompt each time, copy the `PLAYWRIGHT_MCP_EXTENSION_TOKEN` shown on the extension's status page and add it under `"env"` in the config. This token is unique to your browser profile.

**Verify it works:** with the extension installed and the server running, ask the agent to open the current tab or read the page you're on — it should act on *your* browser, not spawn a new one.

> **🔒 Security note:** attaching to your real browser means the agent can act as the logged-in *you* on every site that tab can reach. Only point it at tabs you're comfortable letting an agent drive, and prefer approving connections manually unless you understand the token trade-off.
>
> Extension install and connect docs: https://github.com/microsoft/playwright/tree/main/packages/extension — MCP flag reference: https://github.com/microsoft/playwright-mcp

#### 3. MarkItDown MCP — turn documents into Markdown

Converts PDF, Office, HTML, and images into clean Markdown so an agent can actually read them (spec sheets, exported tickets, screenshots of tables).

```json
"markitdown": {
  "type": "local",
  "command": "markitdown-mcp",
  "args": [],
  "tools": ["*"]
}
```

- **Prerequisite:** install the package so the `markitdown-mcp` command resolves on your PATH:

  ```powershell
  pip install markitdown-mcp
  # or, to keep it isolated:
  pipx install markitdown-mcp
  # or with uv:
  uv tool install markitdown-mcp
  ```

  A Docker image is also available if you'd rather not install Python tooling — see the repo.
- **Docs (Microsoft OSS):** https://github.com/microsoft/markitdown — the MCP server lives under `packages/markitdown-mcp` and exposes one tool, `convert_to_markdown`.
- **Pairs with the document skills:** MarkItDown reads Office files *in*; the `docx`/`pptx`/`xlsx` skills (see [Recommended skills](#recommended-skills)) write them back *out*.

---

### Real-work set — role-specific

These aren't needed for the workshop. Install the ones that match how *you* work.

#### 4. Azure DevOps MCP — for work tracked in ADO

For attendees whose boards, repos, and pipelines live in Azure DevOps rather than GitHub.

```json
"azure-devops": {
  "type": "local",
  "command": "npx",
  "args": ["-y", "@azure-devops/mcp", "YOUR_ADO_ORG"],
  "tools": ["*"]
}
```

- **`YOUR_ADO_ORG`** is your Azure DevOps **organization name** (the `dev.azure.com/<org>` segment) — replace it with your own.
- **Prerequisite / auth:** Node.js for `npx`, and sign in with the Azure CLI (`az login`) so the server can use your credentials.
- **Note:** the project is now **remote-first** — a hosted server at `https://mcp.dev.azure.com/{organization}` is recommended and needs no local install. Use the local `npx` form above only if you specifically need a local stdio setup.
- **Docs (public):** https://github.com/microsoft/azure-devops-mcp

#### 5. Microsoft 365 Copilot Work IQ — organizational context

Work IQ is a **workplace intelligence layer**, not a plug-and-play local command. It grounds agents in real-time Microsoft 365 context — mail, calendar, files, people, chat, and sites — through a compact set of generic tools, with permission-aware governance.

Because it's an enterprise service, there is **no local `mcpServers` command block** to copy. The real integration path:

- Work IQ is exposed as a **remote MCP server** (alongside A2A and REST endpoints). You add its MCP tools to an agent through **Microsoft Copilot Studio** or **Microsoft Foundry**, not by editing `mcp-config.json`.
- **Prerequisites:** it's currently a **preview** feature; adding Work IQ MCP servers to an agent requires a **Microsoft 365 Copilot license**, and usage of the Work IQ API is billed on a usage-based model independent of that license. Tenant admins manage governance and cost controls in the Microsoft 365 admin center.
- **Docs:** overview — https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/work-iq/ · setup in Copilot Studio — https://learn.microsoft.com/en-us/microsoft-copilot-studio/use-work-iq

#### 6. Chrome DevTools MCP — web performance and debugging

Complements Playwright: where Playwright *automates*, this *inspects* — performance traces, console output, network requests, screenshots of a live Chrome.

```json
"chrome-devtools": {
  "type": "local",
  "command": "npx",
  "args": ["-y", "chrome-devtools-mcp@latest"],
  "tools": ["*"]
}
```

- **Prerequisite:** Node.js for `npx`, and Google Chrome (officially only **Google Chrome** and **Chrome for Testing** are supported).
- **Attach to a running Chrome:** add `"--browser-url=http://127.0.0.1:9222"` to `args` to connect to an already-open Chrome started with remote debugging on that port. For lightweight use, `--slim` reduces the exposed toolset.
- **Docs (public):** https://github.com/ChromeDevTools/chrome-devtools-mcp

#### 7. .NET Aspire MCP — for Aspire-based apps

Relevant only if you build with .NET Aspire (this workshop's app is a plain .NET 10 minimal API, so it's off-topic for Modules 01–04). Recent Aspire tooling can expose an MCP server via `aspire mcp start`; if you work with Aspire day-to-day, see the [Aspire docs](https://learn.microsoft.com/en-us/dotnet/aspire/) for the current command and config.

---

### Recommended skills

Skills are folders of Markdown instructions the coordinator loads when they match the task. The convention is one folder per skill with a `SKILL.md` inside:

```
{skills-dir}/{name}/SKILL.md
```

The CLI and Squad discover skills from several directories, in this precedence order (earlier wins):

```
.squad/skills/  >  .github/skills/  >  .copilot/skills/  >  .claude/skills/  >  .agents/skills/
```

Personal skills in `~/.copilot/skills/` are discovered automatically by the Copilot CLI in **every** session — no matter which folder you launched it from — so they're the right home for procedures you want available everywhere. A skill is picked up automatically when its description matches what you're asking for; you don't invoke it by hand.

#### Document authoring skills — install once, use everywhere

You don't have to build a document author from scratch — but these skills are **not** part of a plain `npm install -g @github/copilot`. You install them yourself, once, into your **personal** skills directory so they're available in every folder.

The Copilot CLI's own `/skills` help lists where it discovers skills. Two of those locations matter here:

- `~/.copilot/skills/` — **personal** skills. They follow *you* and load in every session, whatever directory you start from.
- `<repo-root>/.github/skills/` — **project** skills. They travel with *that repo* only.

For document authoring you want the **personal** location, so the capability is there in every project. These skills come from Anthropic's public [`anthropics/skills`](https://github.com/anthropics/skills) repo:

| Skill | What it produces | License |
|---|---|---|
| `docx` | Word `.docx` — TOCs, headings, page numbers, letterheads, tracked changes, comments, find-and-replace, image insert/replace | Source-available (Anthropic) |
| `pptx` | PowerPoint `.pptx` — decks, templates, layouts, speaker notes, comments, combine/split; also SharePoint/OneDrive-hosted decks | Source-available (Anthropic) |
| `xlsx` | `.xlsx`/`.xlsm`/`.csv`/`.tsv` — formulas, formatting, charts, recalculation, cleaning messy tabular data | Source-available (Anthropic) |
| `pdf` | `.pdf` — extract text/tables, merge/split, rotate, watermark, fill forms, encrypt/decrypt, extract images, OCR scanned pages | Source-available (Anthropic) |

> ⚠️ **Licensing — read before you redistribute.** The `anthropics/skills` README states these four document skills are **source-available, not open source**, and are **"provided for demonstration and educational purposes only."** Install them into *your own* `~/.copilot/skills/` for personal use, but do **not** commit copies into this (or any shared) workshop repo. Many *other* skills in that repo are Apache 2.0 — the document skills are not.

**Global install (run once, works in every folder):**

```powershell
# 1. Grab the skills from Anthropic's public repo (shallow clone into a scratch folder)
$scratch = Join-Path $env:USERPROFILE 'anthropic-skills'
git clone --depth 1 https://github.com/anthropics/skills.git $scratch

# 2. Copy the document skills into your PERSONAL skills directory
$dest = Join-Path $env:USERPROFILE '.copilot\skills'
New-Item -ItemType Directory -Force -Path $dest | Out-Null
foreach ($name in 'docx','pptx','xlsx','pdf') {
    Copy-Item -Recurse -Force "$scratch\skills\$name" (Join-Path $dest $name)
}

# 3. Confirm they landed, then delete the scratch clone
Get-ChildItem $dest -Directory | Select-Object Name
Remove-Item -Recurse -Force $scratch
```

Because they now live under `~/.copilot/skills/` (personal), they load in **every** Copilot CLI session — this repo, a scratch folder, anywhere — with no per-project setup. That's the difference from a `.github/skills/` install, which would only apply inside one repo.

> The `anthropics/skills` README also shows a `/plugin marketplace add anthropics/skills` flow, but that section is written for **Claude Code**, a different product. The Copilot CLI has its own `/plugin` command and a `/skills add <directory-path>` command (run `/help` in a session to see them), but the manual copy above is the path we can verify works for the CLI — so that's what this workshop uses.

These fire **on intent, not by name** — you describe the deliverable and the matching skill loads itself:

```text
Draft a one-page Word memo (.docx) summarising this week's decisions.
Turn these release notes into a 5-slide .pptx deck with speaker notes.
Clean this messy CSV into a formatted .xlsx with a totals column.
Extract the form fields from this scanned .pdf and fill them in.
```

Under the hood they operate on Office Open XML directly (a `.docx`/`.pptx`/`.xlsx` is really a ZIP of XML parts, so a skill unpacks → edits → validates → repacks), and lean on LibreOffice (`soffice`) for conversion and thumbnail steps.

**Check what you already have:**

```powershell
Get-ChildItem $env:USERPROFILE\.copilot\skills\ -Directory
```

Anything listed here shows up in your Copilot session automatically — no `mcp-config.json` entry, no restart-to-load step. You may also see skills placed there by other tools (for example, the Copilot desktop app); those are separate from the CLI and may not exist on a teammate's machine, which is exactly why the install above is worth running.

#### Skills vs MCP servers — which does what

They solve different halves of the document problem:

- **Skills** are Markdown instructions loaded into the agent's context. Document *authoring* — producing a `.docx`, `.pptx`, or `.xlsx` — is a **skill** concern (the document skills above). There is no official Microsoft MCP server that writes Office documents.
- **MCP servers** are running processes that expose tools the agent calls. Document *retrieval and conversion* is an **MCP** concern: [MarkItDown](#3-markitdown-mcp--turn-documents-into-markdown) (subsection 3) turns existing Office/PDF/HTML files into Markdown the agent can read, and [Work IQ](#5-microsoft-365-copilot-work-iq--organizational-context) (subsection 5) grounds the agent in live Microsoft 365 content.

Rule of thumb: **read a document in → MCP; write a document out → skill.**

Where to get more of them for this workshop:

- **Squad's own starter skills.** `squad init` (Module 1, Step 0d) ships a starter set under `.github/skills/`. Module 2 inspects them in depth. Browse them after init:

  ```powershell
  Get-ChildItem -Recurse .github/skills/
  ```
- **Workshop agents/skills installer.** The repo includes [`scripts/Install-WorkshopAgents.ps1`](../scripts/Install-WorkshopAgents.ps1) — run it from the repo root to add the workshop coach agent (see Module 1, Step 0f).
- **Write your own.** Drop a `my-skill/SKILL.md` under `.github/skills/` (shared with the repo) or `~/.copilot/skills/` (personal, everywhere). Keep each skill a single focused procedure.

---

### Verify your setup

Inside a Copilot CLI session, list what actually loaded:

```text
/mcp
```

For a single server (e.g. the built-in GitHub one):

```text
/mcp show github-mcp-server
```

Then confirm a server responds by asking the agent to use it, for example:

```text
List my GitHub repositories.
```

**If a server shows as failed or missing:**

- [ ] **Restart the CLI** — config changes only load at startup.
- [ ] **Command on PATH?** Run the `command` yourself in a terminal (`npx …`, `markitdown-mcp --help`, `docker --version`). If it isn't found, install the prerequisite from [docs/prerequisites.md](../docs/prerequisites.md).
- [ ] **Docker running?** For the GitHub/MarkItDown Docker variants, make sure Docker Desktop is started.
- [ ] **Token/env var set?** Confirm the referenced variable (e.g. `GITHUB_PERSONAL_ACCESS_TOKEN`) is exported in the shell that launched the CLI.
- [ ] **Valid JSON?** Validate the config: `Get-Content $env:USERPROFILE\.copilot\mcp-config.json | ConvertFrom-Json`.

---

Next: [Module 1 — Basic →](01-basic.md)
