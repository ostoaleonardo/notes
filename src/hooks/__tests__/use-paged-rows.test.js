import { act, renderHook } from '@testing-library/react-native'

import { usePagedRows } from '../use-paged-rows'

const makeRows = (count) => Array.from({ length: count }, (_, index) => index)

describe('first page', () => {
    test('returns only the first page of rows', async () => {
        const rows = makeRows(10)
        const { result } = await renderHook(() => usePagedRows(rows, 4))

        expect(result.current.data).toEqual([0, 1, 2, 3])
        expect(result.current.total).toBe(10)
    })
})

describe('end reached', () => {
    test('adds one more page each time', async () => {
        const rows = makeRows(10)
        const { result } = await renderHook(() => usePagedRows(rows, 4))

        await act(() => {
            result.current.onEndReached()
        })

        expect(result.current.data).toHaveLength(8)

        await act(() => {
            result.current.onEndReached()
        })

        expect(result.current.data).toHaveLength(10)
    })

    test('stops growing once every row is shown', async () => {
        const rows = makeRows(3)
        const { result } = await renderHook(() => usePagedRows(rows, 4))

        await act(() => {
            result.current.onEndReached()
        })

        expect(result.current.data).toHaveLength(3)
    })
})

describe('new rows', () => {
    test('goes back to the first page', async () => {
        const first = makeRows(10)
        const second = makeRows(12)
        const { result, rerender } = await renderHook(
            ({ rows }) => usePagedRows(rows, 4),
            { initialProps: { rows: first } }
        )

        await act(() => {
            result.current.onEndReached()
        })

        await rerender({ rows: second })

        expect(result.current.data).toHaveLength(4)
    })
})
