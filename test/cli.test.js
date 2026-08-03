const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");
const test = require("node:test");
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");

const repoRoot = resolve(__dirname, "..");
const cli = join(repoRoot, "dist", "index.js");
const idPattern = /^akp_\d{8}T\d{9}Z_[a-f0-9]{8}$/;

function tempWorkspace() {
  return mkdtempSync(join(tmpdir(), "akephalos-test-"));
}

function runCli(cwd, args) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    assert.fail(
      [
        `Command failed: akephalos ${args.join(" ")}`,
        `stdout: ${result.stdout}`,
        `stderr: ${result.stderr}`,
      ].join("\n"),
    );
  }

  return result;
}

function runCliRaw(cwd, args) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: "utf8",
  });
}

function readJsonl(path) {
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function runGit(cwd, args) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    assert.fail(
      [
        `Git failed: git ${args.join(" ")}`,
        `stdout: ${result.stdout}`,
        `stderr: ${result.stderr}`,
      ].join("\n"),
    );
  }

  return result;
}

test("init creates expected files", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);

  const root = join(cwd, ".akephalos");
  const expected = [
    "manifest.json",
    "akephalos.md",
    "rules.md",
    "tools.md",
    "projects.md",
    "harnesses.json",
    "memories.jsonl",
    "events.jsonl",
  ];

  for (const file of expected) {
    assert.equal(existsSync(join(root, file)), true, `${file} should exist`);
  }

  assert.equal(existsSync(join(root, "exports")), true, "exports directory should exist");
  assert.equal(JSON.parse(readFileSync(join(root, "manifest.json"), "utf8")).version, 1);
});

test("init does not overwrite existing files", () => {
  const cwd = tempWorkspace();
  const customRules = "# Rules\n\nDo not overwrite this.\n";

  runCli(cwd, ["init"]);
  writeFileSync(join(cwd, ".akephalos", "rules.md"), customRules, "utf8");
  runCli(cwd, ["init"]);

  assert.equal(readFileSync(join(cwd, ".akephalos", "rules.md"), "utf8"), customRules);
});

test("add-memory appends valid JSONL", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, ["add-memory", "first memory"]);
  runCli(cwd, ["add-memory", "second memory"]);

  const memories = readJsonl(join(cwd, ".akephalos", "memories.jsonl"));
  assert.equal(memories.length, 2);
  assert.equal(memories[0].source, "cli");
  assert.equal(memories[0].type, "memory.add");
  assert.equal(memories[0].text, "first memory");
  assert.equal(memories[1].text, "second memory");
  assert.equal(typeof memories[0].time, "string");
  assert.match(memories[0].id, idPattern);
  assert.match(memories[1].id, idPattern);

  const events = readJsonl(join(cwd, ".akephalos", "events.jsonl"));
  const memoryEvents = events.filter((event) => event.type === "memory.add");
  assert.equal(memoryEvents.length, 2);
  assert.match(memoryEvents[0].id, idPattern);
});

test("add-memory refuses secret-looking text", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  const result = runCliRaw(cwd, ["add-memory", "password=supersecret123"]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Refusing to store memory/);
  assert.equal(readJsonl(join(cwd, ".akephalos", "memories.jsonl")).length, 0);
});

test("import-harness imports tools and preferences", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, [
    "import-harness",
    "Pi IDE",
    "--tool",
    "terminal",
    "--tool",
    "git",
    "--preference",
    "Prefer small diffs",
    "--note",
    "Runs on the Pi test machine",
  ]);

  const tools = readFileSync(join(cwd, ".akephalos", "tools.md"), "utf8");
  const identity = readFileSync(join(cwd, ".akephalos", "akephalos.md"), "utf8");
  const memories = readJsonl(join(cwd, ".akephalos", "memories.jsonl"));
  const events = readJsonl(join(cwd, ".akephalos", "events.jsonl"));
  const harnesses = JSON.parse(readFileSync(join(cwd, ".akephalos", "harnesses.json"), "utf8"));

  assert.match(tools, /## Imported Harnesses/);
  assert.match(tools, /### Pi IDE/);
  assert.match(tools, /terminal/);
  assert.match(tools, /Prefer small diffs/);
  assert.match(identity, /Imported Pi IDE harness context/);
  assert.equal(harnesses.length, 1);
  assert.equal(harnesses[0].name, "Pi IDE");
  assert.equal(harnesses[0].status, "configured");
  assert.equal(harnesses[0].sync, true);
  assert.equal(memories.length, 1);
  assert.equal(memories[0].type, "harness.import");
  assert.match(memories[0].id, idPattern);
  const importEvent = events.find((event) => event.type === "harness.import" && event.harness === "Pi IDE");
  assert.ok(importEvent);
  assert.match(importEvent.id, idPattern);
});

