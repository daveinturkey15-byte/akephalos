# Public And Private Repositories

Akephalos separates reusable source code from personal passport data.

## Private Passport Repositories

Private passport repositories should stay private. They may contain:

- personal `akephalos.md`, `rules.md`, `tools.md`, and `projects.md`
- `memories.jsonl`
- `events.jsonl`
- private sync history
- personal harness notes
- local machine paths
- private Git remotes
- exported snapshots

Do not make a private passport repository public.

## Public Source Repository

The public source repository contains the reusable Akephalos package:

- TypeScript CLI source
- tests
- docs
- fictional examples
- package metadata
- GitHub Actions
- release checklist

It must not contain:

- real user memories
- real event ledgers
- private passport history
- private GitHub URLs
- auth references
- machine-specific paths
- API keys, tokens, passwords, or private keys

## Demo Passport

Public demos should use only fictional data. This repo includes:

```txt
examples/demo-passport/.akephalos/
```

Use that folder for screenshots, docs, and first-time testing. Do not replace it with a real passport.

## Before Release

Run:

```sh
npm install
npm run build
npm test
npm pack --dry-run
```

Then inspect the package contents and confirm the demo passport is synthetic.
