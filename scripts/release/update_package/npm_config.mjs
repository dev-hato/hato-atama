import { accessSync, constants, realpathSync } from "node:fs";
import { delimiter, dirname, join, resolve } from "node:path";
import Config from "@npmcli/config";
import definitionsModule from "@npmcli/config/lib/definitions/index.js";

const { definitions, shorthands, flatten } = definitionsModule;

function findNpmPath(env) {
  if (env.npm_execpath) {
    return dirname(dirname(realpathSync(env.npm_execpath)));
  }
  for (const directory of (env.PATH ?? "").split(delimiter)) {
    const executable = join(directory, "npm");
    try {
      accessSync(executable, constants.X_OK);
      return dirname(dirname(realpathSync(executable)));
    } catch (error) {
      if (!["ENOENT", "EACCES", "ENOTDIR"].includes(error.code)) {
        throw error;
      }
    }
  }
  throw new Error("Cannot locate npm to load its builtin configuration");
}

export async function loadMinimumReleaseAge(
  directory,
  {
    env = process.env,
    npmPath = findNpmPath(env),
    execPath = process.execPath,
  } = {},
) {
  const config = new Config({
    definitions,
    shorthands,
    flatten,
    npmPath,
    cwd: resolve(directory),
    // Config.load exports npm_config_* values into this object.
    env: { ...env },
    argv: [],
    execPath,
  });
  await config.load();
  const minimumAgeDays = config.get("min-release-age") ?? 0;
  if (
    typeof minimumAgeDays !== "number" ||
    !Number.isFinite(minimumAgeDays) ||
    minimumAgeDays < 0
  ) {
    throw new Error(`Invalid npm min-release-age in ${directory}`);
  }
  return minimumAgeDays;
}
