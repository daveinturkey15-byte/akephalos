# Platform and Agent Smoke-Test Recipes

Akephalos v0.1 needs small, repeatable field reports more than broad compatibility claims. This page gives copy-paste starting points for contributors who can test macOS, Claude Code, Codex CLI, OpenClaw, or another local coding-agent harness.

These recipes are intentionally conservative:

- Use a source checkout from `https://github.com/sunnja69/akephalos`.
- Use a disposable `.akephalos` bundle only.
- Report exact OS, shell, Node version, Akephalos commit, commands tried, and results.
- Redact local usernames, hostnames, private repo names, auth paths, tokens, and real memories before posting.
- Do not claim hosted sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, npm availability, or production maturity.

If you verify one of these paths, post a sanitized report on the matching GitHub issue and link the exact commit you tested.

## macOS Terminal source-checkout smoke test

Issue: [Test Akephalos on macOS](https://github.com/sunnja69/akephalos/issues/1)

This checks whether the early CLI works from a public clone on macOS. It does not prove any external agent integration.

```sh
node -v
npm -v
git clone https://github.com/sunnja69/akephalos.git
cd akephalos
npm ci
npm test
npm run build
node dist/index.js --help

mkdir ../akephalos-macos-smoke
cd ../akephalos-macos-smoke
node ../akephalos/dist/index.js init
node ../akephalos/dist/index.js add-memory "Demo user prefers local-first markdown tools."
node ../akephalos/dist/index.js import-harness "macOS Terminal" --tool "zsh" --tool "git" --preference "Use disposable public test data."
node ../akephalos/dist/index.js status
node ../akephalos/dist/index.js scan
node ../akephalos/dist/index.js print identity
node ../akephalos/dist/index.js print tools
node ../akephalos/dist/index.js print memories
```

Useful report fields:

- macOS version:
- Shell: Terminal/zsh, iTerm, or other:
- Node/npm versions:
- Akephalos commit tested:
- Did `npm ci`, `npm test`, and `npm run build` pass?
- Did `init`, `add-memory`, `import-harness`, `status`, `scan`, and `print` pass?
- Did `scan` report any warnings or failures?
- Anything confusing in the README or quickstart?

## Claude Code or Codex CLI local-file smoke test

Issues:

- [Test Akephalos with Claude Code](https://github.com/sunnja69/akephalos/issues/3)
- [Add a Codex CLI compatibility smoke report](https://github.com/sunnja69/akephalos/issues/14)

This checks whether a local coding agent can read and update a disposable `.akephalos` folder through normal files and CLI commands. It is not a full sync or product certification.

For copy-paste prompts that make the read-only check, fictional memory append, and tiny before/after task easier to reproduce, see [Agent Prompt Packs](AGENT_PROMPT_PACKS.md).

1. Run the source-checkout steps from the macOS/Linux/Windows recipe for your platform.
2. Create a disposable bundle in a scratch folder:

   ```sh
   mkdir ../akephalos-agent-smoke
   cd ../akephalos-agent-smoke
   node ../akephalos/dist/index.js init
   node ../akephalos/dist/index.js import-harness "Claude Code or Codex CLI" --tool "terminal" --tool "git" --preference "Use disposable public test data."
   node ../akephalos/dist/index.js add-memory "Demo user wants concise compatibility reports."
   node ../akephalos/dist/index.js scan
   ```

3. Ask the agent to read only these disposable files before a tiny task:

   ```txt
   Read .akephalos/akephalos.md, .akephalos/rules.md, .akephalos/tools.md, .akephalos/projects.md, and .akephalos/memories.jsonl. Summarize the fictional preferences and do not read any other private files.
   ```

4. Ask it to append one fictional memory through the CLI:

   ```txt
   Run `node ../akephalos/dist/index.js add-memory "Demo user confirmed this agent can read a disposable .akephalos bundle."` and then run `node ../akephalos/dist/index.js scan`.
   ```

Useful report fields:

- Agent/client name and version if visible:
- OS/shell/Node version:
- Akephalos commit tested:
- Could the agent summarize only the disposable files?
- Could it run the CLI append command?
- Did `scan` stay clean?
- Any permission prompts, path issues, or confusing docs?

## OpenClaw or Hermes-style harness smoke test

Issues:

- [Test Akephalos with OpenClaw](https://github.com/sunnja69/akephalos/issues/5)
- [Test Akephalos with Hermes](https://github.com/sunnja69/akephalos/issues/4)

Start with [Agent Harness Smoke Test](AGENT_HARNESS_SMOKE_TEST.md) if you want the longer recipe. The shortest useful report is:

```sh
git clone https://github.com/sunnja69/akephalos.git
cd akephalos
npm ci
npm test
npm run build

mkdir ../akephalos-openclaw-smoke
cd ../akephalos-openclaw-smoke
node ../akephalos/dist/index.js init
node ../akephalos/dist/index.js import-harness "OpenClaw or Hermes" --tool "terminal" --tool "git" --preference "Read local markdown before work."
node ../akephalos/dist/index.js add-memory "Demo user wants agent harnesses to append non-secret memories after tasks."
node ../akephalos/dist/index.js harness list
node ../akephalos/dist/index.js harness check
node ../akephalos/dist/index.js status
node ../akephalos/dist/index.js scan
node ../akephalos/dist/index.js print identity
node ../akephalos/dist/index.js print memories
```

Then, inside the harness, test only a tiny disposable workflow:

1. Read `.akephalos/akephalos.md`, `rules.md`, `tools.md`, `projects.md`, and `memories.jsonl`.
2. Perform a harmless local summary task.
3. Append one fictional memory through the CLI or by a sanitized report of the exact manual step used.
4. Run `scan` again.

Report it as a narrow harness smoke test unless you also verified real sync/pull-back behaviour. Use `known-working` only after read, append, sync, and pull-back are all confirmed with disposable data.

## Posting checklist

Before sharing output publicly:

- [ ] Replace local usernames and private paths with placeholders such as `<repo>` or `<scratch-dir>`.
- [ ] Remove tokens, auth config, hostnames, private repo names, and real memories.
- [ ] Say whether the result is `passed`, `configured`, `unknown`, or `broken`.
- [ ] Keep claims to Akephalos v0.1 / early MVP.
- [ ] Link the matching issue and the Akephalos commit tested.
