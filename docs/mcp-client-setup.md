# MCP Client Setup

Akephalos v0.1 can run as a local MCP stdio server from a source checkout. Use this when you want an MCP-capable client to read the local `.akephalos` passport and append non-secret memories without adding a hosted service.

## Prerequisites

From the public source checkout:

```sh
git clone https://github.com/sunnja69/akephalos.git
cd akephalos
npm ci
npm run build
```

Create or enter the workspace that should contain the passport bundle, then initialize it if needed:

```sh
node /path/to/akephalos/dist/index.js init
node /path/to/akephalos/dist/index.js status
```

Keep the MCP server `cwd` pointed at the workspace that contains `.akephalos`. The server reads fixed bundle files from that directory and exposes them over stdio.

## Generic MCP stdio config

Use this shape for clients that accept a JSON-style MCP server definition:

```json
{
  "mcpServers": {
    "akephalos": {
      "command": "node",
      "args": ["/path/to/akephalos/dist/index.js", "mcp"],
      "cwd": "/path/to/workspace-with-passport"
    }
  }
}
```

Replace both paths before use:

- `/path/to/akephalos/dist/index.js` is the built CLI in the source checkout.
- `/path/to/workspace-with-passport` is the project or home workspace that contains `.akephalos`.

For Windows clients, use escaped backslashes or forward slashes accepted by the client, for example:

```json
{
  "command": "node",
  "args": ["C:/Users/you/src/akephalos/dist/index.js", "mcp"],
  "cwd": "C:/Users/you/projects/demo"
}
```

## Claude Desktop-style entry

Many desktop MCP clients use the same `mcpServers` shape. For a source checkout, point directly at `dist/index.js`:

```json
{
  "mcpServers": {
    "akephalos": {
      "command": "node",
      "args": ["/absolute/path/to/akephalos/dist/index.js", "mcp"],
      "cwd": "/absolute/path/to/workspace-with-.akephalos"
    }
  }
}
```

Restart or reload the client after changing its MCP config.

## Cursor-style entry

For Cursor or another editor client with MCP JSON config support, use the same local stdio server entry:

```json
{
  "mcpServers": {
    "akephalos": {
      "command": "node",
      "args": ["/absolute/path/to/akephalos/dist/index.js", "mcp"],
      "cwd": "/absolute/path/to/workspace-with-.akephalos"
    }
  }
}
```

Reload the MCP configuration before testing resources or tools.

## Exposed resources and tools

Resources:

- `akephalos://identity`
- `akephalos://rules`
- `akephalos://projects`
- `akephalos://tools`
- `akephalos://memories`

Tools:

- `get_status` — shows local `.akephalos` bundle status.
- `add_memory` — appends a non-secret memory to `.akephalos/memories.jsonl`.

The MCP server does not provide arbitrary file reads, shell execution, hosted sync, dashboards, OAuth, vector search, or account services.

## Smoke test checklist

After adding the config to a client:

1. Start or reload the client.
2. Read `akephalos://identity` or call `get_status`.
3. Add a harmless non-secret memory such as `MCP smoke test succeeded for this client.`
4. In the workspace, run:

   ```sh
   node /path/to/akephalos/dist/index.js print memories
   node /path/to/akephalos/dist/index.js scan
   ```

5. If reporting compatibility publicly, include only non-sensitive OS, client, command/config shape, result, and sanitized output. Do not publish private passport contents.
