import { extractWikiLinkTexts, getNoteLinkTexts, seedNoteLinkTexts } from '../note-links'

describe('extract wiki link texts', () => {
    test('returns the text of every link in order', () => {
        expect(extractWikiLinkTexts('a [[One]] b [[Two|alias]] c [[Three#head]]')).toEqual([
            'One',
            'Two',
            'Three#head'
        ])
    })

    test('ignores links inside code', () => {
        expect(extractWikiLinkTexts('[[Real]]\n```\n[[Fenced]]\n```\n`[[Inline]]`')).toEqual(['Real'])
    })

    test('returns nothing for empty content', () => {
        expect(extractWikiLinkTexts(undefined)).toEqual([])
    })
})

describe('note link texts', () => {
    test('reuses the texts extracted before for the same note object', () => {
        const note = { note: '[[One]]' }

        expect(getNoteLinkTexts(note)).toBe(getNoteLinkTexts(note))
    })

    test('recomputes for a new object even with the same body', () => {
        const note = { note: '[[One]]' }
        seedNoteLinkTexts(note, ['Seeded'])

        expect(getNoteLinkTexts({ ...note })).toEqual(['One'])
    })

    test('uses the seeded texts without scanning the body', () => {
        const note = { note: '[[One]]' }
        seedNoteLinkTexts(note, ['Seeded'])

        expect(getNoteLinkTexts(note)).toEqual(['Seeded'])
    })
})
