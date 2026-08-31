import { getSortedNotes } from '../sorted-notes'
import { MOCK_APPLE_NOTE, MOCK_BANANA_NOTE } from '../__fixtures__/sorted-notes'

describe('get sorted notes', () => {
    test('sorts by creation date ascending', () => {
        const result = getSortedNotes(MOCK_BANANA_NOTE, MOCK_APPLE_NOTE, { field: 'created', order: 'asc' })
        expect(result).toBeLessThan(0)
    })

    test('sorts by creation date descending', () => {
        const result = getSortedNotes(MOCK_BANANA_NOTE, MOCK_APPLE_NOTE, { field: 'created', order: 'desc' })
        expect(result).toBeGreaterThan(0)
    })

    test('sorts by update date ascending', () => {
        const result = getSortedNotes(MOCK_BANANA_NOTE, MOCK_APPLE_NOTE, { field: 'updated', order: 'asc' })
        expect(result).toBeGreaterThan(0)
    })

    test('sorts by title alphabetically ascending', () => {
        const result = getSortedNotes(MOCK_BANANA_NOTE, MOCK_APPLE_NOTE, { field: 'title', order: 'asc' })
        expect(result).toBeGreaterThan(0)
    })

    test('sorts by title alphabetically descending', () => {
        const result = getSortedNotes(MOCK_BANANA_NOTE, MOCK_APPLE_NOTE, { field: 'title', order: 'desc' })
        expect(result).toBeLessThan(0)
    })
})