test("import-harness updates an existing harness section", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, ["import-harness", "Pi IDE", "--tool", "terminal"]);
  runCli(cwd, ["import-harness", "Pi IDE", "--tool", "git"]);

  const tools = readFileSync(join(cwd, ".akephalos", "tools.md"), "utf8");
  assert.equal((tools.match(/^### Pi IDE\s*$/gm) || []).length, 1);
  assert.doesNotMatch(tools, /terminal/);
  assert.match(tools, /git/);
});

test("import-harness refuses secret-looking context", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  const result = runCliRaw(cwd, [
    "import-harness",
    "Pi IDE",
    "--preference",
    "password=supersecret123",
  ]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Import harness failed/);
  assert.equal(readJsonl(join(cwd, ".akephalos", "memories.jsonl")).length, 0);
});

test("harness commands add list mark and check registry", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, ["harness", "add", "Hermes"]);
  runCli(cwd, ["harness", "mark", "Hermes", "--status", "configured"]);
  const list = runCli(cwd, ["harness", "list"]);

  assert.match(list.stdout, /Hermes: status=configured/);

  const check = runCli(cwd, ["harness", "check"]);
  assert.match(check.stdout, /Harness check complete/);

  const harnesses = JSON.parse(readFileSync(join(cwd, ".akephalos", "harnesses.json"), "utf8"));
  const hermes = harnesses.find((entry) => entry.name === "Hermes");
  assert.ok(hermes);
  assert.equal(hermes.status, "configured");
  assert.equal(hermes.source, "manual");

  const events = readJsonl(join(cwd, ".akephalos", "events.jsonl"));
  assert.ok(events.find((event) => event.type === "harness.add" && event.harness === "Hermes"));
  assert.ok(events.find((event) => event.type === "harness.mark" && event.status === "configured"));
  assert.ok(events.find((event) => event.type === "harness.check"));
});

test("harness list migrates imported harnesses from tools markdown", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  writeFileSync(
    join(cwd, ".akephalos", "tools.md"),
    "# Tools\n\n## Imported Harnesses\n\n### Codex\n\n### Cursor\n\n### Pi IDE\n",
    "utf8",
  );

  const result = runCli(cwd, ["harness", "list"]);
  assert.match(result.stdout, /Codex: status=configured/);
  assert.match(result.stdout, /Cursor: status=configured/);
  assert.match(result.stdout, /Pi IDE: status=configured/);

  const harnesses = JSON.parse(readFileSync(join(cwd, ".akephalos", "harnesses.json"), "utf8"));
  assert.deepEqual(
    harnesses.map((entry) => entry.name),
    ["Codex", "Cursor", "Pi IDE"],
  );
});


test("status counts memories", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, ["add-memory", "one"]);
  runCli(cwd, ["add-memory", "two"]);
  runCli(cwd, ["add-memory", "three"]);

  const result = runCli(cwd, ["status"]);
  assert.match(result.stdout, /Memory count: 3/);
});

test("doctor reports healthy bundle checks", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, ["add-memory", "doctor smoke memory"]);

  const result = runCli(cwd, ["doctor"]);

  assert.match(result.stdout, /Akephalos doctor/);
  assert.match(result.stdout, /PASS \(/);
  assert.match(result.stdout, /WARN \(/);
  assert.match(result.stdout, /FAIL \(0\)/);
  assert.match(result.stdout, /manifest\.json is valid JSON/);
  assert.match(result.stdout, /memories\.jsonl has valid JSONL/);
});

test("doctor reports malformed JSONL without crashing", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  writeFileSync(join(cwd, ".akephalos", "memories.jsonl"), '{"text":"ok"}\nnot json\n', "utf8");

  const result = runCliRaw(cwd, ["doctor"]);

  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /FAIL \(/);
  assert.match(result.stdout, /memories\.jsonl:2: malformed JSONL entry/);
  assert.doesNotMatch(result.stderr, /SyntaxError|stack/i);
});

test("doctor detects conflict markers", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  writeFileSync(join(cwd, ".akephalos", "rules.md"), "# Rules\n\n<<<<<<< HEAD\n", "utf8");

  const result = runCliRaw(cwd, ["doctor"]);

  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /Git conflict marker in rules\.md:3/);
  assert.match(result.stdout, /Next: Resolve the conflict/);
});

test("doctor redacts likely secrets", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  writeFileSync(
    join(cwd, ".akephalos", "memories.jsonl"),
    `${JSON.stringify({ text: "password=supersecret123" })}\n`,
    "utf8",
  );

  const result = runCliRaw(cwd, ["doctor"]);

  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /likely secret in memories\.jsonl:1 \(password; value redacted\)/);
  assert.doesNotMatch(result.stdout, /supersecret123/);
});

