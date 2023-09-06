module.exports = async ({ github, context }) => {
  const issuesListCommentsParams = {
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo
  }
  console.log('call issues.listComments:', issuesListCommentsParams)
  const issueComments = (await github.paginate(github.rest.issues.listComments, issuesListCommentsParams)).filter(
    issueComment => issueComment.user.id === 41898282 && issueComment.body.startsWith('日本語の')
  )

  for (const issueComment of issueComments) {
    const issuesDeleteCommentParams = {
      comment_id: issueComment.id,
      owner: context.repo.owner,
      repo: context.repo.repo
    }
    console.log('call issues.deleteComment:', issuesDeleteCommentParams)
    await github.rest.issues.deleteComment(issuesDeleteCommentParams)
  }

  const issuesCreateCommentParams = {
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
    body: '日本語のLint結果だよ！🕊🕊🕊\n```\n' + process.env.RESULT + '\n```'
  }
  console.log('call issues.createComment:', issuesCreateCommentParams)
  await github.rest.issues.createComment(issuesCreateCommentParams)
}
