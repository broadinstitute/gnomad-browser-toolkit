const loaderUtils = require('loader-utils')
const remark = require('remark')
const extract = require('remark-extract-frontmatter')
const frontmatter = require('remark-frontmatter')
const html = require('remark-html')
const visit = require('unist-util-visit')
const yaml = require('yaml').parse

/* eslint-disable no-param-reassign */
const imageFinder = () => (tree, file) => {
  file.images = []
  visit(tree, 'image', node => {
    if (!node.url.startsWith('http')) {
      file.images.push(node.url)
      node.url = `___MD_CONTENT_IMAGE_${file.images.length - 1}___`
    }
  })
}

const linkTransformer = () => tree => {
  visit(tree, 'link', node => {
    if (node.url.match(/^https?:\/\//)) {
      if (!node.data) {
        node.data = {}
      }
      if (!node.data.hProperties) {
        node.data.hProperties = {}
      }
      node.data.hProperties.target = '_blank'
      node.data.hProperties.rel = 'noopener noreferrer'
    }
  })
}
/* eslint-enable no-param-reassign */

const translateMarkdown = markdownSource =>
  remark()
    .use(frontmatter)
    .use(extract, { yaml })
    .use(imageFinder)
    .use(linkTransformer)
    .use(html)
    .process(markdownSource)

const markdownLoader = function (content) {
  const callback = this.async()
  translateMarkdown(content).then(vfile => {
    let output = `export default ${JSON.stringify({
      ...vfile.data,
      html: vfile.contents,
    })};`

    const imports = []

    output = output.replace(/___MD_CONTENT_IMAGE_([0-9]+)___/g, (_match, p1) => {
      const imageIndex = parseInt(p1, 10)
      const request = loaderUtils.stringifyRequest(
        this,
        loaderUtils.urlToRequest(vfile.images[imageIndex])
      )
      imports.push(`import ___MD_CONTENT_IMAGE_${imageIndex}__ from ${request}`)

      return `" + ___MD_CONTENT_IMAGE_${imageIndex}__ + "`
    })

    if (imports.length > 0) {
      output = `${imports.join(';')};${output}`
    }
    callback(null, output)
  }, callback)
}

module.exports = markdownLoader
module.exports.translateMarkdown = translateMarkdown
