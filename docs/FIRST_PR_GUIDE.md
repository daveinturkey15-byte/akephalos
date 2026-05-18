# First PR Guide

Akephalos `v0.1` is intentionally small. A useful first PR should be boring, factual, and easy for another adopter to verify.

Use this guide when you want to turn a quick trial into a tiny contribution.

## Pick one small shape

Choose exactly one:

1. **Compatibility report** — you tried the CLI or MCP server on a specific OS/client and can say what passed or failed.
2. **Docs/example fix** — you found a confusing line, missing command, stale transcript, or screenshot gap.
3. **Small test** — you found a narrow behavior that needs a regression test.

If you are unsure, open a compatibility report issue first. A real smoke test is more useful than a broad integration claim.

## Safe source-checkout setup

```sh
git clone https://github.com/sunnja69/akephalos.git
cd akephalos
npm ci
npm test
```

For docs-only edits, `npm test` is still preferred because it builds the TypeScript and catches obvious drift. If you skip it, say exactly why in the PR.

## Use disposable data only

Good public demo data:

```sh
mkdir ../akephalos-demo-passport
cd ../akephalos-demo-passport
node ../akephalos/dist/index.js init
node ../akephalos/dist/index.js add-memory "Demo user prefers local-first markdown tools and short examples."
node ../akephalos/dist/index.js scan
```

Do not paste real memories, tokens, API keys, private repo names, hostnames, local usernames, auth config, private paths, or screenshots that reveal personal data.

## Compatibility report PR

Good report files live under `examples/compatibility-reports/` and should include:

- OS, shell, Node version, and install method.
- Exact client or agent tested, if any.
- Commands or sanitized config shape.
- What passed, failed, or remained untested.
- Clear caveats: `known-working`, `configured`, `unknown`, or `broken` only when supported by the test.

Start from the examples index: [`examples/compatibility-reports/README.md`](../examples/compatibility-reports/README.md).

## Docs/example PR

Good docs/example PRs are tiny:

- Fix one confusing step in the 5-minute trial guide.
- Improve one terminal transcript using fictional data.
- Add one public-safe screenshot/GIF set.
- Clarify one MCP client snippet without claiming it is verified unless you tested it.

## PR description template

```md
## What changed
- 

## Why this helps adopters
- 

## Verification
- [ ] npm test
- [ ] checked docs/examples for private data
- [ ] compatibility status is factual and conservative

## Guardrails
This PR does not add or imply hosted sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, npm availability, or production maturity.
```

## After opening the PR

Link the relevant issue if one exists, then wait for maintainer feedback. Do not keep reposting the same report across issues; one focused report beats five noisy nudges.
