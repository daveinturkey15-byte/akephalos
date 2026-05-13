# Contributing Notes

Thanks for testing Akephalos. The project is intentionally small: a local folder, markdown files, append-only JSONL ledgers, a TypeScript CLI, and optional MCP.

## Good Contributions

- Clear bug reports with command output.
- Small documentation fixes.
- Harness test results.
- Focused tests for CLI behavior.
- Compatibility notes for Windows, macOS, and Linux.
- Simple safety improvements that keep the project local-first.

## Avoid

- Adding a database.
- Adding a web dashboard.
- Adding hosted accounts.
- Adding OAuth.
- Adding cloud sync as a service.
- Adding vector search.
- Adding blockchain.
- Storing secrets in examples, tests, docs, or memories.

## Adding A Harness Test Result

1. Test with a fictional or non-sensitive passport.
2. Run:

```sh
akephalos doctor
akephalos scan
akephalos sync-status
```

3. Add or update the harness entry:

```sh
akephalos harness add "Harness Name"
akephalos harness mark "Harness Name" --status configured
```

4. Update `docs/KNOWN_WORKING_AGENTS.md`.
5. Include:

- agent/harness name
- operating system
- install method
- MCP support
- sync support
- status
- caveats

Use `known-working` only after a real read, memory append, sync, and pull-back test succeeds.

## Status Meanings

- `unknown`: not tested
- `detected`: local files or settings were found
- `configured`: setup steps completed, but end-to-end behavior is not fully proven
- `known-working`: read, memory append, sync, and pull-back were tested
- `broken`: currently known not to work
- `unsupported`: not expected to work with current Akephalos features

## Safety Rules

- Do not include real user data in issues, docs, examples, or tests.
- Do not paste API keys, tokens, passwords, private keys, or local auth paths.
- Use placeholders clearly marked as examples.
- Run `akephalos scan` before sharing exports or demo bundles.
- Keep changes small and easy to review.
