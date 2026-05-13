# Akephalos MVP Milestones

## Milestone 0 — Repo skeleton

Goal: create a clean TypeScript CLI project.

Deliverables:

- package.json
- tsconfig.json
- src/index.ts
- README.md
- basic test setup
- CLI binary called `akephalos`

Done when:

- `npm install` works
- `npm run build` works
- `node dist/index.js --help` works

---

## Milestone 1 — Local bundle init

Goal: create the `.akephalos` folder and starter files.

Deliverables:

- `akephalos init`
- manifest generation
- starter `akephalos.md`
- starter `rules.md`, `tools.md`, `projects.md`
- empty `memories.jsonl` and `events.jsonl`

Done when:

- running `akephalos init` creates a valid bundle
- running it twice does not destroy existing data

---

## Milestone 2 — Status and print commands

Goal: inspect the bundle from the CLI.

Deliverables:

- `akephalos status`
- `akephalos print identity`
- `akephalos print rules`
- `akephalos print tools`
- `akephalos print projects`
- `akephalos print memories`

Done when:

- commands handle missing files gracefully
- output is readable and useful

---

## Milestone 3 — Append-only memory ledger

Goal: safely add memories without rewriting the main profile.

Deliverables:

- `akephalos add-memory "text"`
- JSONL append helper
- event logging
- tests for valid JSONL writes

Done when:

- every new memory is appended as one JSON object per line
- no raw secrets are accepted without warning

---

## Milestone 4 — Compaction

Goal: compile memory ledger into a clean markdown summary.

Deliverables:

- `akephalos compact`
- generates/updates a memory section in `akephalos.md`
- keeps raw ledger untouched
- event log records compaction

Done when:

- `akephalos.md` becomes a useful bootstrap profile
- compaction is deterministic and does not delete history

---

## Milestone 5 — Export

Goal: make the bundle portable.

Deliverables:

- `akephalos export`
- creates timestamped export under `.akephalos/exports/`
- optionally creates a zip/tar file if easy

Done when:

- user can copy/export a complete profile bundle

---

## Milestone 6 — MCP server

Goal: expose the Akephalos bundle to agents through MCP.

Deliverables:

- `akephalos mcp`
- MCP resources for identity, rules, projects, tools, memories
- MCP tools for get_status and add_memory
- no network server required initially; stdio is enough

Done when:

- an MCP client can read the user's profile resources
- an MCP client can append a memory

---

## Milestone 7 — Hardening and docs

Goal: make the MVP pleasant and safe enough to share.

Deliverables:

- better error messages
- README examples
- AGENTS.md for coding agents
- security notes
- sample profile
- simple release checklist

Done when:

- another developer can clone, run, and understand the project in under 10 minutes
