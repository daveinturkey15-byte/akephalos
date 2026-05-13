# Contributing

Akephalos is a small, local-first, markdown-first identity and memory passport for AI agents.

Good contributions are small, readable, and easy to test.

## Before Opening A PR

Run:

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

Harness compatibility notes belong in `docs/KNOWN_WORKING_AGENTS.md`.

Use `known-working` only after a real read, memory append, sync, and pull-back check succeeds with a non-sensitive test passport.
