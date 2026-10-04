import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function readPackageVersions(names, directory = "/node_modules") {
  const versions = {};
  for (const name of names) {
    try {
      const manifest = readFileSync(
        `${directory}/${name}/package.json`,
        "utf8",
      );
      versions[name] = JSON.parse(manifest).version;
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
      versions[name] = null;
    }
  }
  return versions;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  console.log(JSON.stringify(readPackageVersions(JSON.parse(process.argv[2]))));
}