test("merge-ledgers resolves JSONL conflict markers and deduplicates records", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  writeFileSync(
    join(cwd, ".akephalos", "memories.jsonl"),
    [
      '{"id":"mem-1","time":"2026-01-01T00:00:00.000Z","type":"memory.add","text":"keep older"}',
      "<<<<<<< HEAD",
      '{"id":"mem-2","time":"2026-01-02T00:00:00.000Z","type":"memory.add","text":"ours"}',
      '{"id":"mem-dup","time":"2026-01-03T00:00:00.000Z","type":"memory.add","text":"same"}',
      "=======",
      '{"id":"mem-dup","time":"2026-01-03T00:00:00.000Z","type":"memory.add","text":"same"}',
      '{"id":"mem-3","time":"2026-01-04T00:00:00.000Z","type":"memory.add","text":"theirs"}',
      ">>>>>>> branch",
      "",
    ].join("\n"),
    "utf8",
  );

  const result = runCli(cwd, ["merge-ledgers"]);

  assert.match(result.stdout, /Merged ledgers/);
  assert.match(result.stdout, /memories\.jsonl records: 4/);
  assert.match(result.stdout, /Rejected lines: 0/);

  const memoriesText = readFileSync(join(cwd, ".akephalos", "memories.jsonl"), "utf8");
  assert.doesNotMatch(memoriesText, /<<<<<<<|=======|>>>>>>>/);
  const memories = readJsonl(join(cwd, ".akephalos", "memories.jsonl"));
  assert.deepEqual(
    memories.map((entry) => entry.id),
    ["mem-1", "mem-2", "mem-dup", "mem-3"],
  );
  assert.equal(existsSync(join(cwd, ".akephalos", "memories.rejected.jsonl")), false);

  const events = readJsonl(join(cwd, ".akephalos", "events.jsonl"));
  assert.ok(events.find((event) => event.type === "ledger.merge"));
});

test("merge-ledgers writes malformed conflict lines to a rejected ledger", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  writeFileSync(
    join(cwd, ".akephalos", "events.jsonl"),
    [
      "<<<<<<< HEAD",
      '{"id":"evt-1","time":"2026-01-01T00:00:00.000Z","type":"sync"}',
      "=======",
      "not json",
      '{"id":"evt-2","time":"2026-01-02T00:00:00.000Z","type":"memory.add"}',
      ">>>>>>> branch",
      "",
    ].join("\n"),
    "utf8",
  );

  const result = runCli(cwd, ["merge-ledgers"]);

  assert.match(result.stdout, /events\.jsonl records: 3/);
  assert.match(result.stdout, /Rejected lines: 1/);
  assert.match(result.stdout, /Rejected output:/);

  const eventsText = readFileSync(join(cwd, ".akephalos", "events.jsonl"), "utf8");
  assert.doesNotMatch(eventsText, /<<<<<<<|=======|>>>>>>>|not json/);
  const events = readJsonl(join(cwd, ".akephalos", "events.jsonl"));
  assert.ok(events.find((event) => event.id === "evt-1"));
  assert.ok(events.find((event) => event.id === "evt-2"));
  assert.ok(events.find((event) => event.type === "ledger.merge"));

  const rejected = readJsonl(join(cwd, ".akephalos", "events.rejected.jsonl"));
  assert.equal(rejected.length, 1);
  assert.equal(rejected[0].file, "events.jsonl");
  assert.equal(rejected[0].text, "not json");
  assert.match(rejected[0].reason, /malformed JSON/);
});

test("scan detects likely secrets without printing values", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  writeFileSync(join(cwd, ".akephalos", "rules.md"), "OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuv1234567890\n", "utf8");
  const result = runCliRaw(cwd, ["scan"]);

  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /Akephalos scan/);
  assert.match(result.stdout, /rules\.md:1 \[fail\] OpenAI key/);
  assert.match(result.stdout, /value redacted/);
  assert.doesNotMatch(result.stdout, /sk-proj-abcdefghijklmnopqrstuv1234567890/);
});

test("scan warns for local user paths without failing", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  writeFileSync(join(cwd, ".akephalos", "tools.md"), "Workspace: C:\\Users\\alice\\Desktop\\Project\n", "utf8");
  const result = runCli(cwd, ["scan"]);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /tools\.md:1 \[warn\] user path/);
});

test("scan allows clearly marked demo placeholders", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  writeFileSync(join(cwd, ".akephalos", "rules.md"), "Example placeholder key: sk-proj-abcdefghijklmnopqrstuv1234567890\n", "utf8");
  const result = runCli(cwd, ["scan"]);

  assert.match(result.stdout, /fail: 0/);
});

test("export refuses likely secrets", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  writeFileSync(join(cwd, ".akephalos", "rules.md"), "github_pat_abcdefghijklmnopqrstuv1234567890ABCDEFGHIJ\n", "utf8");
  const result = runCliRaw(cwd, ["export"]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Export failed: Refusing to export/);
  assert.doesNotMatch(result.stderr, /github_pat_abcdefghijklmnopqrstuv1234567890ABCDEFGHIJ/);
});

