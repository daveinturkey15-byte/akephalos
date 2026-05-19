#!/usr/bin/env node

import {
  mkdirSync,
  writeFileSync,
  existsSync,
  statSync,
  appendFileSync,
  readFileSync,
  copyFileSync,
  readdirSync,
} from "fs";
import { join } from "path";
import { spawnSync } from "child_process";
import { createHash } from "crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const version = "0.1.0";

const help = `Akephalos ${version}

A tiny markdown-first identity and memory passport for AI agents.
Stores local files in .akephalos/ under the current working directory.

Usage:
  akephalos <command> [options]

Commands:
  init                         Create a .akephalos passport bundle
  status [--json]              Show bundle status and memory count
  doctor [--json]              Run a non-destructive passport health check
  scan [--json]                Scan the passport for likely secrets and privacy leaks
  merge-ledgers                Resolve JSONL ledger conflict markers safely
  print <target>               Print identity, rules, tools, projects, or memories
  add-memory "text"            Append a non-secret durable memory
  import-harness <name>        Import a harness profile into Akephalos
  harness <action>             List, add, mark, or check harness registry entries
  pulse                        Show a weekly passport digest
  sync-status                  Show read-only Git and ledger sync health
  sync                         Commit, pull, and push the .akephalos git repo
  compact                      Compile memories into akephalos.md
  export                       Create a portable snapshot in .akephalos/exports
  mcp                          Start a local MCP stdio server
  help                         Show this help output

Print targets:
  identity, rules, tools, projects, memories

Options:
  --force                      Overwrite generated files during init
  -h, --help                   Show this help output
  -v, --version                Show the CLI version

Examples:
  akephalos init
  akephalos doctor
  akephalos doctor --json
  akephalos scan
  akephalos scan --json
  akephalos merge-ledgers
  akephalos add-memory "User prefers small dependency-light CLI changes"
  akephalos import-harness "Pi IDE" --tool "terminal" --preference "Use small changes"
  akephalos import-harness --auto
  akephalos harness list
  akephalos harness add "Hermes"
  akephalos harness mark "Hermes" --status configured
  akephalos harness check
  akephalos pulse
  akephalos sync-status
  akephalos sync
  akephalos print memories
  akephalos compact

Security:
  Akephalos refuses memory text that looks like an API key, token, password, or private key.
`;

type InitResult = {
  created: string[];
  skipped: string[];
};

type JsonlParseResult = {
  entries: unknown[];
  warnings: string[];
};

type StatusFileCheck = {
  path: string;
  state: "ok" | "missing" | "not directory" | "not file";
};

type StatusResult = {
  ok: boolean;
  bundle: {
    path: string;
    exists: boolean;
    manifestVersion: string | null;
  };
  files: StatusFileCheck[];
  memoryCount: number;
  warnings: string[];
};

type PrintTarget = "identity" | "rules" | "tools" | "projects" | "memories";
type McpResourceTarget = "identity" | "rules" | "tools" | "projects";

type HarnessImport = {
  name: string;
  tools: string[];
  preferences: string[];
  notes: string[];
  source: "auto" | "manual";
};

type HarnessImportArgs = {
  auto: boolean;
  imports: HarnessImport[];
};

type HarnessStatus = "unknown" | "detected" | "configured" | "known-working" | "broken" | "unsupported";

type HarnessRegistryEntry = {
  name: string;
  status: HarnessStatus;
  mcp: boolean;
  sync: boolean;
  last_checked: string;
  source: "auto" | "manual";
  notes: string[];
};

type HarnessRegistryRead = {
  entries: HarnessRegistryEntry[];
  warnings: string[];
};

type GitCommandResult = {
  stdout: string;
  stderr: string;
  status: number | null;
};

type DoctorIssue = {
  message: string;
  nextAction?: string;
};

type DoctorResult = {
  pass: string[];
  warn: DoctorIssue[];
  fail: DoctorIssue[];
};

type LedgerFile = "memories.jsonl" | "events.jsonl";

type LedgerMergeRecord = {
  record: unknown;
  key: string;
};

type LedgerRejectedLine = {
  file: LedgerFile;
  line?: number;
  reason: string;
  text: string;
};

type LedgerMergeResult = {
  filesChanged: string[];
  recordsWritten: Record<LedgerFile, number>;
  rejected: LedgerRejectedLine[];
};

type SyncState = {
  branch: string;
  upstream: string;
  remote: string;
  latestCommit: string;
  dirty: string;
  ahead: number | undefined;
  behind: number | undefined;
  relation: string;
};

type ScanSeverity = "info" | "warn" | "fail";

type ScanIssue = {
  severity: ScanSeverity;
  file: string;
  line: number;
  kind: string;
  message: string;
  nextAction: string;
};

type ScanResult = {
  issues: ScanIssue[];
  scannedFiles: string[];
};

type ScanCounts = Record<ScanSeverity, number>;

type ScanReport = {
  version: string;
  bundle: string;
  ok: boolean;
  counts: ScanCounts;
  scannedFiles: string[];
  issues: ScanIssue[];
};

const bundleFiles = [
  "manifest.json",
  "akephalos.md",
  "rules.md",
  "tools.md",
  "projects.md",
  "harnesses.json",
  "memories.jsonl",
  "events.jsonl",
] as const;

const harnessStatuses: HarnessStatus[] = [
  "unknown",
  "detected",
  "configured",
  "known-working",
  "broken",
  "unsupported",
];

const statusEntries = [...bundleFiles, "exports/"] as const;
const exportFiles = [...bundleFiles] as const;

const printTargets: Record<Exclude<PrintTarget, "memories">, string> = {
  identity: "akephalos.md",
  rules: "rules.md",
  tools: "tools.md",
  projects: "projects.md",
};

const mcpResourceTargets: Record<McpResourceTarget, { file: string; mimeType: string; title: string }> = {
  identity: {
    file: "akephalos.md",
    mimeType: "text/markdown",
    title: "Akephalos identity",
  },
  rules: {
    file: "rules.md",
    mimeType: "text/markdown",
    title: "Akephalos rules",
  },
  tools: {
    file: "tools.md",
    mimeType: "text/markdown",
    title: "Akephalos tools",
  },
  projects: {
    file: "projects.md",
    mimeType: "text/markdown",
    title: "Akephalos projects",
  },
};

function printHelp(): void {
  process.stdout.write(help);
}

function bundleRoot(): string {
  return join(process.cwd(), ".akephalos");
}

function bundlePath(root: string, file: (typeof bundleFiles)[number]): string {
  return join(root, file);
}

function ensureDirectory(path: string): void {
  if (existsSync(path)) {
    if (!statSync(path).isDirectory()) {
      throw new Error(`${path} exists and is not a directory`);
    }
    return;
  }

  mkdirSync(path, { recursive: true });
}

function writeFileIfAllowed(
  path: string,
  contents: string,
  force: boolean,
  result: InitResult,
  label: string,
): void {
  if (existsSync(path) && !force) {
    result.skipped.push(label);
    return;
  }

  writeFileSync(path, contents, "utf8");
  result.created.push(label);
}

function jsonLine(value: unknown): string {
  return `${JSON.stringify(value)}\n`;
}

function recordId(time: string = new Date().toISOString()): string {
  const compactTime = time.replace(/[-:]/gu, "").replace(/\.\d{3}Z$/u, (match) => match.slice(1));
  const random = Math.random().toString(16).slice(2, 10).padEnd(8, "0");
  return `akp_${compactTime}_${random}`;
}

function appendEventRecord(root: string, event: Record<string, unknown> & { time?: string }): string {
  const time = event.time ?? new Date().toISOString();
  appendJsonLine(bundlePath(root, "events.jsonl"), {
    id: event.id ?? recordId(time),
    time,
    ...event,
  });
  return time;
}

function initBundle(force: boolean): InitResult {
  const root = bundleRoot();
  const exportsDir = join(root, "exports");
  const now = new Date().toISOString();
  const result: InitResult = {
    created: [],
    skipped: [],
  };

  ensureDirectory(root);
  ensureDirectory(exportsDir);

  const manifest = {
    name: "akephalos",
    version: 1,
    created_at: now,
    updated_at: now,
    description: "A markdown-first identity and memory passport for AI agents.",
    files: [...bundleFiles, "exports/"],
  };

  const files: Record<(typeof bundleFiles)[number], string> = {
    "manifest.json": `${JSON.stringify(manifest, null, 2)}\n`,
    "akephalos.md": `# Akephalos Passport

This folder is a small, markdown-first identity and memory passport for AI agents.

Use these files to describe stable identity, working rules, tools, projects, memories, and events.
`,
    "rules.md": `# Rules

- Keep entries clear and human-readable.
- Prefer markdown for durable context.
- Record structured events in events.jsonl.
`,
    "tools.md": `# Tools

List useful tools, commands, and access notes here.
`,
    "projects.md": `# Projects

List active projects and lightweight status notes here.
`,
    "harnesses.json": "[]\n",
    "memories.jsonl": "",
    "events.jsonl": "",
  };

  for (const file of bundleFiles) {
    writeFileIfAllowed(join(root, file), files[file], force, result, file);
  }

  const eventPath = join(root, "events.jsonl");

  if (existsSync(eventPath) && statSync(eventPath).isDirectory()) {
    throw new Error(`${eventPath} exists and is not a file`);
  }

  appendFileSync(
    eventPath,
    jsonLine({
      id: recordId(now),
      time: now,
      source: "cli",
      type: "init",
      timestamp: now,
      version,
      force,
    }),
    "utf8",
  );

  return result;
}

function readTextFile(path: string): string | undefined {
  if (!existsSync(path)) {
    process.stderr.write(`Missing file: ${path}\n`);
    process.exitCode = 1;
    return undefined;
  }

  if (!statSync(path).isFile()) {
    process.stderr.write(`Not a file: ${path}\n`);
    process.exitCode = 1;
    return undefined;
  }

  return readFileSync(path, "utf8");
}

function readOptionalTextFile(path: string): string | undefined {
  if (!existsSync(path) || !statSync(path).isFile()) {
    return undefined;
  }

  return readFileSync(path, "utf8");
}

function requireBundleRoot(): string | undefined {
  const root = bundleRoot();

  if (!existsSync(root)) {
    process.stderr.write(`Missing .akephalos bundle in ${process.cwd()}.\n`);
    process.stderr.write("Run `akephalos init` first.\n");
    process.exitCode = 1;
    return undefined;
  }

  if (!statSync(root).isDirectory()) {
    process.stderr.write(`.akephalos exists but is not a directory: ${root}\n`);
    process.exitCode = 1;
    return undefined;
  }

  return root;
}

function getBundleRootError(): string | undefined {
  const root = bundleRoot();

  if (!existsSync(root)) {
    return `Missing .akephalos bundle in ${process.cwd()}. Run \`akephalos init\` first.`;
  }

  if (!statSync(root).isDirectory()) {
    return `.akephalos exists but is not a directory: ${root}`;
  }

  return undefined;
}

function appendJsonLine(path: string, value: unknown): void {
  if (existsSync(path) && statSync(path).isDirectory()) {
    throw new Error(`${path} exists and is not a file`);
  }

  appendFileSync(path, jsonLine(value), "utf8");
}

function stableNormalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableNormalize);
  }

  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const normalized: Record<string, unknown> = {};

    for (const key of Object.keys(record).sort()) {
      normalized[key] = stableNormalize(record[key]);
    }

    return normalized;
  }

  return value;
}

function stableJson(value: unknown): string {
  return JSON.stringify(stableNormalize(value));
}

function stableHash(value: unknown): string {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

function portableTimestamp(time: Date): string {
  return time.toISOString().replace(/[:.]/gu, "-");
}

function createUniqueDirectory(parent: string, baseName: string): string {
  let candidate = join(parent, baseName);
  let suffix = 1;

  while (existsSync(candidate)) {
    candidate = join(parent, `${baseName}-${suffix}`);
    suffix += 1;
  }

  mkdirSync(candidate);
  return candidate;
}

function parseJsonlText(text: string, path: string): JsonlParseResult {
  const result: JsonlParseResult = {
    entries: [],
    warnings: [],
  };
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (!line.trim()) {
      return;
    }

    try {
      result.entries.push(JSON.parse(line));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.warnings.push(`${path}:${index + 1}: malformed JSONL entry (${message})`);
    }
  });

  return result;
}

function parseJsonlQuiet(path: string): JsonlParseResult {
  const text = readOptionalTextFile(path);

  if (text === undefined) {
    return {
      entries: [],
      warnings: [`Missing file: ${path}`],
    };
  }

  return parseJsonlText(text, path);
}

