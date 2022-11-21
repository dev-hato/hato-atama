function escape (s) {
  for (const replaceRule of [['&', '&amp;'], ['<', '&lt;'], ['>', '&gt;']]) {
    s = s.replaceAll(replaceRule[0], replaceRule[1])
  }

  return s
}

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

  if (context.payload.workflow_run.event === 'pull_request') {
    payload.attachments.unshift({
      title: 'PR',
      value: context.payload.workflow_run.pull_requests.map(p => `<${escape(context.payload.workflow_run.display_title)}|${context.payload.workflow_run.head_repository.html_url}/pulls/${p.number}>`).join('\n')
    })
  } else if (context.payload.workflow_run.head_commit && context.payload.workflow_run.head_repository) {
    payload.attachments.unshift({
      title: 'コミット',
      value: `<${escape(context.payload.workflow_run.head_commit.message)}|${context.payload.workflow_run.head_repository.html_url}/commit/${context.payload.workflow_run.head_commit.id}>`
    })
  }

  return JSON.stringify(payload)
}
