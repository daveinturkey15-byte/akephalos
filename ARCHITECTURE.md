# Akephalos MVP Architecture

## Architecture summary

Akephalos v0.1 is a local-first file bundle plus a tiny TypeScript CLI.

```txt
User / Agent
   |
   | CLI commands or MCP calls
   v
Akephalos CLI / MCP adapter
   |
   v
.akephalos local bundle
```

## Folder layout

```txt
.akephalos/
  manifest.json          # machine-readable index
  akephalos.md           # main human-readable profile
  memories.jsonl         # append-only memory ledger
  events.jsonl           # append-only event ledger
  rules.md               # durable user/agent rules
  tools.md               # preferred tools and integration notes
  projects.md            # active projects and context
  harnesses.json         # structured registry of linked agents/harnesses
  exports/               # exported bundles
```

## File roles

### manifest.json

Machine-readable index used by agents and the CLI.

```json
{
  "version": "0.1.0",
  "profile_name": "default",
  "entrypoint": "akephalos.md",
  "files": {
    "rules": "rules.md",
    "tools": "tools.md",
    "projects": "projects.md",
    "memories": "memories.jsonl",
    "events": "events.jsonl"
  },
  "created_at": "2026-05-12T00:00:00.000Z",
  "updated_at": "2026-05-12T00:00:00.000Z"
}
```

### akephalos.md

The main readable bootstrap profile. This is what a human can open in Notepad, VS Code, Obsidian, or any markdown editor.

### memories.jsonl

Append-only memory log. Agents should append to this file rather than constantly rewriting the main markdown profile.

Example:

```jsonl
{"time":"2026-05-12T13:30:00.000Z","source":"cli","type":"memory.add","text":"User prefers lightweight open-source tools."}
```

### events.jsonl

Append-only operational log for imports, exports, compactions, MCP starts, and future sync events.

### harnesses.json

A lightweight JSON registry for linked agents and coding harnesses.

Example:

```json
[
  {
    "name": "Codex",
    "status": "known-working",
    "mcp": false,
    "sync": true,
    "last_checked": "2026-05-13T00:00:00.000Z",
    "source": "auto",
    "notes": []
  }
]
```

Valid statuses are `unknown`, `detected`, `configured`, `known-working`, `broken`, and `unsupported`.

## CLI commands

```bash
akephalos init
akephalos status
akephalos add-memory "..."
akephalos print identity
akephalos print memories
akephalos compact
akephalos export
akephalos harness list
akephalos harness add "Hermes"
akephalos harness mark "Hermes" --status configured
akephalos harness check
akephalos mcp
```

## MCP MVP

Expose a minimal MCP server with:

### Resources

- `akephalos://identity`
- `akephalos://rules`
- `akephalos://projects`
- `akephalos://tools`
- `akephalos://memories`

### Tools

- `add_memory(text, source?)`
- `get_status()`
- `compact_profile()`

## Security rules

1. Never store raw API keys or passwords.
2. Do not execute arbitrary shell commands from memory files.
3. Treat imported files as untrusted text.
4. MCP tools should be read-mostly in v0.1.
5. Writes should only append to ledgers unless the user explicitly compacts.
