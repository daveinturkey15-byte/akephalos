# Contributor Task Picker

Akephalos v0.1 is an early, local-first MVP. The most useful contributions are small field reports and docs/tests that make the source-checkout flow safer for the next person.

Use fictional or disposable passport data only. Do not paste real memories, tokens, auth paths, private repositories, or machine-specific secrets.

## If you have 5 minutes

1. Clone and build from source:

   ```sh
   git clone https://github.com/sunnja69/akephalos.git
   cd akephalos
   npm ci
   npm test
   ```

2. Run the disposable quickstart in [Try Akephalos in 5 Minutes](TRY_IN_5_MINUTES.md).
3. If the source-checkout build or command path fails before you can test anything else, use [Source-Checkout Troubleshooting](SOURCE_CHECKOUT_TROUBLESHOOTING.md) to file a narrow, sanitized failure report instead of guessing at a fix.
4. If you are unsure what the early MVP can safely claim, skim the [Adopter FAQ](ADOPTER_FAQ.md).
5. Open a compatibility report with your OS, shell, Node version, and sanitized command output. The [Compatibility Reports](COMPATIBILITY_REPORTS.md) page has a copy-pasteable template.

If the trial gives you a tiny fix or report worth submitting, use the [First PR Guide](FIRST_PR_GUIDE.md) before opening a pull request.

Best issue matches:

