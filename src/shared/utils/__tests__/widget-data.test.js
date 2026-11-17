import { buildExtract, buildPinnedNote, findPinnedNote } from '../widget-data'

const notes = [
    { path: 'a.md', title: 'Old', updatedAt: 1, note: 'plain' },
    { path: 'b.md', title: 'New', updatedAt: 3, note: '# Heading\nbody with **bold** text' },
    { path: 'c folder/c.md', title: 'Other', updatedAt: 2, note: 'other' }
]

describe('extract', () => {
    test('drops headings and markup', () => {
        expect(buildExtract('# Heading\nbody with **bold** and ==mark==')).toBe(
            'body with bold and mark'
        )
    })

    test('drops wiki link brackets', () => {
        expect(buildExtract('Mutual link with [[Linked B]].')).toBe('Mutual link with Linked B.')
    })

    test('respects the limit', () => {
        expect(buildExtract('abcdefghij', 4)).toBe('abcd')
    })

    test('returns an empty string without text', () => {
        expect(buildExtract(undefined)).toBe('')
    })
})

describe('pinned note', () => {
    test('picks the latest pinned note', () => {
        const pinned = new Set(['a.md', 'b.md'])

        expect(buildPinnedNote(notes, pinned)).toEqual({
            title: 'New',
            extract: 'body with bold text',
            link: 'notes://notes/b.md'
        })
    })

    test('encodes the note path in the link', () => {
        expect(buildPinnedNote(notes, new Set(['c folder/c.md'])).link).toBe(
            'notes://notes/c%20folder%2Fc.md'
        )
    })

    test('returns null when nothing is pinned', () => {
        expect(buildPinnedNote(notes, new Set())).toBeNull()
    })
})

describe('build the pinned note from loaded bodies', () => {
    test('reads the extract from the loaded body of a note without one', () => {
        const note = { path: 'a', title: 'A', updatedAt: 1 }
        const bodies = new Map([['a', 'Loaded text']])

        expect(buildPinnedNote([note], new Set(['a']), undefined, bodies).extract).toBe('Loaded text')
    })

    test('finds the most recently updated pinned note', () => {
        const older = { path: 'a', updatedAt: 1 }
        const newer = { path: 'b', updatedAt: 2 }

        expect(findPinnedNote([older, newer], new Set(['a', 'b']))).toBe(newer)
    })
})
