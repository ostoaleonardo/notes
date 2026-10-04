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

describe('render block ids', () => {
    test('hides the trailing id and marks the paragraph', () => {
        const html = renderMarkdownRaw('Key idea ^idea-1')

        expect(html).toContain('<p data-block-id="idea-1">Key idea</p>')
        expect(html).not.toContain('^idea-1')
    })

    test('marks the list item for a tight list entry', () => {
        const html = renderMarkdownRaw('- one\n- two ^second')

        expect(html).toContain('<li data-block-id="second">two</li>')
    })

    test('attaches a standalone id to the block above it', () => {
        const html = renderMarkdownRaw('| a | b |\n| - | - |\n| 1 | 2 |\n\n^table')

        expect(html).toContain('<table data-block-id="table">')
        expect(html).not.toContain('^table')
    })

    test('keeps ids inside code untouched', () => {
        expect(renderMarkdownRaw('`x ^id`')).toContain('x ^id')
    })

    test('leaves a mid-paragraph caret alone', () => {
        expect(renderMarkdownRaw('2 ^3 apples')).toContain('2 ^3 apples')
    })
})

describe('render custom task statuses', () => {
    test('renders a custom status as a checked checkbox tagged with its status', () => {
        const html = renderMarkdownRaw('- [/] doing\n- [-] dropped')

        expect(html).toContain('data-task="/"')
        expect(html).toContain('data-task="-"')
        expect(html.match(/checked=""/g)).toHaveLength(2)
        expect(html).toContain('doing')
    })

    test('tags the checkbox of a custom status with its glyph', () => {
        const html = renderMarkdownRaw('- [/] doing\n- [ ] todo')

        expect(html).toContain('data-status="/"')
        expect(html.match(/data-status=/g)).toHaveLength(1)
    })

    test('leaves regular tasks without a status attribute', () => {
        const html = renderMarkdownRaw('- [ ] a\n- [x] b')

        expect(html).not.toContain('data-task')
        expect(html.match(/<input/g)).toHaveLength(2)
    })
})

describe('render line breaks', () => {
    test('turns a single newline into a line break', () => {
        expect(renderMarkdownRaw('one\ntwo')).toContain('one<br>\ntwo')
    })
})

describe('render inline footnotes', () => {
    test('renders a caret bracket note as a numbered footnote', () => {
        const html = renderMarkdownRaw('Text^[inline note] end')

        expect(html).toContain('class="footnote-ref"')
        expect(html).toContain('inline note')
    })
})

describe('render tables', () => {
    const TABLE = '| a | b |\n| --- | --- |\n| 1 | 2 |'

    test('leaves a line without a pipe outside the table', () => {
        const html = renderMarkdownRaw(`${TABLE}\nhi`)

        expect(html.match(/<tr>/g)).toHaveLength(2)
        expect(html).toContain('<p>hi</p>')
    })

    test('keeps every row that has a pipe', () => {
        const html = renderMarkdownRaw(`${TABLE}\n| 3 | 4 |\nhi`)

        expect(html.match(/<tr>/g)).toHaveLength(3)
    })
})
