import {
    areNoteEntriesEqual,
    buildNoteEntries,
    filterBlockSuggestions,
    getNoteBlocks,
    resolveBlockTarget,
    resolveLinkTargets,
    searchNoteEntries
} from '../note-entries'

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

    test('lists the block ids of a note with a preview of each block', () => {
        const notes = [
            { path: 'r::A.md', title: 'A', note: 'Key idea ^idea\n\n- one\n- two ^second' }
        ]

        expect(getNoteBlocks(notes[0]).labeled).toEqual([
            { id: 'idea', preview: 'Key idea' },
            { id: 'second', preview: '- two' }
        ])
    })

    test('refreshes the blocks when the note body changes', () => {
        getNoteBlocks({ path: 'r::C.md', title: 'C', note: 'Old ^old' })

        const updated = { path: 'r::C.md', title: 'C', note: 'New ^new' }

        expect(getNoteBlocks(updated).labeled).toEqual([{ id: 'new', preview: 'New' }])
    })

    test('lists the blocks that have no id yet', () => {
        const notes = [
            { path: 'r::E.md', title: 'E', note: 'Labeled ^one\n\nPlain paragraph\n\n- item' }
        ]

        expect(getNoteBlocks(notes[0]).unlabeled).toEqual([
            { preview: 'Plain paragraph' },
            { preview: '- item' }
        ])
    })

    test('truncates long previews', () => {
        const note = { path: 'r::D.md', title: 'D', note: `${'word '.repeat(30)}^long` }

        expect(getNoteBlocks(note).labeled[0].preview).toHaveLength(60)
    })
})

describe('block target resolution', () => {
    const entries = [
        entry({ id: 'r::A.md', title: 'Alpha', aliases: ['Al'] }),
        entry({ id: 'r::B.md', title: 'Beta' })
    ]

    test('resolves the target by title', () => {
        expect(resolveBlockTarget(entries, 'Alpha')).toBe('r::A.md')
    })

    test('resolves the target through aliases', () => {
        expect(resolveBlockTarget(entries, 'Al')).toBe('r::A.md')
    })

    test('returns nothing for an unknown or empty target', () => {
        expect(resolveBlockTarget(entries, 'Missing')).toBeNull()
        expect(resolveBlockTarget(entries, '')).toBeNull()
    })
})

describe('block suggestions', () => {
    const blocks = {
        labeled: [
            { id: 'idea-1', preview: 'Key idea' },
            { id: 'todo', preview: 'Buy milk' }
        ],
        unlabeled: [{ preview: 'Plain paragraph' }, { preview: 'Second paragraph' }]
    }

    test('returns labeled blocks first, then the ones without an id, for an empty query', () => {
        expect(filterBlockSuggestions('r::A.md', blocks, '')).toEqual([
            { id: 'idea-1', preview: 'Key idea' },
            { id: 'todo', preview: 'Buy milk' },
            { preview: 'Plain paragraph', index: 0, path: 'r::A.md' },
            { preview: 'Second paragraph', index: 1, path: 'r::A.md' }
        ])
    })

    test('keeps the original position of an unlabeled block after filtering', () => {
        expect(filterBlockSuggestions('r::A.md', blocks, 'second')).toEqual([
            { preview: 'Second paragraph', index: 1, path: 'r::A.md' }
        ])
    })

    test('filters by id or preview text, ignoring case', () => {
        expect(filterBlockSuggestions('r::A.md', blocks, 'IDEA').map(({ id }) => id)).toEqual(
            ['idea-1']
        )
        expect(filterBlockSuggestions('r::A.md', blocks, 'milk').map(({ id }) => id)).toEqual(
            ['todo']
        )
    })
})

describe('link target resolution', () => {
    test('marks each target as resolved or missing', () => {
        const entries = [entry({ id: 'r::Alpha.md', title: 'Alpha', aliases: [] })]

        expect(resolveLinkTargets(entries, ['Alpha', 'Nope'])).toEqual({ Alpha: true, Nope: false })
    })
})

describe('note search', () => {
    const entries = [
        entry({ id: '1', title: 'Project plan', path: 'work' }),
        entry({ id: '2', title: 'Plan B', path: 'work' }),
        entry({ id: '3', title: 'Plan B', path: 'home' }),
        entry({ id: '4', title: 'Unrelated', path: '' })
    ]

    test('puts titles that start with the query first', () => {
        const titles = searchNoteEntries(entries, 'plan').map(({ title }) => title)

        expect(titles).toEqual(['Plan B', 'Plan B', 'Project plan'])
    })

    test('flags titles shared by several notes as ambiguous', () => {
        const [first] = searchNoteEntries(entries, 'plan b')

        expect(first.ambiguous).toBe(true)
    })

    test('skips the same title in the same folder', () => {
        const duplicated = [...entries, entry({ id: '5', title: 'Plan B', path: 'work' })]

        expect(searchNoteEntries(duplicated, 'plan b')).toHaveLength(2)
    })

    test('returns nothing when no title matches', () => {
        expect(searchNoteEntries(entries, 'zzz')).toEqual([])
    })
})
