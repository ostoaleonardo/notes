import { toggleSavedSearch, removeSavedSearch } from '../saved-searches'

describe('toggle saved search', () => {
    test('saves the trimmed query when not already saved', () => {
        const result = toggleSavedSearch([], '  tag:work is:pinned  ', 'search-1')
        expect(result).toEqual([{ id: 'search-1', query: 'tag:work is:pinned' }])
    })

    test('removes the entry when the same query is toggled again', () => {
        const saved = [{ id: 'search-1', query: 'tag:work' }]
        const result = toggleSavedSearch(saved, 'tag:work', 'search-2')
        expect(result).toEqual([])
    })

    test('keeps other saved searches untouched', () => {
        const saved = [{ id: 'search-1', query: 'tag:work' }]
        const result = toggleSavedSearch(saved, 'is:pinned', 'search-2')
        expect(result).toEqual([
            { id: 'search-2', query: 'is:pinned' },
            { id: 'search-1', query: 'tag:work' }
        ])
    })
})

describe('remove saved search', () => {
    test('removes the entry with the matching id', () => {
        const saved = [
            { id: 'search-1', query: 'tag:work' },
            { id: 'search-2', query: 'is:pinned' }
        ]

        expect(removeSavedSearch(saved, 'search-1')).toEqual([
            { id: 'search-2', query: 'is:pinned' }
        ])
    })

    test('is a no-op when the id is not found', () => {
        const saved = [{ id: 'search-1', query: 'tag:work' }]
        expect(removeSavedSearch(saved, 'missing')).toEqual(saved)
    })
})
