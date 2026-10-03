import { resolveLinkPress } from '../link-press'

describe('resolve link press', () => {
    test('returns null for an empty url', () => {
        expect(resolveLinkPress('')).toBeNull()
        expect(resolveLinkPress(undefined)).toBeNull()
    })

    test('resolves a tag link to the decoded tag name', () => {
        expect(resolveLinkPress('tag://work%2Fideas')).toEqual({ type: 'tag', tag: 'work/ideas' })
    })

    test('resolves a wiki link to the decoded note id', () => {
        expect(resolveLinkPress('wikilink://repo-1%3A%3AMy%20note.md')).toEqual({
            type: 'note',
            id: 'repo-1::My note.md'
        })
    })

    test('resolves a missing wiki link to its path and title', () => {
        expect(resolveLinkPress('wikilink://missing/work/New%20note')).toEqual({
            type: 'missing-note',
            missing: { path: 'work', title: 'New note' }
        })
    })

    test('treats any other url as external', () => {
        expect(resolveLinkPress('https://expo.dev')).toEqual({ type: 'external', url: 'https://expo.dev' })
    })
})
