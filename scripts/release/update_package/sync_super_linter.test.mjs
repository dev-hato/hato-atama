import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  isCompatible,
  loadImageVersions,
  loadRegistryMetadata,
  planUpdates,
  selectCompatibleVersion,
} from "./sync_super_linter.mjs";

const now = Date.parse("2026-10-03T00:00:00Z");
const old = "2026-09-01T00:00:00Z";
const options = {
  tool: "eslint",
  toolVersion: "10.0.0",
  nodeVersion: "26.8.1",
  minimumAgeDays: 7,
  now,
};
const pluginReleases = [
  { version: "6.4.4", peerDependencies: { eslint: ">=9" } },
  { version: "7.0.2", peerDependencies: { eslint: ">=10" } },
];
const registryData = {
  "eslint-plugin-cypress": {
    releases: pluginReleases,
    times: { "6.4.4": old, "7.0.2": old },
  },
};

test("the Docker reader mounts the linted module read-only and passes package names", () => {
  const image = "ghcr.io/super-linter/super-linter:slim-v9.0.0";
  const names = ["eslint", "@scope/custom-rule"];
  const versions = { eslint: "9.39.4", "@scope/custom-rule": null };
  const readerPath = fileURLToPath(
    new URL("./read_super_linter_versions.mjs", import.meta.url),
  );
  assert.deepEqual(
    loadImageVersions(image, names, (command, args) => {
      assert.equal(command, "docker");
      assert.deepEqual(args, [
        "run",
        "--rm",
        "--entrypoint",
        "node",
        "--mount",
        `type=bind,source=${readerPath},target=/tmp/read_super_linter_versions.mjs,readonly`,
        image,
        "/tmp/read_super_linter_versions.mjs",
        JSON.stringify(names),
      ]);
      return JSON.stringify(versions);
    }),
    versions,
  );
});

function eslintPlan(overrides = {}) {
  return planUpdates({
    ...options,
    extension: /^eslint-plugin/,
    manifest: {
      devDependencies: { eslint: "9.39.4", "eslint-plugin-cypress": "6.4.4" },
    },
    lock: {
      packages: { "node_modules/eslint-plugin-cypress": pluginReleases[0] },
    },
    imageVersions: { eslint: "9.39.4", "eslint-plugin-cypress": null },
    ...overrides,
  });
}

test("unchanged compatible extensions make no registry requests", () => {
  assert.deepEqual(eslintPlan(), { updates: {}, registryRequests: [] });
  assert.deepEqual(eslintPlan({ registryData }), {
    updates: {},
    registryRequests: [],
  });
});

test("an ESLint major upgrade updates the compatible plugin together", () => {
  const imageVersions = { eslint: "10.0.0", "eslint-plugin-cypress": null };
  assert.deepEqual(eslintPlan({ imageVersions }).registryRequests, [
    "eslint-plugin-cypress",
  ]);
  assert.deepEqual(eslintPlan({ imageVersions, registryData }), {
    updates: { eslint: "10.0.0", "eslint-plugin-cypress": "7.0.2" },
    registryRequests: [],
  });
});

test("an incompatible installed plugin is repaired even without a tool update", () => {
  const manifest = {
    devDependencies: { eslint: "9.39.4", "eslint-plugin-cypress": "7.0.2" },
  };
  const lock = {
    packages: { "node_modules/eslint-plugin-cypress": pluginReleases[1] },
  };
  assert.deepEqual(eslintPlan({ manifest, lock }).registryRequests, [
    "eslint-plugin-cypress",
  ]);
  assert.deepEqual(eslintPlan({ manifest, lock, registryData }).updates, {
    "eslint-plugin-cypress": "6.4.4",
  });
});

test("a manifest update with a stale compatible lockfile still refreshes the plugin", () => {
  const manifest = {
    devDependencies: { eslint: "9.39.4", "eslint-plugin-cypress": "7.0.2" },
  };
  assert.deepEqual(eslintPlan({ manifest }).registryRequests, [
    "eslint-plugin-cypress",
  ]);
  assert.deepEqual(eslintPlan({ manifest, registryData }).updates, {
    "eslint-plugin-cypress": "6.4.4",
  });
});

test("root textlint tools and bundled rules use exact image versions", () => {
  const plan = planUpdates({
    ...options,
    tool: "textlint",
    extension: /^(?:@[^/]+\/)?textlint-(?:rule|filter-rule)-/,
    manifest: {
      devDependencies: {
        textlint: "15.7.0",
        "textlint-filter-rule-comments": "1.2.0",
        "textlint-rule-terminology": "5.2.15",
        cheerio: "1.2.0",
      },
    },
    lock: { packages: {} },
    imageVersions: {
      textlint: "15.8.0",
      "textlint-filter-rule-comments": "1.3.0",
      "textlint-rule-terminology": "5.2.16",
      cheerio: "1.1.0",
    },
  });
  assert.deepEqual(plan, {
    updates: {
      textlint: "15.8.0",
      "textlint-filter-rule-comments": "1.3.0",
      "textlint-rule-terminology": "5.2.16",
    },
    registryRequests: [],
  });
});

