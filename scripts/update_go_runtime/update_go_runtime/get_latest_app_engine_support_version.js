const axios = require('axios')
const cheerio = require('cheerio')
const chardet = require('chardet');
const iconv = require('iconv-lite');
const { Text } = require('domhandler')

module.exports = async () => {
  const response = await axios.get('https://cloud.google.com/appengine/docs/standard/go/runtime', {responseType: 'arraybuffer'})
  const encoding = chardet.detect(response.data)
  if (!encoding) {
    throw new Error('chardet failed to detect encoding')
  }
  const data = iconv.decode(response.data, encoding)
  console.log(data)
  const $ = cheerio.load(data)
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
