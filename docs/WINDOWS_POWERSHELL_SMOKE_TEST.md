# Windows PowerShell Smoke Test

Akephalos v0.1 still needs a real Windows compatibility report. This page gives Windows testers a copy-paste starting point without claiming the path is already known-working.

Use a fresh public source checkout and fictional data only. Before posting results, remove private paths, usernames, hostnames, auth config, tokens, private repository names, and real memories.

## Prerequisites

- Windows 10/11.
- PowerShell.
- Git.
- Node.js/npm.

## Source-checkout commands

Run this from a disposable folder, not inside a private project:

```powershell
git clone https://github.com/sunnja69/akephalos.git
Set-Location akephalos
npm ci
npm test
node dist/index.js --help

New-Item -ItemType Directory -Force ..\akephalos-demo | Out-Null
Set-Location ..\akephalos-demo
node ..\akephalos\dist\index.js init
node ..\akephalos\dist\index.js add-memory "Demo user prefers local-first markdown tools and disposable test data."
node ..\akephalos\dist\index.js import-harness "Windows PowerShell smoke-test agent" --tool "PowerShell" --tool "git" --preference "Use fictional data for public reports."
node ..\akephalos\dist\index.js status
node ..\akephalos\dist\index.js scan
node ..\akephalos\dist\index.js print memories
```

## What to report

Post a compatibility report on [issue #9](https://github.com/sunnja69/akephalos/issues/9) or open the GitHub compatibility-report issue form with:

- Windows version.
- PowerShell version.
- Node version.
- Akephalos commit tested.
- Whether `npm ci`, `npm test`, `init`, `add-memory`, `import-harness`, `status`, `scan`, and `print memories` passed.
- Any exact error text, with private paths and usernames redacted.

## Safety and claims

- Use only a disposable `.akephalos` bundle and fictional memories.
- Do not paste private local paths, real user context, API keys, auth config, tokens, hostnames, or private repositories.
- Keep the result conservative: this page is a test recipe, not a claim that Windows PowerShell is already known-working.
- Do not imply hosted sync, automatic realtime sync, OAuth, dashboards, vector DB, blockchain, npm availability, or production maturity.