test("release selection excludes prereleases, deprecations, young and undated versions", () => {
  assert.equal(
    selectCompatibleVersion({
      ...options,
      releases: [
        { version: "7.0.2" },
        { version: "8.0.0-beta.1" },
        { version: "7.0.3", deprecated: "Use another version" },
        { version: "7.0.4" },
        { version: "7.0.5" },
        { version: "7.0.6", engines: { node: ">=28" } },
      ],
      times: {
        "7.0.2": old,
        "8.0.0-beta.1": old,
        "7.0.3": old,
        "7.0.4": "2026-10-01T00:00:00Z",
        "7.0.6": old,
      },
    }),
    "7.0.2",
  );
});

test("peer ranges and Node engines are both required", () => {
  const metadata = {
    peerDependencies: { eslint: "^9.39.0 || ^10.0.0" },
    engines: { node: ">=24" },
  };
  assert.equal(isCompatible(metadata, "eslint", "9.39.4", "26.8.1"), true);
  assert.equal(isCompatible(metadata, "eslint", "11.0.0", "26.8.1"), false);
  assert.equal(isCompatible(metadata, "eslint", "10.0.0", "22.0.0"), false);
});

test("missing tools and missing eligible extensions fail", () => {
  assert.throws(
    () => eslintPlan({ imageVersions: { eslint: null } }),
    /does not contain a valid eslint/,
  );
  assert.throws(
    () =>
      selectCompatibleVersion({
        ...options,
        releases: [pluginReleases[1]],
        times: { "7.0.2": old },
        toolVersion: "9.39.4",
      }),
    /No eligible stable release supports eslint@9.39.4/,
  );
});

test("the npm provider requests the complete stable range through the package directory", () => {
  const metadata = registryData["eslint-plugin-cypress"];
  const calls = [];
  const result = loadRegistryMetadata(
    "eslint-plugin-cypress",
    "test/e2e",
    (command, args, directory) => {
      calls.push({ command, args, directory });
      if (args[1] === "eslint-plugin-cypress@>=0") {
        return JSON.stringify(metadata.releases);
      }
      assert.deepEqual(args, [
        "view",
        "eslint-plugin-cypress",
        "time",
        "--json",
      ]);
      return JSON.stringify(metadata.times);
    },
  );
  assert.deepEqual(calls, [
    {
      command: "npm",
      args: [
        "view",
        "eslint-plugin-cypress@>=0",
        "name",
        "version",
        "peerDependencies",
        "engines",
        "deprecated",
        "--json",
      ],
      directory: "test/e2e",
    },
    {
      command: "npm",
      args: ["view", "eslint-plugin-cypress", "time", "--json"],
      directory: "test/e2e",
    },
  ]);
  assert.equal(
    selectCompatibleVersion({ ...options, ...result, toolVersion: "9.39.4" }),
    "6.4.4",
  );
});

test("optional metadata on later releases survives npm field unwrapping", () => {
  const records = [
    { name: "custom-rule", version: "1.0.0" },
    {
      name: "custom-rule",
      version: "2.0.0",
      peerDependencies: { textlint: ">=16" },
    },
  ];
  const metadata = loadRegistryMetadata(
    "custom-rule",
    ".",
    (_command, args) => {
      if (args.includes("time")) {
        return JSON.stringify({ "1.0.0": old, "2.0.0": old });
      }
      // npm drops all optional fields if its first result has only version.
      return JSON.stringify(
        args.includes("name")
          ? records
          : records.map((record) => record.version),
      );
    },
  );
  assert.equal(
    selectCompatibleVersion({
      ...options,
      ...metadata,
      tool: "textlint",
      toolVersion: "15.7.1",
    }),
    "1.0.0",
  );
});

test("single records without optional fields are eligible while string-only records fail", () => {
  const metadata = { times: { "3.1.2": old } };
  assert.equal(
    selectCompatibleVersion({
      ...options,
      ...metadata,
      releases: { name: "custom-rule", version: "3.1.2" },
    }),
    "3.1.2",
  );
  assert.throws(
    () =>
      selectCompatibleVersion({ ...options, ...metadata, releases: "3.1.2" }),
    /No eligible stable release/,
  );
});

test("GitHub custom rules preserve their specification without registry requests", () => {
  const spec = "dev-hato/textlint-rule-general-novel-style-ja-markdown";
  const manifest = {
    devDependencies: {
      textlint: "15.7.0",
      "textlint-rule-general-novel-style-ja": spec,
    },
  };
  const original = structuredClone(manifest);
  const plan = planUpdates({
    ...options,
    tool: "textlint",
    extension: /^(?:@[^/]+\/)?textlint-(?:rule|filter-rule)-/,
    manifest,
    lock: { packages: {} },
    imageVersions: {
      textlint: "15.8.0",
      "textlint-rule-general-novel-style-ja": null,
    },
  });
  assert.deepEqual(plan, {
    updates: { textlint: "15.8.0" },
    registryRequests: [],
  });
  assert.deepEqual(manifest, original);
});
