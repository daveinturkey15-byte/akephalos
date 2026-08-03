# Adopter FAQ

Akephalos `v0.1` is an early local-first MVP. This page is for people deciding whether it is worth a quick source-checkout trial.

## What can I safely try today?

Use Akephalos as a plain local `.akephalos` passport:

1. Clone the repo and build it from source.
2. Create a disposable `.akephalos` folder with `init`.
3. Add fictional memories with `add-memory`.
4. Inspect Markdown/JSONL files directly or with `print`, `status`, and `scan`.
5. Optionally start the MCP stdio server from the local checkout and test it with one client.

Start with [Try Akephalos in 5 Minutes](TRY_IN_5_MINUTES.md). If you already use coding agents, use the [Agent Harness Smoke Test](AGENT_HARNESS_SMOKE_TEST.md). If you use MCP clients, use [MCP Client Config Snippets](MCP_CLIENT_SNIPPETS.md) as conservative setup shapes.

## What is not ready or not claimed?

Akephalos does **not** currently claim:

- hosted cloud sync
- automatic realtime sync
- OAuth or hosted accounts
- dashboards
- vector databases
- blockchain
- npm package availability
- production maturity
- universal compatibility with every agent/client

Private Git sync is an optional user-controlled pattern for plain files, not a hosted Akephalos service.

## Should I use real personal memories?

Not for public testing. Use fictional or disposable data until you are comfortable with the local file shape and privacy model.

Never paste tokens, API keys, auth config, private repo names, local usernames, hostnames, private paths, screenshots with personal data, or real memories into public issues or PRs.

## How does this help if my agent has its own memory?

Akephalos is meant to be a portable bootstrap layer, not a replacement for every agent's native memory. A useful pattern is:

- Put durable preferences, rules, tool notes, project context, and non-secret memories in `.akephalos`.
- Let each agent read that folder before work starts.
- Append small, durable, non-secret memories back to `memories.jsonl` when something should travel to the next tool or machine.

Because the files are Markdown and JSONL, you can inspect and edit them without trusting a hosted memory product.

## Which trial should I run?

| If you have... | Start here | Best public follow-up |
|---|---|---|
| 5 minutes on any OS | [Try Akephalos in 5 Minutes](TRY_IN_5_MINUTES.md) | Open a sanitized compatibility report. |
| Windows PowerShell | [Windows PowerShell Smoke Test](WINDOWS_POWERSHELL_SMOKE_TEST.md) | Reply to issue [#9](https://github.com/sunnja69/akephalos/issues/9). |
| Linux/WSL | [WSL source-checkout report](../examples/compatibility-reports/linux-wsl-source-checkout-2026-05-18.md) | Add a non-WSL Linux or fresh WSL report to issue [#2](https://github.com/sunnja69/akephalos/issues/2). |
| MCP client | [MCP Client Config Snippets](MCP_CLIENT_SNIPPETS.md) | Use issues [#13](https://github.com/sunnja69/akephalos/issues/13), [#15](https://github.com/sunnja69/akephalos/issues/15), [#16](https://github.com/sunnja69/akephalos/issues/16), or [#17](https://github.com/sunnja69/akephalos/issues/17). |
| Local coding-agent harness | [Agent Harness Smoke Test](AGENT_HARNESS_SMOKE_TEST.md) | Use issues [#3](https://github.com/sunnja69/akephalos/issues/3), [#4](https://github.com/sunnja69/akephalos/issues/4), or [#5](https://github.com/sunnja69/akephalos/issues/5). |
| A tiny docs/example fix | [First PR Guide](FIRST_PR_GUIDE.md) | Open a small PR with verification and guardrails. |

## What makes a useful compatibility report?

A useful report is narrow and reproducible:

- OS, shell, Node version, and Akephalos commit tested.
- Install method: source checkout from the public repo.
- Exact commands or sanitized MCP/client config shape.
- What passed, failed, or remained untested.
- `scan` result before sharing.
- Confirmation that the report uses only disposable data and does not overclaim maturity.

Use [Compatibility Reports](COMPATIBILITY_REPORTS.md) for the full template.