function parseJsonl(path: string): JsonlParseResult {
  const text = readTextFile(path);

  if (text === undefined) {
    return {
      entries: [],
      warnings: [],
    };
  }

  return parseJsonlText(text, path);
}

function printWarnings(warnings: string[]): void {
  for (const warning of warnings) {
    process.stderr.write(`Warning: ${warning}\n`);
  }
}

function readManifestVersion(root: string): string {
  const manifestPath = join(root, "manifest.json");

  if (!existsSync(manifestPath)) {
    return "missing";
  }

  if (!statSync(manifestPath).isFile()) {
    return "invalid: not a file";
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { version?: unknown };
    return manifest.version === undefined ? "missing version" : String(manifest.version);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `invalid JSON (${message})`;
  }
}

function updateManifestUpdatedAt(root: string, time: string): void {
  const manifestPath = join(root, "manifest.json");

  if (!existsSync(manifestPath)) {
    process.stderr.write("Warning: manifest.json is missing; updated_at was not changed.\n");
    return;
  }

  if (!statSync(manifestPath).isFile()) {
    process.stderr.write("Warning: manifest.json is not a file; updated_at was not changed.\n");
    return;
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, unknown>;
    manifest.updated_at = time;

    if ("updatedAt" in manifest) {
      manifest.updatedAt = time;
    }

    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Warning: manifest.json could not be updated (${message}).\n`);
  }
}

function formatStatusLine(root: string, entry: (typeof statusEntries)[number]): string {
  const path = join(root, entry);

  if (!existsSync(path)) {
    return `  [missing] ${entry}`;
  }

  if (entry.endsWith("/")) {
    return statSync(path).isDirectory() ? `  [ok] ${entry}` : `  [not directory] ${entry}`;
  }

  return statSync(path).isFile() ? `  [ok] ${entry}` : `  [not file] ${entry}`;
}

function getStatusFileCheck(root: string, entry: (typeof statusEntries)[number]): StatusFileCheck {
  const path = join(root, entry);

  if (!existsSync(path)) {
    return { path: entry, state: "missing" };
  }

  if (entry.endsWith("/")) {
    return { path: entry, state: statSync(path).isDirectory() ? "ok" : "not directory" };
  }

  return { path: entry, state: statSync(path).isFile() ? "ok" : "not file" };
}

function buildStatusResult(): StatusResult {
  const root = bundleRoot();
  const exists = existsSync(root) && statSync(root).isDirectory();

  if (!exists) {
    return {
      ok: false,
      bundle: {
        path: root,
        exists: false,
        manifestVersion: null,
      },
      files: [],
      memoryCount: 0,
      warnings: [],
    };
  }

  const files = statusEntries.map((entry) => getStatusFileCheck(root, entry));
  const memories = parseJsonlQuiet(join(root, "memories.jsonl"));
  const allFilesOk = files.every((file) => file.state === "ok");

  return {
    ok: allFilesOk && memories.warnings.length === 0,
    bundle: {
      path: root,
      exists: true,
      manifestVersion: readManifestVersion(root),
    },
    files,
    memoryCount: memories.entries.length,
    warnings: memories.warnings,
  };
}

function buildStatusText(): { text: string; warnings: string[] } {
  const status = buildStatusResult();
  const lines = ["Akephalos status", ""];

  lines.push(`Bundle: ${status.bundle.exists ? `found at ${status.bundle.path}` : "missing"}`);

  if (!status.bundle.exists) {
    lines.push("Run `akephalos init` to create a bundle.");
    return {
      text: `${lines.join("\n")}\n`,
      warnings: status.warnings,
    };
  }

  lines.push(`Manifest version: ${status.bundle.manifestVersion}`);
  lines.push("Files:");

  for (const entry of statusEntries) {
    lines.push(formatStatusLine(status.bundle.path, entry));
  }

  lines.push(`Memory count: ${status.memoryCount}`);

  return {
    text: `${lines.join("\n")}\n`,
    warnings: status.warnings,
  };
}

function printStatus(): void {
  const status = buildStatusText();

  process.stdout.write(status.text);
  printWarnings(status.warnings);
}

function printStatusJson(): void {
  process.stdout.write(`${JSON.stringify(buildStatusResult(), null, 2)}\n`);
}

function addDoctorPass(result: DoctorResult, message: string): void {
  result.pass.push(message);
}

function addDoctorWarn(result: DoctorResult, message: string, nextAction: string): void {
  result.warn.push({ message, nextAction });
}

function addDoctorFail(result: DoctorResult, message: string, nextAction: string): void {
  result.fail.push({ message, nextAction });
}

function fileExists(root: string, file: string): boolean {
  const path = join(root, file);
  return existsSync(path) && statSync(path).isFile();
}

function directoryExists(root: string, file: string): boolean {
  const path = join(root, file);
  return existsSync(path) && statSync(path).isDirectory();
}

function checkRequiredFile(result: DoctorResult, root: string, file: string): boolean {
  if (fileExists(root, file)) {
    addDoctorPass(result, `${file} exists`);
    return true;
  }

  addDoctorFail(result, `${file} is missing or is not a file`, `Restore ${file} or run akephalos init in a clean workspace.`);
  return false;
}

function checkManifest(result: DoctorResult, root: string): void {
  const manifestPath = join(root, "manifest.json");

  if (!checkRequiredFile(result, root, "manifest.json")) {
    return;
  }

  let manifest: Record<string, unknown>;

  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, unknown>;
    addDoctorPass(result, "manifest.json is valid JSON");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    addDoctorFail(result, `manifest.json is malformed JSON (${message})`, "Fix manifest.json so it parses as JSON.");
    return;
  }

  const requiredFields = ["name", "created_at", "updated_at", "files"];

  for (const field of requiredFields) {
    if (manifest[field] === undefined) {
      addDoctorFail(result, `manifest.json is missing ${field}`, `Add ${field} to manifest.json.`);
    } else {
      addDoctorPass(result, `manifest.json has ${field}`);
    }
  }

  if (manifest.version === undefined && manifest.schema_version === undefined) {
    addDoctorFail(
      result,
      "manifest.json is missing version or schema_version",
      "Add version or schema_version to manifest.json.",
    );
  } else {
    addDoctorPass(result, "manifest.json has version or schema_version");
  }

  if (!Array.isArray(manifest.files)) {
    addDoctorFail(result, "manifest.json files is not an array", "Set manifest.json files to an array of bundle file names.");
  }
}

function checkJsonlFile(result: DoctorResult, root: string, file: "memories.jsonl" | "events.jsonl"): void {
  const path = join(root, file);

  if (!checkRequiredFile(result, root, file)) {
    return;
  }

  const parsed = parseJsonlText(readFileSync(path, "utf8"), path);

  if (parsed.warnings.length === 0) {
    addDoctorPass(result, `${file} has valid JSONL`);
    return;
  }

  for (const warning of parsed.warnings) {
    addDoctorFail(result, warning, `Fix malformed JSON on the reported ${file} line.`);
  }
}

function checkConflictMarkers(result: DoctorResult, root: string): void {
  const markerPattern = /^(<<<<<<<|=======|>>>>>>>)($|\s)/mu;
  const files = bundleFiles.filter((file) => file.endsWith(".md") || file.endsWith(".jsonl") || file.endsWith(".json"));
  let found = false;

  for (const file of files) {
    const path = join(root, file);

    if (!existsSync(path) || !statSync(path).isFile()) {
      continue;
    }

    const lines = readFileSync(path, "utf8").split(/\r?\n/);
    lines.forEach((line, index) => {
      if (markerPattern.test(line)) {
        found = true;
        addDoctorFail(result, `Git conflict marker in ${file}:${index + 1}`, "Resolve the conflict and remove marker lines.");
      }
    });
  }

  if (!found) {
    addDoctorPass(result, "no Git conflict markers found in markdown, JSON, or JSONL files");
  }
}

function checkLikelySecrets(result: DoctorResult, root: string): void {
  const scan = scanBundle(root);
  const secretIssues = scan.issues.filter((issue) => issue.severity === "fail");

  if (secretIssues.length === 0) {
    addDoctorPass(result, "no likely secrets found in bundle text files");
    return;
  }

  for (const issue of secretIssues) {
    addDoctorFail(
      result,
      `likely secret in ${issue.file}:${issue.line} (${issue.kind}; value redacted)`,
      issue.nextAction,
    );
  }
}

function checkGitState(result: DoctorResult, root: string): void {
  const inside = runGit(root, ["rev-parse", "--is-inside-work-tree"], { allowFailure: true });

  if (inside.stdout.trim() !== "true") {
    addDoctorWarn(result, ".akephalos is not inside a Git repository", "Clone or initialize the shared passport repo if sync is needed.");
    return;
  }

  addDoctorPass(result, ".akephalos is inside a Git repository");

  const remote = runGit(root, ["remote", "get-url", "origin"], { allowFailure: true }).stdout.trim();

  if (remote) {
    addDoctorPass(result, "Git origin remote is configured");
  } else {
    addDoctorWarn(result, "Git origin remote is not configured", "Add an origin remote before using akephalos sync.");
  }

  const branch = runGit(root, ["branch", "--show-current"], { allowFailure: true }).stdout.trim();
  const status = runGit(root, ["status", "--porcelain"], { allowFailure: true }).stdout.trim();

  if (!branch) {
    addDoctorWarn(result, "Git is in detached HEAD state", "Check out a branch before routine sync.");
  } else {
    addDoctorPass(result, `Git branch is ${branch}`);
  }

  if (status) {
    addDoctorWarn(result, "Git working tree has local changes", "Review and sync or commit intentional passport changes.");
  } else {
    addDoctorPass(result, "Git working tree is clean");
  }

  if (!remote || !branch) {
    return;
  }

  const upstream = runGit(root, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"], {
    allowFailure: true,
  }).stdout.trim();

  if (!upstream) {
    addDoctorWarn(result, "Git branch has no upstream tracking branch", "Run git push -u origin <branch> inside .akephalos.");
    return;
  }

  const counts = runGit(root, ["rev-list", "--left-right", "--count", `${upstream}...HEAD`], {
    allowFailure: true,
  }).stdout
    .trim()
    .split(/\s+/)
    .map((value) => Number.parseInt(value, 10));

  if (counts.length !== 2 || counts.some((value) => !Number.isFinite(value))) {
    addDoctorWarn(result, "Git ahead/behind state could not be determined", "Run akephalos sync --pull-only and inspect Git status.");
    return;
  }

  const [behind, ahead] = counts;

  if (behind === 0 && ahead === 0) {
    addDoctorPass(result, "Git branch is aligned with upstream");
  } else if (behind > 0 && ahead > 0) {
    addDoctorWarn(result, `Git branch has diverged (${ahead} ahead, ${behind} behind)`, "Run akephalos sync and resolve conflicts if prompted.");
  } else if (ahead > 0) {
    addDoctorWarn(result, `Git branch is ${ahead} commit(s) ahead`, "Run akephalos sync to push local passport changes.");
  } else {
    addDoctorWarn(result, `Git branch is ${behind} commit(s) behind`, "Run akephalos sync --pull-only to refresh local context.");
  }
}

function checkMcpDocumentation(result: DoctorResult, root: string): void {
  const tools = readOptionalTextFile(join(root, "tools.md")) ?? "";

  if (!tools.includes("mcp.json") && !tools.includes("akephalos-mcp")) {
    return;
  }

  const projectConfig = join(process.cwd(), ".cursor", "mcp.json");
  const wrapper = join(process.cwd(), ".cursor", "akephalos-mcp.js");
  const userConfig = join(process.env.USERPROFILE ?? "", ".cursor", "mcp.json");

  if (existsSync(projectConfig) && statSync(projectConfig).isFile()) {
    addDoctorPass(result, "documented Cursor project MCP config exists");
  } else {
    addDoctorWarn(result, "Cursor project MCP config is documented but missing", "Create .cursor/mcp.json or update tools.md if it no longer applies.");
  }

  if (existsSync(userConfig) && statSync(userConfig).isFile()) {
    addDoctorPass(result, "documented Cursor user MCP config exists");
  } else {
    addDoctorWarn(result, "Cursor user MCP config is documented but missing", "Create ~/.cursor/mcp.json or update tools.md if it no longer applies.");
  }

  if (tools.includes("akephalos-mcp")) {
    if (existsSync(wrapper) && statSync(wrapper).isFile()) {
      addDoctorPass(result, "documented Cursor MCP wrapper exists");
    } else {
      addDoctorWarn(result, "Cursor MCP wrapper is documented but missing", "Restore .cursor/akephalos-mcp.js or update tools.md.");
    }
  }
}

function checkScheduledSyncDocumentation(result: DoctorResult, root: string): void {
  const tools = readOptionalTextFile(join(root, "tools.md")) ?? "";
  const memories = readOptionalTextFile(join(root, "memories.jsonl")) ?? "";
  const text = `${tools}\n${memories}`;

  if (/scheduled task|scheduler|cron|every 15 minutes|15-minute/i.test(text)) {
    addDoctorPass(result, "scheduled sync appears documented");
  }
}

function checkHarnessRegistry(result: DoctorResult, root: string): void {
  const path = bundlePath(root, "harnesses.json");

  if (!existsSync(path)) {
    addDoctorWarn(result, "harnesses.json is missing", "Run akephalos harness check to create it from tools.md.");
    return;
  }

  if (!statSync(path).isFile()) {
    addDoctorFail(result, "harnesses.json is not a file", "Replace it with a JSON array of harness entries.");
    return;
  }

  const registry = readHarnessRegistry(root);

  if (registry.warnings.some((warning) => warning.includes("malformed JSON") || warning.includes("must contain"))) {
    for (const warning of registry.warnings) {
      addDoctorFail(result, warning, "Fix harnesses.json so it is a valid JSON array.");
    }
    return;
  }

  if (registry.warnings.length > 0) {
    for (const warning of registry.warnings) {
      addDoctorWarn(result, warning, "Run akephalos harness check after fixing or removing the invalid entry.");
    }
  }

  addDoctorPass(result, `harnesses.json has ${registry.entries.length} harness entr${registry.entries.length === 1 ? "y" : "ies"}`);
}

function findLikelySecretIssues(root: string, includeRejected = false): string[] {
  return scanBundle(root, { includeRejected }).issues
    .filter((issue) => issue.severity === "fail")
    .map((issue) => `${issue.file}:${issue.line} (${issue.kind}; value redacted)`);
}

function formatDoctorSection(title: "PASS" | "WARN" | "FAIL", entries: Array<string | DoctorIssue>): string[] {
  const lines = [`${title} (${entries.length})`];

  if (entries.length === 0) {
    lines.push("- none");
    return lines;
  }

  for (const entry of entries) {
    if (typeof entry === "string") {
      lines.push(`- ${entry}`);
    } else {
      lines.push(`- ${entry.message}`);

      if (entry.nextAction) {
        lines.push(`  Next: ${entry.nextAction}`);
      }
    }
  }

  return lines;
}

function buildDoctor(): DoctorResult {
  const result: DoctorResult = {
    pass: [],
    warn: [],
    fail: [],
  };
  const root = bundleRoot();

  if (!existsSync(root)) {
    addDoctorFail(result, `.akephalos bundle is missing at ${root}`, "Run akephalos init or clone the shared passport repo as .akephalos.");
  } else if (!statSync(root).isDirectory()) {
    addDoctorFail(result, `.akephalos exists but is not a directory at ${root}`, "Move the file aside and restore a .akephalos directory.");
  } else {
    addDoctorPass(result, `.akephalos bundle exists at ${root}`);
    checkManifest(result, root);

    for (const file of ["akephalos.md", "rules.md", "tools.md", "projects.md"] as const) {
      checkRequiredFile(result, root, file);
    }

    checkJsonlFile(result, root, "memories.jsonl");
    checkJsonlFile(result, root, "events.jsonl");
    checkHarnessRegistry(result, root);
    checkConflictMarkers(result, root);
    checkLikelySecrets(result, root);
    checkGitState(result, root);
    checkMcpDocumentation(result, root);
    checkScheduledSyncDocumentation(result, root);
  }

  return result;
}

function buildDoctorText(result = buildDoctor()): { text: string; hasFailures: boolean } {
  const lines = [
    "Akephalos doctor",
    `Bundle: ${bundleRoot()}`,
    "",
    ...formatDoctorSection("PASS", result.pass),
    "",
    ...formatDoctorSection("WARN", result.warn),
    "",
    ...formatDoctorSection("FAIL", result.fail),
  ];

  return {
    text: `${lines.join("\n")}\n`,
    hasFailures: result.fail.length > 0,
  };
}

function printDoctor(options: { json: boolean } = { json: false }): void {
  const result = buildDoctor();

  if (options.json) {
    process.stdout.write(`${JSON.stringify({
      version,
      bundle: bundleRoot(),
      ok: result.fail.length === 0,
      counts: {
        pass: result.pass.length,
        warn: result.warn.length,
        fail: result.fail.length,
      },
      pass: result.pass,
      warn: result.warn,
      fail: result.fail,
    }, null, 2)}\n`);

    if (result.fail.length > 0) {
      process.exitCode = 1;
    }

    return;
  }

  const doctor = buildDoctorText(result);

  process.stdout.write(doctor.text);

  if (doctor.hasFailures) {
    process.exitCode = 1;
  }
}

function latestRecord(entries: unknown[], predicate: (record: Record<string, unknown>) => boolean): Record<string, unknown> | undefined {
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];

    if (entry !== null && typeof entry === "object") {
      const record = entry as Record<string, unknown>;

      if (predicate(record)) {
        return record;
      }
    }
  }

  return undefined;
}

function recordTime(record: Record<string, unknown> | undefined): string {
  if (!record) {
    return "none";
  }

  return String(record.time ?? record.timestamp ?? "unknown time");
}

function remoteDisplay(remote: string): string {
  return remote
    .replace(/(https?:\/\/)([^/@:\s]+):([^/@\s]+)@/iu, "$1[redacted]@")
    .replace(/(https?:\/\/)([^/@\s]+)@/iu, "$1[redacted]@");
}

function readSyncState(root: string): SyncState {
  const branch = runGit(root, ["branch", "--show-current"], { allowFailure: true }).stdout.trim();
  const upstream = runGit(root, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"], {
    allowFailure: true,
  }).stdout.trim();
  const remote = runGit(root, ["remote", "get-url", "origin"], { allowFailure: true }).stdout.trim();
  const latestCommit = runGit(root, ["log", "-1", "--oneline"], { allowFailure: true }).stdout.trim();
  const dirty = runGit(root, ["status", "--porcelain"], { allowFailure: true }).stdout.trim();
  let ahead: number | undefined;
  let behind: number | undefined;
  let relation = "unknown";

  if (upstream) {
    const counts = runGit(root, ["rev-list", "--left-right", "--count", `${upstream}...HEAD`], {
      allowFailure: true,
    }).stdout
      .trim()
      .split(/\s+/)
      .map((value) => Number.parseInt(value, 10));

    if (counts.length === 2 && counts.every((value) => Number.isFinite(value))) {
      [behind, ahead] = counts;

      if (behind === 0 && ahead === 0) {
        relation = "aligned";
      } else if (behind > 0 && ahead > 0) {
        relation = `diverged (${ahead} ahead, ${behind} behind)`;
      } else if (ahead > 0) {
        relation = `${ahead} ahead`;
      } else {
        relation = `${behind} behind`;
      }
    }
  } else if (!remote) {
    relation = "no remote";
  } else {
    relation = "no upstream";
  }

  return {
    branch: branch || "detached",
    upstream,
    remote,
    latestCommit: latestCommit || "none",
    dirty: dirty ? "dirty" : "clean",
    ahead,
    behind,
    relation,
  };
}

function ledgersHealthy(root: string): string {
  const memories = parseJsonlQuiet(bundlePath(root, "memories.jsonl"));
  const events = parseJsonlQuiet(bundlePath(root, "events.jsonl"));
  const conflicts = [bundlePath(root, "memories.jsonl"), bundlePath(root, "events.jsonl")].filter(
    (path) => existsSync(path) && statSync(path).isFile() && hasConflictMarkers(readFileSync(path, "utf8")),
  );
  const warnings = [...memories.warnings, ...events.warnings];

  if (conflicts.length === 0 && warnings.length === 0) {
    return "healthy";
  }

  const parts: string[] = [];

  if (warnings.length > 0) {
    parts.push(`${warnings.length} malformed JSONL warning(s)`);
  }

  if (conflicts.length > 0) {
    parts.push(`${conflicts.length} conflict marker file(s)`);
  }

  return parts.join("; ");
}

function buildSyncStatusText(): string {
  const error = getBundleRootError();

  if (error) {
    return `Akephalos sync-status\n\n${error}\n`;
  }

  const root = bundleRoot();
  const state = readSyncState(root);
  const events = parseJsonlQuiet(bundlePath(root, "events.jsonl"));
  const memories = parseJsonlQuiet(bundlePath(root, "memories.jsonl"));
  const lastSync = latestRecord(events.entries, (record) => record.type === "sync");
  const lastCompact = latestRecord(events.entries, (record) => record.type === "memory.compact");
  const lastMemory = latestRecord(memories.entries, () => true);
  const harnesses = knownHarnessNames(root);

  return `${[
    "Akephalos sync-status",
    "",
    `Branch: ${state.branch}`,
    `Remote: ${state.remote ? remoteDisplay(state.remote) : "none"}`,
    `Latest commit: ${state.latestCommit}`,
    `Local state: ${state.dirty}`,
    `Upstream: ${state.upstream || "none"}`,
    `Relation: ${state.relation}`,
    `Last sync event: ${recordTime(lastSync)}`,
    `Last memory event: ${recordTime(lastMemory)}`,
    `Last compact event: ${recordTime(lastCompact)}`,
    `Harnesses: ${harnesses.length > 0 ? harnesses.join(", ") : "none"}`,
    `JSONL ledgers: ${ledgersHealthy(root)}`,
  ].join("\n")}\n`;
}

function printSyncStatus(): void {
  process.stdout.write(buildSyncStatusText());
}

function hasConflictMarkers(text: string): boolean {
  return /^(<<<<<<<|=======|>>>>>>>)($|\s)/mu.test(text);
}

function ledgerRecordKey(record: unknown): string {
  if (record !== null && typeof record === "object") {
    const id = (record as Record<string, unknown>).id;

    if (typeof id === "string" && id.trim()) {
      return `id:${id}`;
    }
  }

  return `hash:${stableHash(record)}`;
}

function ledgerSortValue(record: unknown, key: string): string[] {
  if (record !== null && typeof record === "object") {
    const value = record as Record<string, unknown>;
    return [
      String(value.time ?? value.timestamp ?? ""),
      String(value.source ?? ""),
      String(value.type ?? ""),
      key,
    ];
  }

  return ["", "", "", key];
}

function compareLedgerRecords(a: LedgerMergeRecord, b: LedgerMergeRecord): number {
  const left = ledgerSortValue(a.record, a.key);
  const right = ledgerSortValue(b.record, b.key);

  for (let index = 0; index < left.length; index += 1) {
    const compared = left[index].localeCompare(right[index]);

    if (compared !== 0) {
      return compared;
    }
  }

  return 0;
}

function parseLedgerLine(
  file: LedgerFile,
  line: string,
  lineNumber: number | undefined,
  records: Map<string, LedgerMergeRecord>,
  rejected: LedgerRejectedLine[],
): void {
  if (!line.trim()) {
    return;
  }

  try {
    const record = JSON.parse(line) as unknown;
    const key = ledgerRecordKey(record);

    if (!records.has(key)) {
      records.set(key, {
        record,
        key,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    rejected.push({
      file,
      line: lineNumber,
      reason: `malformed JSON (${message})`,
      text: line,
    });
  }
}

function parseLedgerText(file: LedgerFile, text: string): { records: LedgerMergeRecord[]; rejected: LedgerRejectedLine[] } {
  const records = new Map<string, LedgerMergeRecord>();
  const rejected: LedgerRejectedLine[] = [];
  const lines = text.split(/\r?\n/);
  let state: "normal" | "ours" | "theirs" = "normal";
  let ours: Array<{ text: string; line: number }> = [];
  let theirs: Array<{ text: string; line: number }> = [];
  let conflictStartLine: number | undefined;

  const flushConflict = (): void => {
    for (const item of [...ours, ...theirs]) {
      parseLedgerLine(file, item.text, item.line, records, rejected);
    }

    ours = [];
    theirs = [];
    conflictStartLine = undefined;
  };

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    if (/^<<<<<<<($|\s)/u.test(line)) {
      if (state !== "normal") {
        rejected.push({
          file,
          line: lineNumber,
          reason: "nested conflict marker",
          text: line,
        });
      }

      state = "ours";
      conflictStartLine = lineNumber;
      ours = [];
      theirs = [];
      return;
    }

    if (/^=======$/u.test(line) || /^=======\s/u.test(line)) {
      if (state !== "ours") {
        rejected.push({
          file,
          line: lineNumber,
          reason: "unexpected conflict separator",
          text: line,
        });
        return;
      }

      state = "theirs";
      return;
    }

    if (/^>>>>>>>($|\s)/u.test(line)) {
      if (state !== "theirs") {
        rejected.push({
          file,
          line: lineNumber,
          reason: "unexpected conflict end marker",
          text: line,
        });
        state = "normal";
        return;
      }

      flushConflict();
      state = "normal";
      return;
    }

    if (state === "ours") {
      ours.push({ text: line, line: lineNumber });
      return;
    }

    if (state === "theirs") {
      theirs.push({ text: line, line: lineNumber });
      return;
    }

    parseLedgerLine(file, line, lineNumber, records, rejected);
  });

  if (state !== "normal") {
    rejected.push({
      file,
      line: conflictStartLine,
      reason: "unterminated conflict block",
      text: "<<<<<<<",
    });
    flushConflict();
  }

  return {
    records: [...records.values()].sort(compareLedgerRecords),
    rejected,
  };
}

function rejectedFileName(file: LedgerFile): string {
  return file.replace(/\.jsonl$/u, ".rejected.jsonl");
}

function mergeLedgersInRoot(root: string): LedgerMergeResult {
  const result: LedgerMergeResult = {
    filesChanged: [],
    recordsWritten: {
      "memories.jsonl": 0,
      "events.jsonl": 0,
    },
    rejected: [],
  };

  for (const file of ["memories.jsonl", "events.jsonl"] as LedgerFile[]) {
    const path = join(root, file);

    if (!existsSync(path) || !statSync(path).isFile()) {
      continue;
    }

    const parsed = parseLedgerText(file, readFileSync(path, "utf8"));
    const nextText = parsed.records.map((entry) => JSON.stringify(entry.record)).join("\n");
    const finalText = parsed.records.length > 0 ? `${nextText}\n` : "";

    writeFileSync(path, finalText, "utf8");
    result.filesChanged.push(file);
    result.recordsWritten[file] = parsed.records.length;
    result.rejected.push(...parsed.rejected);

    const rejectedPath = join(root, rejectedFileName(file));
    const fileRejected = parsed.rejected.filter((entry) => entry.file === file);

    if (fileRejected.length > 0) {
      writeFileSync(rejectedPath, fileRejected.map((entry) => JSON.stringify(entry)).join("\n") + "\n", "utf8");
      result.filesChanged.push(rejectedFileName(file) as LedgerFile);
    } else if (existsSync(rejectedPath) && statSync(rejectedPath).isFile()) {
      writeFileSync(rejectedPath, "", "utf8");
    }
  }

  appendEventRecord(root, {
    source: "cli",
    type: "ledger.merge",
    payload: {
      files: result.filesChanged,
      rejected_count: result.rejected.length,
      memories_count: result.recordsWritten["memories.jsonl"],
      events_count: result.recordsWritten["events.jsonl"],
    },
  });
  result.recordsWritten["events.jsonl"] += 1;

  return result;
}

function mergeLedgers(): void {
  const root = requireBundleRoot();

  if (!root) {
    return;
  }

  const result = mergeLedgersInRoot(root);

  process.stdout.write("Merged ledgers.\n");
  process.stdout.write(`memories.jsonl records: ${result.recordsWritten["memories.jsonl"]}\n`);
  process.stdout.write(`events.jsonl records: ${result.recordsWritten["events.jsonl"]}\n`);
  process.stdout.write(`Rejected lines: ${result.rejected.length}\n`);

  if (result.rejected.length > 0) {
    process.stdout.write("Rejected output: memories.rejected.jsonl and/or events.rejected.jsonl\n");
  }
}

function extractSection(text: string, heading: string): string | undefined {
  const headingPattern = new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, "mu");
  const match = headingPattern.exec(text);

  if (!match) {
    return undefined;
  }

  const afterHeading = match.index + match[0].length;
  const nextHeading = text.slice(afterHeading).match(/\n##\s+/u);
  const end =
    nextHeading && nextHeading.index !== undefined ? afterHeading + nextHeading.index : text.length;

  return text.slice(afterHeading, end).trim();
}

function parsePulseLimit(args: string[]): number {
  if (args.length === 0) {
    return 5;
  }

  if (args.length === 2 && args[0] === "--limit") {
    const limit = Number.parseInt(args[1], 10);

    if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
      throw new Error("--limit must be an integer from 1 to 20");
    }

    return limit;
  }

  throw new Error("Usage: akephalos pulse [--limit 5]");
}

function importedHarnessNames(root: string): string[] {
  const tools = readOptionalTextFile(bundlePath(root, "tools.md"));
  const section = tools ? extractSection(tools, "Imported Harnesses") : undefined;

  if (!section) {
    return [];
  }

  return [...section.matchAll(/^###\s+(.+?)\s*$/gmu)].map((match) => match[1]);
}

function isHarnessStatus(value: unknown): value is HarnessStatus {
  return typeof value === "string" && harnessStatuses.includes(value as HarnessStatus);
}

function harnessKey(name: string): string {
  return name.trim().toLocaleLowerCase();
}

function defaultHarnessEntry(
  name: string,
  source: "auto" | "manual",
  status: HarnessStatus,
  now = new Date().toISOString(),
  notes: string[] = [],
): HarnessRegistryEntry {
  return {
    name: name.trim(),
    status,
    mcp: false,
    sync: true,
    last_checked: now,
    source,
    notes,
  };
}

function normalizeHarnessEntry(value: unknown, index: number, warnings: string[]): HarnessRegistryEntry | undefined {
  if (value === null || typeof value !== "object") {
    warnings.push(`harnesses.json entry ${index + 1} is not an object`);
    return undefined;
  }

  const record = value as Record<string, unknown>;

  if (typeof record.name !== "string" || !record.name.trim()) {
    warnings.push(`harnesses.json entry ${index + 1} is missing name`);
    return undefined;
  }

  const status = isHarnessStatus(record.status) ? record.status : "unknown";
  const source = record.source === "manual" ? "manual" : "auto";
  const notes = Array.isArray(record.notes)
    ? record.notes.filter((note): note is string => typeof note === "string")
    : [];

  if (record.status !== undefined && !isHarnessStatus(record.status)) {
    warnings.push(`harnesses.json entry ${record.name} has unknown status; using unknown`);
  }

  return {
    name: record.name.trim(),
    status,
    mcp: typeof record.mcp === "boolean" ? record.mcp : false,
    sync: typeof record.sync === "boolean" ? record.sync : true,
    last_checked: typeof record.last_checked === "string" ? record.last_checked : "",
    source,
    notes,
  };
}

function dedupeHarnessRegistry(entries: HarnessRegistryEntry[]): HarnessRegistryEntry[] {
  const byName = new Map<string, HarnessRegistryEntry>();

  for (const entry of entries) {
    const key = harnessKey(entry.name);
    const existing = byName.get(key);

    if (!existing) {
      byName.set(key, entry);
      continue;
    }

    byName.set(key, {
      ...existing,
      ...entry,
      notes: [...new Set([...existing.notes, ...entry.notes])],
    });
  }

  return [...byName.values()].sort((left, right) => left.name.localeCompare(right.name));
}

function readHarnessRegistry(root: string): HarnessRegistryRead {
  const path = bundlePath(root, "harnesses.json");

  if (!existsSync(path)) {
    return {
      entries: [],
      warnings: ["harnesses.json is missing; run `akephalos harness check` to create it."],
    };
  }

  if (!statSync(path).isFile()) {
    return {
      entries: [],
      warnings: ["harnesses.json exists but is not a file."],
    };
  }

  const warnings: string[] = [];

  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as unknown;

    if (!Array.isArray(parsed)) {
      return {
        entries: [],
        warnings: ["harnesses.json must contain a JSON array."],
      };
    }

    const entries = parsed
      .map((entry, index) => normalizeHarnessEntry(entry, index, warnings))
      .filter((entry): entry is HarnessRegistryEntry => entry !== undefined);

    return {
      entries: dedupeHarnessRegistry(entries),
      warnings,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      entries: [],
      warnings: [`harnesses.json is malformed JSON (${message}).`],
    };
  }
}

function writeHarnessRegistry(root: string, entries: HarnessRegistryEntry[]): void {
  writeFileSync(bundlePath(root, "harnesses.json"), `${JSON.stringify(dedupeHarnessRegistry(entries), null, 2)}\n`, "utf8");
}

function ensureManifestListsFile(root: string, file: string): void {
  const manifestPath = bundlePath(root, "manifest.json");

  if (!existsSync(manifestPath) || !statSync(manifestPath).isFile()) {
    return;
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, unknown>;

    if (Array.isArray(manifest.files) && !manifest.files.includes(file)) {
      manifest.files.push(file);
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    }
  } catch {
    return;
  }
}

function upsertHarnessRegistryEntry(
  entries: HarnessRegistryEntry[],
  entry: HarnessRegistryEntry,
): { entries: HarnessRegistryEntry[]; changed: boolean } {
  const key = harnessKey(entry.name);
  const existing = entries.find((candidate) => harnessKey(candidate.name) === key);

  if (!existing) {
    return {
      entries: dedupeHarnessRegistry([...entries, entry]),
      changed: true,
    };
  }

  const merged = {
    ...existing,
    ...entry,
    notes: [...new Set([...existing.notes, ...entry.notes])],
  };
  const nextEntries = entries.map((candidate) => (harnessKey(candidate.name) === key ? merged : candidate));

  return {
    entries: dedupeHarnessRegistry(nextEntries),
    changed: stableJson(dedupeHarnessRegistry(entries)) !== stableJson(dedupeHarnessRegistry(nextEntries)),
  };
}

function migrateHarnessRegistryFromTools(root: string): { entries: HarnessRegistryEntry[]; warnings: string[]; changed: boolean } {
  const read = readHarnessRegistry(root);
  const now = new Date().toISOString();
  let entries = read.entries;
  let changed = !existsSync(bundlePath(root, "harnesses.json"));
  const warnings = [...read.warnings.filter((warning) => !warning.startsWith("harnesses.json is missing"))];

  if (existsSync(bundlePath(root, "harnesses.json")) && read.warnings.some((warning) => warning.includes("malformed JSON"))) {
    return { entries, warnings: read.warnings, changed: false };
  }

  for (const name of importedHarnessNames(root)) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      continue;
    }

    if (entries.some((entry) => harnessKey(entry.name) === harnessKey(trimmedName))) {
      continue;
    }

    if (sensitiveTextWarnings(trimmedName).length > 0) {
      warnings.push(`Skipped unsafe imported harness name from tools.md: value redacted.`);
      continue;
    }

    const result = upsertHarnessRegistryEntry(
      entries,
      defaultHarnessEntry(trimmedName, "auto", "configured", now, ["Migrated from tools.md Imported Harnesses section."]),
    );
    entries = result.entries;
    changed = changed || result.changed;
  }

  if (changed) {
    writeHarnessRegistry(root, entries);
    ensureManifestListsFile(root, "harnesses.json");
  }

  return { entries, warnings, changed };
}

function knownHarnessNames(root: string): string[] {
  const registry = readHarnessRegistry(root);
  const names = new Set<string>();

  for (const entry of registry.entries) {
    names.add(entry.name);
  }

  for (const name of importedHarnessNames(root)) {
    names.add(name);
  }

  return [...names].sort((left, right) => left.localeCompare(right));
}

function formatHarnessRegistry(entries: HarnessRegistryEntry[]): string {
  if (entries.length === 0) {
    return "No harnesses registered.\n";
  }

  const lines = ["Harnesses", ""];

  for (const entry of entries) {
    lines.push(
      `- ${entry.name}: status=${entry.status}, mcp=${entry.mcp ? "yes" : "no"}, sync=${
        entry.sync ? "yes" : "no"
      }, source=${entry.source}, last_checked=${entry.last_checked || "never"}`,
    );

    for (const note of entry.notes) {
      lines.push(`  Note: ${note}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function printHarnessList(): void {
  const root = requireBundleRoot();

  if (!root) {
    return;
  }

  const migrated = migrateHarnessRegistryFromTools(root);
  process.stdout.write(formatHarnessRegistry(migrated.entries));
  printWarnings(migrated.warnings);
}

function addHarness(name: string): void {
  const root = requireBundleRoot();

  if (!root) {
    return;
  }

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Harness name is required.");
  }

  assertNonSecretText("Harness name", trimmedName);

  const migrated = migrateHarnessRegistryFromTools(root);
  const now = new Date().toISOString();
  const result = upsertHarnessRegistryEntry(
    migrated.entries,
    defaultHarnessEntry(trimmedName, "manual", "unknown", now, ["Added manually."]),
  );

  if (result.changed) {
    writeHarnessRegistry(root, result.entries);
    appendEventRecord(root, {
      time: now,
      source: "cli",
      type: "harness.add",
      harness: trimmedName,
    });
    ensureManifestListsFile(root, "harnesses.json");
    updateManifestUpdatedAt(root, now);
    process.stdout.write(`Added harness: ${trimmedName}\n`);
  } else {
    process.stdout.write(`Harness already registered: ${trimmedName}\n`);
  }

  printWarnings(migrated.warnings);
}

function markHarness(name: string, status: HarnessStatus): void {
  const root = requireBundleRoot();

  if (!root) {
    return;
  }

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Harness name is required.");
  }

  const migrated = migrateHarnessRegistryFromTools(root);
  const existing = migrated.entries.find((entry) => harnessKey(entry.name) === harnessKey(trimmedName));

  if (!existing) {
    throw new Error(`Harness is not registered: ${trimmedName}. Run \`akephalos harness add "${trimmedName}"\` first.`);
  }

  const now = new Date().toISOString();
  const result = upsertHarnessRegistryEntry(migrated.entries, {
    ...existing,
    status,
    last_checked: now,
  });

  writeHarnessRegistry(root, result.entries);
  appendEventRecord(root, {
    time: now,
    source: "cli",
    type: "harness.mark",
    harness: existing.name,
    status,
  });
  updateManifestUpdatedAt(root, now);
  process.stdout.write(`Marked ${existing.name} as ${status}.\n`);
  printWarnings(migrated.warnings);
}

