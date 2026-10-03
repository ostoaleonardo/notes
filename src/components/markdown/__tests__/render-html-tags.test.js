import { renderMarkdownRaw } from '../markdown-dom-render-html'

describe('render inline tags', () => {
    test('turns tags into links when asked', () => {
        const html = renderMarkdownRaw('hello #work/a there', { tags: true })

        expect(html).toContain('<a href="tag://work%2Fa" class="tag">#work/a</a>')
    })

    test('leaves tags as plain text by default', () => {
        expect(renderMarkdownRaw('hello #work')).not.toContain('tag://')
    })

    test('does not touch code or existing links', () => {
        const html = renderMarkdownRaw('`#a` [#b](http://x.com)', { tags: true })

        expect(html).not.toContain('tag://')
    })

    test('does not treat headings as tags', () => {
        expect(renderMarkdownRaw('# Title', { tags: true })).not.toContain('tag://')
    })
})
