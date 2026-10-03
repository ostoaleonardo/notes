import { areNoteEntriesEqual, buildNoteEntries } from '../note-entries'

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

describe('build note entries', () => {
    test('skips untitled notes and resolves folder paths', () => {
        const notes = [
            { path: 'r::A.md', title: 'A' },
            { path: 'r::B.md', title: '' }
        ]

        expect(buildNoteEntries(notes, new Map([['r::A.md', 'work']]))).toEqual([
            { id: 'r::A.md', title: 'A', aliases: [], path: 'work' }
        ])
    })

    test('falls back to an empty path when the note has no known folder', () => {
        const entries = buildNoteEntries([{ path: 'r::A.md', title: 'A' }], new Map())

        expect(entries[0].path).toBe('')
    })
})
