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

    test('resolves a link mention to the decoded note path', () => {
        expect(resolveLinkPress('linkmention://repo-1%3A%3AMy%20note.md')).toEqual({
            type: 'link-mention',
            path: 'repo-1::My note.md'
        })
    })

    test('resolves a file link to the decoded target', () => {
        expect(resolveLinkPress('filelink://docs%2Fsample%20doc.pdf')).toEqual({
            type: 'file',
            target: 'docs/sample doc.pdf'
        })
    })

    test('resolves a wiki link with a block anchor', () => {
        expect(resolveLinkPress('wikilink://note%2F1#%5Eabc')).toEqual({
            type: 'note',
            id: 'note/1',
            anchor: '^abc'
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
