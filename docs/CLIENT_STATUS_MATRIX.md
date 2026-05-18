# Client Status Matrix

Akephalos v0.1 is an early, local-first MVP. This page keeps adopter claims narrow while pointing contributors at the next useful compatibility report.

Status words used here:

- `known-working`: the exact path was tested with disposable `.akephalos` data and a public-safe report exists.
- `configured`: a conservative config or recipe exists, but a real client report is still needed.
- `unverified`: there is an issue or recipe, but no public report yet.
- `not tested`: no useful evidence yet.

Do not upgrade a status without a report that includes OS, shell, Node version, Akephalos commit, commands/config shape, sanitized output, and whether `scan` stayed clean.

| Client / path | Current status | Evidence | Best next contribution |
| --- | --- | --- | --- |
| Linux / WSL source checkout CLI | `known-working` for one WSL environment | [WSL source-checkout report](../examples/compatibility-reports/linux-wsl-source-checkout-2026-05-18.md) | Add an independent Linux or second WSL report in [issue #2](https://github.com/sunnja69/akephalos/issues/2). |
| MCP stdio via SDK client on WSL | `known-working` for SDK-client smoke basics | [WSL MCP stdio report](../examples/compatibility-reports/linux-wsl-mcp-stdio-2026-05-18.md) | Add a real UI-client report for Cursor, Claude Desktop, Cline/Roo Code, or opencode. |
| Hermes-hosted WSL agent harness | `known-working` only for local CLI/file harness smoke path | [Hermes-hosted WSL harness report](../examples/compatibility-reports/hermes-wsl-agent-harness-2026-05-18.md) | Add a fuller Hermes workflow report in [issue #4](https://github.com/sunnja69/akephalos/issues/4) if you test actual read-before-task / append-after-task behavior. |
| Windows PowerShell | `configured` | [Windows PowerShell smoke-test recipe](WINDOWS_POWERSHELL_SMOKE_TEST.md) | Run it on Windows and post a sanitized report in [issue #9](https://github.com/sunnja69/akephalos/issues/9). |
| macOS Terminal | `configured` | [macOS source-checkout recipe](PLATFORM_AGENT_SMOKE_RECIPES.md#macos-terminal-source-checkout-smoke-test) | Run it on real macOS and report in [issue #1](https://github.com/sunnja69/akephalos/issues/1). |
| Claude Code local-file workflow | `configured` | [Agent Prompt Packs](AGENT_PROMPT_PACKS.md) and [local-file recipe](PLATFORM_AGENT_SMOKE_RECIPES.md#claude-code-or-codex-cli-local-file-smoke-test) | Test with Claude Code and report in [issue #3](https://github.com/sunnja69/akephalos/issues/3). |
| Codex CLI local-file workflow | `configured` | [Agent Prompt Packs](AGENT_PROMPT_PACKS.md) and [local-file recipe](PLATFORM_AGENT_SMOKE_RECIPES.md#claude-code-or-codex-cli-local-file-smoke-test) | Test from a real Codex CLI environment and report in [issue #14](https://github.com/sunnja69/akephalos/issues/14). |
| Cursor MCP client | `configured` | [MCP Client Config Snippets](MCP_CLIENT_SNIPPETS.md#cursor--vs-code-mcp-style) and [VS Code MCP Client Notes](VS_CODE_MCP_CLIENT_NOTES.md) | Test Cursor against `node dist/index.js mcp` and report in [issue #13](https://github.com/sunnja69/akephalos/issues/13). |
| Claude Desktop MCP client | `configured` | [MCP Client Config Snippets](MCP_CLIENT_SNIPPETS.md#claude-desktop-style) | Test Claude Desktop against `node dist/index.js mcp` and report in [issue #15](https://github.com/sunnja69/akephalos/issues/15). |
| Cline / Roo Code MCP clients | `configured` | [MCP Client Config Snippets](MCP_CLIENT_SNIPPETS.md#cursor--vs-code-mcp-style) and [VS Code MCP Client Notes](VS_CODE_MCP_CLIENT_NOTES.md) | Test one VS Code client and report in [issue #16](https://github.com/sunnja69/akephalos/issues/16). |
| opencode MCP client | `configured` | [MCP Client Config Snippets](MCP_CLIENT_SNIPPETS.md#opencode-style) and [opencode MCP Client Notes](OPENCODE_MCP_CLIENT_NOTES.md) | Test opencode and report in [issue #17](https://github.com/sunnja69/akephalos/issues/17). |
| OpenClaw local harness | `configured` | [OpenClaw/Hermes-style harness recipe](PLATFORM_AGENT_SMOKE_RECIPES.md#openclaw-or-hermes-style-harness-smoke-test) and [Agent Harness Smoke Test](AGENT_HARNESS_SMOKE_TEST.md) | Test in OpenClaw and report in [issue #5](https://github.com/sunnja69/akephalos/issues/5). |

## Report before claiming support

A useful report is better than a broad support claim. Use only disposable/fictional `.akephalos` data, redact local paths/usernames/hostnames, and keep the language to Akephalos v0.1 / early MVP.

Akephalos does not provide hosted cloud sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, npm-package availability, or production maturity.
