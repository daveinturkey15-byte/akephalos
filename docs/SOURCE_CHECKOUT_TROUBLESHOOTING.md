# Source-Checkout Troubleshooting

Akephalos `v0.1` is an early prerelease. The safest trial path is still a local source checkout, not a package-manager install. This page collects small, public-safe fixes for the common first-run snags.

Use disposable `.akephalos` data while testing. Do not paste tokens, auth files, private repo names, real memories, hostnames, local usernames, or machine-specific private paths into public reports.

## Quick sanity checklist

From the repository root:

```sh
node --version
npm --version
npm ci
npm run build
node dist/index.js --help
```

Expected shape:

- Node should be a current LTS-style version; if in doubt, try Node 20.
- `npm ci` should finish before `npm run build`.
- `dist/index.js` exists only after the build.
- Commands in docs that use `node dist/index.js ...` assume your shell is in the cloned `akephalos` repository unless the command shows a different relative path.

## `Cannot find module .../dist/index.js`

Usually one of these is true:

1. `npm run build` has not been run yet.
2. The command is running from the wrong directory.
3. A relative path copied from a demo folder no longer points back to the source checkout.

Fix:

```sh
cd path/to/akephalos
npm run build
node dist/index.js --help
```

If you are inside a throwaway demo folder next to the checkout, use:

```sh
node ../akephalos/dist/index.js status
```

## `npm ci` or `npm run build` fails

Useful report details:

- OS and shell/terminal.
- Node and npm versions.
- Akephalos commit tested.
- The exact failing command.
- The shortest error excerpt that still shows the failure.

Redact private paths, local usernames, hostnames, private repo names, auth config, tokens, and real memories before posting.

## PowerShell path quoting

If a path contains spaces, quote it:

```powershell
node "..\akephalos\dist\index.js" status
```

If you are translating a POSIX-style command from docs, keep the same command shape but adjust slashes and quoting for your shell.

## MCP client says the server command is missing

For `v0.1`, point the MCP client at the built source checkout command. Do not assume an npm-installed `akephalos` binary exists.

Good conservative command shape:

```json
{
  "command": "node",
  "args": ["/absolute/path/to/akephalos/dist/index.js", "mcp"]
}
```

Before trying the client, verify the same command works in a terminal:

```sh
node /absolute/path/to/akephalos/dist/index.js mcp
```

Then report the client name/version, OS, Node/npm versions, sanitized config shape, and whether resources/tools were visible.

## `scan` warns about private-looking content

Treat `scan` warnings seriously. Replace real data with fictional demo data before opening a public issue or PR.

Good public demo memory:

```txt
Demo user prefers short local-first CLI examples.
```

Bad public demo memory:

```txt
Real customer/project/account details, tokens, auth paths, or private operational facts.
```

## What to include in a helpful issue

A useful source-checkout troubleshooting report is small and factual:

````md
## Environment
- OS:
- Shell/terminal:
- Node:
- npm:
- Akephalos commit:

## Command that failed

```sh
# paste the sanitized command
```

## Sanitized output

```txt
# paste the shortest useful error excerpt
```

## What I expected

## What happened instead

## Privacy check
- [ ] I used disposable `.akephalos` data only.
- [ ] I removed private paths/usernames/hostnames/tokens/auth config/private repo names.
- [ ] I did not include real memories.
````

Keep claims narrow: this is an early local-first MVP using plain files/Git, not hosted sync, automatic realtime sync, OAuth, a dashboard, vector database, blockchain layer, package-manager availability claim, or production certification.
