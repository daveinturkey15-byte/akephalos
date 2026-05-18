# Try Akephalos in 5 Minutes

Akephalos `v0.1` is an early prerelease. This walkthrough uses a local source checkout and a disposable passport so you can see the shape of the tool without publishing personal data.

## 1. Clone and build

```sh
git clone https://github.com/sunnja69/akephalos.git
cd akephalos
npm ci
npm run build
node dist/index.js --help
```

## 2. Create a disposable passport

Run this from a throwaway directory, not inside a real private passport repo:

```sh
mkdir akephalos-demo
cd akephalos-demo
node ../akephalos/dist/index.js init
```

Akephalos creates a local `.akephalos` folder with markdown/plain-file state.

If you want to preview the happy path before running it, see the fictional, public-safe [terminal demo SVG](../examples/terminal-demo.svg), [demo transcript](../examples/demo-transcript.md), or [starter passport example](../examples/starter-passport/README.md).

## 3. Add fictional, non-secret context

```sh
node ../akephalos/dist/index.js add-memory "Demo user prefers short CLI examples with no hidden network services."
node ../akephalos/dist/index.js import-harness "Demo Agent" --tool "terminal" --tool "git" --preference "Ask before changing public files."
```

Do not use real secrets, tokens, private project names, auth paths, or personal memories in public examples.

## 4. Inspect what an agent can read

```sh
node ../akephalos/dist/index.js status
node ../akephalos/dist/index.js scan
node ../akephalos/dist/index.js print identity
node ../akephalos/dist/index.js print tools
node ../akephalos/dist/index.js print memories
```

The important property is boring inspectability: the durable context is in local files you can read, diff, edit carefully, export, or carry with your own private Git workflow.

## 5. Optional MCP smoke test

If your client supports local MCP stdio servers, start Akephalos with:

```sh
node ../akephalos/dist/index.js mcp
```

For `v0.1`, treat MCP setup as local/manual. There is no hosted cloud sync, dashboard, OAuth flow, vector database, blockchain layer, or managed account service.

## 6. Share a useful compatibility report

If the walkthrough works or breaks in your environment, please open a small issue or PR with:

- OS and shell
- Node version
- install method: source checkout
- command transcript, with private paths/secrets removed
- whether `npm run build` and `npm test` passed
- which agent/client you tried, if any

Good starting issues are labeled [`good first issue`](https://github.com/sunnja69/akephalos/issues?q=is%3Aissue%20is%3Aopen%20label%3A%22good%20first%20issue%22) and [`help wanted`](https://github.com/sunnja69/akephalos/issues?q=is%3Aissue%20is%3Aopen%20label%3A%22help%20wanted%22).
