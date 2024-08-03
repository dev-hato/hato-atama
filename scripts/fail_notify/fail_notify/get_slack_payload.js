module.exports = ({ context }) => {
  const attachment = {
    color: "danger",
    fields: [
      {
        title: "詳細",
        value: `<${context.payload.workflow_run.html_url}|${context.payload.workflow_run.id}>`,
        short: true,
      },
    ],
  };

  if (
    context.payload.workflow_run.display_title &&
    context.payload.workflow_run.head_repository
  ) {
    let displayTitle = context.payload.workflow_run.display_title;

    // https://api.slack.com/reference/surfaces/formatting#escaping
    for (const replaceRule of [
      ["&", "&amp;"],
      ["<", "&lt;"],
      [">", "&gt;"],
    ]) {
      displayTitle = displayTitle.replaceAll(replaceRule[0], replaceRule[1]);
    }

    if (context.payload.workflow_run.pull_requests.length > 0) {
      attachment.title = "Pull Request";
      attachment.text = context.payload.workflow_run.pull_requests
        .map(
          (p) =>
            `<${context.payload.workflow_run.head_repository.html_url}/pull/${p.number}|${displayTitle}>`,
        )
        .join("\n");
    } else if (context.payload.workflow_run.head_commit) {
      attachment.title = "コミット";
      attachment.text = `<${context.payload.workflow_run.head_repository.html_url}/commit/${context.payload.workflow_run.head_commit.id}|${displayTitle}>`;
    }
  }

  return JSON.stringify({
    text: "CIが失敗したっぽ......",
    attachments: [attachment],
  });
};
