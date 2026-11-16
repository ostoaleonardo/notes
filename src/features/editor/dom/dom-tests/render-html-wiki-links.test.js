import { parseReadMarkdown, renderReadHtml } from '../../shared/markdown-dom-render-html'

const render = (text, details = new Map()) => renderReadHtml(parseReadMarkdown(text), { details })

const found = (path, target, anchor = '') => ({ path, target, anchor })

describe('read markdown wiki links', () => {
    test('collects each distinct target once', () => {
        const parsed = parseReadMarkdown('[[A]] and [[B|alias]] and [[A]]')

        expect(parsed.targets).toEqual(['A', 'B'])
    })

    test('renders a resolved link to the note path', () => {
        const html = render('see [[Target]]', new Map([['Target', found('note-1', 'Target')]]))

        expect(html).toContain('<a href="wikilink://note-1" class="wiki-link">Target</a>')
    })

    test('renders the alias as the label', () => {
        const html = render('[[Target|shown]]', new Map([['Target', found('note-1', 'Target')]]))

        expect(html).toContain('class="wiki-link">shown</a>')
    })

    test('renders an unresolved link as a broken link', () => {
        const html = render('[[folder/Nope]]', new Map([['folder/Nope', found(null, 'folder/Nope')]]))

        expect(html).toContain('href="wikilink://missing/folder/Nope" class="wiki-link-broken"')
    })

    test('keeps the anchor in the href and the default label', () => {
        const html = render('[[Target#Part]]', new Map([['Target#Part', found('note-1', 'Target', 'Part')]]))

        expect(html).toContain('href="wikilink://note-1#Part"')
        expect(html).toContain('Target &gt; Part')
    })

    test('ignores links inside code', () => {
        const parsed = parseReadMarkdown('`[[A]]`\n\n```\n[[B]]\n```')

        expect(parsed.targets).toEqual([])
    })

    test('works inside escaped table cells', () => {
        const parsed = parseReadMarkdown('| a |\n| - |\n| [[T\\|x]] |')

        expect(parsed.targets).toEqual(['T'])
    })
})
