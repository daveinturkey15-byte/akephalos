# Akephalos Project Brief

## Working name

**Akephalos** — from the idea of the “headless” system: a portable memory and identity layer that does not depend on one central agent, one company, or one hosted account.

## One-line pitch

Akephalos is a tiny open-source, markdown-first identity and context passport for AI agents.

## Problem

People are starting to use multiple AI agents and coding harnesses: Codex, Claude Code, Cursor, OpenClaw, Hermes, local agents, and future products. Each tool has its own memory, rules, preferences, and context. Moving between tools means re-explaining everything.

## User story

As a user, I want to give a new AI agent one local Akephalos bundle so it can understand my identity, preferences, active projects, tools, and important memories without me recreating everything manually.

## MVP solution

A local folder containing:

- a readable markdown profile
- append-only memory and event logs
- simple markdown files for rules, tools, and projects
- a manifest file
- a CLI for reading/writing/compacting/exporting
- a tiny MCP server to expose the bundle to compatible agents

## Target users

- developers using multiple coding agents
- power users migrating between AI assistants
- people who want local-first AI memory
- open-source agent builders
- users who dislike hosted memory platforms

## Design stance

Akephalos should feel more like Git, Obsidian, or a dotfiles repo than like a SaaS platform.

## MVP success criteria

The MVP is successful when:

1. `akephalos init` creates a clean `.akephalos` bundle.
2. A user can add memories through the CLI.
3. A user can read/export the bundle easily.
4. An MCP-compatible agent can call tools/resources to read identity, rules, projects, and memories.
5. The whole project remains dependency-light and easy to understand.
