---
name: Compatibility report
description: Share a small Akephalos v0.1 source-checkout, OS, agent, or MCP client smoke report.
title: "Compatibility report: <OS / agent / MCP client>"
body:
  - type: markdown
    attributes:
      value: |
        Thanks for testing Akephalos v0.1. Small factual reports help new adopters more than broad integration claims.

        Use a disposable `.akephalos` passport and fictional memories only. Do not paste tokens, auth config, private repo names, hostnames, local usernames, real memories, or machine-specific private paths.
  - type: input
    id: os
    attributes:
      label: OS and version
      description: "Example: Windows 11, macOS 14, Ubuntu 24.04, WSL2 Ubuntu."
    validations:
      required: true
  - type: input
    id: shell
    attributes:
      label: Shell / terminal
      description: "Example: PowerShell 7, zsh, bash, Windows Terminal."
    validations:
      required: false
  - type: input
    id: node-version
    attributes:
      label: Node.js version
      description: "Paste the output of `node --version` if available."
    validations:
      required: false
  - type: input
    id: akephalos-version
    attributes:
      label: Akephalos version or commit
      description: "For v0.1, a source-checkout commit SHA is best."
      placeholder: "0.1.0 / commit <sha>"
    validations:
      required: false
  - type: input
    id: client
    attributes:
      label: Agent or MCP client tested, if any
      description: "Example: Claude Code, Codex CLI, Cursor, Claude Desktop, Cline, Roo Code, opencode, Hermes/OpenClaw, or none."
    validations:
      required: false
  - type: textarea
    id: commands
    attributes:
      label: Commands tried
      description: Paste a short sanitized command transcript.
      value: |
        ```sh
        git clone https://github.com/sunnja69/akephalos.git
        cd akephalos
        npm ci
        npm test
        node dist/index.js --help
        mkdir ../akephalos-demo
        cd ../akephalos-demo
        node ../akephalos/dist/index.js init
        node ../akephalos/dist/index.js add-memory "Demo user prefers local-first markdown tools."
        node ../akephalos/dist/index.js scan
        node ../akephalos/dist/index.js print memories
        ```
    validations:
      required: true
  - type: textarea
    id: result
    attributes:
      label: Result
      description: What worked, what broke, and what was confusing?
      value: |
        - Build/test result:
        - CLI quickstart result:
        - MCP result, if tested:
        - `scan` result:
        - Confusing docs or errors:
    validations:
      required: true
  - type: checkboxes
    id: safety
    attributes:
      label: Safety check
      options:
        - label: I used only fictional/demo memories and disposable `.akephalos` data.
          required: true
        - label: I removed private paths, hostnames, usernames, auth config, tokens, and private repo names.
          required: true
        - label: I am not claiming hosted cloud sync, realtime sync, OAuth, dashboards, vector DB, blockchain, npm availability, or production maturity.
          required: true