function checkHarnesses(): void {
  const root = requireBundleRoot();

  if (!root) {
    return;
  }

  const migrated = migrateHarnessRegistryFromTools(root);
  const now = new Date().toISOString();
  let entries = migrated.entries.map((entry) => ({ ...entry, last_checked: now }));

  for (const detected of detectLocalHarnesses()) {
    const existing = entries.find((entry) => harnessKey(entry.name) === harnessKey(detected.name));
    const result = upsertHarnessRegistryEntry(
      entries,
      defaultHarnessEntry(
        detected.name,
        "auto",
        existing && existing.status !== "unknown" ? existing.status : "detected",
        now,
        detected.notes,
      ),
    );
    entries = result.entries;
  }

  writeHarnessRegistry(root, entries);
  appendEventRecord(root, {
    time: now,
    source: "cli",
    type: "harness.check",
    harness_count: entries.length,
  });
  ensureManifestListsFile(root, "harnesses.json");
  updateManifestUpdatedAt(root, now);

  process.stdout.write("Harness check complete.\n");
  process.stdout.write(formatHarnessRegistry(entries));
  printWarnings(migrated.warnings);
}

function parseHarnessMarkArgs(args: string[]): { name: string; status: HarnessStatus } {
  const statusIndex = args.indexOf("--status");

  if (args.length < 3 || statusIndex === -1 || statusIndex === args.length - 1) {
    throw new Error(`Usage: akephalos harness mark <name> --status <status>\nStatuses: ${harnessStatuses.join(", ")}`);
  }

  const nameParts = args.slice(0, statusIndex);
  const trailing = args.slice(statusIndex + 2);

  if (nameParts.length === 0 || trailing.length > 0) {
    throw new Error(`Usage: akephalos harness mark <name> --status <status>\nStatuses: ${harnessStatuses.join(", ")}`);
  }

  const status = args[statusIndex + 1];

  if (!isHarnessStatus(status)) {
    throw new Error(`Unknown harness status: ${status}\nUse one of: ${harnessStatuses.join(", ")}`);
  }

  return {
    name: nameParts.join(" "),
    status,
  };
}

