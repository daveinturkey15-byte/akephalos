# Known Working Agents

This matrix tracks agent and harness compatibility with the local Akephalos passport bundle.

Keep updates small and factual. Do not add secrets, local auth paths, or private machine details.

| Agent/harness | OS | Install method | MCP support | Sync support | Status | Caveats |
| --- | --- | --- | --- | --- | --- | --- |
| Codex | Windows | Local CLI from source/package | Yes | Yes | known-working | Reads the local bundle and can use Git sync through `.akephalos`. |
| Cursor | Windows | Local CLI from source/package | Yes | Yes | known-working | Cursor may need its MCP config reloaded before it sees resources. |
| Pi IDE | Pi/Linux | Local CLI from source/package | Not confirmed | Yes | known-working | Scheduled sync has been tested at a 15-minute interval with a private passport. |
| Hermes | TBD | Manual CLI setup; see [Hermes integration](integrations/hermes.md) | TBD | TBD | unknown | Next harness test. Keep status below `known-working` until read, memory append, sync, and pull-back are confirmed. |
| Claude Code | TBD | TBD | TBD | TBD | unknown | Not tested yet. |
| OpenClaw | TBD | TBD | TBD | TBD | unknown | Not tested yet. |

## Updating The Matrix

Use a fictional or non-sensitive passport for public reports. Then add or update the structured entry:

```sh
akephalos harness add "Hermes"
akephalos harness mark "Hermes" --status configured
```

Update this markdown table with the OS, install method, MCP support, sync support, status, and caveats.

Run:

```sh
akephalos harness check
akephalos doctor
akephalos scan
akephalos sync-status
```

Use `known-working` only after the harness has completed a full read, memory append, sync, and pull-back check.

Valid statuses are:

- unknown
- detected
- configured
- known-working
- broken
- unsupported
