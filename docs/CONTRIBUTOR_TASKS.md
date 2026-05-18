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
3. Open a compatibility report with your OS, shell, Node version, and sanitized command output.

Best issue matches:

- [Test Akephalos on Windows from a fresh public clone](https://github.com/sunnja69/akephalos/issues/9)
- [Test Akephalos on macOS](https://github.com/sunnja69/akephalos/issues/1)
- [Test Akephalos on Linux](https://github.com/sunnja69/akephalos/issues/2)

## If you use an agent or MCP client

Try the local `.akephalos` bundle with one agent/client and report exactly what worked:

- Could the agent read the markdown files?
- Could it append a fictional memory with `add-memory`?
- Did MCP resources/tools appear if you configured `node dist/index.js mcp`?
- Did `scan` stay clean before sharing anything public?

Best issue matches:

- [Improve MCP setup docs](https://github.com/sunnja69/akephalos/issues/6)
- [Test Akephalos with Claude Code](https://github.com/sunnja69/akephalos/issues/3)
- [Test Akephalos with Hermes](https://github.com/sunnja69/akephalos/issues/4)
- [Test Akephalos with OpenClaw](https://github.com/sunnja69/akephalos/issues/5)

## If you like docs/examples

Help another adopter see the v0.1 flow before installing anything:

- Improve the fictional [demo transcript](../examples/demo-transcript.md).
- Add a tiny screenshot set or terminal GIF using disposable data.
- Clarify one MCP/client setup note without implying hosted sync, OAuth, dashboards, vector DB, blockchain, npm availability, or production maturity.

Best issue matches:

- [Add a tiny terminal demo GIF or screenshot set](https://github.com/sunnja69/akephalos/issues/10)
- [Improve MCP setup docs](https://github.com/sunnja69/akephalos/issues/6)

## PR checklist

Before opening a PR:

- Keep the change tiny and focused.
- Run `npm test`.
- Re-read any transcript, screenshot, or report for private data.
- State the exact OS/client/tool you tested.
- Say whether the result is `known-working`, `configured`, `unknown`, or `broken`; do not overclaim.

If in doubt, open a compatibility report first. A small verified report is more useful than a broad untested integration claim.
