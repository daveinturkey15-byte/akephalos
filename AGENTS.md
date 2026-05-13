# AGENTS.md — Coding Agent Instructions

You are working on Akephalos, a tiny open-source, markdown-first identity and memory passport for AI agents.

## Non-negotiable project principles

1. Keep it lightweight.
2. Keep it local-first.
3. Keep it markdown-first.
4. Do not add a database in the MVP.
5. Do not add a web dashboard in the MVP.
6. Do not add hosted accounts, OAuth, blockchain, or cloud services in the MVP.
7. Never store raw secrets.
8. Prefer boring, readable TypeScript over clever abstractions.
9. Each feature should be easy for a solo developer to understand.
10. The MVP should work cross-platform on Windows, macOS, and Linux.

## Technical preferences

- TypeScript
- Node.js CLI
- Minimal dependencies
- JSONL for append-only logs
- Markdown for human-readable state
- MCP support through the official TypeScript SDK when implemented

## Working style

Before coding:

1. Read README.md, PROJECT_BRIEF.md, ARCHITECTURE.md, and MILESTONES.md.
2. Identify the current milestone.
3. Make the smallest useful implementation.
4. Add or update tests where sensible.
5. Update docs if behaviour changes.

## Akephalos bootstrap

Before starting work, read the local Akephalos bundle and treat it as durable user/project context:

1. Run `akephalos sync --pull-only` if `.akephalos` is connected to the shared private repo.
2. Read `.akephalos/akephalos.md`, `.akephalos/rules.md`, `.akephalos/tools.md`, and `.akephalos/projects.md`.
3. Use `akephalos add-memory "..."` for durable non-secret memories.
4. Use `akephalos sync` after updating durable context.

Do not store secrets in Akephalos.

## Avoid

- big frameworks
- unnecessary build tools
- complex memory ranking
- vector search
- database migrations
- remote execution
- storing secrets
- destructive rewrites of user files

## Quality bar

The code should be simple enough that a new contributor can understand the core in one sitting.
