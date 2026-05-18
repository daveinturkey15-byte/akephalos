# WSL MCP Stdio Smoke Test — 2026-05-18

This is a public-safe compatibility report for the Akephalos `v0.1` MCP stdio server using the official Model Context Protocol TypeScript client from the repo dependencies and a disposable passport.

## Environment

- OS: Linux under WSL2
- Shell: Bash
- Node: `v22.22.2`
- Install method: existing source checkout on the PR branch after `npm ci`
- Client tested: `@modelcontextprotocol/sdk` `Client` over `StdioClientTransport`
- Data used: fictional demo memory and a disposable `.akephalos` bundle under `/tmp`

Private hostnames, usernames, and machine-specific paths are intentionally omitted.

## Commands run

```sh
npm test
mkdir -p /tmp/akephalos-mcp-stdio-smoke
cd /tmp/akephalos-mcp-stdio-smoke
node /path/to/akephalos/dist/index.js init
node /path/to/akephalos/dist/index.js add-memory "Demo user prefers MCP clients that read local markdown context."
node /path/to/akephalos/dist/index.js scan
node /path/to/mcp-smoke-client.mjs
```

The smoke client started:

```js
new StdioClientTransport({
  command: "node",
  args: ["/path/to/akephalos/dist/index.js", "mcp"],
  cwd: "/tmp/akephalos-mcp-stdio-smoke"
})
```

Then it called:

- `listResources()`
- `readResource({ uri: "akephalos://identity" })`
- `callTool({ name: "get_status", arguments: {} })`
- `callTool({ name: "add_memory", arguments: { text: "Demo user keeps MCP smoke tests public-safe." } })`
- `readResource({ uri: "akephalos://memories" })`

## Result

- `npm test`: passed all 33 Node tests after the TypeScript build.
- `init`: created the expected disposable `.akephalos` bundle.
- `add-memory`: appended a fictional demo memory.
- `scan`: scanned 8 files with `info: 0`, `warn: 0`, `fail: 0` before the MCP client ran.
- MCP stdio connection: passed.
- `listResources()`: returned 5 resources: `akephalos://identity`, `akephalos://rules`, `akephalos://tools`, `akephalos://projects`, and `akephalos://memories`.
- `readResource("akephalos://identity")`: returned the local markdown passport text.
- `get_status`: returned bundle status for the disposable passport.
- `add_memory`: returned `Memory added.` for fictional text.
- `readResource("akephalos://memories")`: returned the two fictional memories.
- Final `scan`: scanned 8 files with `info: 0`, `warn: 0`, `fail: 0`.

## Caveats

- This verifies the local stdio MCP server with the SDK client on WSL, not Claude Desktop, Cursor, Cline, Roo Code, opencode, Hermes/OpenClaw, or another external UI.
- This does not certify cross-machine sync; the test used one disposable local folder.
- This does not claim hosted sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, npm availability, or production maturity.

## Follow-up

This report supports MCP stdio basics on WSL. Separate reports are still useful for Windows PowerShell, macOS, Claude Desktop, Cursor, Cline/Roo Code, opencode, Hermes/OpenClaw, and any client-specific config quirks.
