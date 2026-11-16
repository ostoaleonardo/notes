import { getRecentIds } from '../recent-ids'

describe('recent ids', () => {
    const notes = [{ path: 'a' }, { path: 'b' }, { path: 'c' }]
    const templates = [{ filename: 'daily.md' }]

    test('lists pinned ids before recent ones', () => {
        const result = getRecentIds(new Set(['b']), ['a', 'c'], notes, templates)

        expect(result).toEqual(['b', 'a', 'c'])
    })

    test('does not repeat a pinned id that is also recent', () => {
        const result = getRecentIds(new Set(['a']), ['a', 'b'], notes, templates)

        expect(result).toEqual(['a', 'b'])
    })

    test('drops ids of notes that no longer exist', () => {
        const result = getRecentIds(new Set(), ['gone', 'a'], notes, templates)

        expect(result).toEqual(['a'])
    })

    test('keeps template ids that still exist', () => {
        const result = getRecentIds(new Set(), ['template:daily.md'], notes, templates)

        expect(result).toEqual(['template:daily.md'])
    })

    test('drops template ids that no longer exist', () => {
        const result = getRecentIds(new Set(), ['template:old.md'], notes, templates)

        expect(result).toEqual([])
    })
})
