# MCP Client Smoke-Test Worksheet

Akephalos v0.1 can expose a local `.akephalos` passport over MCP stdio from a source checkout. This worksheet is for contributors testing a **real MCP client** such as Claude Desktop, Cursor, Cline, Roo Code, opencode, or another stdio-capable client.

This is a field-report worksheet, not a compatibility claim. Only mark a client `known-working` after a real test with disposable data.

## Safety rules

Use fictional or disposable data only.

Do not publish:

- tokens, API keys, auth config, or secret paths
- private repository names
- real memories or private project details
- local usernames, hostnames, or machine-specific private paths
- screenshots that show account names, keys, chat history, browser profiles, or private files

Keep claims narrow: Akephalos v0.1 is an early local-first MVP. Do not imply hosted sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, npm package availability, or production maturity.

## 1. Build the local server

From a fresh public checkout:

```sh
git clone https://github.com/sunnja69/akephalos.git
cd akephalos
npm ci
npm test
npm run build
node dist/index.js --help
```

Record the commit you tested:

```sh
git rev-parse --short HEAD
node -v
npm -v
```

## 2. Create a disposable passport folder

From a sibling demo directory:

```sh
mkdir ../akephalos-mcp-client-demo
cd ../akephalos-mcp-client-demo
node ../akephalos/dist/index.js init
node ../akephalos/dist/index.js add-memory "Demo user prefers local-first markdown context."
node ../akephalos/dist/index.js scan
```

Expected `scan` result before client testing: no failures and no warnings that would leak private data.

## 3. Configure your MCP client

Start from the conservative snippets in [MCP Client Config Snippets](MCP_CLIENT_SNIPPETS.md). Use an absolute path to your built source checkout:

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

For Windows, use escaped backslashes in JSON if the client expects JSON:

```json
{
  "mcpServers": {
    "akephalos": {
      "command": "node",
      "args": ["C:\\Users\\you\\src\\akephalos\\dist\\index.js", "mcp"]
    }
  }
}
```

In your report, name the exact config file or settings screen you used, but redact usernames and private paths. Example: `~/Library/Application Support/...` or `<home>/AppData/Roaming/...` is fine; a real full home path is not.

## 4. Smoke-test resources and tools

In the client, try the smallest useful checks:

1. Confirm the `akephalos` server starts without crashing.
2. List MCP resources if the client exposes that view.
3. Read `akephalos://identity`.
4. Read `akephalos://memories`.
5. Call `get_status` if the client exposes tools.
6. Call `add_memory` with one fictional memory, such as:

   ```text
   Demo user wants agents to check .akephalos/rules.md before writing files.
   ```

7. Back in the demo directory, verify the append landed and the bundle still scans cleanly:

   ```sh
   node ../akephalos/dist/index.js print memories
   node ../akephalos/dist/index.js scan
   ```

If your client can read resources but cannot call tools, that is still a useful `configured` report. Do not call it `known-working` unless the tested behavior matches what you actually verified.

## 5. Status wording

Use one of these labels in your report:

- `known-working`: the client started the MCP server, read at least one resource, and successfully added a fictional memory or called another tool, with a clean final `scan`.
- `configured`: the client accepted the config and/or started the server, but resource or tool behavior was only partly verified.
- `blocked`: the client could not start the server or could not accept the config; include the sanitized error.
- `not tested`: snippet or docs-only note; no real client run yet.

## 6. Copy-paste report shape

````md
## MCP client tested

- Client name/version:
- OS:
- Shell/terminal:
- Node version:
- npm version:
- Akephalos commit:
- Install method: source checkout from https://github.com/sunnja69/akephalos

## Config used

- Config location or settings screen, redacted:
- Sanitized config shape:

```json
{
  "mcpServers": {
    "akephalos": {
      "command": "node",
      "args": ["/redacted/path/to/akephalos/dist/index.js", "mcp"]
    }
  }
}
```

## What worked

- Server started:
- Resources listed:
- `akephalos://identity` read:
- `akephalos://memories` read:
- `get_status` tool call:
- `add_memory` tool call:
- Final `scan` result:

## What failed or confused me

- Sanitized error/output:
- Docs step that needs improvement:

## Status

- Status label: `known-working` / `configured` / `blocked` / `not tested`

## Safety check

- [ ] Uses only fictional/demo memories.
- [ ] Redacts private paths, usernames, hostnames, tokens, auth config, and private repo names.
- [ ] Does not imply hosted sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, npm package availability, or production maturity.
````

## Good first report targets

- [Test Akephalos as a Cursor MCP server](https://github.com/sunnja69/akephalos/issues/13)
- [Add a Claude Desktop MCP compatibility smoke report](https://github.com/sunnja69/akephalos/issues/15)
- [Test Akephalos with Cline or Roo Code MCP clients](https://github.com/sunnja69/akephalos/issues/16)
- [Add an opencode MCP compatibility smoke report](https://github.com/sunnja69/akephalos/issues/17)
- [Improve MCP setup docs](https://github.com/sunnja69/akephalos/issues/6)

If you test a different MCP client, open a new compatibility report and link this worksheet.
