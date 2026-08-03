# Starter Passport Example

This folder is a public-safe, fictional `.akephalos` starter shape for people who want to see what a tiny local passport might contain before creating their own.

It is **not** a real user's memory bundle. Do not copy secrets, tokens, auth paths, private project names, or personal memories into public examples.

## What to copy

Copy the example files into a throwaway `.akephalos` folder only if you want a disposable demo to inspect with Akephalos:

```sh
mkdir akephalos-starter-demo
cd akephalos-starter-demo
mkdir .akephalos
cp ../akephalos/examples/starter-passport/akephalos.md .akephalos/akephalos.md
cp ../akephalos/examples/starter-passport/rules.md .akephalos/rules.md
cp ../akephalos/examples/starter-passport/tools.md .akephalos/tools.md
cp ../akephalos/examples/starter-passport/projects.md .akephalos/projects.md
cp ../akephalos/examples/starter-passport/memories.jsonl .akephalos/memories.jsonl
node ../akephalos/dist/index.js scan
node ../akephalos/dist/index.js print identity
node ../akephalos/dist/index.js print rules
node ../akephalos/dist/index.js print memories
```

For normal use, prefer `node dist/index.js init` so Akephalos creates the full current bundle layout, including `manifest.json`, `events.jsonl`, and `harnesses.json` as needed.

## Guardrails

Akephalos `v0.1` is an early local-first/source-checkout MVP. This example only shows plain markdown/JSONL files. It does not imply hosted cloud sync, automatic realtime sync, OAuth, dashboards, vector databases, blockchain, npm availability, or production maturity.
