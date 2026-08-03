# Cline / Roo Code MCP Client Notes

Akephalos v0.1 is an early, local-first MVP. This checklist is for someone testing Akephalos as a local stdio MCP server from Cline or Roo Code in a VS Code-style environment.

Use only a disposable `.akephalos` folder. Do not paste tokens, auth config, private repository names, real memories, hostnames, local usernames, or machine-specific private paths into public reports.

## 1. Build Akephalos from source

```sh
git clone https://github.com/sunnja69/akephalos.git
cd akephalos
npm ci
npm run build
node dist/index.js --help
```

Record the Akephalos commit you tested:

```sh
git rev-parse --short HEAD
```

## 2. Create disposable passport data

Use a temporary folder outside any private workspace:

```sh
mkdir akephalos-cline-roo-smoke
cd akephalos-cline-roo-smoke
node ../akephalos/dist/index.js init
node ../akephalos/dist/index.js add-memory "Fictional test user prefers tiny local-first tools."
node ../akephalos/dist/index.js scan
```

If your paths differ, keep the public report generic and redact the real path.

## 3. Configure the MCP server

Start from the [Cursor / VS Code MCP-style snippet](MCP_CLIENT_SNIPPETS.md#cursor--vs-code-mcp-style). In your Cline or Roo Code MCP settings, point the command at the local source checkout:

```json
{
  "mcpServers": {
    "akephalos": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/akephalos/dist/index.js", "mcp"],
      "cwd": "/ABSOLUTE/PATH/TO/akephalos-cline-roo-smoke"
    }
  }
}
```

Before sharing anything public, replace real home directories, usernames, organization names, hostnames, and private repo names with placeholders.

## 4. Smoke-test resources and tools

In Cline or Roo Code, check whether the `akephalos` server starts without crashing and whether the client exposes:

- resources such as `akephalos://identity`, `akephalos://rules`, `akephalos://projects`, and `akephalos://memories`
- tools such as `get_status` and `add_memory`

Try only fictional/disposable content, for example:

```txt
Read akephalos://identity and akephalos://memories from the akephalos MCP server. Then call add_memory with: "Fictional Cline/Roo smoke test memory." Do not read files outside this disposable folder.
```

After the client test, verify the local bundle from the terminal:

```sh
node ../akephalos/dist/index.js scan
node ../akephalos/dist/index.js print memories
```

## 5. Report format

Post a sanitized report in [issue #16](https://github.com/sunnja69/akephalos/issues/16) with:

- client tested: Cline or Roo Code, including version if visible
- VS Code / editor version if relevant
- OS, shell/terminal, Node version, npm version
- Akephalos commit tested
- sanitized MCP settings location and command shape
- whether the server started
- which resources were visible/readable
- which tools were visible/callable
- whether `add_memory` changed only the disposable `.akephalos/memories.jsonl`
- final `scan` result
- exact errors, with private paths and account details redacted

Keep the wording conservative: `configured` until a real Cline or Roo Code run verifies resource reads and a fictional memory append. Do not claim hosted sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, npm package availability, or production maturity.
