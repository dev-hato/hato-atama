module.exports = async ({github,context}) => {
    const issues_listComments_params = {
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo
    }
    console.log("call issues.listComments:", issues_listComments_params)
    const issue_comments = (await github.paginate(github.rest.issues.listComments, issues_listComments_params)).filter(
        issue_comment => issue_comment.user.id === 41898282 && issue_comment.body.startsWith('日本語の')
    )

    for (const issue_comment of issue_comments) {
        const issues_deleteComment_params = {
            comment_id: issue_comment.id,
            owner: context.repo.owner,
            repo: context.repo.repo
        }
        console.log("call issues.deleteComment:", issues_deleteComment_params)
        await github.rest.issues.deleteComment(issues_deleteComment_params)
    }

    const result = process.env.RESULT
    const issues_createComment_params = {
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: "日本語のLint結果だよ！🕊🕊🕊\n```\n" + result + "\n```"
    }
    console.log("call issues.createComment:", issues_createComment_params)
    await github.rest.issues.createComment(issues_createComment_params)
}