function handleHarnessCommand(args: string[]): void {
  const [action, ...rest] = args;

  if (!action || action === "help" || action === "--help" || action === "-h") {
    process.stdout.write(
      [
        "Usage:",
        "  akephalos harness list",
        "  akephalos harness add <name>",
        "  akephalos harness mark <name> --status <status>",
        "  akephalos harness check",
        "",
        `Statuses: ${harnessStatuses.join(", ")}`,
        "",
      ].join("\n"),
    );
    return;
  }

  if (action === "list") {
    if (rest.length > 0) {
      throw new Error(`Unexpected argument for harness list: ${rest[0]}`);
    }

    printHarnessList();
    return;
  }

  if (action === "add") {
    const name = rest.join(" ").trim();

    if (!name) {
      throw new Error("Usage: akephalos harness add <name>");
    }

    addHarness(name);
    return;
  }

  if (action === "mark") {
    const parsed = parseHarnessMarkArgs(rest);
    markHarness(parsed.name, parsed.status);
    return;
  }

  if (action === "check") {
    if (rest.length > 0) {
      throw new Error(`Unexpected argument for harness check: ${rest[0]}`);
    }

    checkHarnesses();
    return;
  }

  throw new Error(`Unknown harness action: ${action}`);
}

function buildPulseText(limit: number): { text: string; warnings: string[] } {
  const error = getBundleRootError();

  if (error) {
    return {
      text: `Akephalos pulse\n\n${error}\n`,
      warnings: [],
    };
  }

  const root = bundleRoot();
  const memories = parseJsonlQuiet(bundlePath(root, "memories.jsonl"));
  const memoryLines = memories.entries
    .slice(-limit)
    .reverse()
    .map((memory, index) => `${index + 1}. ${summarizeMemory(memory)}`);
  const identity = readOptionalTextFile(bundlePath(root, "akephalos.md")) ?? "";
  const harnesses = knownHarnessNames(root);
  const suggestions: string[] = [];

  if (memories.entries.length === 0) {
    suggestions.push("Add durable non-secret memories as useful preferences or project facts appear.");
  }

  if (!extractSection(identity, "Compacted Memories")) {
    suggestions.push("Run `akephalos compact` so the master identity file has a readable memory summary.");
  }

  if (harnesses.length === 0) {
    suggestions.push("Run `akephalos import-harness` for each linked agent or IDE.");
  }

  if (memories.warnings.length > 0) {
    suggestions.push("Fix malformed JSONL entries reported in warnings.");
  }

  if (memories.entries.length > 25) {
    suggestions.push("Review older memories and remove stale entries manually if they no longer represent durable context.");
  }

  if (suggestions.length === 0) {
    suggestions.push("No immediate cleanup needed. Keep adding only durable, non-secret context.");
  }

  const lines = [
    "Akephalos pulse",
    "",
    `Bundle: ${root}`,
    `Manifest version: ${readManifestVersion(root)}`,
    `Memory count: ${memories.entries.length}`,
    `Imported harnesses: ${harnesses.length > 0 ? harnesses.join(", ") : "none"}`,
    "",
    `Top ${Math.min(limit, Math.max(memories.entries.length, 1))} recent memories:`,
    ...(memoryLines.length > 0 ? memoryLines : ["No memories found."]),
    "",
    "Review suggestions:",
    ...suggestions.map((suggestion) => `- ${suggestion}`),
  ];

  return {
    text: `${lines.join("\n")}\n`,
    warnings: memories.warnings,
  };
}

