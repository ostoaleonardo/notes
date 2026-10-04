import {
    areNoteEntriesEqual,
    buildNoteEntries,
    getBlockSuggestions
} from '../note-entries'

const entry = (overrides = {}) => ({
    id: 'a',
    title: 'Alpha',
    aliases: ['x'],
    path: 'folder',
    blocks: [],
    unlabeled: [],
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

    test('detects changed unlabeled blocks', () => {
        const withUnlabeled = entry({ unlabeled: [{ preview: 'Plain' }] })

        expect(areNoteEntriesEqual([entry()], [withUnlabeled])).toBe(false)
        expect(areNoteEntriesEqual([withUnlabeled], [entry({ unlabeled: [{ preview: 'Other' }] })])).toBe(false)
        expect(areNoteEntriesEqual([withUnlabeled], [entry({ unlabeled: [{ preview: 'Plain' }] })])).toBe(true)
    })

    test('detects changed blocks', () => {
        const withBlock = entry({ blocks: [{ id: 'one', preview: 'First' }] })

        expect(areNoteEntriesEqual([entry()], [withBlock])).toBe(false)
        expect(areNoteEntriesEqual([withBlock], [entry({ blocks: [{ id: 'one', preview: 'Other' }] })])).toBe(false)
    })
})

describe('build note entries', () => {
    test('skips untitled notes and resolves folder paths', () => {
        const notes = [
            { path: 'r::A.md', title: 'A' },
            { path: 'r::B.md', title: '' }
        ]

        expect(buildNoteEntries(notes, new Map([['r::A.md', 'work']]))).toEqual([
            { id: 'r::A.md', title: 'A', aliases: [], path: 'work', blocks: [], unlabeled: [] }
        ])
    })

    test('falls back to an empty path when the note has no known folder', () => {
        const entries = buildNoteEntries([{ path: 'r::A.md', title: 'A' }], new Map())

        expect(entries[0].path).toBe('')
    })

    test('lists the block ids of a note with a preview of each block', () => {
        const notes = [{ path: 'r::A.md', title: 'A', note: 'Key idea ^idea\n\n- one\n- two ^second' }]

        expect(buildNoteEntries(notes, new Map())[0].blocks).toEqual([
            { id: 'idea', preview: 'Key idea' },
            { id: 'second', preview: '- two' }
        ])
    })

    test('refreshes the blocks when the note body changes', () => {
        const notes = [{ path: 'r::C.md', title: 'C', note: 'Old ^old' }]
        buildNoteEntries(notes, new Map())

        const updated = [{ path: 'r::C.md', title: 'C', note: 'New ^new' }]

        expect(buildNoteEntries(updated, new Map())[0].blocks).toEqual([{ id: 'new', preview: 'New' }])
    })

    test('lists the blocks that have no id yet', () => {
        const notes = [{ path: 'r::E.md', title: 'E', note: 'Labeled ^one\n\nPlain paragraph\n\n- item' }]

        expect(buildNoteEntries(notes, new Map())[0].unlabeled).toEqual([
            { preview: 'Plain paragraph' },
            { preview: '- item' }
        ])
    })

    test('truncates long previews', () => {
        const notes = [{ path: 'r::D.md', title: 'D', note: `${'word '.repeat(30)}^long` }]

        expect(buildNoteEntries(notes, new Map())[0].blocks[0].preview).toHaveLength(60)
    })
})

describe('block suggestions', () => {
    const entries = [
        entry({
            id: 'r::A.md',
            title: 'Alpha',
            aliases: ['Al'],
            blocks: [
                { id: 'idea-1', preview: 'Key idea' },
                { id: 'todo', preview: 'Buy milk' }
            ],
            unlabeled: [{ preview: 'Plain paragraph' }, { preview: 'Second paragraph' }]
        }),
        entry({ id: 'r::B.md', title: 'Beta', blocks: [{ id: 'other', preview: 'Elsewhere' }] })
    ]

    test('returns the labeled blocks first, then the ones without an id, for an empty query', () => {
        expect(getBlockSuggestions(entries, 'Alpha', '')).toEqual([
            { id: 'idea-1', preview: 'Key idea' },
            { id: 'todo', preview: 'Buy milk' },
            { preview: 'Plain paragraph', index: 0, path: 'r::A.md' },
            { preview: 'Second paragraph', index: 1, path: 'r::A.md' }
        ])
    })

    test('keeps the original position of an unlabeled block after filtering', () => {
        expect(getBlockSuggestions(entries, 'Alpha', 'second')).toEqual([
            { preview: 'Second paragraph', index: 1, path: 'r::A.md' }
        ])
    })

    test('resolves the target through aliases', () => {
        expect(getBlockSuggestions(entries, 'Al', '').map(({ id }) => id).filter(Boolean)).toEqual(['idea-1', 'todo'])
    })

    test('filters by id or preview text, ignoring case', () => {
        expect(getBlockSuggestions(entries, 'Alpha', 'IDEA').map(({ id }) => id)).toEqual(['idea-1'])
        expect(getBlockSuggestions(entries, 'Alpha', 'milk').map(({ id }) => id)).toEqual(['todo'])
    })

    test('returns nothing for an unknown or empty target', () => {
        expect(getBlockSuggestions(entries, 'Missing', '')).toEqual([])
        expect(getBlockSuggestions(entries, '', '')).toEqual([])
    })
})
