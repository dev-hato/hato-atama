const axios = require('axios')
const cheerio = require('cheerio')
const iconv = require('iconv-lite');
const { Text } = require('domhandler')

module.exports = async () => {
  const response = await axios.get('https://cloud.google.com/appengine/docs/standard/go/runtime',{responseType: 'arraybuffer',
    responseEncoding: 'binary'})
  const n=iconv.decode(Buffer.from(response.data), 'windows-31j')
  console.log(n)
  const $ = cheerio.load(n)
  const versions = []

  console.log($('code[dir="ltr"]').get())

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
  console.log(versions)
  const a=versions.pop()
  console.log(a)
  return a
}
