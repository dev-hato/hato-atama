import * as core from "@actions/core";
import type { Context } from "@actions/github/lib/context";
import type { GitHub } from "@actions/github/lib/utils";
import type { PaginatingEndpoints } from "@octokit/plugin-paginate-rest";
import type { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";
import { sleep } from "./sleep";

export async function script(
  github: InstanceType<typeof GitHub>,
  context: Context,
): Promise<string> {
  const HEAD_REF = process.env.HEAD_REF;
  const running = "running";
  const retryCount = 10;
  let result: string[];

  for (let i = 0; i < retryCount; i++) {
    const listRepoWorkflowsParams: RestEndpointMethodTypes["actions"]["listRepoWorkflows"]["parameters"] =
      {
        owner: context.repo.owner,
        repo: context.repo.repo,
      };
    console.log("call actions.listRepoWorkflows:", listRepoWorkflowsParams);
    let workflows: PaginatingEndpoints["GET /repos/{owner}/{repo}/actions/workflows"]["response"]["data"]["workflows"] =
      await github.paginate(
        github.rest.actions.listRepoWorkflows,
        listRepoWorkflowsParams,
      );
    workflows = workflows.filter((w): boolean => w.name === "release");
    const runNumbers: string[][] = await Promise.all(
      workflows.map(async (w): Promise<string[]> => {
        const listWorkflowRunsParams: RestEndpointMethodTypes["actions"]["listWorkflowRuns"]["parameters"] =
          {
            owner: context.repo.owner,
            repo: context.repo.repo,
            workflow_id: w.id,
            branch: HEAD_REF,
          };
        console.log("call actions.listWorkflowRuns:");
        console.log(listWorkflowRunsParams);
        let runs: PaginatingEndpoints["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"]["response"]["data"]["workflow_runs"] =
          await github.paginate(
            github.rest.actions.listWorkflowRuns,
            listWorkflowRunsParams,
          );
        console.log(runs);
        runs = runs.filter(
          (r): boolean =>
            process.env.RUN_NUMBER === undefined ||
            r.run_number < Number(process.env.RUN_NUMBER),
        );
        return runs.map((r): string => {
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
