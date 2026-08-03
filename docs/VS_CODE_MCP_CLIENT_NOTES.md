# VS Code MCP Client Notes

Akephalos v0.1 can be tested as a local MCP stdio server from a source checkout. This page narrows the report path for Cursor, Cline, Roo Code, and other VS Code-style MCP clients.

These notes are **not** compatibility claims. They are a contributor checklist for turning one real client trial into a useful, sanitized report.

## Safety rules

Use a disposable `.akephalos` folder and fictional memories only.

Do not publish:

- tokens, API keys, auth config, or secret paths
- private repository names
- real memories or private project details
- local usernames, hostnames, or machine-specific private paths
- screenshots that reveal accounts, chats, private files, browser profiles, keys, or customer/project data

Keep claims narrow: Akephalos is a v0.1 / early MVP local-first tool. Do not imply hosted cloud sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, npm package availability, or production maturity.

## 1. Build Akephalos locally

```sh
git clone https://github.com/sunnja69/akephalos.git
cd akephalos
npm ci
npm test
npm run build
node dist/index.js --help
```

Record:

```sh
git rev-parse --short HEAD
node -v
npm -v
```

## 2. Create disposable passport data

From a sibling demo folder:

```sh
mkdir ../akephalos-vscode-mcp-demo
cd ../akephalos-vscode-mcp-demo
node ../akephalos/dist/index.js init
node ../akephalos/dist/index.js add-memory "Demo user wants agents to read local markdown context before editing files."
node ../akephalos/dist/index.js scan
```

Only continue if the demo bundle scans cleanly and contains no private data.

## 3. Add the MCP server to the client

Start from the same stdio shape used in [MCP Client Config Snippets](MCP_CLIENT_SNIPPETS.md#cursor--vs-code-mcp-style):

```json
{
  "mcpServers": {
    "akephalos": {
      "command": "node",
      "args": ["/absolute/path/to/akephalos/dist/index.js", "mcp"]
    }
  }
}
```

Report the exact client and config location you used, but redact private details. Useful examples:

- `Cursor settings MCP server entry` rather than a screenshot with account details.
- `<workspace>/.cursor/...` or `<home>/...` rather than a full personal path.
- `Cline MCP server settings` or `Roo Code MCP server settings` rather than private workspace names.

If the client expects a different field name, path style, or settings UI, document that difference. That delta is often the most useful part of the report.

## 4. Check resources and tools

In the VS Code-style client, try the smallest useful checks it exposes:

1. Confirm the Akephalos server starts without crashing.
2. List MCP resources, if the client exposes a resource list.
3. Read `akephalos://identity`.
4. Read `akephalos://memories`.
5. Call `get_status`, if tools are exposed.
6. Call `add_memory` with fictional text, if tools are exposed.
7. Back in the demo folder, verify the result:

   ```sh
   node ../akephalos/dist/index.js print memories
   node ../akephalos/dist/index.js scan
   ```

If the client can start the server but cannot show resources or tools, that is still worth reporting as `configured` or `blocked` with a sanitized error. Do not mark it `known-working` unless the report verifies the exact behavior.

## 5. Report in the matching issue

Use the full [MCP Client Smoke-Test Worksheet](MCP_CLIENT_SMOKE_WORKSHEET.md) for the final report shape.

Best issue targets:

- [Test Akephalos as a Cursor MCP server](https://github.com/sunnja69/akephalos/issues/13)
- [Test Akephalos with Cline or Roo Code MCP clients](https://github.com/sunnja69/akephalos/issues/16)
- [Improve MCP setup docs](https://github.com/sunnja69/akephalos/issues/6) if you only learned a docs/config correction

Use one of these status labels:

- `known-working`: the client started the MCP server, read at least one resource, and successfully called a tool such as `add_memory`, with a clean final `scan`.
- `configured`: the server entry was accepted or started, but resource/tool behavior was only partly verified.
- `blocked`: the client could not start the server or could not accept the config; include the sanitized error.
- `not tested`: docs-only note, no real client run yet.
