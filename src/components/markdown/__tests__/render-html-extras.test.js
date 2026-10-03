import { renderMarkdownRaw } from '../markdown-dom-render-html'

describe('render highlights', () => {
    test('wraps highlighted text in a mark element', () => {
        expect(renderMarkdownRaw('a ==key idea== b')).toContain('<mark>key idea</mark>')
    })

    test('keeps inline formatting inside the highlight', () => {
        expect(renderMarkdownRaw('==a **b**==')).toContain('<mark>a <strong>b</strong></mark>')
    })

    test('ignores comparison operators and code', () => {
        expect(renderMarkdownRaw('x === y and `==a==`')).not.toContain('<mark>')
    })
})

describe('render comments', () => {
    test('removes inline and multiline comments', () => {
        const html = renderMarkdownRaw('a %%hidden%% b\n\n%%\nmulti\nline\n%%\n\nc')

        expect(html).not.toContain('hidden')
        expect(html).not.toContain('multi')
        expect(html).toContain('c')
    })

    test('keeps comment markers inside code', () => {
        expect(renderMarkdownRaw('`%%a%%`')).toContain('%%a%%')
    })
})

describe('render callouts', () => {
    test('turns a callout blockquote into a styled block with title and body', () => {
        const html = renderMarkdownRaw('> [!warning] Careful\n> body text')

        expect(html).toContain('<div class="callout callout-warning">')
        expect(html).toContain('<div class="callout-title">Careful</div>')
        expect(html).toContain('body text')
        expect(html).not.toContain('[!warning]')
    })

    test('uses the capitalized type as the default title', () => {
        expect(renderMarkdownRaw('> [!tip]\n> body')).toContain('>Tip</div>')
    })

    test('maps aliases and unknown types', () => {
        expect(renderMarkdownRaw('> [!hint]\n> a')).toContain('callout-tip')
        expect(renderMarkdownRaw('> [!whatever]\n> a')).toContain('callout-note')
    })

    test('renders foldable callouts as details', () => {
        const closed = renderMarkdownRaw('> [!note]- Title\n> body')
        const opened = renderMarkdownRaw('> [!note]+ Title\n> body')

        expect(closed).toContain('<details class="callout callout-note">')
        expect(closed).toContain('<summary class="callout-title">Title</summary>')
        expect(opened).toContain('<details class="callout callout-note" open="">')
    })

    test('renders a callout without body', () => {
        const html = renderMarkdownRaw('> [!info] Only title')

        expect(html).toContain('Only title')
        expect(html).not.toContain('<p>')
    })

    test('leaves plain blockquotes alone', () => {
        expect(renderMarkdownRaw('> quote')).toContain('<blockquote>')
    })
})
