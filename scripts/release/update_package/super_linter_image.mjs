import semver from "semver";
import { isMap, isScalar, isSeq, parseDocument } from "yaml";

export function getSuperLinterImage(workflowText) {
  const document = parseDocument(workflowText);
  if (document.errors.length !== 0) {
    throw new Error(`Invalid workflow YAML: ${document.errors[0].message}`);
  }
  const steps = document.getIn(["jobs", "super-linter", "steps"]);
  if (!isSeq(steps)) {
    throw new Error("Super-Linter job must declare a steps sequence");
  }
  const matches = steps.items.filter(
    (step) => isMap(step) && step.get("name") === "Super-Linter",
  );
  if (matches.length !== 1) {
    throw new Error(
      "Workflow must contain exactly one named Super-Linter step",
    );
  }
  const uses = matches[0].get("uses", true);
  if (
    !isScalar(uses) ||
    typeof uses.value !== "string" ||
    !/^super-linter\/super-linter\/slim@[a-f0-9]{40}$/.test(uses.value)
  ) {
    throw new Error(
      "Super-Linter must use the slim action pinned to a full SHA",
    );
  }
  const version = semver.valid(uses.comment?.trim());
  if (!version) {
    throw new Error("Super-Linter uses comment must contain a valid version");
  }
  return `ghcr.io/super-linter/super-linter:slim-v${version}`;
}
