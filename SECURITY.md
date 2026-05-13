# Security Notes

Akephalos is a local-first identity and memory bundle. It may contain sensitive personal context. Treat it carefully.

## MVP security rules

1. Do not store raw API keys, passwords, tokens, private keys, or session cookies.
2. Store references to secrets instead, such as environment variable names.
3. Imported markdown should be treated as untrusted text.
4. The CLI should not execute commands from the profile.
5. The MCP server should expose read-only resources by default.
6. Write operations should append to JSONL ledgers rather than rewriting major files.
7. Destructive operations should require explicit user confirmation in future versions.

## Secret examples

Bad:

```md
OpenAI key: sk-abc123
```

Good:

```md
OpenAI key: configured via OPENAI_API_KEY in the local environment.
```

## MCP caution

The MCP layer should be implemented carefully. The first version should use a narrow, explicit set of tools:

- get_status
- add_memory
- compact_profile, optional

Do not expose arbitrary file reads, shell commands, or unrestricted write access.
