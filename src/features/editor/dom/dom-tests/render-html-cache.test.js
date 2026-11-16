import { parseReadMarkdown, renderReadHtml } from '../../shared/markdown-dom-render-html'

describe('read markdown parsing cache', () => {
    test('returns the same parsed note for the same text', () => {
        const first = parseReadMarkdown('# one')

        expect(parseReadMarkdown('# one')).toBe(first)
    })

    test('parses again when the text changes', () => {
        const first = parseReadMarkdown('# one')
        const second = parseReadMarkdown('# two')

        expect(second).not.toBe(first)
        expect(renderReadHtml(second)).toContain('two')
        expect(renderReadHtml(parseReadMarkdown('# one'))).toContain('one')
    })

    test('renders nothing for empty text', () => {
        expect(renderReadHtml(parseReadMarkdown(''))).toBe('')
    })
})
