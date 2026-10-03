import { areNoteEntriesEqual } from '../note-entries'

const entry = (overrides = {}) => ({
    id: 'a',
    title: 'Alpha',
    aliases: ['x'],
    path: 'folder',
    ...overrides
})

describe('note entries equality', () => {
    test('treats structurally identical lists as equal', () => {
        expect(areNoteEntriesEqual([entry()], [entry()])).toBe(true)
    })

    test('detects a different length', () => {
        expect(areNoteEntriesEqual([entry()], [])).toBe(false)
    })

    test('detects a changed title', () => {
        expect(areNoteEntriesEqual([entry()], [entry({ title: 'Beta' })])).toBe(false)
    })

    test('detects changed aliases', () => {
        expect(areNoteEntriesEqual([entry()], [entry({ aliases: ['y'] })])).toBe(false)
        expect(areNoteEntriesEqual([entry()], [entry({ aliases: [] })])).toBe(false)
    })
})
