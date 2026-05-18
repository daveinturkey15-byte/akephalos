# Contributing

Akephalos is a small, local-first, markdown-first identity and memory passport for AI agents.

Good contributions are small, readable, and easy to test.

If you are choosing your first task, start with the [Contributor Task Picker](docs/CONTRIBUTOR_TASKS.md). It maps 5-minute source-checkout checks, agent/MCP reports, and docs/example improvements to open `good first issue` / `help wanted` items. If you are still deciding whether Akephalos fits your setup, skim the [Adopter FAQ](docs/ADOPTER_FAQ.md) for current v0.1 scope and non-goals. If you already know the tiny change you want to make, use the [First PR Guide](docs/FIRST_PR_GUIDE.md) to keep the report, docs fix, or test PR focused and public-safe.

## Before Opening A PR

1. Start with a small scope: one doc fix, one harness note, one focused test, or one narrow CLI behaviour change.
2. If you are reporting compatibility, use fictional/non-secret passport data and include your OS, Node version, command transcript, and whether `npm run build` / `npm test` passed. The [Compatibility Reports](docs/COMPATIBILITY_REPORTS.md) template shows the preferred shape, and the GitHub issue form will prompt for the same safety checks.
3. For docs/examples, prefer copy-pasteable commands and short terminal transcripts over broad claims.
4. Before opening the PR, run:

```sh
npm ci
npm run build
npm test
```

If your change touches examples or docs, also inspect them for private data.

## Safety Rules

- Do not include real user memories, private events, tokens, passwords, API keys, private keys, auth paths, or machine-specific local paths.
- Use clearly fictional examples.
- Keep the project dependency-light.
- Do not add a database, dashboard, hosted account, OAuth flow, vector database, blockchain, or cloud service.

## Harness Results

Harness compatibility notes belong in `docs/KNOWN_WORKING_AGENTS.md` when the full harness path has really been verified. For a smaller first check, use the [Client Status Matrix](docs/CLIENT_STATUS_MATRIX.md) to find an unverified client path, then follow the [Agent Harness Smoke Test](docs/AGENT_HARNESS_SMOKE_TEST.md), the [Platform and Agent Smoke-Test Recipes](docs/PLATFORM_AGENT_SMOKE_RECIPES.md), or the copy-paste [Agent Prompt Packs](docs/AGENT_PROMPT_PACKS.md) and submit a compatibility report instead of broadening the matrix too early.

Use `known-working` only after a real read, memory append, sync, and pull-back check succeeds with a non-sensitive test passport.

For lighter OS/client smoke tests that do not prove full harness sync, use a compatibility report instead of upgrading the matrix status.

## Issue and PR Templates

- Use the GitHub compatibility-report issue form for OS, source-checkout, agent, or MCP client smoke tests; use the docs/example issue form for small wording, transcript, screenshot, or starter-passport improvements.
- Keep PR descriptions small and factual: what changed, why it helps v0.1 adopters, and how you verified it.
- If you did not run the full test suite because the change is docs-only, say so explicitly and inspect the rendered Markdown/examples for private data.
- The [First PR Guide](docs/FIRST_PR_GUIDE.md) has a copy-pasteable PR description checklist for compatibility reports, docs/example fixes, and small tests.
