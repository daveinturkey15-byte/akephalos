# MCP Client Config Snippets

Akephalos `v0.1` can run as a local MCP stdio server from a source checkout. These snippets are starting points for contributors who want to test Akephalos with real MCP clients.

Status note: snippets on this page are **configuration shapes**, not compatibility claims. Please only mark a client `known-working` after a real smoke test with disposable data.

## Build the local server first

```sh
git clone https://github.com/sunnja69/akephalos.git
cd akephalos
npm ci
npm run build
```

Use an absolute path to the built checkout in client configs.

## Generic stdio shape

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

Windows path example:

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

## Claude Desktop style

Many desktop MCP configs use this `mcpServers` object shape:

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

Good first report: [Add a Claude Desktop MCP compatibility smoke report](https://github.com/sunnja69/akephalos/issues/15).

## Cursor / VS Code MCP style

Cursor, Cline, Roo Code, and related VS Code clients may store MCP server entries in different files or settings panes. Start from the same stdio command and report the exact config location you used:

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

Good first reports:

- [Test Akephalos as a Cursor MCP server](https://github.com/sunnja69/akephalos/issues/13)
- [Test Akephalos with Cline or Roo Code MCP clients](https://github.com/sunnja69/akephalos/issues/16)

## opencode style

If your opencode setup accepts MCP stdio servers, start with the same command and include the sanitized config shape in the report:

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

Good first report: [Add an opencode MCP compatibility smoke report](https://github.com/sunnja69/akephalos/issues/17).

## Smoke test checklist

Use only fictional, disposable data:

```sh
mkdir ../akephalos-mcp-demo
cd ../akephalos-mcp-demo
node ../akephalos/dist/index.js init
node ../akephalos/dist/index.js add-memory "Demo user prefers local-first agent context."
node ../akephalos/dist/index.js scan
```

In the MCP client, try to verify at least one of:

- read `akephalos://identity`
- read `akephalos://memories`
- call `get_status`
- call `add_memory` with a fictional memory, then confirm it appears in `memories.jsonl`

When you report results, redact private usernames, hostnames, paths, tokens, private repo names, and real memories. Keep claims to `v0.1` / early MVP: no hosted cloud sync, automatic realtime sync, OAuth, dashboard, vector DB, blockchain, npm package availability, or production maturity.
