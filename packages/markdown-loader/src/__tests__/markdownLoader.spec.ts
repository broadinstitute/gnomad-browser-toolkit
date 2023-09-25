import { translateMarkdown } from '../markdownLoader'

describe('markdownLoader', () => {
  test('translateMarkdown returns promise to string of rendered HTML', () => {
    const exampleMarkdownSource = `
# This is a heading

Followed by a paragraph

* Some people
* overuse
* bulleted lists
	`

    return translateMarkdown(exampleMarkdownSource).then(result => {
      expect(result.contents).toMatchSnapshot()
    })
  })
})
