import * as core from "@actions/core";
import type { Context } from "@actions/github/lib/context";
import type { GitHub } from "@actions/github/lib/utils";
import type {PaginatingEndpoints} from '@octokit/plugin-paginate-rest';
import { sleep } from "./sleep";

export async function script(
  github: InstanceType<typeof GitHub>,
  context: Context,
) {
  const HEAD_REF = process.env.HEAD_REF;
  const commonParams = {
    owner: context.repo.owner,
    repo: context.repo.repo,
  };
  const running = "running";
  const retryCount = 10;
  let result: string[];

  for (let i = 0; i < retryCount; i++) {
    console.log("call actions.listRepoWorkflows:", commonParams);
    let workflows: PaginatingEndpoints["GET /repos/{owner}/{repo}/actions/workflows"]["response"]["data"]["workflows"] = await github.paginate(
      github.rest.actions.listRepoWorkflows,
      commonParams,
    );
    workflows = workflows.filter((w) => w.name === "release");
    const runNumbers = await Promise.all(
      workflows.map(async (w) => {
        const listWorkflowRunsParams = {
          workflow_id: w.id,
          branch: HEAD_REF,
          ...commonParams,
        };
        console.log("call actions.listWorkflowRuns:");
        console.log(listWorkflowRunsParams);
        let runs: PaginatingEndpoints["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"]["response"]["data"]["workflow_runs"] = await github.paginate(
          github.rest.actions.listWorkflowRuns,
          listWorkflowRunsParams,
        );
        runs = runs.filter(
          (r) =>
            process.env.RUN_NUMBER === undefined ||
            r.run_number < Number(process.env.RUN_NUMBER),
        );
        return runs.map((r) => {
          if (r.status !== "completed") {
            return running;
          }

          return `v${r.run_number}`;
        });
      }),
    );
    result = runNumbers.flat().filter(Boolean);

    if (process.env.RUN_NUMBER !== undefined) {
      result.shift();
    }

    await sleep(result, running, retryCount, i);
  }

  if (result.includes(running)) {
    core.setFailed("There are running runs.");
  }

  return result.join(" ");
}
