import { getGridFillers, toGridRows } from '../grid-rows'

describe('grid rows', () => {
    test('splits the items into rows of the given size', () => {
        expect(toGridRows([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    })

    test('returns no rows without items', () => {
        expect(toGridRows([], 2)).toEqual([])
    })

    test('lists the empty cells of an incomplete row', () => {
        expect(getGridFillers([5], 3)).toHaveLength(2)
        expect(getGridFillers([1, 2], 2)).toHaveLength(0)
    })
})
