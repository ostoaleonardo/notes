import { appendSharedContent, buildSharedContent } from '../shared-note'

describe('build shared content', () => {
    test('returns plain text trimmed', () => {
        expect(buildSharedContent({ text: '  hello  ', webUrl: null })).toBe('hello')
    })

    test('turns a lone url into a markdown link', () => {
        const shareIntent = { text: 'https://a.com', webUrl: 'https://a.com' }

        expect(buildSharedContent(shareIntent)).toBe('[https://a.com](https://a.com)')
    })

    test('uses the shared title as the link label', () => {
        const shareIntent = {
            text: 'https://a.com',
            webUrl: 'https://a.com',
            meta: { title: 'Site' }
        }

        expect(buildSharedContent(shareIntent)).toBe('[Site](https://a.com)')
    })

    test('keeps text that only contains a url', () => {
        const shareIntent = { text: 'see https://a.com', webUrl: 'https://a.com' }

        expect(buildSharedContent(shareIntent)).toBe('see https://a.com')
    })

    test('returns empty when nothing was shared', () => {
        expect(buildSharedContent(null)).toBe('')
    })
})

describe('append shared content', () => {
    test('separates the addition with a blank line', () => {
        expect(appendSharedContent('first\n', 'second')).toBe('first\n\nsecond')
    })

    test('returns only the addition for an empty note', () => {
        expect(appendSharedContent('', 'second')).toBe('second')
    })
})
