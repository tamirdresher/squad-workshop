# PM Track — Drive the Product, Let Agents Write Code

← Back to [Workshop Index](../README.md)

This track is for PMs, PGMs, docs leads, managers, and product-minded engineers who want to understand Squad without hand-writing the app.

## What you will do

- Define the product goal and acceptance criteria.
- Ask the Lead to explain tradeoffs in product language.
- Let Backend, Frontend, and Tester write the implementation.
- Review behavior in the running app.
- Inspect `.squad/decisions.md` to see whether the team captured useful context.

## Recommended path

| Path | Modules | Time | Outcome |
|---|---|---:|---|
| PM quick path | Module 0 + Module 1 | 2–2.5h | Build and review the MVP. |
| PM full path | Module 0 + Module 1 + Module 2 artifact review | ~3h | See whether memory compounds. |
| Advanced demo | Module 3 | facilitator-led | Observe Ralph autonomous mode without owning setup risk. |

## Copy/paste PM prompts

Use these inside `copilot --agent squad`.

```text
Act as my product team. Build the smallest useful Reading List MVP. Explain every technical tradeoff in product language before committing to it.
```

```text
Before coding, write acceptance criteria from the user's point of view and ask me to approve them.
```

```text
After coding, summarize what changed as user-facing behavior, not implementation details. Tell me how to verify it manually.
```

```text
Tester, create acceptance tests from the user's point of view. Lead, tell me which risks remain.
```

```text
Lead, explain the architecture decision in plain English: what did we choose, why, what did we reject, and what product risk does it create?
```

## How to review without reading code

1. Run the app using the commands the team gives you.
2. Add a book.
3. Mark it read/unread.
4. Refresh the page and verify the data persists.
5. Compare behavior to the acceptance criteria.
6. Read `.squad/decisions.md` and ask: would this help a future teammate understand why we built it this way?

If the team writes code but you feel lost, stop it and ask for a product-language recap before continuing.
