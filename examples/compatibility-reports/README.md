# Compatibility Report Examples

These examples show the shape of public-safe Akephalos v0.1 field reports.

A useful report is narrow and factual: one OS, shell, agent, MCP client, or source-checkout path; disposable `.akephalos` data only; exact commands/results; no private paths, tokens, hostnames, usernames, auth config, or real memories.

## Current examples

| Report | Scope | Status |
| --- | --- | --- |
| [WSL source checkout smoke test](linux-wsl-source-checkout-2026-05-18.md) | Linux under WSL2, Bash, source checkout, CLI quickstart | CLI path passed; external MCP client not tested |

## Add another report

Good next reports:

- Windows PowerShell source checkout.
- macOS Terminal source checkout.
- Claude Code reading a disposable `.akephalos` folder.
- Cursor, Claude Desktop, Cline/Roo Code, or opencode using `node dist/index.js mcp` as a local stdio MCP server.
- Hermes/OpenClaw reading the markdown bundle and appending a fictional memory.

Use [Compatibility Reports](../../docs/COMPATIBILITY_REPORTS.md) for the copy-paste report template and issue links. Mark results conservatively: use `known-working` only after the exact read/append/sync path was verified with disposable data.

Do not use these reports to imply hosted sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, npm availability, or production maturity.
