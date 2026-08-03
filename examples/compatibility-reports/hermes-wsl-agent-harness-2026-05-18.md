# Hermes-Hosted WSL Agent Harness Smoke Test — 2026-05-18

This is a public-safe compatibility report for the Akephalos v0.1 source-checkout path from a Hermes-hosted WSL cron environment using a disposable passport.

It is intentionally narrow: this report verifies local file/CLI interaction from the harness environment. It does **not** claim full Hermes product integration, OpenClaw integration, external MCP UI-client support, hosted sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, npm availability, or production maturity.

## Environment

- OS: Linux under WSL2
- Shell: Bash
- Node: `v22.22.2`
- Install method: existing public source checkout from `https://github.com/sunnja69/akephalos.git`, branch `docs/contributor-conversion-20260518-1035`
- Agent/harness context: Hermes Agent scheduled cron job running shell commands in WSL
- MCP client tested: not in this report; see the separate WSL MCP stdio report for SDK-level MCP coverage
- Data used: fictional demo memory and a disposable `.akephalos` bundle under a temporary directory

Private hostnames, usernames, and machine-specific paths are intentionally omitted.

## Commands run

```sh
mkdir akephalos-hermes-harness-smoke
cd akephalos-hermes-harness-smoke
node /path/to/akephalos/dist/index.js init
node /path/to/akephalos/dist/index.js add-memory \
  "Demo user wants agent context to stay local, inspectable, and easy to carry between tools."
node /path/to/akephalos/dist/index.js import-harness "Hermes cron smoke test" \
  --tool "terminal" \
  --tool "git" \
  --preference "Use fictional memories and redact private paths in public reports."
node /path/to/akephalos/dist/index.js harness list
node /path/to/akephalos/dist/index.js harness check
node /path/to/akephalos/dist/index.js status
node /path/to/akephalos/dist/index.js scan
node /path/to/akephalos/dist/index.js print identity
node /path/to/akephalos/dist/index.js print tools
node /path/to/akephalos/dist/index.js print memories
node -v
```

## Result

- `init`: created the expected `.akephalos` bundle files.
- `add-memory`: appended a fictional demo memory.
- `import-harness`: imported a fictional `Hermes cron smoke test` harness profile and compacted memories into `akephalos.md`.
- `harness list`: showed the harness as `status=configured`, `mcp=no`, `sync=yes`, `source=manual`.
- `harness check`: completed and preserved the configured harness record.
- `status`: found the bundle and reported 2 memories.
- `scan`: scanned 8 files with `info: 0`, `warn: 0`, `fail: 0`.
- `print identity`, `print tools`, and `print memories`: printed only the fictional demo content and generated harness notes.
- Privacy scan of captured `print` output found no private path, Dave account string, private-key marker, token assignment, or API-key assignment.

## Status

Result for this exact path: `configured` / smoke test passed.

This is useful evidence that a Hermes-hosted coding-agent environment can create, read, and update a disposable local `.akephalos` passport through normal files and the Akephalos CLI. It should not be upgraded to a broad `known-working` Hermes/OpenClaw compatibility claim until a maintainer or user verifies the intended full harness workflow, including any sync or MCP client path they actually use.

## Follow-up

Good next reports:

- Hermes/OpenClaw reading an existing user-created disposable `.akephalos` bundle before a task and appending a fictional memory after the task.
- OpenClaw-specific source-checkout smoke test.
- Claude Code, Codex, Cursor, Claude Desktop, Cline/Roo, or opencode reports using the same privacy rules.
