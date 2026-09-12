import {
    filterNotes,
    parseSearchQuery,
    toggleTagQualifier,
    togglePinnedQualifier,
    toggleImageQualifier
} from '../search-query'
import { MOCK_SEARCH_NOTES, MOCK_SEARCH_TAGS } from '../__fixtures__/search-query'

describe('parse search query', () => {
    test('extracts plain text', () => {
        expect(parseSearchQuery('Groceries')).toEqual({
            text: 'groceries', tags: [], pinned: false, hasImage: false, modified: null, created: null
        })
    })

    test('extracts a bare tag qualifier', () => {
        expect(parseSearchQuery('tag:work meeting')).toEqual({
            text: 'meeting', tags: ['work'], pinned: false, hasImage: false, modified: null, created: null
        })
    })

    test('extracts a quoted tag qualifier with spaces', () => {
        const result = parseSearchQuery('tag:"personal notes" ideas')

        expect(result).toEqual({
            text: 'ideas', tags: ['personal notes'], pinned: false, hasImage: false, modified: null, created: null
        })
    })

    test('extracts more than one tag qualifier', () => {
        const result = parseSearchQuery('tag:work tag:personal standup')

        expect(result).toEqual({
            text: 'standup', tags: ['work', 'personal'], pinned: false, hasImage: false, modified: null, created: null
        })
    })

    test('extracts the pinned qualifier', () => {
        expect(parseSearchQuery('is:pinned todo')).toEqual({
            text: 'todo', tags: [], pinned: true, hasImage: false, modified: null, created: null
        })
    })

    test('combines pinned and tag qualifiers with text', () => {
        const result = parseSearchQuery('is:pinned tag:work standup')

        expect(result).toEqual({
            text: 'standup', tags: ['work'], pinned: true, hasImage: false, modified: null, created: null
        })
    })

    test('extracts the has:image qualifier', () => {
        const result = parseSearchQuery('has:image recipe')

        expect(result).toEqual({
            text: 'recipe', tags: [], pinned: false, hasImage: true, modified: null, created: null
        })
    })

    test('extracts the modified: date qualifier', () => {
        const result = parseSearchQuery('modified:2026-01-15 report')

        expect(result).toEqual({
            text: 'report', tags: [], pinned: false, hasImage: false, modified: '2026-01-15', created: null
        })
    })

    test('extracts the created: date qualifier', () => {
        const result = parseSearchQuery('created:2026-01-01')

        expect(result).toEqual({
            text: '', tags: [], pinned: false, hasImage: false, modified: null, created: '2026-01-01'
        })
    })
})

describe('toggle tag qualifier', () => {
    test('adds a tag qualifier to an empty query', () => {
        expect(toggleTagQualifier('', 'work')).toBe('tag:work')
    })

    test('quotes a tag name containing spaces', () => {
        expect(toggleTagQualifier('', 'personal notes')).toBe('tag:"personal notes"')
    })

    test('removes the qualifier when the same tag is toggled again', () => {
        expect(toggleTagQualifier('meeting tag:work', 'work')).toBe('meeting')
    })

    test('adds a second tag qualifier alongside an existing one', () => {
        expect(toggleTagQualifier('meeting tag:work', 'personal')).toBe('meeting tag:work tag:personal')
    })

    test('removes only the toggled tag, keeping other selected tags', () => {
        expect(toggleTagQualifier('meeting tag:work tag:personal', 'work')).toBe('meeting tag:personal')
    })
})

describe('toggle pinned qualifier', () => {
    test('adds the pinned qualifier to an empty query', () => {
        expect(togglePinnedQualifier('')).toBe('is:pinned')
    })

    test('appends the pinned qualifier to existing text', () => {
        expect(togglePinnedQualifier('todo')).toBe('todo is:pinned')
    })

    test('removes the pinned qualifier when already present', () => {
        expect(togglePinnedQualifier('todo is:pinned')).toBe('todo')
    })
})

describe('toggle image qualifier', () => {
    test('adds the has:image qualifier to an empty query', () => {
        expect(toggleImageQualifier('')).toBe('has:image')
    })

    test('appends the has:image qualifier to existing text', () => {
        expect(toggleImageQualifier('recipe')).toBe('recipe has:image')
    })

    test('removes the has:image qualifier when already present', () => {
        expect(toggleImageQualifier('recipe has:image')).toBe('recipe')
    })
})

describe('filter notes', () => {
    test('filters by title text', () => {
        const options = { tags: MOCK_SEARCH_TAGS, pinned: new Set() }
        const result = filterNotes(MOCK_SEARCH_NOTES, 'grocery', options)
        expect(result.map((note) => note.id)).toEqual(['note-2'])
    })

    test('filters by tag qualifier', () => {
        const options = { tags: MOCK_SEARCH_TAGS, pinned: new Set() }
        const result = filterNotes(MOCK_SEARCH_NOTES, 'tag:work', options)
        expect(result.map((note) => note.id)).toEqual(['note-1'])
    })

    test('filters by more than one tag qualifier, matching any of them', () => {
        const options = { tags: MOCK_SEARCH_TAGS, pinned: new Set() }
        const result = filterNotes(MOCK_SEARCH_NOTES, 'tag:work tag:personal', options)
        expect(result.map((note) => note.id).sort()).toEqual(['note-1', 'note-2'])
    })

    test('filters by pinned qualifier', () => {
        const result = filterNotes(MOCK_SEARCH_NOTES, 'is:pinned', {
            tags: MOCK_SEARCH_TAGS,
            pinned: new Set(['note-3'])
        })
        expect(result.map((note) => note.id)).toEqual(['note-3'])
    })

    test('combines pinned, tag and text qualifiers', () => {
        const result = filterNotes(MOCK_SEARCH_NOTES, 'is:pinned tag:work standup', {
            tags: MOCK_SEARCH_TAGS,
            pinned: new Set(['note-1'])
        })
        expect(result.map((note) => note.id)).toEqual(['note-1'])
    })

    test('returns every note for an empty query', () => {
        const result = filterNotes(MOCK_SEARCH_NOTES, '', { tags: MOCK_SEARCH_TAGS, pinned: new Set() })
        expect(result).toHaveLength(3)
    })

    test('filters by has:image qualifier', () => {
        const options = { tags: MOCK_SEARCH_TAGS, pinned: new Set() }
        const result = filterNotes(MOCK_SEARCH_NOTES, 'has:image', options)
        expect(result.map((note) => note.id)).toEqual(['note-2'])
    })

    test('filters by modified: date qualifier', () => {
        const options = { tags: MOCK_SEARCH_TAGS, pinned: new Set() }
        const result = filterNotes(MOCK_SEARCH_NOTES, 'modified:2026-01-05', options)
        expect(result.map((note) => note.id)).toEqual(['note-1'])
    })

    test('filters by created: date qualifier', () => {
        const options = { tags: MOCK_SEARCH_TAGS, pinned: new Set() }
        const result = filterNotes(MOCK_SEARCH_NOTES, 'created:2026-01-02', options)
        expect(result.map((note) => note.id)).toEqual(['note-2'])
    })
})