test("pulse shows a digest without writing to the ledger", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, ["add-memory", "old memory"]);
  runCli(cwd, ["add-memory", "new memory"]);
  runCli(cwd, ["import-harness", "Pi IDE", "--tool", "terminal"]);
  const memoriesBefore = readFileSync(join(cwd, ".akephalos", "memories.jsonl"), "utf8");
  const eventsBefore = readFileSync(join(cwd, ".akephalos", "events.jsonl"), "utf8");

  const result = runCli(cwd, ["pulse", "--limit", "2"]);

  assert.match(result.stdout, /Akephalos pulse/);
  assert.match(result.stdout, /Memory count: 3/);
  assert.match(result.stdout, /Imported harnesses: Pi IDE/);
  assert.match(result.stdout, /new memory/);
  assert.doesNotMatch(result.stdout, /old memory/);
  assert.match(result.stdout, /Review suggestions:/);
  assert.equal(readFileSync(join(cwd, ".akephalos", "memories.jsonl"), "utf8"), memoriesBefore);
  assert.equal(readFileSync(join(cwd, ".akephalos", "events.jsonl"), "utf8"), eventsBefore);
});

test("pulse validates limit", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  const result = runCliRaw(cwd, ["pulse", "--limit", "0"]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Pulse failed/);
});

test("merge-ledgers resolves JSONL conflict markers and preserves rejected lines", () => {
  const cwd = tempWorkspace();
  const memoryPath = join(cwd, ".akephalos", "memories.jsonl");
  const eventPath = join(cwd, ".akephalos", "events.jsonl");

  runCli(cwd, ["init"]);
  writeFileSync(
    memoryPath,
    [
      JSON.stringify({ time: "2026-05-12T00:00:00.000Z", source: "base", type: "memory.add", text: "base" }),
      "<<<<<<< HEAD",
      JSON.stringify({ id: "shared", time: "2026-05-12T00:00:01.000Z", source: "ours", type: "memory.add", text: "ours" }),
      "not json",
      "=======",
      JSON.stringify({ id: "shared", time: "2026-05-12T00:00:01.000Z", source: "theirs", type: "memory.add", text: "theirs duplicate" }),
      JSON.stringify({ time: "2026-05-12T00:00:02.000Z", source: "theirs", type: "memory.add", text: "legacy" }),
      ">>>>>>> branch",
      JSON.stringify({ time: "2026-05-12T00:00:02.000Z", source: "theirs", type: "memory.add", text: "legacy" }),
      "",
    ].join("\n"),
    "utf8",
  );

  const result = runCli(cwd, ["merge-ledgers"]);

  assert.match(result.stdout, /Merged ledgers/);
  assert.match(result.stdout, /Rejected lines: 1/);
  const memoryText = readFileSync(memoryPath, "utf8");
  assert.doesNotMatch(memoryText, /<<<<<<<|=======|>>>>>>>/);
  const memories = readJsonl(memoryPath);
  assert.equal(memories.length, 3);
  assert.equal(memories.filter((memory) => memory.id === "shared").length, 1);
  assert.equal(memories.filter((memory) => memory.text === "legacy").length, 1);
  assert.match(readFileSync(join(cwd, ".akephalos", "memories.rejected.jsonl"), "utf8"), /not json/);

  const events = readJsonl(eventPath);
  assert.ok(events.some((event) => event.type === "ledger.merge" && event.id));
});

test("merge-ledgers dedupes equivalent legacy records without ids", () => {
  const cwd = tempWorkspace();
  const memoryPath = join(cwd, ".akephalos", "memories.jsonl");

  runCli(cwd, ["init"]);
  writeFileSync(
    memoryPath,
    [
      JSON.stringify({ time: "2026-05-12T00:00:00.000Z", source: "legacy", type: "memory.add", text: "same" }),
      JSON.stringify({ text: "same", type: "memory.add", source: "legacy", time: "2026-05-12T00:00:00.000Z" }),
      JSON.stringify({ time: "2026-05-12T00:00:01.000Z", source: "legacy", type: "memory.add", text: "different" }),
      "",
    ].join("\n"),
    "utf8",
  );

  const result = runCli(cwd, ["merge-ledgers"]);

  assert.match(result.stdout, /memories\.jsonl records: 2/);
  const memories = readJsonl(memoryPath);
  assert.equal(memories.length, 2);
  assert.equal(memories.filter((memory) => memory.text === "same").length, 1);
  assert.equal(memories.filter((memory) => memory.text === "different").length, 1);
});

