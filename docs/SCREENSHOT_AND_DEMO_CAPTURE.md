# Screenshot and Demo Capture Guide

Akephalos v0.1 needs tiny, public-safe screenshots/GIFs more than polished marketing. A good first contribution is a short visual proof that the source-checkout flow works on your machine or client, using only disposable `.akephalos` data.

Keep claims narrow: this guide is for source-checkout demos of the early MVP. Do not imply npm package availability, hosted cloud sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, or production maturity.

## What to capture

Pick one small path and stop there:

1. **Terminal source-checkout demo** — `npm ci`, `npm run build`, `init`, one fictional `add-memory`, `scan`, and `print memories`.
2. **MCP client setup screenshot** — the sanitized settings screen or config shape plus a short note about whether resources/tools appeared.
3. **Agent harness mini demo** — an agent reading the disposable markdown bundle and appending one fictional memory through the local CLI.

If you are not sure which path helps most, start with issue [#7](https://github.com/sunnja69/akephalos/issues/7) or [#10](https://github.com/sunnja69/akephalos/issues/10).

## Disposable terminal script

Run this inside a fresh public clone, not inside your real passport folder:

```sh
git clone https://github.com/sunnja69/akephalos.git
cd akephalos
npm ci
npm run build
mkdir -p /tmp/akephalos-demo
cd /tmp/akephalos-demo
node /path/to/akephalos/dist/index.js init
node /path/to/akephalos/dist/index.js add-memory "Demo memory: prefers small local-first tools."
node /path/to/akephalos/dist/index.js import-harness "Demo Agent" --tool "terminal" --preference "Keep demos fictional."
node /path/to/akephalos/dist/index.js scan
node /path/to/akephalos/dist/index.js print memories
```

Replace `/path/to/akephalos` with a redacted or generic path in anything you publish. If your terminal captures the real path, edit it to something like `/demo/akephalos` before opening a PR.

## Public-safety checklist

Before you attach an image, GIF, SVG, transcript, or report:

- Use a throwaway `.akephalos` folder, never your real passport.
- Use fictional memories and fictional project names.
- Redact local usernames, hostnames, private repo names, private paths, account names, tokens, API keys, auth config, and chat contents.
- Do not show browser profiles, app sidebars, account switchers, notification badges, or private tabs.
- Do not show real MCP config files if they contain secrets or private paths; rewrite them as sanitized snippets.
- Run `node dist/index.js scan` in the disposable demo folder and include the result if useful.
- Label the result as `known-working`, `configured`, `unknown`, or `broken` based only on what you actually tested.

## PR shape

A tiny PR is enough:

```md
## What changed

- Added one public-safe screenshot/GIF/transcript for <OS/client/path>.

## What I tested

- Akephalos commit:
- OS/client:
- Commands or client path:
- Result: known-working / configured / unknown / broken

## Safety check

- [ ] Used only disposable `.akephalos` data.
- [ ] Redacted private paths, usernames, hostnames, account names, tokens, and real memories.
- [ ] Did not imply hosted sync, OAuth, dashboard, vector DB, blockchain, npm package availability, or production maturity.
```

For a compatibility report instead of a visual asset, use [Compatibility Reports](COMPATIBILITY_REPORTS.md) or the [MCP Client Smoke-Test Worksheet](MCP_CLIENT_SMOKE_WORKSHEET.md).
