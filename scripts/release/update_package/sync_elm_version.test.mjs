import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { main, setElmVersion, toCompilerVersion } from "./sync_elm_version.mjs";

const elmJson = `{
  "type": "application",
  "source-directories": ["src"],
  "elm-version": "0.19.1",
  "dependencies": {}
}
`;

function createProject(t, elmVersion) {
  const directory = mkdtempSync(join(tmpdir(), "sync-elm-version-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  writeFileSync(
    join(directory, "package.json"),
    JSON.stringify({ devDependencies: { elm: elmVersion } }),
  );
  writeFileSync(join(directory, "elm.json"), elmJson);

  return directory;
}

test("toCompilerVersion removes the installer suffix", () => {
  assert.equal(toCompilerVersion("0.19.2-0"), "0.19.2");
  assert.equal(toCompilerVersion("0.19.3"), "0.19.3");
});

test("toCompilerVersion rejects unexpected versions", () => {
  for (const version of [undefined, "^0.19.2-0", "0.19.2-rc1", "latest"]) {
    assert.throws(() => toCompilerVersion(version), /Unexpected elm package/);
  }
});

test("setElmVersion keeps the rest of elm.json", () => {
  const elm = JSON.parse(elmJson);

  assert.deepEqual(setElmVersion(elm, "0.19.2"), {
    ...elm,
    "elm-version": "0.19.2",
  });
  assert.equal(elm["elm-version"], "0.19.1");
});

test("setElmVersion rejects elm.json without elm-version", () => {
  assert.throws(
    () => setElmVersion({ type: "application" }, "0.19.2"),
    /"elm-version" is not found/,
  );
});

test("main writes elm.json with the synced elm-version", (t) => {
  const directory = createProject(t, "0.19.2-0");

  main(directory);

  assert.deepEqual(
    JSON.parse(readFileSync(join(directory, "elm.json"), "utf8")),
    { ...JSON.parse(elmJson), "elm-version": "0.19.2" },
  );
});

test("main keeps elm.json when elm-version is already synced", (t) => {
  const directory = createProject(t, "0.19.1-6");

  main(directory);

  assert.equal(readFileSync(join(directory, "elm.json"), "utf8"), elmJson);
});