test("merge-ledgers resolves events conflicts and records rejected event lines", () => {
  const cwd = tempWorkspace();
  const eventPath = join(cwd, ".akephalos", "events.jsonl");

  runCli(cwd, ["init"]);
  writeFileSync(
    eventPath,
    [
      JSON.stringify({ id: "base-event", time: "2026-05-12T00:00:00.000Z", source: "base", type: "init" }),
      "<<<<<<< HEAD",
      JSON.stringify({ id: "ours-event", time: "2026-05-12T00:00:01.000Z", source: "ours", type: "memory.add" }),
      "bad event json",
      "=======",
      JSON.stringify({ id: "theirs-event", time: "2026-05-12T00:00:02.000Z", source: "theirs", type: "memory.add" }),
      ">>>>>>> branch",
      "",
    ].join("\n"),
    "utf8",
  );

  const result = runCli(cwd, ["merge-ledgers"]);

  assert.match(result.stdout, /Rejected lines: 1/);
  const eventText = readFileSync(eventPath, "utf8");
  assert.doesNotMatch(eventText, /<<<<<<<|=======|>>>>>>>/);
  const events = readJsonl(eventPath);
  assert.ok(events.some((event) => event.id === "base-event"));
  assert.ok(events.some((event) => event.id === "ours-event"));
  assert.ok(events.some((event) => event.id === "theirs-event"));
  assert.ok(events.some((event) => event.type === "ledger.merge" && event.id));
  assert.match(readFileSync(join(cwd, ".akephalos", "events.rejected.jsonl"), "utf8"), /bad event json/);
});

test("merge-ledgers salvages unterminated JSONL conflict blocks", () => {
  const cwd = tempWorkspace();
  const memoryPath = join(cwd, ".akephalos", "memories.jsonl");

  runCli(cwd, ["init"]);
  writeFileSync(
    memoryPath,
    [
      JSON.stringify({ id: "base", time: "2026-05-12T00:00:00.000Z", source: "base", type: "memory.add", text: "base" }),
      "<<<<<<< HEAD",
      JSON.stringify({ id: "ours", time: "2026-05-12T00:00:01.000Z", source: "ours", type: "memory.add", text: "ours" }),
      "=======",
      JSON.stringify({ id: "theirs", time: "2026-05-12T00:00:02.000Z", source: "theirs", type: "memory.add", text: "theirs" }),
      "",
    ].join("\n"),
    "utf8",
  );

  const result = runCli(cwd, ["merge-ledgers"]);

  assert.match(result.stdout, /Rejected lines: 1/);
  const memories = readJsonl(memoryPath);
  assert.ok(memories.some((memory) => memory.id === "base"));
  assert.ok(memories.some((memory) => memory.id === "ours"));
  assert.ok(memories.some((memory) => memory.id === "theirs"));
  assert.match(readFileSync(join(cwd, ".akephalos", "memories.rejected.jsonl"), "utf8"), /unterminated conflict block/);
});

test("sync-status is read-only", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, ["add-memory", "sync status memory"]);
  runGit(join(cwd, ".akephalos"), ["init", "-b", "main"]);
  runGit(join(cwd, ".akephalos"), ["config", "user.name", "Status"]);
  runGit(join(cwd, ".akephalos"), ["config", "user.email", "status@example.invalid"]);
  runGit(join(cwd, ".akephalos"), ["add", "."]);
  runGit(join(cwd, ".akephalos"), ["commit", "-m", "Seed"]);

  const memoriesBefore = readFileSync(join(cwd, ".akephalos", "memories.jsonl"), "utf8");
  const eventsBefore = readFileSync(join(cwd, ".akephalos", "events.jsonl"), "utf8");
  const gitBefore = runGit(join(cwd, ".akephalos"), ["status", "--porcelain"]).stdout;

  const result = runCli(cwd, ["sync-status"]);

  assert.match(result.stdout, /Akephalos sync-status/);
  assert.match(result.stdout, /Branch: main/);
  assert.match(result.stdout, /JSONL ledgers: healthy/);
  assert.equal(readFileSync(join(cwd, ".akephalos", "memories.jsonl"), "utf8"), memoriesBefore);
  assert.equal(readFileSync(join(cwd, ".akephalos", "events.jsonl"), "utf8"), eventsBefore);
  assert.equal(runGit(join(cwd, ".akephalos"), ["status", "--porcelain"]).stdout, gitBefore);
});

