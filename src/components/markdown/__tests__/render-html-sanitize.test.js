import { renderMarkdownRaw } from '../markdown-dom-render-html'
import { sanitizeHtml } from '@/utils/sanitize-html'

describe('render with sanitized html', () => {
    test('strips scripts and event handlers from raw html', () => {
        const html = renderMarkdownRaw(
            '<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">',
            { sanitizeHtml }
        )

        expect(html).not.toContain('<script')
        expect(html).not.toContain('onerror')
    })

    test('keeps generated callout markup', () => {
        const html = renderMarkdownRaw('> [!note] Title\n> body', { sanitizeHtml })

        expect(html).toContain('<div class="')
        expect(html).toContain('Title')
    })

    test('leaves raw html untouched when no sanitizer is given', () => {
        expect(renderMarkdownRaw('<b>x</b>')).toContain('<b>x</b>')
    })
})