function printPulse(args: string[]): void {
  const limit = parsePulseLimit(args);
  const pulse = buildPulseText(limit);

  process.stdout.write(pulse.text);
  printWarnings(pulse.warnings);
}

function runGit(root: string, args: string[], options: { allowFailure?: boolean } = {}): GitCommandResult {
  const result = spawnSync("git", ["-C", root, ...args], {
    encoding: "utf8",
    shell: false,
  });
  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";

  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(`git ${args.join(" ")} failed\n${stderr || stdout}`.trim());
  }

  return {
    stdout,
    stderr,
    status: result.status,
  };
}

function ensureGitRepo(root: string): void {
  const result = runGit(root, ["rev-parse", "--is-inside-work-tree"], { allowFailure: true });

  if (result.stdout.trim() !== "true") {
    throw new Error(".akephalos is not a git repository. Clone or initialize the shared passport repo first.");
  }

  const remote = runGit(root, ["remote", "get-url", "origin"], { allowFailure: true });

  if (!remote.stdout.trim()) {
    throw new Error(".akephalos has no origin remote. Add the private GitHub repo as origin first.");
  }
}

function ensureGitIdentity(root: string): void {
  const name = runGit(root, ["config", "user.name"], { allowFailure: true }).stdout.trim();
  const email = runGit(root, ["config", "user.email"], { allowFailure: true }).stdout.trim();

  if (!name) {
    runGit(root, ["config", "user.name", "Akephalos Sync"]);
  }

  if (!email) {
    runGit(root, ["config", "user.email", "akephalos-sync@users.noreply.github.com"]);
  }
}

function gitStatus(root: string): string {
  return runGit(root, ["status", "--porcelain"]).stdout.trim();
}

function safePassportPaths(root: string): string[] {
  const candidates = [
    ...bundleFiles,
    "memories.rejected.jsonl",
    "events.rejected.jsonl",
    "exports",
  ];

  return candidates.filter((file) => existsSync(join(root, file)));
}

function stageSafePassportFiles(root: string): void {
  const files = safePassportPaths(root);

  if (files.length > 0) {
    runGit(root, ["add", "--", ...files]);
  }
}

function hasStagedChanges(root: string): boolean {
  return runGit(root, ["diff", "--cached", "--quiet"], { allowFailure: true }).status !== 0;
}

function assertNoLikelySecretsBeforeCommit(root: string): void {
  assertNoFailingScanIssues(root, "commit or sync");
}

