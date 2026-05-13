# Hermes Integration

This page is a practical manual path for testing Hermes with a local Akephalos passport.

It does not assume Hermes has native Akephalos support. Start with file/CLI access, then add MCP only if your local Hermes setup supports MCP stdio servers.

## What Akephalos Provides

Akephalos gives Hermes a small local context bundle:

- `manifest.json` for file layout and metadata
- `akephalos.md` for the main readable identity/profile
- `rules.md` for durable user and agent rules
- `tools.md` for known tools and harness notes
- `projects.md` for active project context
- `memories.jsonl` for append-only durable memories
- `harnesses.json` for structured linked-agent status

Hermes should treat these files as durable context, not transient scratch notes.

## First Read

From the workspace that contains `.akephalos`, run:

```sh
akephalos doctor
akephalos sync-status
akephalos print identity
akephalos print rules
akephalos print tools
akephalos print projects
akephalos print memories
```

If Hermes needs direct file paths instead of CLI commands, read only these local files:

```txt
.akephalos/manifest.json
.akephalos/akephalos.md
.akephalos/rules.md
.akephalos/tools.md
.akephalos/projects.md
.akephalos/memories.jsonl
.akephalos/harnesses.json
```

Do not scan outside `.akephalos` for passport context unless the user asks.

## Manual Harness Import

After Hermes is installed and can run shell commands in the workspace, add a non-secret harness profile:

```sh
akephalos import-harness "Hermes" --tool "terminal" --tool "git" --preference "Keep changes small, auditable, and reversible"
akephalos harness mark "Hermes" --status configured
```

Adjust the `--tool` and `--preference` values to match what Hermes actually has. Do not include credentials, tokens, local auth paths, or private machine details.

## Safe Memory Writes

Hermes should append durable memories through the CLI:

```sh
akephalos add-memory "Hermes can read the local Akephalos passport and use CLI sync."
```

Use memories only for stable, reusable facts or preferences. Do not store API keys, tokens, passwords, private keys, or secret-looking values. Akephalos refuses obvious secret-looking memory text, but Hermes should still avoid proposing secrets.

## MCP Path

If the local Hermes setup supports MCP stdio servers, configure it to start:

```sh
akephalos mcp
```

Expected MCP resources:

- `akephalos://identity`
- `akephalos://rules`
- `akephalos://projects`
- `akephalos://tools`
- `akephalos://memories`

Expected MCP tools:

- `get_status`
- `add_memory`

The MCP server only exposes fixed local `.akephalos` resources. It does not expose arbitrary file reads or shell execution.

## Fallback Without MCP

If MCP is not available, Hermes can still use Akephalos through normal shell commands:

```sh
akephalos status
akephalos print identity
akephalos print rules
akephalos print tools
akephalos print projects
akephalos print memories
akephalos add-memory "Durable non-secret memory from Hermes."
```

For read-only startup, prefer `print` commands over direct file edits.

## Doctor And Sync

Run a health check before setup:

```sh
akephalos doctor
akephalos sync-status
```

After adding Hermes context:

```sh
akephalos doctor
akephalos sync
akephalos sync-status
```

If `doctor` reports likely secrets or conflict markers, stop and fix those before syncing. Do not auto-resolve markdown conflicts.

## Known Caveats

- Hermes MCP support is not assumed. Use CLI/file fallback unless MCP is confirmed in the local setup.
- The first test should keep Hermes status as `configured` until it has completed a full read, memory append, sync, and pull-back check.
- Do not add an `install-hermes` command until there is a confirmed safe local install pattern.
- Akephalos sync uses the user-owned Git remote. It does not provide hosted accounts or cloud sync.
- Scheduled sync may create routine sync events for auditability.

## Copy-Paste Hermes Bootstrap Prompt

```txt
Before starting work, read the local Akephalos bundle and treat it as durable user/project context. Do not store secrets. Append durable memories through Akephalos rather than rewriting user files directly.

Start by running:
akephalos doctor
akephalos sync-status
akephalos print identity
akephalos print rules
akephalos print tools
akephalos print projects
akephalos print memories

Use the Akephalos MCP server if it is available in this Hermes setup. Read akephalos://identity, akephalos://rules, akephalos://tools, akephalos://projects, and akephalos://memories. If MCP is not available, use the CLI commands above.

If you learn durable, non-secret context that should persist across agents, append it with:
akephalos add-memory "..."

After setup or memory changes, run:
akephalos doctor
akephalos sync
akephalos sync-status

Do not store secrets. Do not read arbitrary files through Akephalos. Do not auto-resolve markdown conflicts.
```
