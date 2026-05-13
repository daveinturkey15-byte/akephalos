# Release Checklist

Use this checklist before publishing a GitHub MVP release.

## Code

- Run `npm ci`.
- Run `npm run build`.
- Run `npm test`.
- Run `node dist/index.js --help`.
- Run `akephalos scan`.
- Confirm no new major architecture was added.
- Confirm dependencies remain minimal and justified.

## CLI Smoke Test

- Create a temporary directory.
- Run `akephalos init`.
- Run `akephalos status`.
- Run `akephalos add-memory "Release smoke test memory."`.
- Run `akephalos import-harness "Release Harness" --tool "terminal" --preference "Prefer small diffs"`.
- Run `akephalos pulse`.
- Run `akephalos sync --pull-only` in a cloned test passport repo.
- Run `akephalos print memories`.
- Run `akephalos compact`.
- Run `akephalos export`.
- Confirm `.akephalos/exports/` contains a complete snapshot.

## Security

- Confirm secret-like memory text is refused.
- Confirm export and sync are blocked when `akephalos scan` finds fail-level secrets.
- Confirm MCP exposes only fixed Akephalos resources.
- Confirm MCP `add_memory` appends only to `memories.jsonl`.
- Confirm no command exposes shell execution.
- Confirm no command reads arbitrary user-provided file paths.

## Repository Metadata

- Check `package.json` name, version, license, `bin`, and `files`.
- Check `package-lock.json` is current.
- Confirm README quickstart matches the current CLI.
- Confirm public docs are present in the repository.

## Non-Goals

Do not add these for the MVP release:

- database
- dashboard
- OAuth
- cloud sync
- vector search
- hosted service
- agent runtime
