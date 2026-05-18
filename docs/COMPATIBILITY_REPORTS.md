# Compatibility Reports

Akephalos v0.1 needs small, factual field reports more than broad integration claims. Use this page to turn a quick local trial into something maintainers and new adopters can verify.

Use fictional or disposable passport data only. Do not paste real memories, tokens, auth paths, private repository names, hostnames, local usernames, or machine-specific private paths.

## Quick report template

````md
## Environment

- OS:
- Shell:
- Node version:
- Install method: source checkout from https://github.com/sunnja69/akephalos
- Akephalos version or commit:
- Agent/client tested, if any:

## Commands tried

```sh
git clone https://github.com/sunnja69/akephalos.git
cd akephalos
npm ci
npm test
node dist/index.js --help
mkdir ../akephalos-demo
cd ../akephalos-demo
node ../akephalos/dist/index.js init
node ../akephalos/dist/index.js add-memory "Demo user prefers local-first markdown tools."
node ../akephalos/dist/index.js import-harness "Demo Agent" --tool "terminal" --tool "git" --preference "Use disposable data."
node ../akephalos/dist/index.js status
node ../akephalos/dist/index.js scan
node ../akephalos/dist/index.js print memories
```

## Result

- Build/test result:
- CLI quickstart result:
- MCP result, if tested:
- `scan` result:
- Any confusing docs or errors:

## Safety check

- [ ] Uses only fictional/demo memories.
- [ ] Removes private paths, hostnames, usernames, auth config, tokens, and private repo names.
- [ ] Does not imply hosted cloud sync, realtime sync, OAuth, dashboards, vector DB, blockchain, npm availability, or production maturity.
````

## Where to submit

- If the report is mostly environment compatibility, open a GitHub issue using the compatibility-report form. It asks for OS, shell, Node version, commands tried, result, and the same privacy/no-overclaim checks as the template below.
- If the report improves docs, examples, or setup notes, open a tiny PR and link the relevant issue.
- If the report proves an agent/harness status, update [Known Working Agents](KNOWN_WORKING_AGENTS.md) conservatively: use `known-working` only after read, memory append, sync, and pull-back are confirmed with non-sensitive data.

## Good first report targets

- [Test Akephalos on Windows from a fresh public clone](https://github.com/sunnja69/akephalos/issues/9) — use the unverified [Windows PowerShell smoke-test recipe](WINDOWS_POWERSHELL_SMOKE_TEST.md) as a starting point.
- [Test Akephalos on macOS](https://github.com/sunnja69/akephalos/issues/1) — use the [macOS source-checkout recipe](PLATFORM_AGENT_SMOKE_RECIPES.md#macos-terminal-source-checkout-smoke-test) as a starting point.
- [Test Akephalos on Linux](https://github.com/sunnja69/akephalos/issues/2)
- [Improve MCP setup docs](https://github.com/sunnja69/akephalos/issues/6)
- [Test Akephalos as a Cursor MCP server](https://github.com/sunnja69/akephalos/issues/13)
- [Add a Codex CLI compatibility smoke report](https://github.com/sunnja69/akephalos/issues/14) — use the [Claude Code/Codex CLI local-file recipe](PLATFORM_AGENT_SMOKE_RECIPES.md#claude-code-or-codex-cli-local-file-smoke-test) as a starting point.
- [Add a Claude Desktop MCP compatibility smoke report](https://github.com/sunnja69/akephalos/issues/15)
- [Test Akephalos with Cline or Roo Code MCP clients](https://github.com/sunnja69/akephalos/issues/16)
- [Add an opencode MCP compatibility smoke report](https://github.com/sunnja69/akephalos/issues/17)

For any other MCP client or agent harness, open a fresh compatibility report with the same template instead of editing these docs first. Keep the report narrow, factual, and based on a disposable local checkout.

For examples of public-safe report wording, see the [compatibility report examples index](../examples/compatibility-reports/README.md). If you need a copy-paste starting point for macOS, Claude Code, Codex CLI, or OpenClaw/Hermes-style harness tests, see [Platform and Agent Smoke-Test Recipes](PLATFORM_AGENT_SMOKE_RECIPES.md). If you need MCP config, see [MCP Client Config Snippets](MCP_CLIENT_SNIPPETS.md). Treat those snippets as unverified setup shapes until someone submits a real smoke report.
