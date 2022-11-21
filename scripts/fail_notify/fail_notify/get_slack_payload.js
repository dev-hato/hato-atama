module.exports = ({ context }) => {
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
      value: context.payload.workflow_run.pull_requests.map(p => `<${p}|${context.payload.workflow_run.pulls_url.replace('{/number}', `/${p}`)}>`).join('\n')
    })
  } else if (context.payload.workflow_run.head_commit && context.payload.workflow_run.head_repository) {
    payload.attachments.unshift({
      title: 'コミット',
      value: `<${context.payload.workflow_run.head_commit.message}|${context.payload.workflow_run.head_repository.html_url}/commits/${context.payload.workflow_run.head_commit.id}>`
    })
  }

  return JSON.stringify(payload)
}
