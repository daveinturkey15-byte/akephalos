# opencode MCP Client Notes

Akephalos v0.1 can be tested as a local MCP stdio server from a source checkout. This page narrows the report path for opencode users who want to check whether their MCP setup can read and update a disposable `.akephalos` passport.

These notes are **not** a compatibility claim. They are a contributor checklist for turning one real opencode trial into a useful, sanitized report.

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

Record the versions you tested:

```sh
git rev-parse --short HEAD
node -v
npm -v
```

## 2. Create disposable passport data

From a sibling demo folder:

```sh
mkdir ../akephalos-opencode-mcp-demo
cd ../akephalos-opencode-mcp-demo
node ../akephalos/dist/index.js init
node ../akephalos/dist/index.js add-memory "Demo user wants opencode to read local markdown context before editing files."
node ../akephalos/dist/index.js scan
```

Only continue if the demo bundle scans cleanly and contains no private data.

## 3. Add the MCP server to opencode

Start from the same stdio shape used in [MCP Client Config Snippets](MCP_CLIENT_SNIPPETS.md#opencode-style):

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

Report the exact opencode version and config location you used, but redact private details. Useful examples:

- `opencode MCP settings` rather than a screenshot with account details.
- `<workspace>/...` or `<home>/...` rather than a full personal path.
- sanitized config keys and command shape, not tokens, private repo names, or machine-specific paths.

If opencode expects a different field name, path style, or settings location, document that difference. That delta is often the most useful part of the report.

## 4. Check resources and tools

In opencode, try the smallest useful MCP checks it exposes:

1. Confirm the Akephalos server starts without crashing.
2. List MCP resources, if opencode exposes a resource list.
3. Read `akephalos://identity`.
4. Read `akephalos://memories`.
5. Call `get_status`, if tools are exposed.
6. Call `add_memory` with fictional text, if tools are exposed.
7. Back in the demo folder, verify the result:

   ```sh
   node ../akephalos/dist/index.js print memories
   node ../akephalos/dist/index.js scan
   ```

If opencode can start the server but cannot show resources or tools, that is still worth reporting as `configured` or `blocked` with a sanitized error. Do not mark it `known-working` unless the report verifies the exact behavior.

## 5. Report in the matching issue

Use the full [MCP Client Smoke-Test Worksheet](MCP_CLIENT_SMOKE_WORKSHEET.md) for the final report shape.

Best issue target:

- [Add an opencode MCP compatibility smoke report](https://github.com/sunnja69/akephalos/issues/17)

Use one of these status labels:

- `known-working`: opencode started the MCP server, read at least one resource, and successfully called a tool such as `add_memory`, with a clean final `scan`.
- `configured`: the server entry was accepted or started, but resource/tool behavior was only partly verified.
- `blocked`: opencode could not start the server or could not accept the config; include the sanitized error.
- `not tested`: docs-only note, no real opencode run yet.
