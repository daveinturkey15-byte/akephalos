# Codex CLI Compatibility Notes

Akephalos v0.1 is an early, local-first MVP. This checklist is for someone testing whether Codex CLI can use a local `.akephalos` passport as plain project context and update it through the source-checkout CLI.

This is a local-file smoke test, not a production integration claim. Use only disposable data.

## 1. Build Akephalos from source

```sh
git clone https://github.com/sunnja69/akephalos.git
cd akephalos
npm ci
npm run build
node dist/index.js --help
git rev-parse --short HEAD
```

Record the Node/npm versions too:

```sh
node -v
npm -v
```

## 2. Create a disposable test workspace

```sh
mkdir akephalos-codex-smoke
cd akephalos-codex-smoke
node ../akephalos/dist/index.js init
node ../akephalos/dist/index.js add-memory "Fictional test user likes small local-first tools."
node ../akephalos/dist/index.js scan
```

Optional: add a tiny project file for a before/after task.

```sh
printf '# Tiny test project\n\nA disposable file for an agent smoke test.\n' > README.md
```

## 3. Prompt Codex CLI with a narrow task

From the disposable workspace, ask Codex CLI to inspect only the local `.akephalos` bundle and the test file. Adapt the exact invocation to your Codex CLI setup.

Copy-paste prompt:

```txt
You are in a disposable Akephalos smoke-test folder. First read `.akephalos/akephalos.md`, `.akephalos/rules.md`, `.akephalos/tools.md`, `.akephalos/projects.md`, and `.akephalos/memories.jsonl`. Do not read outside this folder. Summarize what this fictional passport says. Then append one fictional memory by running `node ../akephalos/dist/index.js add-memory "Fictional Codex CLI smoke test memory."` and run `node ../akephalos/dist/index.js scan`. Report exactly what changed.
```

Useful observations:

- Did Codex CLI stay inside the disposable workspace?
- Did it read the markdown/JSONL files as normal local files?
- Did it use the CLI to append a fictional memory instead of hand-editing private data?
- Did `scan` remain clean?
- Did any permission/sandbox boundary block the flow?

## 4. Optional MCP note

Codex CLI local-file behavior is the primary target for [issue #14](https://github.com/sunnja69/akephalos/issues/14). If your Codex environment also supports MCP stdio clients, use [MCP Client Config Snippets](MCP_CLIENT_SNIPPETS.md) and [MCP Client Smoke-Test Worksheet](MCP_CLIENT_SMOKE_WORKSHEET.md), but keep that as a separate report so the claim stays narrow.

## 5. Report format

Post a sanitized report in [issue #14](https://github.com/sunnja69/akephalos/issues/14) with:

- OS, shell/terminal, Node version, npm version
- Codex CLI version or commit if visible
- Akephalos commit tested
- exact prompt shape used, with private paths and account details redacted
- whether Codex CLI read the disposable `.akephalos` files
- whether `add-memory` worked through the CLI
- whether the final `scan` passed
- any sandbox, working-directory, permission, or path issues

Do not paste real memories, tokens, auth config, private repo names, hostnames, local usernames, screenshots with accounts/chats, or machine-specific private paths. Mark the result `configured` until a real Codex CLI run verifies the read/update path. Do not imply hosted sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, npm package availability, or production maturity.

## Copy-paste report skeleton

```md
## Codex CLI compatibility smoke report

- Status: configured / known-working / blocked
- Date tested:
- Akephalos commit tested:
- OS and shell/terminal:
- Node/npm versions:
- Codex CLI version or commit, if visible:
- Workspace shape: disposable local folder / other (describe without private paths)

### What I asked Codex CLI to do

Paste or summarize the prompt, with account names, private paths, project names, tokens, and real memories removed.

### What worked

- [ ] Codex CLI read `.akephalos/akephalos.md`
- [ ] Codex CLI read `.akephalos/rules.md`
- [ ] Codex CLI read `.akephalos/tools.md`
- [ ] Codex CLI read `.akephalos/projects.md`
- [ ] Codex CLI read `.akephalos/memories.jsonl`
- [ ] `node ../akephalos/dist/index.js add-memory "Fictional Codex CLI smoke test memory."` worked
- [ ] `node ../akephalos/dist/index.js scan` passed after the update

### Friction or blockers

Note any sandbox, working-directory, permission, path, quoting, or CLI-invocation issue. Keep local paths redacted, for example `/home/<user>/...` or `C:\\Users\\<user>\\...`.

### Claim boundary

This report covers only Akephalos v0.1 / early MVP from a source checkout with a disposable local `.akephalos` passport. It does not claim npm package availability, hosted sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, or production maturity.
```
