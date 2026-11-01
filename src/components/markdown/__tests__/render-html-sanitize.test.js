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

describe('render data urls', () => {
    test('renders images with data urls of any image type', () => {
        const html = renderMarkdownRaw('![x](data:image/avif;base64,AAAA)')

        expect(html).toContain('<img src="data:image/avif;base64,AAAA"')
    })

    test('does not render links to non image data urls', () => {
        expect(renderMarkdownRaw('[x](data:text/html;base64,AAAA)')).not.toContain('<a')
    })

    test('does not render javascript links', () => {
        expect(renderMarkdownRaw('[x](javascript:alert(1))')).not.toContain('<a')
    })

    test('does not render file links', () => {
        expect(renderMarkdownRaw('[x](file:///etc/passwd)')).not.toContain('<a')
    })
})
