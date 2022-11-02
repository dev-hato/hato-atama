module.exports = async ({github, context}) => {
    let body = "${{github.event.pull_request.head.sha}} のPR用環境:"
    body += " <a href=\"https://v" + process.env.GITHUB_RUN_NUMBER
    body += "-dot-hato-atama.an.r.appspot.com\">サイト</a>,"
    body += " <a href=\"https://console.cloud.google.com/logs/query;"
    body += "query=resource.type%3D%22gae_app"
    body += "%22%20resource.labels.module_id%3D%22default"
    body += "%22%20resource.labels.version_id%3D%22v"
    body += process.env.GITHUB_RUN_NUMBER
    body += "%22?project=hato-atama\">ログ</a>"
    await github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body,
    })
}
