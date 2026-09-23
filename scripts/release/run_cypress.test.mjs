import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const runner = fileURLToPath(new URL("./run_cypress.sh", import.meta.url));
const cdpError =
  "There was an error reconnecting to the Chrome DevTools protocol. Please restart the browser.";

function run(t, attempts, args = []) {
  const directory = mkdtempSync(join(tmpdir(), "run-cypress-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  writeFileSync(join(directory, "attempts.json"), JSON.stringify(attempts));
  writeFileSync(join(directory, "events.jsonl"), "");
  writeFileSync(
    join(directory, "command.cjs"),
    `
    const fs = require('node:fs');
    const path = require('node:path');
    const directory = process.env.TEST_DIRECTORY;
    const eventsPath = path.join(directory, 'events.jsonl');
    const events = fs.readFileSync(eventsPath, 'utf8').trim().split('\\n').filter(Boolean).map(JSON.parse);
    const [command, ...args] = process.argv.slice(2);
    fs.appendFileSync(eventsPath, JSON.stringify({ command, args }) + '\\n');
    if (command === 'sleep') process.exit(0);
    const attempts = JSON.parse(fs.readFileSync(path.join(directory, 'attempts.json'), 'utf8'));
    const attempt = attempts[events.filter(event => event.command === 'npm').length];
    if (!attempt) process.exit(99);
    fs.writeSync(1, attempt.stdout || '');
    fs.writeSync(2, attempt.stderr || '');
    process.exit(attempt.code);
  `,
  );
  for (const command of ["npm", "sleep"]) {
    writeFileSync(
      join(directory, command),
      `#!/usr/bin/env bash\nexec "$TEST_NODE" "$TEST_DIRECTORY/command.cjs" ${command} "$@"\n`,
      { mode: 0o755 },
    );
  }
  const result = spawnSync("bash", [runner, ...args], {
    cwd: directory,
    env: {
      ...process.env,
      PATH: `${directory}:${process.env.PATH}`,
      TEST_DIRECTORY: directory,
      TEST_NODE: process.execPath,
    },
    encoding: "utf8",
    timeout: 10_000,
  });
  assert.ifError(result.error);
  assert.equal(result.signal, null);
  const events = readFileSync(join(directory, "events.jsonl"), "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map(JSON.parse);
  return {
    ...result,
    events,
    npmCalls: events.filter((event) => event.command === "npm"),
    sleepCalls: events.filter((event) => event.command === "sleep"),
    output: result.stdout + result.stderr,
  };
}

test("successful tests finish without retry, even if the CDP message appears", (t) => {
  const result = run(t, [{ code: 0, stdout: `${cdpError}\n` }]);
  assert.equal(result.status, 0);
  assert.equal(result.npmCalls.length, 1);
  assert.equal(result.sleepCalls.length, 0);
});

test("a fatal CDP connection error is retried and can recover", (t) => {
  const result = run(t, [
    { code: 1, stderr: `${cdpError}\n` },
    { code: 0, stdout: "All tests passed\n" },
  ]);
  assert.equal(result.status, 0);
  assert.deepEqual(
    result.events.map((event) => event.command),
    ["npm", "sleep", "npm"],
  );
  assert.deepEqual(result.sleepCalls[0].args, ["5"]);
  assert.ok(result.output.includes(cdpError));
  assert.ok(result.output.includes("All tests passed"));
});

test("CDP retries stop after three attempts and preserve the last exit code", (t) => {
  const result = run(
    t,
    [1, 2, 37].map((code) => ({ code, stdout: `${cdpError}\n` })),
  );
  assert.equal(result.status, 37);
  assert.equal(result.npmCalls.length, 3);
  assert.deepEqual(
    result.sleepCalls.map((call) => call.args),
    [["5"], ["5"]],
  );
});

for (const [name, stdout] of [
  ["assertion", "AssertionError: expected 2 to equal 1\n  1 failing\n"],
  ["configuration", "Your configFile threw an error\n"],
  ["other browser", "The browser process exited unexpectedly\n"],
  [
    "intermediate browser warning",
    "Still waiting to connect to Edge, retrying in 1 second\nTimed out waiting for the browser to connect. Retrying...\n",
  ],
]) {
  test(`${name} errors fail immediately`, (t) => {
    const result = run(t, [{ code: 17, stdout }]);
    assert.equal(result.status, 17);
    assert.equal(result.npmCalls.length, 1);
    assert.equal(result.sleepCalls.length, 0);
  });
}

test("a failed test summary prevents retry when a CDP error also appears", (t) => {
  const result = run(t, [
    {
      code: 1,
      stdout: `${cdpError}\n\u001b[31m  1 failing\u001b[0m\nAssertionError: expected true to be false\n`,
    },
  ]);
  assert.equal(result.status, 1);
  assert.equal(result.npmCalls.length, 1);
  assert.equal(result.sleepCalls.length, 0);
});

test("signal-like exits are preserved without retry", (t) => {
  const result = run(t, [{ code: 130, stderr: `${cdpError}\n` }]);
  assert.equal(result.status, 130);
  assert.equal(result.npmCalls.length, 1);
  assert.equal(result.sleepCalls.length, 0);
});

test("a previous CDP error does not cause an unrelated later failure to retry", (t) => {
  const result = run(t, [
    { code: 1, stdout: `${cdpError}\n` },
    { code: 42, stderr: "Your configFile threw an error\n" },
  ]);
  assert.equal(result.status, 42);
  assert.equal(result.npmCalls.length, 2);
  assert.equal(result.sleepCalls.length, 1);
});

test("arguments and both output streams are preserved on every attempt", (t) => {
  const args = [
    "--env",
    "name=two words",
    "--spec",
    "a file.cy.js",
    "--browser",
    "chrome",
  ];
  const result = run(
    t,
    [
      {
        code: 1,
        stdout: "first stdout\n",
        stderr: `first stderr\n${cdpError}\n`,
      },
      { code: 0, stdout: "second stdout\n", stderr: "second stderr\n" },
    ],
    args,
  );
  assert.equal(result.status, 0);
  assert.equal(result.npmCalls.length, 2);
  for (const call of result.npmCalls)
    assert.deepEqual(call.args, ["run", "test", "--", ...args]);
  for (const text of [
    "first stdout",
    "first stderr",
    "second stdout",
    "second stderr",
  ]) {
    assert.ok(result.output.includes(text), `Missing output: ${text}`);
  }
});