test("sync shares context between two cloned passport repos", () => {
  const root = tempWorkspace();
  const remote = join(root, "remote.git");
  const seed = join(root, "seed");
  const pc = join(root, "pc");
  const pi = join(root, "pi");

  runGit(root, ["init", "--bare", remote]);
  runGit(root, ["init", "-b", "main", seed]);
  runGit(seed, ["config", "user.name", "Seed"]);
  runGit(seed, ["config", "user.email", "seed@example.invalid"]);
  runCli(seed, ["init"]);
  runCli(seed, ["add-memory", "Initial shared preference"]);
  runGit(join(seed, ".akephalos"), ["init", "-b", "main"]);
  runGit(join(seed, ".akephalos"), ["config", "user.name", "Seed"]);
  runGit(join(seed, ".akephalos"), ["config", "user.email", "seed@example.invalid"]);
  runGit(join(seed, ".akephalos"), ["remote", "add", "origin", remote]);
  runGit(join(seed, ".akephalos"), ["add", "."]);
  runGit(join(seed, ".akephalos"), ["commit", "-m", "Seed passport"]);
  runGit(join(seed, ".akephalos"), ["push", "-u", "origin", "main"]);
  runGit(root, ["--git-dir", remote, "symbolic-ref", "HEAD", "refs/heads/main"]);

  runGit(root, ["clone", remote, join(pc, ".akephalos")]);
  runGit(root, ["clone", remote, join(pi, ".akephalos")]);

  runCli(pc, ["pulse"]);
  runCli(pi, [
    "import-harness",
    "Pi IDE",
    "--tool",
    "terminal",
    "--preference",
    "Use Pi IDE for remote testing",
  ]);
  runCli(pi, ["sync"]);

  const beforePull = runCli(pc, ["pulse"]);
  assert.doesNotMatch(beforePull.stdout, /Pi IDE/);

  runCli(pc, ["sync", "--pull-only"]);
  const afterPull = runCli(pc, ["pulse"]);
  assert.match(afterPull.stdout, /Pi IDE/);
  assert.match(afterPull.stdout, /Use Pi IDE for remote testing/);

  runCli(pc, ["add-memory", "Codex side learned from Pi IDE"]);
  runCli(pc, ["sync"]);
  runCli(pi, ["sync", "--pull-only"]);
  const piAfterPull = runCli(pi, ["print", "memories"]);
  assert.match(piAfterPull.stdout, /Codex side learned from Pi IDE/);
});

test("sync merges JSONL conflicts from concurrent appends", () => {
  const root = tempWorkspace();
  const remote = join(root, "remote.git");
  const seed = join(root, "seed");
  const pc = join(root, "pc");
  const pi = join(root, "pi");

  runGit(root, ["init", "--bare", remote]);
  runGit(root, ["init", "-b", "main", seed]);
  runGit(seed, ["config", "user.name", "Seed"]);
  runGit(seed, ["config", "user.email", "seed@example.invalid"]);
  runCli(seed, ["init"]);
  runCli(seed, ["add-memory", "Seed memory"]);
  runGit(join(seed, ".akephalos"), ["init", "-b", "main"]);
  runGit(join(seed, ".akephalos"), ["config", "user.name", "Seed"]);
  runGit(join(seed, ".akephalos"), ["config", "user.email", "seed@example.invalid"]);
  runGit(join(seed, ".akephalos"), ["remote", "add", "origin", remote]);
  runGit(join(seed, ".akephalos"), ["add", "."]);
  runGit(join(seed, ".akephalos"), ["commit", "-m", "Seed passport"]);
  runGit(join(seed, ".akephalos"), ["push", "-u", "origin", "main"]);
  runGit(root, ["--git-dir", remote, "symbolic-ref", "HEAD", "refs/heads/main"]);

  runGit(root, ["clone", remote, join(pc, ".akephalos")]);
  runGit(root, ["clone", remote, join(pi, ".akephalos")]);

  writeFileSync(
    join(pc, ".akephalos", "memories.jsonl"),
    `${readFileSync(join(pc, ".akephalos", "memories.jsonl"), "utf8")}${JSON.stringify({
      id: "pc-memory",
      time: "2026-05-12T00:00:01.000Z",
      source: "pc",
      type: "memory.add",
      text: "Memory from PC",
    })}\n`,
    "utf8",
  );
  writeFileSync(
    join(pc, ".akephalos", "events.jsonl"),
    `${readFileSync(join(pc, ".akephalos", "events.jsonl"), "utf8")}${JSON.stringify({
      id: "pc-event",
      time: "2026-05-12T00:00:01.000Z",
      source: "pc",
      type: "memory.add",
      text: "Memory from PC",
    })}\n`,
    "utf8",
  );
  writeFileSync(
    join(pi, ".akephalos", "memories.jsonl"),
    `${readFileSync(join(pi, ".akephalos", "memories.jsonl"), "utf8")}${JSON.stringify({
      id: "pi-memory",
      time: "2026-05-12T00:00:02.000Z",
      source: "pi",
      type: "memory.add",
      text: "Memory from Pi",
    })}\n`,
    "utf8",
  );
  writeFileSync(
    join(pi, ".akephalos", "events.jsonl"),
    `${readFileSync(join(pi, ".akephalos", "events.jsonl"), "utf8")}${JSON.stringify({
      id: "pi-event",
      time: "2026-05-12T00:00:02.000Z",
      source: "pi",
      type: "memory.add",
      text: "Memory from Pi",
    })}\n`,
    "utf8",
  );
  runCli(pc, ["sync"]);

  const piSync = runCli(pi, ["sync"]);
  assert.match(piSync.stdout, /Resolving JSONL ledger conflicts/);

  runCli(pc, ["sync", "--pull-only"]);
  const memories = runCli(pc, ["print", "memories"]);
  assert.match(memories.stdout, /Memory from PC/);
  assert.match(memories.stdout, /Memory from Pi/);
  assert.doesNotMatch(readFileSync(join(pc, ".akephalos", "memories.jsonl"), "utf8"), /<<<<<<<|=======|>>>>>>>/);
});

