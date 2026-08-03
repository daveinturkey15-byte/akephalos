# Agent Prompt Packs

Akephalos v0.1 is an early, local-first MVP. These prompts help contributors test whether a local coding agent can read and update a disposable `.akephalos` passport through normal files and the local CLI.

Use these prompts only in a scratch checkout with fictional data. Do not point an agent at your real passport, private repository, auth config, tokens, hostnames, local usernames, or real memories when preparing a public report.

These prompts do **not** claim hosted sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, npm availability, or production maturity. They only test local-file read/update behaviour from a source checkout.

## Before you prompt the agent

Create a disposable test bundle first:

```sh
git clone https://github.com/sunnja69/akephalos.git
cd akephalos
npm ci
npm test
npm run build

mkdir ../akephalos-agent-prompt-smoke
cd ../akephalos-agent-prompt-smoke
node ../akephalos/dist/index.js init
node ../akephalos/dist/index.js import-harness "Local coding agent" --tool "terminal" --tool "git" --preference "Use disposable public test data only."
node ../akephalos/dist/index.js add-memory "Demo user prefers small markdown-first tools."
node ../akephalos/dist/index.js scan
```

Record your OS, shell, Node/npm versions, Akephalos commit, and whether the build/test/setup commands passed.

## Prompt 1: read-only context check

Use this first to verify the agent can inspect only the disposable passport files:

```txt
You are testing Akephalos v0.1 with disposable data only.

Please read only these files in this scratch directory:

- .akephalos/akephalos.md
- .akephalos/rules.md
- .akephalos/tools.md
- .akephalos/projects.md
- .akephalos/memories.jsonl

Do not read parent directories, home directories, auth config, Git credentials, private repos, or any files outside this disposable test folder.

Summarize the fictional user preferences, project context, tool notes, and memories you found. Then say whether anything looked like a secret or real private data.
```

Good result: the agent summarizes only the fictional bundle and does not wander into unrelated files.

## Prompt 2: append one fictional memory

Use this only after the read-only prompt behaved safely:

```txt
Now append one fictional, non-secret memory to the disposable Akephalos bundle by running:

node ../akephalos/dist/index.js add-memory "Demo user confirmed this agent can read and update a disposable .akephalos bundle."

Then run:

node ../akephalos/dist/index.js scan
node ../akephalos/dist/index.js print memories

Report whether the append command succeeded and whether scan stayed clean. Do not paste private paths, usernames, hostnames, tokens, auth config, or real memories.
```

Good result: the agent runs the CLI append, `scan` reports no warnings/failures, and the output contains only fictional memory text.

## Prompt 3: tiny task with before/after memory

This checks whether the agent can use the passport as pre-task context and append a harmless after-task note:

```txt
Use the disposable .akephalos files as local context for one tiny task: write a three-bullet summary of what Akephalos v0.1 is and is not.

Stay within the scratch folder. Do not read private files. Keep claims conservative: local-first, markdown-first, source-checkout v0.1; no hosted sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, npm availability, or production maturity.

After the summary, append this fictional memory with the local CLI:

node ../akephalos/dist/index.js add-memory "Demo user completed a tiny agent-context task with Akephalos disposable data."

Then run node ../akephalos/dist/index.js scan and report the result.
```

Good result: the agent uses the disposable context for a small task and appends a fictional after-task memory without broad product claims.

## Public report checklist

When reporting results on GitHub, include:

- Agent/client name and version if visible.
- OS, shell, Node version, and Akephalos commit tested.
- Which prompt(s) you ran.
- Whether the agent stayed inside the disposable folder.
- Whether the CLI append succeeded.
- Whether `scan` stayed clean.
- Any permission prompts, path issues, or confusing docs.

Use `known-working` only for the exact local read/update path you verified. If you only prepared config or prompts but did not run them, mark the result as `configured` or `unknown`.
