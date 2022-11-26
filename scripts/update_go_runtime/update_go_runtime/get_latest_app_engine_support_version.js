const axios = require('axios')
const cheerio = require('cheerio')
const { Text } = require('domhandler')

module.exports = async () => {
  const response = await axios.get('https://cloud.google.com/appengine/docs/standard/go/runtime')
  const $ = cheerio.load(response.data)
  const versions = []

  for (const element of $('code[dir="ltr"]').get()) {
    const textElement = element.children[0]
    if (textElement instanceof Text) {
      const textElementData = textElement.data.trim()
      console.log(textElementData)
      if (textElementData.startsWith('runtime')) {
        versions.push(textElementData)
      }
    }
  }

  versions.sort()
  console.log(versions)
  const a=versions.pop()
  console.log(a)
  return a
}
