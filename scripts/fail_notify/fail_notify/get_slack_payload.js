module.exports = ({ context }) => {
  console.log(context.payload)
  const payload = {
    text: 'CIが失敗したっぽ......',
    attachments: [
      {
        title: '詳細',
        value: `<${context.payload.workflow_run.id}|${context.payload.workflow_run.html_url}>`
      }
    ]
  }
  let displayTitle = context.payload.workflow_run.display_title

  // https://api.slack.com/reference/surfaces/formatting#escaping
  for (const replaceRule of [['&', '&amp;'], ['<', '&lt;'], ['>', '&gt;']]) {
    displayTitle = displayTitle.replaceAll(replaceRule[0], replaceRule[1])
  }

  if (context.payload.workflow_run.event === 'pull_request') {
    payload.attachments.unshift({
      title: 'PR',
      value: context.payload.workflow_run.pull_requests.map(p => `<${displayTitle}|${context.payload.workflow_run.head_repository.html_url}/pulls/${p.number}>`).join('\n')
    })
  } else if (context.payload.workflow_run.head_commit && context.payload.workflow_run.head_repository) {
    payload.attachments.unshift({
      title: 'コミット',
      value: `<${displayTitle}|${context.payload.workflow_run.head_repository.html_url}/commit/${context.payload.workflow_run.head_commit.id}>`
    })
  }

  return JSON.stringify(payload)
}
