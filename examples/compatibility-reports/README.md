# Compatibility Report Examples

These examples show the shape of public-safe Akephalos v0.1 field reports.

A useful report is narrow and factual: one OS, shell, agent, MCP client, or source-checkout path; disposable `.akephalos` data only; exact commands/results; no private paths, tokens, hostnames, usernames, auth config, or real memories.

## Current examples

| Report | Scope | Status |
| --- | --- | --- |
| [WSL source checkout smoke test](linux-wsl-source-checkout-2026-05-18.md) | Linux under WSL2, Bash, source checkout, CLI quickstart | CLI path passed; external MCP client not tested |
| [WSL MCP stdio smoke test](linux-wsl-mcp-stdio-2026-05-18.md) | Linux under WSL2, SDK stdio client, MCP resources/tools | MCP stdio basics passed; external UI clients not tested |
| [Hermes-hosted WSL agent harness smoke test](hermes-wsl-agent-harness-2026-05-18.md) | Hermes Agent cron environment, WSL, local CLI/file harness path | Harness environment could create/read/update a disposable passport; not full Hermes/OpenClaw integration |

## Add another report

Good next reports, also summarized in the [Client Status Matrix](../../docs/CLIENT_STATUS_MATRIX.md):

- Windows PowerShell source checkout.
- macOS Terminal source checkout, using the [macOS recipe](../../docs/PLATFORM_AGENT_SMOKE_RECIPES.md#macos-terminal-source-checkout-smoke-test).
- Claude Code or Codex CLI reading a disposable `.akephalos` folder, using the [local-file agent recipe](../../docs/PLATFORM_AGENT_SMOKE_RECIPES.md#claude-code-or-codex-cli-local-file-smoke-test) or [Agent Prompt Packs](../../docs/AGENT_PROMPT_PACKS.md).
- Cursor, Claude Desktop, Cline/Roo Code, or opencode using `node dist/index.js mcp` as a local stdio MCP server.
- Hermes/OpenClaw reading the markdown bundle and appending a fictional memory. Start with the [Agent Harness Smoke Test](../../docs/AGENT_HARNESS_SMOKE_TEST.md) or the shorter [OpenClaw/Hermes-style recipe](../../docs/PLATFORM_AGENT_SMOKE_RECIPES.md#openclaw-or-hermes-style-harness-smoke-test) if you want a narrow, public-safe recipe.

Use [Compatibility Reports](../../docs/COMPATIBILITY_REPORTS.md) for the copy-paste report template and issue links. Mark results conservatively: use `known-working` only after the exact read/append/sync path was verified with disposable data.

Do not use these reports to imply hosted sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, npm availability, or production maturity.
