# Akephalos Agent Integrations

Akephalos is a local, markdown-first identity and memory passport. Agents should treat the `.akephalos` folder as durable user and project context, not as a scratchpad.

## Bootstrap Prompt

> Before starting work, read the local Akephalos bundle and treat it as durable user/project context. Do not store secrets. Append durable memories through Akephalos rather than rewriting user files directly.

## Generic Agent Instructions

At the start of work, inspect the local bundle:

```sh
akephalos status
akephalos print identity
akephalos print rules
akephalos print tools
akephalos print projects
akephalos print memories
```

Use this context to understand stable identity, project preferences, standing rules, known tools, and durable memories.

When new durable context should be preserved, append it:

```sh
akephalos add-memory "User prefers small, dependency-light CLI changes."
```

Do not store secrets, credentials, tokens, passwords, API keys, or private keys. Do not rewrite `.akephalos/memories.jsonl` directly. Use `akephalos compact` only when a readable summary in `akephalos.md` is useful.

## Codex Usage

For Codex, add the bootstrap prompt to the repository or task instructions. At the beginning of a task, run the read-only commands first:

```sh
akephalos status
akephalos print identity
akephalos print rules
akephalos print projects
akephalos print memories
```

Codex should use `akephalos add-memory` for stable preferences or project facts that should survive across sessions. Keep memories short, factual, and non-secret.

Before handoff or export, use:

```sh
akephalos compact
akephalos export
```

## Claude Code Usage

For Claude Code, put the bootstrap prompt in the project instructions or session prompt. Ask Claude Code to read the bundle before editing files:

```sh
akephalos status
akephalos print identity
akephalos print rules
akephalos print tools
akephalos print projects
akephalos print memories
```

Claude Code should append durable memories through:

```sh
akephalos add-memory "Durable project fact or user preference."
```

Avoid using Akephalos for transient task notes. Keep normal code changes in the repository and durable cross-session context in Akephalos.

## OpenClaw/Hermes Usage

For OpenClaw or Hermes-style agents, include the bootstrap prompt in the agent system or startup instructions.

For a dedicated Hermes test flow, see [integrations/hermes.md](integrations/hermes.md).

Recommended startup flow:

```sh
akephalos status
akephalos print identity
akephalos print rules
akephalos print tools
akephalos print projects
akephalos print memories
```

Recommended memory write flow:

```sh
akephalos add-memory "Stable fact to retain for future agent sessions."
```

Recommended harness import flow:

```sh
akephalos import-harness "OpenClaw/Hermes" --tool "terminal" --preference "Stable preference"
```

Hermes-specific manual import example:

```sh
akephalos import-harness "Hermes" --tool "terminal" --tool "git" --preference "Keep changes small, auditable, and reversible"
akephalos harness mark "Hermes" --status configured
```

Agents should not scan outside `.akephalos` for passport context unless the user asks. They should not mutate markdown passport files directly when the intended operation is adding durable memory.

## Pi IDE Usage

Clone the shared private passport repository as `.akephalos`, then import Pi IDE's non-secret tools and preferences:

```sh
git clone <private-passport-repo-url> .akephalos
akephalos status
akephalos import-harness "Pi IDE" --tool "terminal" --tool "git" --preference "Prefer small diffs"
akephalos compact
git -C .akephalos add .
git -C .akephalos commit -m "Add Pi IDE harness context"
git -C .akephalos push
```

After that, Codex and Cursor can pull the private repo and see Pi IDE's imported context:

```sh
akephalos sync --pull-only
akephalos print tools
akephalos print memories
```

For v0.1, use the public GitHub repo or a local clone:

```sh
git clone https://github.com/sunnja69/akephalos.git
cd akephalos
npm ci
npm run build
node dist/index.js --help
```

Run the weekly digest manually or from a scheduler:

```sh
akephalos pulse
```

The pulse command is intentionally read-only and low-token. It prints the top recent memories, linked harnesses, and suggestions for context that may need adding, tweaking, or removing.

## Multi-Machine Sync

Use a private Git repository as the shared source of truth for a personal passport:

```sh
akephalos sync
```

The sync command commits local `.akephalos` changes, pulls remote changes with rebase/autostash, then pushes back to origin. It only runs fixed Git operations inside `.akephalos`.

Recommended 15-minute interval command:

```sh
akephalos sync
```

For read-only refresh:

```sh
akephalos sync --pull-only
```

End-to-end pattern:

1. Codex/Cursor machine syncs local passport changes.
2. Pi IDE machine runs `akephalos sync --pull-only` or `akephalos sync`.
3. Pi IDE imports its context with `akephalos import-harness "Pi IDE" ...`.
4. Pi IDE runs `akephalos sync`.
5. Codex/Cursor machine runs `akephalos sync --pull-only` or scheduled `akephalos sync`.
6. All linked harnesses can read the updated `.akephalos` bundle.

## MCP Usage

Akephalos can run as a local MCP stdio server:

```sh
akephalos mcp
```

For copyable client config examples, source-checkout paths, Windows path notes, and a smoke-test checklist, see [mcp-client-setup.md](mcp-client-setup.md).

MCP resources:

- `akephalos://identity`
- `akephalos://rules`
- `akephalos://projects`
- `akephalos://tools`
- `akephalos://memories`

MCP tools:

- `get_status`
- `add_memory`

The MCP server only exposes fixed resources from the local `.akephalos` folder. It does not provide arbitrary file reads or shell execution. The MCP `add_memory` tool only appends to `memories.jsonl`.
