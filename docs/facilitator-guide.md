# Facilitator Guide — Squad Workshop

← Back to [Workshop Index](../README.md)

Use this when running the workshop for a mixed PM/engineering audience.

Open the [companion slide deck](../presentations/squad-workshop.html) in a browser. It follows Orientation and Modules 1–4; the module documents remain the step-by-step instructions.

## Pre-session checklist

- GitHub Copilot CLI installed: `copilot --version`.
- GitHub CLI authenticated: `gh auth login -s project`; verify with `gh auth status`.
- Node.js 22.5+, .NET SDK 10+, Squad CLI 1.1.0+ (`npm install -g @bradygaster/squad-cli`).
- One known-good facilitator machine with every tool installed.
- Backup `reading-list-squad-lab` repo or branch for demo continuity.
- Repo creation plan: personal/private, org-created, or facilitator-created.
- Pairing plan for PMs who do not want to drive terminal commands alone.

## Suggested timing

| Segment | Time |
|---|---:|
| Setup/identity | 15 min |
| Squad mental model | 15 min |
| Module 1 build | 75–100 min |
| PM/engineering debrief | 30 min |
| Optional Module 2 artifact inspection | 20–30 min |

## Facilitation rules

- Do not spend the workshop debugging Docker unless Module 3 is explicitly on the agenda.
- If an install fails, let the participant observe and drive prompts on a working facilitator machine.
- Keep Module 3 execution modes as demos unless branch protection and review expectations are clear.
- If you demo v0.11 scaling features, stay on the verified path: `squad preset ...`, `squad discover`, `squad delegate`, and worktree-local/main-checkout patterns. Do not promise an undocumented `sub-squad` command.
- If you demo `--monitor-teams` / `--monitor-email`, preconfigure a Teams/email MCP bridge ahead of time or skip that slice entirely.
- Make PMs approve acceptance criteria before agents write code.
- Pause after every major agent response and ask: "What would you review if this were a real team?"

## Accessibility glossary

| Term | Plain-English explanation |
|---|---|
| Repo | The project folder and its GitHub copy. |
| Commit | A saved checkpoint. |
| PR | A proposed change ready for review. |
| API | The backend contract the UI calls. |
| Test | A repeatable check that behavior still works. |
| Decision | A recorded tradeoff and rationale. |
| Agent | An AI team member with a role. |

## Failure handling

- `copilot` missing: install GitHub Copilot CLI (`npm install -g @github/copilot`) and restart the terminal.
- GitHub auth wrong account: run `gh auth status`, then `gh auth login -s project`.
- Repo creation denied: switch to personal/private or facilitator-created repo.
- Agents drift into implementation jargon: ask the Lead for a product-language recap.
