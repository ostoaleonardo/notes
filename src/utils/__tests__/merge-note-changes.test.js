import { mergeNoteChanges } from '../merge-note-changes'

const base = {
    note: 'first line\nsecond line\nthird line',
    tags: ['a'],
    properties: { x: 1 },
    rawFrontmatter: null,
    invalidFrontmatter: null
}

describe('merge note changes', () => {
    test('takes the external body when the draft did not change it', () => {
        const theirs = { ...base, note: 'first line\nsecond line\nthird line changed' }

        const { merged, lostExternalText } = mergeNoteChanges({ base, mine: base, theirs })

        expect(merged.note).toBe(theirs.note)
        expect(lostExternalText).toBe(false)
    })

    test('keeps the draft body when the disk did not change it', () => {
        const mine = { ...base, note: 'first line\nsecond line edited\nthird line' }

        const { merged } = mergeNoteChanges({ base, mine, theirs: base })

        expect(merged.note).toBe(mine.note)
    })

    test('combines edits made in different parts of the body', () => {
        const mine = { ...base, note: 'first line edited\nsecond line\nthird line' }
        const theirs = { ...base, note: 'first line\nsecond line\nthird line edited' }

        const { merged, lostExternalText } = mergeNoteChanges({ base, mine, theirs })

        expect(merged.note).toBe('first line edited\nsecond line\nthird line edited')
        expect(lostExternalText).toBe(false)
    })

    test('keeps the draft and flags the loss when the same text was rewritten', () => {
        const longBase = {
            ...base,
            note: 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda'
        }
        const mine = { ...longBase, note: 'the quick brown fox jumps over the lazy dog and runs far away' }
        const theirs = { ...longBase, note: 'alpha beta GAMMA delta epsilon zeta eta theta iota kappa lambda' }

        const { merged, lostExternalText } = mergeNoteChanges({ base: longBase, mine, theirs })

        expect(merged.note).toBe(mine.note)
        expect(lostExternalText).toBe(true)
    })

    test('merges tags and properties field by field', () => {
        const mine = { ...base, tags: ['a', 'b'] }
        const theirs = { ...base, properties: { x: 2 } }

        const { merged } = mergeNoteChanges({ base, mine, theirs })

        expect(merged.tags).toEqual(['a', 'b'])
        expect(merged.properties).toEqual({ x: 2 })
    })

    test('prefers the draft when both sides changed the same field', () => {
        const mine = { ...base, tags: ['mine'] }
        const theirs = { ...base, tags: ['theirs'] }

        const { merged } = mergeNoteChanges({ base, mine, theirs })

        expect(merged.tags).toEqual(['mine'])
    })

    test('treats a whitespace-only difference as an unchanged draft', () => {
        const mine = { ...base, note: `${base.note}\n` }
        const theirs = { ...base, note: 'first line\nsecond line\nthird line changed' }

        const { merged } = mergeNoteChanges({ base, mine, theirs })

        expect(merged.note).toBe(theirs.note)
    })
})
