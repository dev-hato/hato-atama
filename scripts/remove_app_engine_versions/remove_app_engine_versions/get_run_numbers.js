const sleep = require('../../sleep.js')

module.exports = async ({github, context}) => {
    const HEAD_REF = process.env["HEAD_REF"]
    const common_params = {owner: context.repo.owner, repo: context.repo.repo}
    const running = 'running'
    const retry_count = 10
    let result

    for (let i = 0; i < retry_count; i++) {
        console.log("call actions.listRepoWorkflows:", common_params)
        let workflows = await github.paginate(github.rest.actions.listRepoWorkflows, common_params)
        workflows = workflows.filter(w => w.name === 'release')
        const run_numbers = await Promise.all(workflows.map(async w => {
            const list_workflow_runs_params = {
                workflow_id: w.id, branch: HEAD_REF, ...common_params
            }
            console.log("call actions.listWorkflowRuns:")
            console.log(list_workflow_runs_params)
            const runs = await github.paginate(github.rest.actions.listWorkflowRuns, list_workflow_runs_params)
            return runs.map(run => {
                if (run.status !== 'completed') {
                    return running
                }

                return `v${run.run_number}`
            })
        }))
        result = run_numbers.flat().filter(Boolean)
        await sleep({result, running, retry_count})
    }

    if (result.includes(running)) {
        core.setFailed('There are running runs.')
    }

    return result.join(' ')
}
