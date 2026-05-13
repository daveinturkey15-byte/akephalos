# Roadmap

Akephalos is MVP-stage software. The goal is a small, local-first passport that helps agents share durable context without becoming a hosted memory platform.

## Current MVP

- Markdown-first `.akephalos` bundle
- CLI commands for init, status, print, add-memory, compact, export, doctor, scan, sync, and pulse
- Append-only JSONL memories and events
- Lightweight harness registry
- Optional MCP stdio server
- Optional private Git sync controlled by the user

## Near-Term Goals

- Split private passport repo from public source repo.
- Add a public-safe `examples/demo-passport`.
- Test more harnesses with real users:
  - Hermes
  - Claude Code
  - OpenClaw
  - local agent runners
- Improve docs for first-time setup.
- Keep `akephalos scan` practical and low-noise.
- Publish a clean GitHub `v0.1.0` tag after the public repo is verified.

## Later Ideas

- Safer scheduled sync recipes for Windows, macOS, and Linux.
- Better import helpers for known harnesses where safe local patterns exist.
- Optional migration commands for old ledgers.
- More MCP resource/tool coverage if it stays local and auditable.
- Optional package-manager distribution after GitHub-first usage is proven.

## Non-Goals

Akephalos should not become:

- a hosted account system
- a dashboard
- a vector database
- an OAuth app
- a cloud sync service
- a blockchain project
- an agent runtime
- a secret manager

## Design Constraints

- Keep it local-first.
- Keep it markdown-first.
- Keep it dependency-light.
- Keep it understandable by a solo developer.
- Never store raw secrets.
- Prefer boring TypeScript and plain files over clever infrastructure.
