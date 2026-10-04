import { sanitizeHtml } from '../sanitize-html'

describe('sanitize html', () => {
    test('keeps allowed tags with allowed attributes', () => {
        const html = '<div class="embed"><img src="data:image/png;base64,AAA" width="50"></div>'

        expect(sanitizeHtml(html)).toBe(
            '<div class="embed"><img src="data:image/png;base64,AAA" width="50"></div>'
        )
    })

    test('escapes tags that are not allowed', () => {
        const html = sanitizeHtml('<script>alert(1)</script><iframe src="x"></iframe>')

        expect(html).not.toContain('<script')
        expect(html).not.toContain('<iframe')
        expect(html).toContain('&lt;script>')
    })

    test('drops event handlers and unknown attributes', () => {
        const html = sanitizeHtml('<img src="https://a.test/x.png" onerror="alert(1)" style="x:y">')

        expect(html).toBe('<img src="https://a.test/x.png">')
    })

    test('drops unsafe url schemes', () => {
        const html = sanitizeHtml('<a href="javascript:alert(1)">x</a><img src="data:text/html;base64,AAA">')

        expect(html).toBe('<a>x</a><img>')
    })

    test('escapes a broken tag that could not be parsed', () => {
        const html = sanitizeHtml('<img src=x onerror=alert(1) <b>')

        expect(html).not.toMatch(/<img/)
        expect(html).toContain('<b>')
    })

    test('escapes quotes in attribute values', () => {
        const html = sanitizeHtml('<a href=\'https://a.test/?q="x"\'>x</a>')

        expect(html).toBe('<a href="https://a.test/?q=&quot;x&quot;">x</a>')
    })
})
