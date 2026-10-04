import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { readPackageVersions } from "./read_super_linter_versions.mjs";

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), "super-linter-versions-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

test("reads package versions including scoped packages and reports absent packages", (t) => {
  const directory = fixture(t);
  for (const [name, version] of Object.entries({
    eslint: "9.39.4",
    "@scope/custom-rule": "1.2.3",
  })) {
    const packageDirectory = join(directory, name);
    mkdirSync(packageDirectory, { recursive: true });
    writeFileSync(
      join(packageDirectory, "package.json"),
      JSON.stringify({ name, version }),
    );
  }
  assert.deepEqual(
    readPackageVersions(["eslint", "@scope/custom-rule", "missing"], directory),
    { eslint: "9.39.4", "@scope/custom-rule": "1.2.3", missing: null },
  );
});

test("malformed package metadata fails instead of reporting a missing package", (t) => {
  const directory = fixture(t);
  mkdirSync(join(directory, "eslint"));
  writeFileSync(join(directory, "eslint", "package.json"), "{invalid}");
  assert.throws(() => readPackageVersions(["eslint"], directory), SyntaxError);
});
