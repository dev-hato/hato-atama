const sleep = require('../../sleep.js')

module.exports = async ({ github, context, core }) => {
  const HEAD_REF = process.env.HEAD_REF
  const commonParams = { owner: context.repo.owner, repo: context.repo.repo }
  const running = 'running'
  const retryCount = 10
  let result

  for (let i = 0; i < retryCount; i++) {
    console.log('call actions.listRepoWorkflows:', commonParams)
    let workflows = await github.paginate(
      github.rest.actions.listRepoWorkflows,
      commonParams
    )
    workflows = workflows.filter((w) => w.name === 'release')
    const runNumbers = await Promise.all(
      workflows.map(async (w) => {
        const listWorkflowRunsParams = {
          workflow_id: w.id,
          branch: HEAD_REF,
          ...commonParams
        }
        console.log('call actions.listWorkflowRuns:')
        console.log(listWorkflowRunsParams)
        const runs = await github.paginate(
          github.rest.actions.listWorkflowRuns,
          listWorkflowRunsParams
        )
        return runs.map((run) => {
          if (run.status !== 'completed') {
            return running
          }

          return `v${run.run_number}`
        })
      })
    )
    result = runNumbers.flat().filter(Boolean)
    await sleep({ result, running, retry_count: retryCount, i })
  }

  if (result.includes(running)) {
    core.setFailed('There are running runs.')
  }

  return result.join(' ')
}
