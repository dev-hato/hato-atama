import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import semver from "semver";
import { loadMinimumReleaseAge } from "./npm_config.mjs";
import { getSuperLinterImage } from "./super_linter_image.mjs";

const millisecondsPerDay = 24 * 60 * 60 * 1000;

const families = [
  {
    directory: ".",
    tool: "textlint",
    extension: /^(?:@[^/]+\/)?textlint-(?:rule|filter-rule)-/,
  },
  { directory: "test/e2e", tool: "eslint", extension: /^eslint-plugin/ },
];

export function isCompatible(metadata, tool, toolVersion, nodeVersion) {
  return (
    metadata != null &&
    semver.satisfies(toolVersion, metadata.peerDependencies?.[tool] ?? "*") &&
    semver.satisfies(nodeVersion, metadata.engines?.node ?? "*")
  );
}

export function selectCompatibleVersion({
  releases,
  times,
  tool,
  toolVersion,
  nodeVersion,
  minimumAgeDays,
  now,
  packageName,
}) {
  const versions = (Array.isArray(releases) ? releases : [releases])
    .filter(
      (release) =>
        semver.valid(release.version) &&
        semver.prerelease(release.version) == null &&
        !release.deprecated &&
        isCompatible(release, tool, toolVersion, nodeVersion) &&
        Number.isFinite(Date.parse(times[release.version])) &&
        now - Date.parse(times[release.version]) >=
          minimumAgeDays * millisecondsPerDay,
    )
    .sort((left, right) => semver.rcompare(left.version, right.version));
  if (versions.length === 0) {
    throw new Error(
      `${packageName ? `${packageName}: ` : ""}No eligible stable release supports ${tool}@${toolVersion}`,
    );
  }
  return versions[0].version;
}

export function planUpdates({
  manifest,
  lock,
  imageVersions,
  tool,
  extension,
  registryData = {},
  nodeVersion,
  minimumAgeDays,
  now,
}) {
  const toolVersion = imageVersions[tool];
  if (!semver.valid(toolVersion)) {
    throw new Error(`Super-Linter does not contain a valid ${tool} version`);
  }
  const dependencies = manifest.devDependencies;
  if (!dependencies?.[tool]) {
    throw new Error(`Manifest does not declare ${tool}`);
  }
  const toolChanged = dependencies[tool] !== toolVersion;
  const updates = {};
  const registryRequests = [];
  for (const [name, spec] of Object.entries(dependencies)) {
    if (name !== tool) {
      if (!extension.test(name)) {
        continue;
      }
      // Git and other non-registry specifications retain their source.
      if (!semver.validRange(spec)) {
        continue;
      }
    }
    let version = imageVersions[name];
    if (version != null && !semver.valid(version)) {
      throw new Error(`Super-Linter contains an invalid ${name} version`);
    }
    if (version == null) {
      const installed = lock.packages?.[`node_modules/${name}`];
      if (
        !toolChanged &&
        semver.satisfies(installed?.version ?? "", spec) &&
        isCompatible(installed, tool, toolVersion, nodeVersion)
      ) {
        continue;
      }
      if (!registryData[name]) {
        registryRequests.push(name);
        continue;
      }
      version = selectCompatibleVersion({
        ...registryData[name],
        packageName: name,
        tool,
        toolVersion,
        nodeVersion,
        minimumAgeDays,
        now,
      });
    }
    if (version !== spec) {
      updates[name] = version;
    }
  }
  return { updates, registryRequests };
}

function run(command, args, directory = ".") {
  return execFileSync(command, args, {
    cwd: directory,
    encoding: "utf8",
  }).trim();
}

export function loadRegistryMetadata(name, directory, execute = run) {
  // Two required fields prevent npm from unwrapping away later peer metadata.
  return {
    releases: JSON.parse(
      execute(
        "npm",
        [
          "view",
          `${name}@>=0`,
          "name",
          "version",
          "peerDependencies",
          "engines",
          "deprecated",
          "--json",
        ],
        directory,
      ),
    ),
    times: JSON.parse(
      execute("npm", ["view", name, "time", "--json"], directory),
    ),
  };
}

export function loadImageVersions(image, names, execute = run) {
  const readerPath = fileURLToPath(
    new URL("./read_super_linter_versions.mjs", import.meta.url),
  );
  const containerPath = "/tmp/read_super_linter_versions.mjs";
  return JSON.parse(
    execute("docker", [
      "run",
      "--rm",
      "--entrypoint",
      "node",
      "--mount",
      `type=bind,source=${readerPath},target=${containerPath},readonly`,
      image,
      containerPath,
      JSON.stringify(names),
    ]),
  );
}

async function main() {
  const documents = families.map((family) => ({
    ...family,
    manifest: JSON.parse(
      readFileSync(`${family.directory}/package.json`, "utf8"),
    ),
    lock: JSON.parse(
      readFileSync(`${family.directory}/package-lock.json`, "utf8"),
    ),
  }));
  const names = documents.flatMap(({ manifest, tool, extension }) =>
    Object.keys(manifest.devDependencies).filter(
      (name) => name === tool || extension.test(name),
    ),
  );
  const workflow = ".github/workflows/super-linter.yml";
  const image = getSuperLinterImage(readFileSync(workflow, "utf8"));
  const imageVersions = loadImageVersions(image, names);
  const plans = await Promise.all(
    documents.map(async (document) => {
      const minimumAgeDays = await loadMinimumReleaseAge(document.directory);
      const inputs = {
        ...document,
        imageVersions,
        nodeVersion: process.version,
        minimumAgeDays,
        now: Date.now(),
      };
      const { registryRequests } = planUpdates(inputs);
      const registryData = Object.fromEntries(
        registryRequests.map((name) => [
          name,
          loadRegistryMetadata(name, document.directory),
        ]),
      );
      return { document, ...planUpdates({ ...inputs, registryData }) };
    }),
  );
  for (const { document, updates } of plans) {
    if (Object.keys(updates).length === 0) {
      continue;
    }
    Object.assign(document.manifest.devDependencies, updates);
    writeFileSync(
      `${document.directory}/package.json`,
      `${JSON.stringify(document.manifest, null, 2)}\n`,
    );
    console.log(`${document.directory}: ${JSON.stringify(updates)}`);
  }
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  try {
    await main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
