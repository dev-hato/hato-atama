const fs = require('fs')
const cheerio = require('cheerio')
const { Text } = require('domhandler')

module.exports = async () => {
  const $ = cheerio.load(fs.readFileSync('runtime.html'))
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
