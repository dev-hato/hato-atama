const axios = require('axios')
const cheerio = require('cheerio')
const Encoding = require('encoding-japanese')
const { Text } = require('domhandler')

module.exports = async () => {
  const response = await axios.get('https://cloud.google.com/appengine/docs/standard/go/runtime', {responseEncoding: 'binary'})
  const $ = cheerio.load(response.data.toString('utf-8'),{ decodeEntities: false })
  const versions = []

  for (const element of $('code[dir="ltr"]').get()) {
    const textElement = element.children[0]
    if (textElement instanceof Text) {
      const textElementData = textElement.data.trim()
      if (textElementData.startsWith('runtime')) {
        versions.push(textElementData)
      }
    }
  }

  versions.sort()
  return versions.pop()
}
