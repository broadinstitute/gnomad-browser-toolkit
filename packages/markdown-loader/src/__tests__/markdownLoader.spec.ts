import { translateMarkdown } from '../markdownLoader'

describe('markdownLoader', () => {
  test('translateMarkdown returns promise to string of rendered HTML', async done => {
    const exampleMarkdownSource = `
# This is a heading

Followed by a paragraph

* Some people
* overuse
* bulleted lists
	`

    translateMarkdown(exampleMarkdownSource).then((result: any) => {
      expect(result.contents).toMatchSnapshot()
      done()
    })
  })
})
