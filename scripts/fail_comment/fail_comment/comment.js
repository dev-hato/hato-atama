module.exports = async ({github, context}) => {
    for (const pr of JSON.load(process.env.PULL_REQUESTS)) {
        await github.rest.issues.createComment({
            issue_number: pr.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: "CIが失敗したっぽ......\n${{github.event.workflow_run.html_url}}"
        })
    }
}
