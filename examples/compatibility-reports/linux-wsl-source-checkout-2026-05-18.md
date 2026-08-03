# WSL Source Checkout Smoke Test — 2026-05-18

This is a public-safe compatibility report for the Akephalos v0.1 source-checkout path using a disposable passport.

## Environment

- OS: Linux under WSL2
- Shell: Bash
- Node: `v22.22.2`
- Install method: fresh public source checkout from `https://github.com/sunnja69/akephalos.git`
- Agent/client tested: plain terminal CLI only; MCP client configuration was not tested in this report
- Data used: fictional demo memory and a disposable `.akephalos` bundle under `/tmp`

Private hostnames, usernames, and machine-specific paths are intentionally omitted.

## Commands run

```sh
git clone --depth 1 https://github.com/sunnja69/akephalos.git
cd akephalos
npm ci
npm test
node dist/index.js --help
mkdir ../demo-passport
cd ../demo-passport
node ../akephalos/dist/index.js init
node ../akephalos/dist/index.js add-memory "Demo user prefers local-first markdown tools and short CLI examples."
node ../akephalos/dist/index.js import-harness "WSL smoke-test agent" --tool "terminal" --tool "git" --preference "Use disposable data for public examples."
node ../akephalos/dist/index.js status
node ../akephalos/dist/index.js scan
node ../akephalos/dist/index.js print memories
```

## Result

- `npm ci`: passed.
- `npm test`: passed all 33 Node tests after the TypeScript build.
- `init`: created the expected `.akephalos` bundle files.
- `add-memory`: appended a fictional demo memory.
- `import-harness`: imported a fictional harness profile and compacted memories into `akephalos.md`.
- `status`: found the bundle and reported 2 memories.
- `scan`: scanned 8 files with `info: 0`, `warn: 0`, `fail: 0`.
- `print memories`: showed only the fictional demo memory plus the imported fictional harness context.

## Caveats

- This is a CLI/source-checkout smoke test, not a full agent-harness certification.
- MCP stdio startup is covered by the automated test suite, but no external MCP client was configured in this report.
- This does not claim hosted sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, npm availability, or production maturity.

## Follow-up

This report supports the Linux/WSL quickstart path. A separate report is still useful for Windows PowerShell, macOS, Claude Code, Cursor, Hermes/OpenClaw, and external MCP clients.
