import importedExample from './ExampleContent.md'

document.title = importedExample.title

const { translateMarkdown } = require('../src/markdownLoader')

const literalSource = `
# Begin first section
This section was generated via \`translateMarkdown\`. The section below was \`import\`ed from a static Markdown source file.
# End first section. Second section follows.
`

translateMarkdown(literalSource).then(translatedLiteralExample => {
  document.body.innerHTML = [translatedLiteralExample.contents, importedExample.html].join(' ')
})
