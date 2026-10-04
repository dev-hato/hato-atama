import assert from "node:assert/strict";
import test from "node:test";
import { getSuperLinterImage } from "./super_linter_image.mjs";

const sha = "2da136927bd4a73596db63044b504547c62cb854";
const action = `super-linter/super-linter/slim@${sha}`;

function workflow(steps) {
  return `---
name: super-linter
on: [pull_request]
jobs:
  super-linter:
    runs-on: ubuntu-latest
    steps:
${steps}
`;
}

test("reads the version comment from a named step without assuming its position", () => {
  assert.equal(
    getSuperLinterImage(
      workflow(`      - name: "Super-Linter"
        uses: "${action}" # v9.0.0
      - name: Later step
        run: echo done`),
    ),
    "ghcr.io/super-linter/super-linter:slim-v9.0.0",
  );
});

test("ignores unrelated action comments and other job steps", () => {
  const source = workflow(`      - name: Checkout
        uses: actions/checkout@${sha} # v99.0.0
      - name: Super-Linter
        uses: ${action} # v9.0.0`);
  assert.equal(
    getSuperLinterImage(`${source}  other-job:
    steps:
      - name: Super-Linter
        uses: ${action} # v8.7.0
`),
    "ghcr.io/super-linter/super-linter:slim-v9.0.0",
  );
});

test("accepts valid semantic prerelease versions", () => {
  assert.equal(
    getSuperLinterImage(
      workflow(`      - name: Super-Linter
        uses: ${action} # v9.0.0-beta.1`),
    ),
    "ghcr.io/super-linter/super-linter:slim-v9.0.0-beta.1",
  );
});

test("requires a steps sequence and exactly one named Super-Linter step", () => {
  assert.throws(
    () => getSuperLinterImage("jobs: {super-linter: {runs-on: ubuntu-latest}}"),
    /must declare a steps sequence/,
  );
  assert.throws(
    () =>
      getSuperLinterImage(
        workflow("      - name: Checkout\n        run: true"),
      ),
    /exactly one named Super-Linter step/,
  );
  assert.throws(
    () =>
      getSuperLinterImage(
        workflow(`      - name: Super-Linter
        uses: ${action} # v9.0.0
      - name: Super-Linter
        uses: ${action} # v9.0.0`),
      ),
    /exactly one named Super-Linter step/,
  );
});

test("rejects missing uses and actions without a full slim SHA pin", () => {
  const invalid = [
    `super-linter/super-linter@${sha}`,
    "super-linter/super-linter/slim@v9.0.0",
    "super-linter/super-linter/slim@2da1369",
    `someone-else/super-linter/slim@${sha}`,
  ];
  for (const uses of invalid) {
    assert.throws(
      () =>
        getSuperLinterImage(
          workflow(`      - name: Super-Linter
        uses: ${uses} # v9.0.0`),
        ),
      /slim action pinned to a full SHA/,
    );
  }
  assert.throws(
    () =>
      getSuperLinterImage(
        workflow("      - name: Super-Linter\n        run: true"),
      ),
    /slim action pinned to a full SHA/,
  );
});

test("requires a valid version on the uses node itself", () => {
  for (const comment of ["", " # latest", " # v9", " # v9.0.0 extra text"]) {
    assert.throws(
      () =>
        getSuperLinterImage(
          workflow(`      - name: Super-Linter # v9.0.0
        uses: ${action}${comment}`),
        ),
      /uses comment must contain a valid version/,
    );
  }
});

test("rejects invalid YAML, duplicate mapping keys, and multiple documents", () => {
  const valid = workflow(`      - name: Super-Linter
        uses: ${action} # v9.0.0`);
  for (const source of [
    "jobs: [",
    valid.replace("        uses:", "        uses: invalid\n        uses:"),
    `${valid}\n---\nother: document\n`,
  ]) {
    assert.throws(() => getSuperLinterImage(source), /Invalid workflow YAML/);
  }
});
