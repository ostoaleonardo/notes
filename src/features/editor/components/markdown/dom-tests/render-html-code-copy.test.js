import { renderMarkdownHtml } from '../markdown-dom-render-html'

describe('render fenced code blocks', () => {
    test('wraps the block with a copy button that survives sanitizing', () => {
        const html = renderMarkdownHtml('```js\nconst a = 1\n```')

        expect(html).toContain('class="code-block"')
        expect(html).toContain('class="code-copy"')
        expect(html).toContain('<svg')
        expect(html).toContain('<pre>')
    })

    test('does not add a button to inline code', () => {
        expect(renderMarkdownHtml('use `a` here')).not.toContain('code-copy')
    })

    test('keeps placeholders and replacement patterns in code untouched', () => {
        const html = renderMarkdownHtml('```\n{icon} $& {pre}\n```')

        expect(html).toContain('{icon} $&amp; {pre}')
    })
})