function lastRecordTimeMs(record: Record<string, unknown> | undefined): number {
  const value = record?.time ?? record?.timestamp;

  if (typeof value !== "string") {
    return -1;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : -1;
}

function compactIfMemoriesChanged(root: string): boolean {
  const memories = parseJsonlQuiet(bundlePath(root, "memories.jsonl"));
  const events = parseJsonlQuiet(bundlePath(root, "events.jsonl"));
  const lastMemory = latestRecord(memories.entries, () => true);
  const lastCompact = latestRecord(events.entries, (record) => record.type === "memory.compact");

  if (!lastMemory) {
    return false;
  }

  if (lastRecordTimeMs(lastMemory) <= lastRecordTimeMs(lastCompact)) {
    return false;
  }

  const memoryCount = compactMemoriesInRoot(root);
  const time = appendEventRecord(root, {
    source: "cli",
    type: "memory.compact",
    memory_count: memoryCount,
  });
  updateManifestUpdatedAt(root, time);
  process.stdout.write(`Compacted ${memoryCount} memories into akephalos.md.\n`);
  return true;
}

function unmergedGitFiles(root: string): string[] {
  return runGit(root, ["diff", "--name-only", "--diff-filter=U"], { allowFailure: true })
    .stdout.split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseConflictSides(text: string): { ours: string; theirs: string } | undefined {
  const lines = text.split(/\r?\n/);
  let state: "normal" | "ours" | "theirs" = "normal";
  const ours: string[] = [];
  const theirs: string[] = [];
  let sawConflict = false;

  for (const line of lines) {
    if (/^<<<<<<<($|\s)/u.test(line)) {
      sawConflict = true;
      state = "ours";
      continue;
    }

    if (/^=======($|\s)/u.test(line)) {
      state = "theirs";
      continue;
    }

    if (/^>>>>>>>($|\s)/u.test(line)) {
      state = "normal";
      continue;
    }

    if (state === "ours") {
      ours.push(line);
    } else if (state === "theirs") {
      theirs.push(line);
    } else {
      ours.push(line);
      theirs.push(line);
    }
  }

  return sawConflict ? { ours: ours.join("\n"), theirs: theirs.join("\n") } : undefined;
}

function normalizeManifestForComparison(manifest: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...manifest };
  delete normalized.updated_at;
  delete normalized.updatedAt;
  return normalized;
}

function resolveManifestConflict(root: string): void {
  const path = join(root, "manifest.json");
  const sides = parseConflictSides(readFileSync(path, "utf8"));

  if (!sides) {
    return;
  }

  let ours: Record<string, unknown>;
  let theirs: Record<string, unknown>;

  try {
    ours = JSON.parse(sides.ours) as Record<string, unknown>;
    theirs = JSON.parse(sides.theirs) as Record<string, unknown>;
  } catch {
    throw new Error("manifest.json conflict is not safely parseable as JSON. Resolve it manually.");
  }

  if (stableJson(normalizeManifestForComparison(ours)) !== stableJson(normalizeManifestForComparison(theirs))) {
    throw new Error("manifest.json conflict changes more than timestamps. Resolve it manually.");
  }

  const oursTime = String(ours.updated_at ?? ours.updatedAt ?? "");
  const theirsTime = String(theirs.updated_at ?? theirs.updatedAt ?? "");
  const chosen = Date.parse(oursTime) >= Date.parse(theirsTime) ? ours : theirs;

  writeFileSync(path, `${JSON.stringify(chosen, null, 2)}\n`, "utf8");
}

function handleSafeGitConflicts(root: string): boolean {
  const unmerged = unmergedGitFiles(root);

  if (unmerged.length === 0) {
    return false;
  }

  const allowed = new Set(["memories.jsonl", "events.jsonl", "manifest.json"]);
  const unsafe = unmerged.filter((file) => !allowed.has(file.replace(/\\/gu, "/")));

  if (unsafe.length > 0) {
    throw new Error(
      [
        "Sync stopped because non-JSONL files have conflicts.",
        `Conflicted files: ${unsafe.join(", ")}`,
        "Resolve these manually, then run akephalos sync again.",
      ].join("\n"),
    );
  }

  const hasJsonlConflict = unmerged.some((file) => file.endsWith(".jsonl"));

  if (hasJsonlConflict) {
    process.stdout.write("Resolving JSONL ledger conflicts...\n");
    const result = mergeLedgersInRoot(root);
    process.stdout.write(
      `Merged ledgers with ${result.rejected.length} rejected malformed line(s).\n`,
    );
  }

  if (unmerged.includes("manifest.json")) {
    process.stdout.write("Resolving manifest timestamp conflict...\n");
    resolveManifestConflict(root);
  }

  const filesToAdd = [
    "memories.jsonl",
    "events.jsonl",
    "manifest.json",
    "memories.rejected.jsonl",
    "events.rejected.jsonl",
  ].filter((file) => existsSync(join(root, file)));
  runGit(root, ["add", ...filesToAdd]);
  return true;
}

function syncPassport(args: string[]): void {
  const root = requireBundleRoot();

  if (!root) {
    return;
  }

  if (args.length > 1 || (args.length === 1 && args[0] !== "--pull-only")) {
    throw new Error("Usage: akephalos sync [--pull-only]");
  }

  const doctor = buildDoctorText();

  if (doctor.hasFailures) {
    throw new Error(`Doctor checks failed before sync.\n${doctor.text}`);
  }

  const inside = runGit(root, ["rev-parse", "--is-inside-work-tree"], { allowFailure: true }).stdout.trim();

  if (inside !== "true") {
    throw new Error(".akephalos is not a git repository. Clone or initialize the shared passport repo first.");
  }

  const hasRemote = Boolean(runGit(root, ["remote", "get-url", "origin"], { allowFailure: true }).stdout.trim());

  if (args[0] === "--pull-only") {
    if (!hasRemote) {
      process.stdout.write("No origin remote configured; pull skipped.\n");
      return;
    }

    process.stdout.write("Pulling .akephalos from origin...\n");
    const pull = runGit(root, ["pull", "--ff-only"]);
    process.stdout.write(pull.stdout || pull.stderr);
    assertNoFailingScanIssues(root, "finish pull-only sync");
    process.stdout.write("Sync complete.\n");
    return;
  }

  ensureGitIdentity(root);
  appendEventRecord(root, {
    source: "cli",
    type: "sync",
    payload: {
      mode: "push",
    },
  });
  if (!hasRemote) {
    compactIfMemoriesChanged(root);
  }
  assertNoLikelySecretsBeforeCommit(root);
  stageSafePassportFiles(root);

  if (hasStagedChanges(root)) {
    process.stdout.write("Committing local .akephalos changes...\n");
    const commit = runGit(root, ["commit", "-m", "Sync Akephalos passport"]);
    process.stdout.write(commit.stdout || commit.stderr);
  } else {
    process.stdout.write("No local .akephalos changes to commit.\n");
  }

  if (hasRemote) {
    process.stdout.write("Pulling remote .akephalos changes...\n");
    const pull = runGit(root, ["pull", "--rebase", "--autostash"], { allowFailure: true });
    process.stdout.write(pull.stdout || pull.stderr);

    if ((pull.stderr || pull.stdout) && unmergedGitFiles(root).length > 0) {
      if (handleSafeGitConflicts(root)) {
        assertNoLikelySecretsBeforeCommit(root);
        const continued = runGit(root, ["-c", "core.editor=true", "rebase", "--continue"], {
          allowFailure: true,
        });

        if (continued.stdout || continued.stderr) {
          process.stdout.write(continued.stdout || continued.stderr);
        }

        if (unmergedGitFiles(root).length > 0 || continued.stderr.includes("could not")) {
          throw new Error("Sync could not finish after JSONL merge. Resolve Git rebase state manually.");
        }
      }
    } else if (pull.stderr.includes("CONFLICT") || pull.stderr.includes("error:")) {
      throw new Error(`git pull --rebase --autostash failed\n${pull.stderr || pull.stdout}`.trim());
    }

    compactIfMemoriesChanged(root);
    assertNoLikelySecretsBeforeCommit(root);
    stageSafePassportFiles(root);

    if (hasStagedChanges(root)) {
      process.stdout.write("Committing post-pull passport updates...\n");
      const commit = runGit(root, ["commit", "-m", "Sync Akephalos passport"]);
      process.stdout.write(commit.stdout || commit.stderr);
    }

    process.stdout.write("Pushing .akephalos to origin...\n");
    const push = runGit(root, ["push"]);
    process.stdout.write(push.stdout || push.stderr);
  } else {
    process.stdout.write("No origin remote configured; push skipped.\n");
  }

  process.stdout.write("Sync complete.\n");
}

function summarizeMemory(memory: unknown): string {
  if (memory === null) {
    return "null";
  }

  if (typeof memory !== "object") {
    return String(memory);
  }

  const record = memory as Record<string, unknown>;
  const text =
    record.text ??
    record.memory ??
    record.content ??
    record.summary ??
    record.title ??
    JSON.stringify(memory);
  const timestamp = record.timestamp ?? record.createdAt ?? record.date;
  const time = record.time ?? timestamp;
  const tags = Array.isArray(record.tags) ? record.tags.join(", ") : undefined;
  const displayText = safeDisplayText(String(text));
  const parts = [displayText];

  if (time) {
    parts.push(`time: ${String(time)}`);
  }

  if (tags) {
    parts.push(`tags: ${tags}`);
  }

  return parts.join(" | ");
}

function isClearlyMarkedPlaceholder(text: string): boolean {
  return /\b(example|placeholder|dummy|sample|test|fake|redacted|xxxx|your[_-]?key|replace[_-]?me)\b/i.test(text);
}

function looksHighEntropy(value: string): boolean {
  if (value.length < 32 || isClearlyMarkedPlaceholder(value)) {
    return false;
  }

  if (/^akp_\d{8}T\d{9}Z_[a-f0-9]{8}$/u.test(value)) {
    return false;
  }

  if (/^[a-f0-9]{40,64}$/u.test(value)) {
    return false;
  }

  if (/^exports\/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/u.test(value)) {
    return false;
  }

  const unique = new Set(value).size;
  const classes = [
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /\d/.test(value),
    /[_+/=-]/.test(value),
  ].filter(Boolean).length;

  return unique >= 18 && classes >= 3;
}

function scanLineForIssues(file: string, lineNumber: number, line: string): ScanIssue[] {
  if (isClearlyMarkedPlaceholder(line)) {
    return [];
  }

  const issues: ScanIssue[] = [];
  const fail = (kind: string, message: string): void => {
    issues.push({
      severity: "fail",
      file,
      line: lineNumber,
      kind,
      message,
      nextAction: "Remove the secret-looking value and rotate it if it was real.",
    });
  };
  const warn = (kind: string, message: string, nextAction: string): void => {
    issues.push({
      severity: "warn",
      file,
      line: lineNumber,
      kind,
      message,
      nextAction,
    });
  };

  const secretChecks: Array<[string, RegExp]> = [
    ["OpenAI key", /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/],
    ["Anthropic key", /\bsk-ant-[A-Za-z0-9_-]{20,}\b/],
    ["GitHub token", /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/],
    ["private key block", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
    ["password", /\b(pass(word)?|pwd)\b\s*[:=]\s*['"]?[^'"\s]{6,}/i],
    ["bearer token", /\bbearer\s+[A-Za-z0-9._~+/=-]{20,}\b/i],
    ["token", /\b(access[_-]?token|auth[_-]?token|api[_-]?key|apikey|token)\b\s*[:=]\s*['"]?[A-Za-z0-9._~+/=-]{20,}/i],
  ];

  for (const [kind, pattern] of secretChecks) {
    if (pattern.test(line)) {
      fail(kind, `${kind} detected; value redacted.`);
    }
  }

  const candidateValues = line.match(/[A-Za-z0-9_+/=-]{32,}/gu) ?? [];

  for (const value of candidateValues) {
    if (looksHighEntropy(value)) {
      fail("high entropy string", "Long high-entropy string detected; value redacted.");
      break;
    }
  }

  if (/\b[A-Z]:\\Users\\[^\\\s]+/i.test(line) || /\b\/Users\/[^\s/]+/i.test(line) || /\b\/home\/[^\s/]+/i.test(line)) {
    warn(
      "user path",
      "Local user path detected; path redacted.",
      "Replace machine-specific paths with generic descriptions if this passport will be shared.",
    );
  }

  return issues;
}

function sensitiveTextWarnings(text: string): string[] {
  return [...new Set(scanLineForIssues("input", 1, text).filter((issue) => issue.severity === "fail").map((issue) => issue.kind))];
}

function collectFilesRecursive(root: string, relativeRoot: string): string[] {
  const absoluteRoot = join(root, relativeRoot);

  if (!existsSync(absoluteRoot) || !statSync(absoluteRoot).isDirectory()) {
    return [];
  }

  const files: string[] = [];

  for (const entry of readdirSync(absoluteRoot, { withFileTypes: true })) {
    const relative = join(relativeRoot, entry.name);
    const absolute = join(root, relative);

    if (entry.isDirectory()) {
      files.push(...collectFilesRecursive(root, relative));
    } else if (entry.isFile() && /\.(md|json|jsonl|txt)$/iu.test(entry.name)) {
      files.push(relative);
    } else if (existsSync(absolute) && statSync(absolute).isFile() && /\.(md|json|jsonl|txt)$/iu.test(entry.name)) {
      files.push(relative);
    }
  }

  return files;
}

function scanBundle(root: string, options: { includeRejected?: boolean } = {}): ScanResult {
  const scanFiles = [
    ...bundleFiles,
    ...(options.includeRejected ? ["memories.rejected.jsonl", "events.rejected.jsonl"] : []),
    ...collectFilesRecursive(root, join("docs", "examples")),
  ];
  const scannedFiles: string[] = [];
  const issues: ScanIssue[] = [];

  for (const file of [...new Set(scanFiles)]) {
    const path = join(root, file);

    if (!existsSync(path) || !statSync(path).isFile()) {
      continue;
    }

    scannedFiles.push(file);
    const lines = readFileSync(path, "utf8").split(/\r?\n/);

    lines.forEach((line, index) => {
      issues.push(...scanLineForIssues(file, index + 1, line));
    });
  }

  const workspaceExamples = collectFilesRecursive(process.cwd(), join("docs", "examples"));

  for (const file of workspaceExamples) {
    const path = join(process.cwd(), file);

    if (!existsSync(path) || !statSync(path).isFile() || scannedFiles.includes(file)) {
      continue;
    }

    scannedFiles.push(file);
    const lines = readFileSync(path, "utf8").split(/\r?\n/);

    lines.forEach((line, index) => {
      issues.push(...scanLineForIssues(file, index + 1, line));
    });
  }

  return { issues, scannedFiles };
}

function formatScanIssue(issue: ScanIssue): string {
  return `- ${issue.file}:${issue.line} [${issue.severity}] ${issue.kind}: ${issue.message} Next: ${issue.nextAction}`;
}

function countScanIssues(issues: ScanIssue[]): ScanCounts {
  const counts: ScanCounts = {
    info: 0,
    warn: 0,
    fail: 0,
  };

  for (const issue of issues) {
    counts[issue.severity] += 1;
  }

  return counts;
}

function buildScanReport(root: string): ScanReport {
  const rootExists = existsSync(root);

  if (!rootExists || !statSync(root).isDirectory()) {
    const issue: ScanIssue = {
      severity: "fail",
      file: ".akephalos",
      line: 0,
      kind: rootExists ? "invalid bundle" : "missing bundle",
      message: rootExists ? `.akephalos exists but is not a directory at ${root}` : `.akephalos bundle is missing at ${root}`,
      nextAction: rootExists
        ? "Move the file aside and restore a .akephalos directory."
        : "Run akephalos init or clone the shared passport repo as .akephalos.",
    };

    return {
      version,
      bundle: root,
      ok: false,
      counts: countScanIssues([issue]),
      scannedFiles: [],
      issues: [issue],
    };
  }

  const scan = scanBundle(root);
  const counts = countScanIssues(scan.issues);

  return {
    version,
    bundle: root,
    ok: counts.fail === 0,
    counts,
    scannedFiles: scan.scannedFiles,
    issues: scan.issues,
  };
}

function buildScanText(root: string): { text: string; hasFailures: boolean } {
  const scan = scanBundle(root);
  const counts = countScanIssues(scan.issues);

  const lines = [
    "Akephalos scan",
    "",
    `Scanned files: ${scan.scannedFiles.length}`,
    `info: ${counts.info}`,
    `warn: ${counts.warn}`,
    `fail: ${counts.fail}`,
    "",
  ];

  if (scan.issues.length === 0) {
    lines.push("No issues found.");
  } else {
    lines.push("Issues:");
    lines.push(...scan.issues.map(formatScanIssue));
  }

  return {
    text: `${lines.join("\n")}\n`,
    hasFailures: counts.fail > 0,
  };
}

function printScan(options: { json: boolean } = { json: false }): void {
  if (options.json) {
    const report = buildScanReport(bundleRoot());
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

    if (!report.ok) {
      process.exitCode = 1;
    }

    return;
  }

  const root = requireBundleRoot();

  if (!root) {
    return;
  }

  const scan = buildScanText(root);
  process.stdout.write(scan.text);

  if (scan.hasFailures) {
    process.exitCode = 1;
  }
}

function assertNoFailingScanIssues(root: string, action: string): void {
  const scan = scanBundle(root, { includeRejected: true });
  const failures = scan.issues.filter((issue) => issue.severity === "fail");

  if (failures.length === 0) {
    return;
  }

  throw new Error(
    [
      `Refusing to ${action} because the passport contains likely secrets.`,
      ...failures.map(formatScanIssue),
      "Run `akephalos scan` for the full local report.",
    ].join("\n"),
  );
}

function safeDisplayText(text: string): string {
  if (sensitiveTextWarnings(text).length > 0) {
    return "[redacted: memory looks like it may contain a secret]";
  }

  return text;
}

function assertNonSecretText(label: string, text: string): void {
  const warnings = sensitiveTextWarnings(text);

  if (warnings.length > 0) {
    throw new Error(`${label} looks like it contains: ${warnings.join(", ")}`);
  }
}

function appendMemoryRecord(root: string, source: string, type: string, text: string): string {
  assertNonSecretText("Memory text", text);

  const time = new Date().toISOString();
  const memory = {
    id: recordId(time),
    time,
    source,
    type,
    text,
  };

  appendJsonLine(bundlePath(root, "memories.jsonl"), memory);
  return time;
}

function addMemory(text: string): void {
  const root = requireBundleRoot();

  if (!root) {
    return;
  }

  const warnings = sensitiveTextWarnings(text);

  if (warnings.length > 0) {
    process.stderr.write(
      `Refusing to store memory because it looks like it contains: ${warnings.join(", ")}.\n`,
    );
    process.stderr.write("Remove secrets from the text and try again.\n");
    process.exitCode = 1;
    return;
  }

  const time = appendMemoryRecord(root, "cli", "memory.add", text);
  appendEventRecord(root, {
    time,
    source: "cli",
    type: "memory.add",
    text,
  });
  updateManifestUpdatedAt(root, time);
  process.stdout.write("Memory added.\n");
}

function addMcpMemory(text: string): { warnings: string[] } {
  const error = getBundleRootError();

  if (error) {
    throw new Error(error);
  }

  const root = bundleRoot();
  const warnings = sensitiveTextWarnings(text);

  if (warnings.length > 0) {
    throw new Error(`Refusing to store memory because it looks like it contains: ${warnings.join(", ")}.`);
  }

  const memory = {
    time: new Date().toISOString(),
    source: "mcp",
    type: "memory.add",
    text,
  };
  const memoryWithId = {
    id: recordId(memory.time),
    ...memory,
  };

  appendJsonLine(bundlePath(root, "memories.jsonl"), memoryWithId);

  return {
    warnings: [],
  };
}

function formatCompactedMemory(memory: unknown): string {
  if (memory === null || typeof memory !== "object") {
    return `- ${safeDisplayText(String(memory))}`;
  }

  const record = memory as Record<string, unknown>;
  const text =
    record.text ??
    record.memory ??
    record.content ??
    record.summary ??
    record.title ??
    JSON.stringify(memory);
  const time = record.time ?? record.timestamp ?? record.createdAt ?? record.date;

  const displayText = safeDisplayText(String(text));

  if (time) {
    return `- ${displayText} (${String(time)})`;
  }

  return `- ${displayText}`;
}

function compactSection(memories: unknown[]): string {
  const lines = ["## Compacted Memories", ""];

  if (memories.length === 0) {
    lines.push("No memories recorded yet.");
  } else {
    for (const memory of memories) {
      lines.push(formatCompactedMemory(memory));
    }
  }

  return `${lines.join("\n")}\n`;
}

function replaceCompactedSection(identity: string, section: string): string {
  const markerMatch = /^## Compacted Memories\s*$/mu.exec(identity);

  if (!markerMatch) {
    const trimmed = identity.replace(/\s+$/u, "");
    return `${trimmed}\n\n${section}`;
  }

  const markerIndex = markerMatch.index;
  const afterMarker = markerIndex + markerMatch[0].length;
  const nextHeadingMatch = identity.slice(afterMarker).match(/\n##\s+/u);

  if (!nextHeadingMatch || nextHeadingMatch.index === undefined) {
    const before = identity.slice(0, markerIndex).replace(/\s+$/u, "");
    return `${before}\n\n${section}`;
  }

  const sectionEnd = afterMarker + nextHeadingMatch.index;
  const before = identity.slice(0, markerIndex).replace(/\s+$/u, "");
  const after = identity.slice(sectionEnd).replace(/^\s+/u, "");
  return `${before}\n\n${section}\n${after}`;
}

function compactMemoriesInRoot(root: string): number {
  const identityPath = join(root, "akephalos.md");
  const identity = readTextFile(identityPath);

  if (identity === undefined) {
    return 0;
  }

  const memories = parseJsonl(join(root, "memories.jsonl"));
  printWarnings(memories.warnings);

  const nextIdentity = replaceCompactedSection(identity, compactSection(memories.entries));
  writeFileSync(identityPath, nextIdentity, "utf8");

  return memories.entries.length;
}

function compactMemories(): void {
  const root = requireBundleRoot();

  if (!root) {
    return;
  }

  const memoryCount = compactMemoriesInRoot(root);
  const time = new Date().toISOString();
  appendEventRecord(root, {
    time,
    source: "cli",
    type: "memory.compact",
    memory_count: memoryCount,
  });
  updateManifestUpdatedAt(root, time);
  process.stdout.write(`Compacted ${memoryCount} memories into akephalos.md.\n`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function formatHarnessImport(entry: HarnessImport): string {
  const lines = [`### ${entry.name}`, "", `Source: ${entry.source}`];

  if (entry.tools.length > 0) {
    lines.push("", "Tools:");
    lines.push(...entry.tools.map((tool) => `- ${tool}`));
  }

  if (entry.preferences.length > 0) {
    lines.push("", "Preferences:");
    lines.push(...entry.preferences.map((preference) => `- ${preference}`));
  }

  if (entry.notes.length > 0) {
    lines.push("", "Notes:");
    lines.push(...entry.notes.map((note) => `- ${note}`));
  }

  return `${lines.join("\n")}\n`;
}

function upsertImportedHarness(toolsText: string, entry: HarnessImport): string {
  const sectionHeading = "## Imported Harnesses";
  const sectionMatch = /^## Imported Harnesses\s*$/mu.exec(toolsText);
  const entryBlock = formatHarnessImport(entry);

  if (!sectionMatch) {
    return `${toolsText.replace(/\s+$/u, "")}\n\n${sectionHeading}\n\n${entryBlock}`;
  }

  const sectionStart = sectionMatch.index;
  const afterHeading = sectionStart + sectionMatch[0].length;
  const nextSectionMatch = toolsText.slice(afterHeading).match(/\n##\s+/u);
  const sectionEnd =
    nextSectionMatch && nextSectionMatch.index !== undefined
      ? afterHeading + nextSectionMatch.index
      : toolsText.length;
  const before = toolsText.slice(0, sectionStart).replace(/\s+$/u, "");
  const section = toolsText.slice(sectionStart, sectionEnd).replace(/\s+$/u, "");
  const after = toolsText.slice(sectionEnd).replace(/^\s+/u, "");
  const entryHeadingPattern = new RegExp(`^### ${escapeRegExp(entry.name)}\\s*$`, "mu");
  const entryMatch = entryHeadingPattern.exec(section);
  let nextSection: string;

  if (!entryMatch) {
    nextSection = `${section}\n\n${entryBlock.replace(/\s+$/u, "")}`;
  } else {
    const entryStart = entryMatch.index;
    const afterEntryHeading = entryStart + entryMatch[0].length;
    const nextEntryMatch = section.slice(afterEntryHeading).match(/\n###\s+/u);
    const entryEnd =
      nextEntryMatch && nextEntryMatch.index !== undefined
        ? afterEntryHeading + nextEntryMatch.index
        : section.length;
    const beforeEntry = section.slice(0, entryStart).replace(/\s+$/u, "");
    const afterEntry = section.slice(entryEnd).replace(/^\s+/u, "");
    nextSection = afterEntry
      ? `${beforeEntry}\n\n${entryBlock.replace(/\s+$/u, "")}\n\n${afterEntry}`
      : `${beforeEntry}\n\n${entryBlock.replace(/\s+$/u, "")}`;
  }

  return after ? `${before}\n\n${nextSection}\n\n${after}` : `${before}\n\n${nextSection}\n`;
}

function parseHarnessImportArgs(args: string[]): HarnessImportArgs {
  const tools: string[] = [];
  const preferences: string[] = [];
  const notes: string[] = [];
  let name: string | undefined;
  let auto = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--auto") {
      auto = true;
      continue;
    }

    if (arg === "--tool" || arg === "--preference" || arg === "--note") {
      const value = args[index + 1];

      if (!value || value.startsWith("--")) {
        throw new Error(`${arg} requires a value`);
      }

      if (arg === "--tool") {
        tools.push(value);
      } else if (arg === "--preference") {
        preferences.push(value);
      } else {
        notes.push(value);
      }

      index += 1;
      continue;
    }

    if (arg.startsWith("--")) {
      throw new Error(`Unknown option for import-harness: ${arg}`);
    }

    if (name) {
      throw new Error(`Unexpected argument for import-harness: ${arg}`);
    }

    name = arg;
  }

  if (auto) {
    return {
      auto,
      imports: detectLocalHarnesses(),
    };
  }

  if (!name) {
    throw new Error('Usage: akephalos import-harness "Harness Name" --tool "..." --preference "..."');
  }

  return {
    auto,
    imports: [
      {
        name,
        tools,
        preferences,
        notes: notes.length > 0 ? notes : ["Harness linked to the shared Akephalos profile."],
        source: "manual",
      },
    ],
  };
}

function detectLocalHarnesses(): HarnessImport[] {
  const imports: HarnessImport[] = [];
  const home = process.env.USERPROFILE ?? process.env.HOME;
  const appData = process.env.APPDATA;

  if (home) {
    const codexDir = join(home, ".codex");
    const codexConfig = join(codexDir, "config.toml");
    const codexAgents = join(codexDir, "AGENTS.md");

    if (existsSync(codexDir)) {
      const configText = readOptionalTextFile(codexConfig) ?? "";
      imports.push({
        name: "Codex",
        tools: [
          ...(configText.includes('plugins."github@openai-curated"') ? ["GitHub plugin"] : []),
          ...(configText.includes('plugins."browser-use@openai-bundled"') ? ["Browser plugin"] : []),
        ],
        preferences: readOptionalTextFile(codexAgents)
          ? [
              "Be direct and concise.",
              "Inspect the local codebase before making changes.",
              "Prefer the simplest change that satisfies the requirement.",
              "Run the smallest relevant validation after changes.",
              "Do not run destructive git commands unless explicitly requested.",
            ]
          : [],
        notes: ["Imported from fixed local Codex configuration paths; auth, logs, sessions, and SQLite state were ignored."],
        source: "auto",
      });
    }
  }

  if (appData) {
    const cursorUserDir = join(appData, "Cursor", "User");

    if (existsSync(cursorUserDir)) {
      imports.push({
        name: "Cursor",
        tools: ["Cursor IDE"],
        preferences: [],
        notes: [
          "Cursor user configuration was detected.",
          "No project-level Cursor rules are imported automatically; add them manually with import-harness if needed.",
        ],
        source: "auto",
      });
    }
  }

  return imports;
}

function importHarnesses(args: string[]): void {
  const root = requireBundleRoot();

  if (!root) {
    return;
  }

  const parsed = parseHarnessImportArgs(args);

  if (parsed.imports.length === 0) {
    process.stdout.write("No known local harnesses detected.\n");
    return;
  }

  for (const entry of parsed.imports) {
    assertNonSecretText("Harness name", entry.name);

    for (const tool of entry.tools) {
      assertNonSecretText("Harness tool", tool);
    }

    for (const preference of entry.preferences) {
      assertNonSecretText("Harness preference", preference);
    }

    for (const note of entry.notes) {
      assertNonSecretText("Harness note", note);
    }
  }

  const toolsPath = bundlePath(root, "tools.md");
  let toolsText = readOptionalTextFile(toolsPath) ?? "# Tools\n";
  const registry = migrateHarnessRegistryFromTools(root);
  let registryEntries = registry.entries;
  let lastTime = new Date().toISOString();

  for (const entry of parsed.imports) {
    toolsText = upsertImportedHarness(toolsText, entry);
    const existing = registryEntries.find((candidate) => harnessKey(candidate.name) === harnessKey(entry.name));
    const registryResult = upsertHarnessRegistryEntry(
      registryEntries,
      defaultHarnessEntry(
        entry.name,
        entry.source,
        existing?.status === "known-working" ? "known-working" : "configured",
        lastTime,
        entry.notes,
      ),
    );
    registryEntries = registryResult.entries;
    const summaryParts = [
      `Imported ${entry.name} harness context into Akephalos.`,
      entry.tools.length > 0 ? `Tools: ${entry.tools.join(", ")}.` : "",
      entry.preferences.length > 0 ? `Preferences: ${entry.preferences.join("; ")}.` : "",
      entry.notes.length > 0 ? `Notes: ${entry.notes.join("; ")}.` : "",
    ].filter(Boolean);

    lastTime = appendMemoryRecord(root, "cli", "harness.import", summaryParts.join(" "));
    appendEventRecord(root, {
      time: lastTime,
      source: "cli",
      type: "harness.import",
      harness: entry.name,
      import_source: entry.source,
      tool_count: entry.tools.length,
      preference_count: entry.preferences.length,
      note_count: entry.notes.length,
    });
  }

  writeFileSync(toolsPath, toolsText, "utf8");
  writeHarnessRegistry(root, registryEntries);
  ensureManifestListsFile(root, "harnesses.json");
  const memoryCount = compactMemoriesInRoot(root);
  updateManifestUpdatedAt(root, lastTime);
  process.stdout.write(`Imported ${parsed.imports.length} harness profile(s).\n`);
  process.stdout.write(`Compacted ${memoryCount} memories into akephalos.md.\n`);
  printWarnings(registry.warnings);
}

function exportBundle(): void {
  const root = requireBundleRoot();

  if (!root) {
    return;
  }

  assertNoFailingScanIssues(root, "export");

  const exportsRoot = join(root, "exports");
  ensureDirectory(exportsRoot);

  const now = new Date();
  const time = now.toISOString();
  const exportName = portableTimestamp(now);
  const exportDir = createUniqueDirectory(exportsRoot, exportName);

  appendEventRecord(root, {
    time,
    source: "cli",
    type: "export.create",
    export: `exports/${exportName}`,
  });

  const copied: string[] = [];
  const missing: string[] = [];

  for (const file of exportFiles) {
    const source = join(root, file);

    if (!existsSync(source) || !statSync(source).isFile()) {
      missing.push(file);
      continue;
    }

    copyFileSync(source, join(exportDir, file));
    copied.push(file);
  }

  process.stdout.write(`Export created: ${exportDir}\n`);
  process.stdout.write(`Copied: ${copied.length > 0 ? copied.join(", ") : "none"}\n`);
  process.stdout.write("Zip: skipped (no archive dependency configured)\n");

  for (const file of missing) {
    process.stderr.write(`Warning: missing optional file was not exported: ${file}\n`);
  }
}

function readKnownMcpResource(target: McpResourceTarget): string {
  const error = getBundleRootError();

  if (error) {
    return `${error}\n`;
  }

  const root = bundleRoot();
  const file = mcpResourceTargets[target].file;
  const path = join(root, file);
  const text = readOptionalTextFile(path);

  return text ?? `Missing file: ${file}\n`;
}

function readableMemoriesResource(): string {
  const error = getBundleRootError();

  if (error) {
    return `${error}\n`;
  }

  const root = bundleRoot();
  const memories = parseJsonlQuiet(join(root, "memories.jsonl"));
  const lines =
    memories.entries.length === 0
      ? ["No memories found."]
      : memories.entries.map((memory, index) => `${index + 1}. ${summarizeMemory(memory)}`);

  for (const warning of memories.warnings) {
    lines.push(`Warning: ${warning}`);
  }

  return `${lines.join("\n")}\n`;
}

async function startMcpServer(): Promise<void> {
  const server = new McpServer({
    name: "akephalos",
    version,
  });

  for (const [target, config] of Object.entries(mcpResourceTargets) as Array<
    [McpResourceTarget, (typeof mcpResourceTargets)[McpResourceTarget]]
  >) {
    server.registerResource(
      target,
      `akephalos://${target}`,
      {
        title: config.title,
        description: `Read ${config.file} from the local .akephalos bundle.`,
        mimeType: config.mimeType,
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: config.mimeType,
            text: readKnownMcpResource(target),
          },
        ],
      }),
    );
  }

  server.registerResource(
    "memories",
    "akephalos://memories",
    {
      title: "Akephalos memories",
      description: "Read parsed memories from the local .akephalos bundle.",
      mimeType: "text/plain",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/plain",
          text: readableMemoriesResource(),
        },
      ],
    }),
  );

  server.registerTool(
    "get_status",
    {
      title: "Get Akephalos status",
      description: "Show local .akephalos bundle status.",
    },
    async () => {
      const status = buildStatusText();
      const text =
        status.warnings.length === 0
          ? status.text
          : `${status.text}${status.warnings.map((warning) => `Warning: ${warning}`).join("\n")}\n`;

      return {
        content: [{ type: "text", text }],
      };
    },
  );

  const addMemoryToolConfig = {
    title: "Add memory",
    description: "Append a memory to .akephalos/memories.jsonl.",
    inputSchema: {
      text: z.string(),
    },
  };
  const addMemoryToolHandler = async (args: { text: string }) => {
      try {
        const { text } = args;

        if (!text.trim()) {
          return {
            content: [{ type: "text", text: "Error: text is required." }],
            isError: true,
          };
        }

        const result = addMcpMemory(text);
        const warningText =
          result.warnings.length === 0
            ? ""
            : `\n${result.warnings.map((warning) => `Warning: memory text appears to contain a ${warning}.`).join("\n")}`;

        return {
          content: [{ type: "text", text: `Memory added.${warningText}` }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        };
      }
    };

  server.registerTool("add_memory", addMemoryToolConfig as any, addMemoryToolHandler as any);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function printMemories(): void {
  const root = bundleRoot();
  const memories = parseJsonl(join(root, "memories.jsonl"));

  printWarnings(memories.warnings);

  if (memories.entries.length === 0) {
    process.stdout.write("No memories found.\n");
    return;
  }

  memories.entries.forEach((memory, index) => {
    process.stdout.write(`${index + 1}. ${summarizeMemory(memory)}\n`);
  });
}

function printSection(target: PrintTarget): void {
  if (target === "memories") {
    printMemories();
    return;
  }

  const text = readTextFile(join(bundleRoot(), printTargets[target]));

  if (text !== undefined) {
    process.stdout.write(text);
  }
}

function printInitResult(result: InitResult): void {
  process.stdout.write("Created .akephalos bundle.\n");

  if (result.created.length > 0) {
    process.stdout.write(`Created: ${result.created.join(", ")}\n`);
  }

  if (result.skipped.length > 0) {
    process.stdout.write(`Skipped existing files: ${result.skipped.join(", ")}\n`);
  }
}

function main(args: string[]): void {
  const [command, ...rest] = args;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "--version" || command === "-v") {
    process.stdout.write(`${version}\n`);
    return;
  }

  if (command === "init") {
    const force = rest.includes("--force");
    const unknownFlag = rest.find((arg) => arg !== "--force");

    if (unknownFlag) {
      process.stderr.write(`Unknown option for init: ${unknownFlag}\n`);
      process.exitCode = 1;
      return;
    }

    try {
      printInitResult(initBundle(force));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`Init failed: ${message}\n`);
      process.exitCode = 1;
    }
    return;
  }

  if (command === "add-memory") {
    const text = rest.join(" ").trim();

    if (!text) {
      process.stderr.write('Usage: akephalos add-memory "text"\n');
      process.exitCode = 1;
      return;
    }

    try {
      addMemory(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`Add memory failed: ${message}\n`);
      process.exitCode = 1;
    }
    return;
  }

  if (command === "compact") {
    if (rest.length > 0) {
      process.stderr.write(`Unknown option for compact: ${rest[0]}\n`);
      process.exitCode = 1;
      return;
    }

    try {
      compactMemories();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`Compact failed: ${message}\n`);
      process.exitCode = 1;
    }
    return;
  }

  if (command === "import-harness") {
    try {
      importHarnesses(rest);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`Import harness failed: ${message}\n`);
      process.exitCode = 1;
    }
    return;
  }

  if (command === "harness") {
    try {
      handleHarnessCommand(rest);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`Harness failed: ${message}\n`);
      process.exitCode = 1;
    }
    return;
  }

  if (command === "pulse") {
    try {
      printPulse(rest);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`Pulse failed: ${message}\n`);
      process.exitCode = 1;
    }
    return;
  }

  if (command === "sync") {
    try {
      syncPassport(rest);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`Sync failed: ${message}\n`);
      process.exitCode = 1;
    }
    return;
  }

  if (command === "sync-status") {
    if (rest.length > 0) {
      process.stderr.write(`Unknown option for sync-status: ${rest[0]}\n`);
      process.exitCode = 1;
      return;
    }

    try {
      printSyncStatus();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`Sync status failed: ${message}\n`);
      process.exitCode = 1;
    }
    return;
  }

  if (command === "scan") {
    if (rest.length > 1 || (rest.length === 1 && rest[0] !== "--json")) {
      process.stderr.write(`Unknown option for scan: ${rest[0]}\n`);
      process.exitCode = 1;
      return;
    }

    try {
      printScan({ json: rest[0] === "--json" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`Scan failed: ${message}\n`);
      process.exitCode = 1;
    }
    return;
  }

  if (command === "merge-ledgers") {
    if (rest.length > 0) {
      process.stderr.write(`Unknown option for merge-ledgers: ${rest[0]}\n`);
      process.exitCode = 1;
      return;
    }

    try {
      mergeLedgers();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`Merge ledgers failed: ${message}\n`);
      process.exitCode = 1;
    }
    return;
  }

  if (command === "export") {
    if (rest.length > 0) {
      process.stderr.write(`Unknown option for export: ${rest[0]}\n`);
      process.exitCode = 1;
      return;
    }

    try {
      exportBundle();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`Export failed: ${message}\n`);
      process.exitCode = 1;
    }
    return;
  }

  if (command === "mcp") {
    if (rest.length > 0) {
      process.stderr.write(`Unknown option for mcp: ${rest[0]}\n`);
      process.exitCode = 1;
      return;
    }

    startMcpServer().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`MCP server failed: ${message}\n`);
      process.exitCode = 1;
    });
    return;
  }

  if (command === "status") {
    if (rest.length > 1 || (rest.length === 1 && rest[0] !== "--json")) {
      process.stderr.write(`Unknown option for status: ${rest[0]}\n`);
      process.exitCode = 1;
      return;
    }

    if (rest[0] === "--json") {
      printStatusJson();
    } else {
      printStatus();
    }
    return;
  }

  if (command === "doctor") {
    if (rest.length > 1 || (rest.length === 1 && rest[0] !== "--json")) {
      process.stderr.write(`Unknown option for doctor: ${rest[0]}\n`);
      process.exitCode = 1;
      return;
    }

    try {
      printDoctor({ json: rest[0] === "--json" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`Doctor failed: ${message}\n`);
      process.exitCode = 1;
    }
    return;
  }

  if (command === "print") {
    const [target, ...extra] = rest;
    const allowedTargets = ["identity", "rules", "tools", "projects", "memories"];

    if (!target || !allowedTargets.includes(target)) {
      process.stderr.write(
        `Unknown print target: ${target ?? "(missing)"}\nUse one of: ${allowedTargets.join(", ")}\n`,
      );
      process.exitCode = 1;
      return;
    }

    if (extra.length > 0) {
      process.stderr.write(`Unexpected argument for print ${target}: ${extra[0]}\n`);
      process.exitCode = 1;
      return;
    }

    printSection(target as PrintTarget);
    return;
  }

  process.stderr.write(`Unknown command: ${command}\n\n`);
  printHelp();
  process.exitCode = 1;
}

main(process.argv.slice(2));
