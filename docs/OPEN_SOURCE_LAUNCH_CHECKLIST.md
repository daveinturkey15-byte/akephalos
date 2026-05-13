# Open Source Launch Checklist

Use this before sharing Akephalos publicly.

## Repository Split

- [ ] Keep the current private passport repository private.
- [ ] Create a separate public source repository.
- [ ] Copy only source, tests, public-safe docs, and package metadata.
- [ ] Do not copy private `.akephalos` history.
- [ ] Do not copy private memories or events.
- [ ] Do not copy package tarballs from private testing.
- [ ] Do not copy machine-specific paths.

## Public Repo Contents

- [ ] `src/`
- [ ] `test/`
- [ ] `docs/`
- [ ] `examples/demo-passport/.akephalos/`
- [ ] `README.md`
- [ ] `package.json`
- [ ] `package-lock.json`
- [ ] `tsconfig.json`
- [ ] `LICENSE`
- [ ] `AGENTS.md`

## Public-Safe Demo

- [ ] Demo identity is fictional.
- [ ] Demo preferences are fictional.
- [ ] Demo projects are fictional.
- [ ] Demo tools are generic.
- [ ] Demo memories are synthetic.
- [ ] Demo events are synthetic.
- [ ] Demo harnesses are fictional or clearly generic.
- [ ] No real user names, paths, tokens, emails, private URLs, or local machine details.

## Validation

- [ ] `npm install`
- [ ] `npm run build`
- [ ] `npm test`
- [ ] `node dist/index.js --help`
- [ ] `akephalos scan`
- [ ] `npm pack --dry-run`
- [ ] Inspect package contents manually.

## Docs

- [ ] README explains what Akephalos is.
- [ ] README explains what Akephalos is not.
- [ ] README says Akephalos is markdown-first and local-first.
- [ ] README says MCP is optional.
- [ ] README says private Git sync is optional.
- [ ] README says no hosted account is required.
- [ ] README says no vector database is required.
- [ ] README says no dashboard is required.
- [ ] README says no blockchain is involved.
- [ ] README says secrets must not be stored in memory.
- [ ] Contributor notes explain how to add harness test results.
- [ ] Known working agents matrix is current.

## Release

- [ ] Confirm package name and license.
- [ ] Tag `v0.1.0`.
- [ ] Optionally publish to npm.
- [ ] Keep the private passport repository private after launch.
