import { sortInChunks } from '../sort-in-chunks'

const noYield = async () => {}
const byValue = (a, b) => a.value - b.value

const buildItems = (values) => values.map((value, index) => ({ value, index }))

describe('chunked sort', () => {
    test('sorts like a single pass sort', async () => {
        const values = Array.from({ length: 101 }, (_, index) => (index * 37) % 53)
        const items = buildItems(values)

        const sorted = await sortInChunks(items, byValue, { chunkSize: 8, yieldFn: noYield })

        expect(sorted).toEqual(items.slice().sort(byValue))
    })

    test('keeps equal items in their original order', async () => {
        const items = buildItems([2, 1, 2, 1, 2, 1, 2, 1, 2])

        const sorted = await sortInChunks(items, byValue, { chunkSize: 2, yieldFn: noYield })

        expect(sorted.map((item) => item.index)).toEqual([1, 3, 5, 7, 0, 2, 4, 6, 8])
    })

    test('does not change the original items', async () => {
        const items = buildItems([3, 1, 2])

        await sortInChunks(items, byValue, { chunkSize: 1, yieldFn: noYield })

        expect(items.map((item) => item.value)).toEqual([3, 1, 2])
    })

    test('returns an empty list for no items', async () => {
        expect(await sortInChunks([], byValue, { yieldFn: noYield })).toEqual([])
    })

    test('handles a single item', async () => {
        const items = buildItems([5])

        expect(await sortInChunks(items, byValue, { yieldFn: noYield })).toEqual(items)
    })

    test('yields to the interface while it works', async () => {
        const yieldFn = jest.fn(noYield)

        await sortInChunks(buildItems([4, 3, 2, 1]), byValue, { chunkSize: 1, yieldFn })

        expect(yieldFn.mock.calls.length).toBeGreaterThan(4)
    })
})
