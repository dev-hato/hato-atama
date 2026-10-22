import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// npmのelmパッケージは「0.19.2-0」のように、コンパイラのバージョンにインストーラーの版を付けている
const packageVersionPattern = /^(\d+\.\d+\.\d+)(?:-\d+)?$/;

export function toCompilerVersion(packageVersion) {
  const match = packageVersionPattern.exec(packageVersion ?? "");

  if (match == null) {
    throw new Error(`Unexpected elm package version: ${packageVersion}`);
  }

  return match[1];
}

export function setElmVersion(elm, compilerVersion) {
  if (typeof elm["elm-version"] !== "string") {
    throw new Error('"elm-version" is not found in elm.json');
  }

  return { ...elm, "elm-version": compilerVersion };
}

export function main(directory = "frontend") {
  const manifest = JSON.parse(
    readFileSync(`${directory}/package.json`, "utf8"),
  );
  const compilerVersion = toCompilerVersion(manifest.devDependencies?.elm);
  const elmJsonPath = `${directory}/elm.json`;
  const elm = JSON.parse(readFileSync(elmJsonPath, "utf8"));
  const updated = setElmVersion(elm, compilerVersion);

  if (updated["elm-version"] === elm["elm-version"]) {
    return;
  }

  writeFileSync(elmJsonPath, `${JSON.stringify(updated, null, 2)}\n`);
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
