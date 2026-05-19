# Quickstart terminal transcript

This is a small, copyable source-checkout transcript for Akephalos v0.1. It is meant to help new users see the shape of a first local `.akephalos` passport without installing a hosted service or creating an account.

Environment used for this transcript:

- OS: Linux/WSL-style shell
- Runtime: Node.js source checkout
- Scope: local files only; no cloud sync, dashboard, OAuth, vector database, blockchain, or production-service claim

## Build from source

```sh
git clone https://github.com/sunnja69/akephalos.git
cd akephalos
npm ci
npm run build
```

## Create a local passport

```sh
node dist/index.js init
```

Example output:

```txt
Created .akephalos bundle.
Created: manifest.json, akephalos.md, rules.md, tools.md, projects.md, harnesses.json, memories.jsonl, events.jsonl
```

## Check status

```sh
node dist/index.js status
```

Example output:

```txt
Akephalos status

Bundle: found at <workspace>/.akephalos
Manifest version: 1
Files:
  [ok] manifest.json
  [ok] akephalos.md
  [ok] rules.md
  [ok] tools.md
  [ok] projects.md
  [ok] harnesses.json
  [ok] memories.jsonl
  [ok] events.jsonl
  [ok] exports/
Memory count: 0
```

## Add a non-secret durable memory

```sh
node dist/index.js add-memory "User prefers local-first markdown memory."
```

Example output:

```txt
Memory added.
```

Read the memory ledger back through the CLI:

```sh
node dist/index.js print memories
```

Example output:

```txt
1. User prefers local-first markdown memory. | time: <timestamp>
```

## Review the local pulse

```sh
node dist/index.js pulse
```

Example output:

```txt
Akephalos pulse

Bundle: <workspace>/.akephalos
Manifest version: 1
Memory count: 1
Imported harnesses: none

Top 1 recent memories:
1. User prefers local-first markdown memory. | time: <timestamp>

Review suggestions:
- Run `akephalos compact` so the master identity file has a readable memory summary.
- Run `akephalos import-harness` for each linked agent or IDE.
```

## What to share in a compatibility report

If you are testing Akephalos on a new OS or agent harness, a useful report includes:

- OS and shell
- Node.js version
- source checkout commit, if known
- commands run (`npm ci`, `npm run build`, `npm test`, and the smoke commands above)
- sanitized output or errors
- whether any `.akephalos` files contained real personal data or only disposable test data

Keep reports narrow. For example, "worked in one WSL checkout" is helpful; it is not the same as claiming every Linux distribution or every MCP client is fully supported.