- [Test Akephalos on Windows from a fresh public clone](https://github.com/sunnja69/akephalos/issues/9) — start with the unverified [Windows PowerShell smoke-test recipe](WINDOWS_POWERSHELL_SMOKE_TEST.md).
- [Test Akephalos on macOS](https://github.com/sunnja69/akephalos/issues/1) — start with the [macOS recipe](PLATFORM_AGENT_SMOKE_RECIPES.md#macos-terminal-source-checkout-smoke-test).
- [Test Akephalos on Linux](https://github.com/sunnja69/akephalos/issues/2)

GitHub Actions catches obvious source-checkout regressions for maintainers, but it does not replace a real compatibility report from your own shell, terminal, agent, or MCP client. Platform reports should include the exact OS, shell, Node/npm versions, Akephalos commit, and sanitized command output.

## If you use an agent or MCP client

Try the local `.akephalos` bundle with one agent/client and report exactly what worked:

- Could the agent read the markdown files?
- Could it append a fictional memory with `add-memory`?
- Did MCP resources/tools appear if you configured `node dist/index.js mcp`?
- Did `scan` stay clean before sharing anything public?

Fastest open report paths right now:

1. Codex CLI local-file report: use [Codex CLI Compatibility Notes](CODEX_CLI_COMPATIBILITY_NOTES.md), then paste the skeleton into [issue #14](https://github.com/sunnja69/akephalos/issues/14).
2. Cline/Roo MCP report: use [Cline/Roo MCP Client Notes](CLINE_ROO_MCP_CLIENT_NOTES.md), then report in [issue #16](https://github.com/sunnja69/akephalos/issues/16).
3. opencode MCP report: use [opencode MCP Client Notes](OPENCODE_MCP_CLIENT_NOTES.md), then report in [issue #17](https://github.com/sunnja69/akephalos/issues/17).

One small verified report is better than a broad “works with everything” claim.

Best issue matches:

- [Improve MCP setup docs](https://github.com/sunnja69/akephalos/issues/6)
- [Test Akephalos with Claude Code](https://github.com/sunnja69/akephalos/issues/3) — start with the [Claude Code/Codex CLI local-file recipe](PLATFORM_AGENT_SMOKE_RECIPES.md#claude-code-or-codex-cli-local-file-smoke-test) or the copy-paste [Agent Prompt Packs](AGENT_PROMPT_PACKS.md).
- [Add a Codex CLI compatibility smoke report](https://github.com/sunnja69/akephalos/issues/14) — start with the [Codex CLI Compatibility Notes](CODEX_CLI_COMPATIBILITY_NOTES.md) or the [Claude Code/Codex CLI local-file recipe](PLATFORM_AGENT_SMOKE_RECIPES.md#claude-code-or-codex-cli-local-file-smoke-test).
- [Test Akephalos as a Cursor MCP server](https://github.com/sunnja69/akephalos/issues/13) — start with the [VS Code MCP Client Notes](VS_CODE_MCP_CLIENT_NOTES.md).
- [Add a Claude Desktop MCP compatibility smoke report](https://github.com/sunnja69/akephalos/issues/15)
- [Test Akephalos with Cline or Roo Code MCP clients](https://github.com/sunnja69/akephalos/issues/16) — start with the focused [Cline/Roo MCP Client Notes](CLINE_ROO_MCP_CLIENT_NOTES.md) or the broader [VS Code MCP Client Notes](VS_CODE_MCP_CLIENT_NOTES.md).
- [Add an opencode MCP compatibility smoke report](https://github.com/sunnja69/akephalos/issues/17) — start with the [opencode MCP Client Notes](OPENCODE_MCP_CLIENT_NOTES.md).
- [Test Akephalos with Hermes](https://github.com/sunnja69/akephalos/issues/4)
- [Test Akephalos with OpenClaw](https://github.com/sunnja69/akephalos/issues/5) — start with the [OpenClaw/Hermes-style harness recipe](PLATFORM_AGENT_SMOKE_RECIPES.md#openclaw-or-hermes-style-harness-smoke-test).

If your client is not listed, open a small compatibility report anyway. Name the exact client/version, use a disposable `.akephalos` passport, redact private paths, and mark the result as `unknown` or `configured` unless you verified resource reads and a fictional memory append. To avoid duplicating already-covered paths, check the [Client Status Matrix](CLIENT_STATUS_MATRIX.md) before choosing a report target.

Use [MCP Client Config Snippets](MCP_CLIENT_SNIPPETS.md) as a starting point for Claude Desktop, Cursor, Cline, Roo Code, opencode, or another stdio MCP client, then use the [MCP Client Smoke-Test Worksheet](MCP_CLIENT_SMOKE_WORKSHEET.md) to turn the trial into a sanitized compatibility report. Cursor, Cline, and Roo Code testers can use the narrower [VS Code MCP Client Notes](VS_CODE_MCP_CLIENT_NOTES.md) to capture the exact settings path and resource/tool behavior; Cline/Roo testers can use the focused [Cline/Roo MCP Client Notes](CLINE_ROO_MCP_CLIENT_NOTES.md); opencode testers can use the [opencode MCP Client Notes](OPENCODE_MCP_CLIENT_NOTES.md) for the same kind of narrow, no-overclaim checklist. The snippets are deliberately conservative: they show local source-checkout config shapes without claiming the clients are already known-working.

For Hermes, OpenClaw, Claude Code, Codex, Cursor, or another local coding-agent harness that reads files and runs commands, use the [Agent Harness Smoke Test](AGENT_HARNESS_SMOKE_TEST.md), the shorter [Platform and Agent Smoke-Test Recipes](PLATFORM_AGENT_SMOKE_RECIPES.md), the [Codex CLI Compatibility Notes](CODEX_CLI_COMPATIBILITY_NOTES.md), or the copy-paste [Agent Prompt Packs](AGENT_PROMPT_PACKS.md). They keep the claim narrow: local markdown bundle read/update through a disposable source checkout, not full product certification.

## If you like docs/examples

Help another adopter see the v0.1 flow before installing anything:

- Improve the fictional [demo transcript](../examples/demo-transcript.md).
- Improve the public-safe [starter passport example](../examples/starter-passport/README.md) if a first-time adopter gets stuck on the file shape.
- Improve [Source-Checkout Troubleshooting](SOURCE_CHECKOUT_TROUBLESHOOTING.md) with one verified setup failure and its safest fix, using only sanitized output.
- Add or improve a public-safe compatibility report listed in the [compatibility report examples index](../examples/compatibility-reports/README.md), such as the [WSL source-checkout smoke test](../examples/compatibility-reports/linux-wsl-source-checkout-2026-05-18.md).
- Add or improve a public-safe MCP report, such as the [WSL MCP stdio smoke test](../examples/compatibility-reports/linux-wsl-mcp-stdio-2026-05-18.md), without claiming external clients are known-working unless you tested them.
- Add or improve a public-safe agent-harness report, such as the [Hermes-hosted WSL harness smoke test](../examples/compatibility-reports/hermes-wsl-agent-harness-2026-05-18.md), without claiming full harness integration unless you tested it.
- Add a tiny screenshot set or terminal GIF using disposable data; use the [Screenshot and Demo Capture Guide](SCREENSHOT_AND_DEMO_CAPTURE.md) to avoid leaking private paths, account names, or real memories.
- Keep or improve the existing public-safe [`examples/terminal-demo.svg`](../examples/terminal-demo.svg) if the CLI output changes.
- Clarify one MCP/client setup note without implying hosted sync, OAuth, dashboards, vector DB, blockchain, npm availability, or production maturity.

Best issue matches:

- [Add a tiny terminal demo GIF or screenshot set](https://github.com/sunnja69/akephalos/issues/10)
- [Improve MCP setup docs](https://github.com/sunnja69/akephalos/issues/6)

## If you like small tests

The safest code contributions for v0.1 are narrow regression tests around local-file behavior. Good first targets:

- [Improve JSONL conflict merge tests](https://github.com/sunnja69/akephalos/issues/8) — add fixtures that cover `merge-ledgers` conflict markers, duplicate JSONL records, malformed rejected lines, and the generated `ledger.merge` event without changing the merge algorithm unless a failing test proves a bug.
- Add one CLI test for a confusing docs command if the command already exists and the expected output is stable.

Keep test data fictional. Do not include real memories, usernames, hostnames, private paths, tokens, or auth config in fixtures.

## PR checklist

Before opening a PR:

- Keep the change tiny and focused.
- Run `npm test`.
- Check the pull request CI result after opening; if it fails, include the failing job and log excerpt in your follow-up instead of guessing.
- Re-read any transcript, screenshot, or report for private data.
- State the exact OS/client/tool you tested.
- Say whether the result is `known-working`, `configured`, `unknown`, or `broken`; do not overclaim.
- Use the [First PR Guide](FIRST_PR_GUIDE.md) for a copy-pasteable PR description and guardrail checklist.

If in doubt, open a compatibility report first. A small verified report is more useful than a broad untested integration claim.