test("sync refuses non-JSONL conflicts", () => {
  const root = tempWorkspace();
  const remote = join(root, "remote.git");
  const seed = join(root, "seed");
  const pc = join(root, "pc");
  const pi = join(root, "pi");

  runGit(root, ["init", "--bare", remote]);
  runGit(root, ["init", "-b", "main", seed]);
  runGit(seed, ["config", "user.name", "Seed"]);
  runGit(seed, ["config", "user.email", "seed@example.invalid"]);
  runCli(seed, ["init"]);
  runGit(join(seed, ".akephalos"), ["init", "-b", "main"]);
  runGit(join(seed, ".akephalos"), ["config", "user.name", "Seed"]);
  runGit(join(seed, ".akephalos"), ["config", "user.email", "seed@example.invalid"]);
  runGit(join(seed, ".akephalos"), ["remote", "add", "origin", remote]);
  runGit(join(seed, ".akephalos"), ["add", "."]);
  runGit(join(seed, ".akephalos"), ["commit", "-m", "Seed passport"]);
  runGit(join(seed, ".akephalos"), ["push", "-u", "origin", "main"]);
  runGit(root, ["--git-dir", remote, "symbolic-ref", "HEAD", "refs/heads/main"]);

  runGit(root, ["clone", remote, join(pc, ".akephalos")]);
  runGit(root, ["clone", remote, join(pi, ".akephalos")]);

  writeFileSync(join(pc, ".akephalos", "rules.md"), "# Rules\n\nPC rules\n", "utf8");
  writeFileSync(join(pi, ".akephalos", "rules.md"), "# Rules\n\nPi rules\n", "utf8");
  runCli(pc, ["sync"]);

  const result = runCliRaw(pi, ["sync"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /non-JSONL files have conflicts/);
  assert.match(result.stderr, /rules\.md/);
});

test("sync refuses to commit likely secrets", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  runGit(join(cwd, ".akephalos"), ["init", "-b", "main"]);
  runGit(join(cwd, ".akephalos"), ["config", "user.name", "Secret"]);
  runGit(join(cwd, ".akephalos"), ["config", "user.email", "secret@example.invalid"]);
  runGit(join(cwd, ".akephalos"), ["add", "."]);
  runGit(join(cwd, ".akephalos"), ["commit", "-m", "Seed"]);
  writeFileSync(
    join(cwd, ".akephalos", "memories.jsonl"),
    `${JSON.stringify({ text: "password=supersecret123" })}\n`,
    "utf8",
  );

  const result = runCliRaw(cwd, ["sync"]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Doctor checks failed before sync/);
  assert.match(result.stderr, /value redacted/);
  assert.doesNotMatch(result.stderr, /supersecret123/);
  assert.doesNotMatch(runGit(join(cwd, ".akephalos"), ["log", "--oneline"]).stdout, /Sync Akephalos passport/);
});

