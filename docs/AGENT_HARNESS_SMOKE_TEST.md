# Agent Harness Smoke Test

Use this when you want to check Akephalos v0.1 with an agent harness such as Hermes, OpenClaw, Claude Code, Codex, Cursor, or another local coding agent.

This is a conservative smoke test. It proves that the agent can work with a disposable local `.akephalos` folder through normal files and CLI commands. It does **not** prove hosted sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, npm availability, or production maturity.

## What to test

A useful first report answers three questions:

1. Can the harness read the local markdown bundle?
2. Can it append a fictional/non-secret memory through the CLI?
3. Can `scan` stay clean before anything is shared publicly?

If you also test MCP, use [MCP Client Config Snippets](MCP_CLIENT_SNIPPETS.md) and say exactly which client/version you used. Do not mark an external client as known-working unless you actually verified resource reads/tool calls with disposable data.

## Disposable source-checkout recipe

From a fresh public checkout:

```sh
git clone https://github.com/sunnja69/akephalos.git
cd akephalos
npm ci
npm test
```

Create a disposable passport outside any real project:

```sh
mkdir ../akephalos-agent-smoke
cd ../akephalos-agent-smoke
node ../akephalos/dist/index.js init
node ../akephalos/dist/index.js add-memory "Demo user prefers local-first markdown tools and short CLI examples."
node ../akephalos/dist/index.js import-harness "Example agent smoke test" \
  --tool "terminal" \
  --tool "git" \
  --preference "Use fictional memories and redact private paths in public reports."
node ../akephalos/dist/index.js harness list
node ../akephalos/dist/index.js harness check
node ../akephalos/dist/index.js status
node ../akephalos/dist/index.js scan
node ../akephalos/dist/index.js print identity
node ../akephalos/dist/index.js print tools
node ../akephalos/dist/index.js print memories
```

## Report checklist

When opening an issue or PR, include:

- Agent/harness name and version if available.
- OS, shell, and Node version.
- Akephalos commit tested.
- Whether the harness read `akephalos.md`, `rules.md`, `tools.md`, `projects.md`, or `memories.jsonl` directly.
- Whether `add-memory`, `import-harness`, `harness list`, `harness check`, `status`, `scan`, and relevant `print` commands passed.
- Whether any MCP client was tested. If not, say `MCP not tested`.
- Exact errors with private usernames, local paths, hostnames, repo names, and secrets redacted.

## Privacy guardrails

Before posting output publicly:

- Use a throwaway `.akephalos` folder with fictional memories only.
- Do not paste real memories, tokens, auth paths, private repo names, hostnames, local usernames, API keys, private keys, or machine-specific private paths.
- Re-run `scan` and re-read the report.
- Mark the result conservatively: `known-working` only for the exact path you tested; otherwise use `configured`, `unknown`, or `broken`.

For examples, see [Compatibility Report Examples](../examples/compatibility-reports/README.md).
