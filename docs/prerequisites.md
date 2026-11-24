# Prerequisites

> **Runs on PowerShell 7 (cross-platform).** Run `pwsh ./scripts/Verify-Prerequisites.ps1` from the repo root to check all tools in one pass.

This page is the authoritative prerequisites reference for the Squad Workshop. All modules link here.

---

## Summary

| Tool | Minimum version | Check command | Download / install link | Install |
|---|---|---|---|---|
| Node.js | 22.5.0 | `node --version` | [nodejs.org/en/download](https://nodejs.org/en/download) | Windows: `winget install OpenJS.NodeJS.22`; macOS: `brew install node@22` |
| .NET SDK | 10.0.0 | `dotnet --version` | [learn.microsoft.com/dotnet/core/install](https://learn.microsoft.com/dotnet/core/install/) | Windows: `winget install Microsoft.DotNet.SDK.10`; macOS: `brew install --cask dotnet-sdk` |
| Git | any recent | `git --version` | [git-scm.com/downloads](https://git-scm.com/downloads) | Windows: `winget install Git.Git`; macOS: `brew install git` |
| GitHub CLI | 2.89.0 | `gh version` | [cli.github.com](https://cli.github.com/) | Windows: `winget install GitHub.cli`; macOS: `brew install gh` |
| GitHub CLI auth | logged in with `project` scope | `gh auth status` | [GitHub CLI auth docs](https://cli.github.com/manual/gh_auth_login) | `gh auth login -s project` |
| GitHub Copilot CLI | current | `copilot --version` | [npm registry package metadata](https://registry.npmjs.org/@github/copilot/latest) | `npm install -g @github/copilot` |
| Squad CLI | 1.1.0 | `squad --version` | [npm registry package metadata](https://registry.npmjs.org/@bradygaster/squad-cli/latest) | `npm install -g @bradygaster/squad-cli` |
| PowerShell 7 | 7.x | `pwsh --version` | [PowerShell latest release](https://github.com/PowerShell/PowerShell/releases/latest) | Windows: `winget install Microsoft.PowerShell`; macOS: `brew install powershell` |

The GitHub Copilot CLI provides the Copilot integration used by this workshop. Install it from the public npm registry (`npm install -g @github/copilot`).

> **Install Node.js first** — Squad CLI requires Node ≥ 22.5.0 for the built-in `node:sqlite` module.

---

## Detailed install instructions

### 1. Node.js 22.5.0 or later

```powershell
node --version       # Expected: v22.5.0 or later
```

Download: https://nodejs.org/en/download

- **Windows:** `winget install OpenJS.NodeJS.22 --accept-source-agreements --accept-package-agreements`
- **macOS:** `brew install node@22` or use `nvm install 22`
- **Linux (Debian/Ubuntu):** `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs`

Restart your terminal after installing so the new `node` is on PATH.

### 2. .NET 10 LTS or later

```powershell
dotnet --version     # Expected: 10.x.x
```

Install guide: https://learn.microsoft.com/dotnet/core/install/

- **Windows:** `winget install Microsoft.DotNet.SDK.10 --accept-source-agreements --accept-package-agreements`
- **macOS:** `brew install --cask dotnet-sdk` or use Microsoft's `dotnet-install.sh --channel 10.0`
- **Linux (Debian/Ubuntu):** use the Microsoft or distro feed for `dotnet-sdk-10.0`, or `dotnet-install.sh --channel 10.0`

### 3. Git

```powershell
git --version
```

Download: https://git-scm.com/downloads

- **Windows:** `winget install Git.Git --accept-source-agreements --accept-package-agreements`
- **macOS:** `brew install git`
- **Linux:** `sudo apt-get update && sudo apt-get install -y git`

### 4. GitHub CLI (`gh`) — 2.89.0 or later

```powershell
gh version
```

Download: https://cli.github.com/

- **Windows:** `winget install GitHub.cli`
- **macOS:** `brew install gh`
- **Linux:** use the official GitHub CLI package instructions at `cli.github.com`.

### 5. GitHub CLI authentication

```powershell
gh auth status
```

If not authenticated:

```powershell
gh auth login -s project
gh auth status
```

Select `GitHub.com` → `HTTPS` → authenticate via browser. Verify the displayed account is the intended account and has access to the lab repo or organization.

### 6. GitHub Copilot CLI

```powershell
copilot --version
copilot --help
```

Package metadata: https://registry.npmjs.org/@github/copilot/latest

All OSes, after Node.js is installed:

```powershell
npm install -g @github/copilot
```

After installing, restart the terminal and rerun `copilot --version`.

### 7. Squad CLI — 1.1.0 or later

```powershell
squad --version
```

Package metadata: https://registry.npmjs.org/@bradygaster/squad-cli/latest

All OSes, after Node.js is installed:

```powershell
npm install -g @bradygaster/squad-cli
npm install -g @bradygaster/squad-cli@latest  # upgrade
```

### 8. PowerShell 7 + Windows execution policy

```powershell
pwsh --version
```

Download: https://github.com/PowerShell/PowerShell/releases/latest

- **Windows:** `winget install Microsoft.PowerShell`
- **macOS:** `brew install powershell`
- **Linux:** install the `powershell` package from Microsoft's feed.

Windows-only execution policy fix:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

---

## Verify all tools in one pass

From the repo root:

```powershell
pwsh ./scripts/Verify-Prerequisites.ps1
```

All lines should show `PASS` and the summary should show `0 failed`. Fix any that don't before opening any module.

---

## Troubleshooting install problems

See [troubleshooting.md](troubleshooting.md) for known failure patterns, exact error text, and fixes.