test("compact updates only the compacted memories section", () => {
  const cwd = tempWorkspace();
  const identityPath = join(cwd, ".akephalos", "akephalos.md");

  runCli(cwd, ["init"]);
  writeFileSync(
    identityPath,
    [
      "# Identity",
      "",
      "Keep this identity text.",
      "",
      "## Compacted Memories",
      "",
      "- stale memory",
      "",
      "## Projects",
      "",
      "Keep this project text.",
      "",
    ].join("\n"),
    "utf8",
  );
  runCli(cwd, ["add-memory", "fresh memory"]);
  runCli(cwd, ["compact"]);
  runCli(cwd, ["compact"]);

  const identity = readFileSync(identityPath, "utf8");
  assert.match(identity, /Keep this identity text\./);
  assert.match(identity, /Keep this project text\./);
  assert.match(identity, /fresh memory/);
  assert.doesNotMatch(identity, /stale memory/);
  assert.equal((identity.match(/^## Compacted Memories\s*$/gm) || []).length, 1);
});

test("compact redacts existing secret-looking memories", () => {
  const cwd = tempWorkspace();
  const memoryPath = join(cwd, ".akephalos", "memories.jsonl");
  const identityPath = join(cwd, ".akephalos", "akephalos.md");

  runCli(cwd, ["init"]);
  writeFileSync(
    memoryPath,
    `${JSON.stringify({
      time: "2026-05-12T00:00:00.000Z",
      source: "manual",
      type: "memory.add",
      text: "password=supersecret123",
    })}\n`,
    "utf8",
  );

  runCli(cwd, ["compact"]);

  const identity = readFileSync(identityPath, "utf8");
  assert.match(identity, /\[redacted: memory looks like it may contain a secret\]/);
  assert.doesNotMatch(identity, /supersecret123/);
});

test("old memory records without ids remain readable", () => {
  const cwd = tempWorkspace();
  const memoryPath = join(cwd, ".akephalos", "memories.jsonl");
  const identityPath = join(cwd, ".akephalos", "akephalos.md");

  runCli(cwd, ["init"]);
  writeFileSync(
    memoryPath,
    `${JSON.stringify({
      time: "2026-05-12T00:00:00.000Z",
      source: "legacy",
      type: "memory.add",
      text: "legacy memory without id",
    })}\n`,
    "utf8",
  );

  const printed = runCli(cwd, ["print", "memories"]);
  assert.match(printed.stdout, /legacy memory without id/);

  runCli(cwd, ["compact"]);
  assert.match(readFileSync(identityPath, "utf8"), /legacy memory without id/);
});

test("export creates a snapshot", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, ["add-memory", "portable memory"]);
  runCli(cwd, ["export"]);

  const exportsRoot = join(cwd, ".akephalos", "exports");
  const exportDirs = readdirSync(exportsRoot, { withFileTypes: true }).filter((entry) =>
    entry.isDirectory(),
  );
  assert.equal(exportDirs.length, 1);

  const snapshot = join(exportsRoot, exportDirs[0].name);
  const expected = [
    "manifest.json",
    "akephalos.md",
    "rules.md",
    "tools.md",
    "projects.md",
    "harnesses.json",
    "memories.jsonl",
    "events.jsonl",
  ];

  for (const file of expected) {
    assert.equal(existsSync(join(snapshot, file)), true, `${file} should be exported`);
  }

  assert.equal(JSON.parse(readFileSync(join(snapshot, "manifest.json"), "utf8")).version, 1);
  assert.equal(readJsonl(join(snapshot, "memories.jsonl")).length, 1);
  const exportEvent = readJsonl(join(snapshot, "events.jsonl")).find((event) => event.type === "export.create");
  assert.ok(exportEvent);
  assert.match(exportEvent.id, idPattern);
});

test("export creates unique snapshot folders", () => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, ["export"]);
  runCli(cwd, ["export"]);

  const exportDirs = readdirSync(join(cwd, ".akephalos", "exports"), { withFileTypes: true }).filter(
    (entry) => entry.isDirectory(),
  );
  assert.equal(exportDirs.length, 2);
  assert.notEqual(exportDirs[0].name, exportDirs[1].name);
});


test("mcp exposes resources and appends memories", async (t) => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);
  runCli(cwd, ["add-memory", "existing memory"]);

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [cli, "mcp"],
    cwd,
    stderr: "pipe",
  });
  const client = new Client({
    name: "akephalos-test-client",
    version: "1.0.0",
  });

  t.after(async () => {
    await client.close();
  });

  await client.connect(transport);

  const resources = await client.listResources();
  assert.ok(resources.resources.some((resource) => resource.uri === "akephalos://identity"));
  assert.ok(resources.resources.some((resource) => resource.uri === "akephalos://memories"));

  const identity = await client.readResource({ uri: "akephalos://identity" });
  assert.match(identity.contents[0].text, /Akephalos Passport/);

  const eventsBefore = readFileSync(join(cwd, ".akephalos", "events.jsonl"), "utf8");
  const addResult = await client.callTool({
    name: "add_memory",
    arguments: {
      text: "memory from mcp",
    },
  });
  assert.equal(addResult.isError, undefined);
  assert.match(addResult.content[0].text, /Memory added/);

  const memories = readJsonl(join(cwd, ".akephalos", "memories.jsonl"));
  assert.equal(memories.length, 2);
  assert.equal(memories[1].source, "mcp");
  assert.equal(memories[1].type, "memory.add");
  assert.equal(memories[1].text, "memory from mcp");
  assert.match(memories[1].id, idPattern);
  assert.equal(readFileSync(join(cwd, ".akephalos", "events.jsonl"), "utf8"), eventsBefore);

  const memoryResource = await client.readResource({ uri: "akephalos://memories" });
  assert.match(memoryResource.contents[0].text, /existing memory/);
  assert.match(memoryResource.contents[0].text, /memory from mcp/);

  const statusResult = await client.callTool({
    name: "get_status",
    arguments: {},
  });
  assert.match(statusResult.content[0].text, /Memory count: 2/);
});

test("mcp add_memory refuses secret-looking text", async (t) => {
  const cwd = tempWorkspace();

  runCli(cwd, ["init"]);

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [cli, "mcp"],
    cwd,
    stderr: "pipe",
  });
  const client = new Client({
    name: "akephalos-test-client",
    version: "1.0.0",
  });

  t.after(async () => {
    await client.close();
  });

  await client.connect(transport);

  const result = await client.callTool({
    name: "add_memory",
    arguments: {
      text: "token=abcdefghijklmnopqrstuvwxyz123456",
    },
  });

  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /Refusing to store memory/);
  assert.equal(readJsonl(join(cwd, ".akephalos", "memories.jsonl")).length, 0);
});
