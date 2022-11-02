module.exports = async ({result, running, retry_count}) => {
    if (!result.includes(running) || i === retry_count - 1) {
        return
    }

    // 完了していないrunがあった場合はリトライ
    // sleepする時間は exponential backoff and jitter で算出している
    // 参考: https://aws.typepad.com/sajp/2015/03/backoff.html
    const sleep_seconds = Math.random() * (Math.pow(2, i + 1) * 100)
    console.log(`sleep ${sleep_seconds}s`)
    await new Promise(r => setTimeout(r, sleep_seconds * 1000))
}
