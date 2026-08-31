import { filterNotes, parseSearchQuery, toggleTagQualifier, togglePinnedQualifier } from '../search-query'
import { MOCK_SEARCH_NOTES, MOCK_SEARCH_TAGS } from '../__fixtures__/search-query'

describe('parse search query', () => {
    test('extracts plain text', () => {
        expect(parseSearchQuery('Groceries')).toEqual({
            text: 'groceries', tag: null, pinned: false
        })
    })

    test('extracts a bare tag qualifier', () => {
        expect(parseSearchQuery('tag:work meeting')).toEqual({
            text: 'meeting', tag: 'work', pinned: false
        })
    })

    test('extracts a quoted tag qualifier with spaces', () => {
        const result = parseSearchQuery('tag:"personal notes" ideas')

        expect(result).toEqual({
            text: 'ideas', tag: 'personal notes', pinned: false
        })
    })

    test('extracts the pinned qualifier', () => {
        expect(parseSearchQuery('is:pinned todo')).toEqual({
            text: 'todo', tag: null, pinned: true
        })
    })

    test('combines pinned and tag qualifiers with text', () => {
        const result = parseSearchQuery('is:pinned tag:work standup')

        expect(result).toEqual({
            text: 'standup', tag: 'work', pinned: true
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

    test('replaces an existing tag qualifier with a different tag', () => {
        expect(toggleTagQualifier('meeting tag:work', 'personal')).toBe('meeting tag:personal')
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
})
