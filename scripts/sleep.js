module.exports = async ({ result, running, retryCount, i }) => {
  if (!result.includes(running) || i === retryCount - 1) {
    return
  }

  // 完了していないrunがあった場合はリトライ
  // sleepする時間は exponential backoff and jitter で算出している
  // 参考: https://aws.typepad.com/sajp/2015/03/backoff.html
  const sleepSeconds = Math.random() * (Math.pow(2, i + 1) * 100)
  console.log(`sleep ${sleepSeconds}s`)
  await new Promise(resolve => setTimeout(resolve, sleepSeconds * 1000))
}
