# Local MCP Setup Notes

Akephalos `v0.1` can run as a local MCP stdio server. Setup is manual: there is no hosted cloud sync, OAuth flow, dashboard, vector database, blockchain layer, or managed account service.

## Prerequisites

Build from a source checkout first:

```sh
git clone https://github.com/sunnja69/akephalos.git
cd akephalos
npm ci
npm run build
```

Then start the stdio server from the checkout:

```sh
node dist/index.js mcp
```

If you later put the built CLI on your shell path, the equivalent command is:

```sh
akephalos mcp
```

## Example stdio client entry

Different clients name their config files differently. Use this shape and adjust the absolute path to your local checkout:

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

For Windows clients, use a Windows path to the checkout, for example:

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

## Resources and tools

The server exposes fixed local passport resources only:

- `akephalos://identity`
- `akephalos://rules`
- `akephalos://projects`
- `akephalos://tools`
- `akephalos://memories`

Tools:

- `get_status`
- `add_memory`

`add_memory` appends a non-secret memory to `.akephalos/memories.jsonl`. It is not arbitrary file write access.

## Smoke test checklist

Use a disposable passport and fictional data:

```sh
mkdir akephalos-mcp-demo
cd akephalos-mcp-demo
node ../akephalos/dist/index.js init
node ../akephalos/dist/index.js add-memory "Demo user prefers local-first agent context."
node ../akephalos/dist/index.js scan
```

Then configure your MCP client and check whether it can read one resource, such as `akephalos://identity`, or call `get_status`.

If you open a compatibility report, include your OS, shell, Node version, client name, the sanitized config shape, and whether the client could read a resource or append a fictional memory.
