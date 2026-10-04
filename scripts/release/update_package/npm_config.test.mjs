import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { loadMinimumReleaseAge } from "./npm_config.mjs";

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), "hato-npm-config-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const project = join(directory, "project");
  const e2e = join(project, "test/e2e");
  const npmPath = join(directory, "npm");
  const home = join(directory, "home");
  const prefix = join(directory, "prefix");
  await Promise.all(
    [project, e2e, npmPath, home, join(prefix, "etc")].map((path) =>
      mkdir(path, { recursive: true }),
    ),
  );
  await Promise.all(
    [project, e2e].map((path) =>
      writeFile(join(path, "package.json"), '{"name":"fixture"}\n'),
    ),
  );
  const options = {
    npmPath,
    env: { HOME: home, PREFIX: prefix },
    execPath: join(prefix, "bin/node"),
  };
  return { project, e2e, npmPath, home, prefix, options };
}

test("each package loads its project config without leaking exported environment", async (t) => {
  const { project, e2e, options } = await fixture(t);
  await writeFile(join(project, ".npmrc"), "min-release-age=7\n");
  await writeFile(join(e2e, ".npmrc"), "min-release-age=14\n");
  const originalEnv = { ...options.env };
  assert.equal(await loadMinimumReleaseAge(project, options), 7);
  assert.equal(await loadMinimumReleaseAge(e2e, options), 14);
  assert.deepEqual(options.env, originalEnv);
});

test("environment overrides project, which overrides guard user config", async (t) => {
  const { project, home, options } = await fixture(t);
  const userconfig = join(home, "guard.npmrc");
  await writeFile(userconfig, "min-release-age=21\n");
  options.env.NPM_CONFIG_USERCONFIG = userconfig;
  assert.equal(await loadMinimumReleaseAge(project, options), 21);
  await writeFile(join(project, ".npmrc"), "min-release-age=7\n");
  assert.equal(await loadMinimumReleaseAge(project, options), 7);
  options.env.NPM_CONFIG_MIN_RELEASE_AGE = "28";
  assert.equal(await loadMinimumReleaseAge(project, options), 28);
});

test("global and npm builtin config load below user config", async (t) => {
  const { project, npmPath, home, prefix, options } = await fixture(t);
  assert.equal(await loadMinimumReleaseAge(project, options), 0);
  await writeFile(join(npmPath, "npmrc"), "min-release-age=3\n");
  assert.equal(await loadMinimumReleaseAge(project, options), 3);
  await writeFile(join(prefix, "etc/npmrc"), "min-release-age=5\n");
  assert.equal(await loadMinimumReleaseAge(project, options), 5);
  await writeFile(join(home, ".npmrc"), "min-release-age=7\n");
  assert.equal(await loadMinimumReleaseAge(project, options), 7);
});

test("a nested directory uses its nearest package config", async (t) => {
  const { project, options } = await fixture(t);
  const nested = join(project, "scripts/nested");
  await mkdir(nested, { recursive: true });
  await writeFile(join(project, ".npmrc"), "min-release-age=7\n");
  assert.equal(await loadMinimumReleaseAge(nested, options), 7);
});

test("npm_execpath and PATH symlinks locate the active npm builtin config", async (t) => {
  const { project, npmPath, prefix, options } = await fixture(t);
  const npmBin = join(npmPath, "bin/npm-cli.js");
  const pathBin = join(prefix, "bin");
  await Promise.all([
    mkdir(join(npmPath, "bin")),
    mkdir(pathBin),
    writeFile(join(npmPath, "npmrc"), "min-release-age=9\n"),
  ]);
  await writeFile(npmBin, "", { mode: 0o755 });
  await symlink(npmBin, join(pathBin, "npm"));
  const { env, execPath } = options;
  assert.equal(
    await loadMinimumReleaseAge(project, {
      env: { ...env, npm_execpath: npmBin },
      execPath,
    }),
    9,
  );
  assert.equal(
    await loadMinimumReleaseAge(project, {
      env: { ...env, PATH: pathBin },
      execPath,
    }),
    9,
  );
});

test("invalid release ages fail instead of selecting unfiltered releases", async (t) => {
  const { project, options } = await fixture(t);
  for (const value of ["invalid", "-1", "Infinity", "true"]) {
    await writeFile(join(project, ".npmrc"), `min-release-age=${value}\n`);
    await assert.rejects(
      loadMinimumReleaseAge(project, options),
      /Invalid npm min-release-age/,
    );
  }
});
