import { getExportMarkdown, getNoteAsHtml } from '../export-html'

jest.mock('@/components/markdown/markdown-dom-preview-css', () => ({
    buildPreviewCss: () => ''
}))

jest.mock('@/components/markdown/markdown-dom-render-html', () => ({
    renderMarkdownRaw: (text) => text
}))

const notes = [
    { path: 'a', title: 'Alpha', note: 'alpha body' },
    { path: 'b', title: 'Beta', note: 'see [[Alpha|first]]' }
]

describe('note as html', () => {
    test('escapes the title in the document head', () => {
        const html = getNoteAsHtml({ title: '</title><script>x</script>', note: '' })

        expect(html).toContain('<title>&lt;/title&gt;&lt;script&gt;x&lt;/script&gt;</title>')
    })

    test('blocks scripts with a content security policy', () => {
        const html = getNoteAsHtml({ title: 'T', note: '' })

        expect(html).toContain("script-src 'none'")
    })

    test('turns wiki links into plain labels', () => {
        const html = getNoteAsHtml(
            { title: 'T', note: '[[Alpha|first]] and [[Beta#Intro]]' },
            { notes }
        )

        expect(html).toContain('first and Beta &gt; Intro')
        expect(html).not.toContain('[[')
    })

    test('inlines embedded notes', () => {
        const html = getNoteAsHtml({ title: 'T', note: '![[Alpha]]' }, { notes })

        expect(html).toContain('alpha body')
    })

    test('inlines embedded images using the provided urls', () => {
        const html = getNoteAsHtml(
            { title: 'T', note: '![[a.png]]' },
            { notes, getImageUrl: () => 'data:image/png;base64,AAA' }
        )

        expect(html).toContain('![a.png](data:image/png;base64,AAA)')
    })

    test('replaces local image urls with the resolved ones', () => {
        const html = getNoteAsHtml(
            { title: 'T', note: '![pic](content://vault/pic.png)' },
            {
                notes,
                imageUrls: new Map([['content://vault/pic.png', 'data:image/png;base64,BBB']])
            }
        )

        expect(html).toContain('![pic](data:image/png;base64,BBB)')
    })
})

describe('export markdown', () => {
    test('inlines embeds and unwraps wiki links', () => {
        const markdown = getExportMarkdown({ title: 'T', note: '![[Alpha]] [[Beta]]' }, { notes })

        expect(markdown).toContain('alpha body')
        expect(markdown).toContain('Beta')
        expect(markdown).not.toContain('[[')
    })
})
