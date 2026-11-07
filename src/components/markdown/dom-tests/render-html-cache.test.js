import { renderReadHtml } from '../markdown-dom-render-html'

describe('render markdown html cache', () => {
    test('returns the same html for the same text', () => {
        const first = renderReadHtml('# one')

        expect(renderReadHtml('# one')).toBe(first)
    })

    test('recomputes when the text changes', () => {
        const first = renderReadHtml('# one')
        const second = renderReadHtml('# two')

        expect(second).not.toBe(first)
        expect(second).toContain('two')
        expect(renderReadHtml('# one')).toContain('one')
    })
})
