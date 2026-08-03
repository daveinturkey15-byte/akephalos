# Demo Transcript

This is a fictional, non-secret terminal transcript for a first Akephalos `v0.1` trial from a source checkout.

It is meant to show new users and contributors what a successful local-only run roughly looks like. Paths, user names, and memories are disposable examples.

```sh
$ git clone https://github.com/sunnja69/akephalos.git
$ cd akephalos
$ npm ci
$ npm run build
$ node dist/index.js --help
Akephalos

Usage:
  akephalos init
  akephalos status
  akephalos scan
  akephalos print <identity|rules|tools|projects|memories>
  akephalos add-memory "text"
  akephalos import-harness "Harness Name" [--tool name] [--preference text]
  akephalos pulse
  akephalos compact
  akephalos export
  akephalos mcp

$ mkdir ../akephalos-demo
$ cd ../akephalos-demo
$ node ../akephalos/dist/index.js init
Initialized .akephalos passport.

$ node ../akephalos/dist/index.js add-memory "Demo user prefers short CLI examples with no hidden network services."
Added memory.

$ node ../akephalos/dist/index.js import-harness "Demo Agent" --tool "terminal" --tool "git" --preference "Ask before changing public files."
Imported harness: Demo Agent

$ node ../akephalos/dist/index.js status
Akephalos passport: .akephalos
Status: ready

$ node ../akephalos/dist/index.js scan
No obvious secrets found.

$ node ../akephalos/dist/index.js print memories
- Demo user prefers short CLI examples with no hidden network services.
```

For public examples, do not paste real user memories, tokens, passwords, auth paths, private repository URLs, or machine-specific private paths.

For MCP setup, see [Local MCP Setup Notes](../docs/MCP_SETUP.md). For a fuller walkthrough, see [Try Akephalos in 5 Minutes](../docs/TRY_IN_5_MINUTES.md).
