import { renderHook } from '@testing-library/react-native'

import { useStableMap } from '../use-stable-map'

describe('stable map', () => {
    test('keeps the previous map when the entries are the same', async () => {
        const { result, rerender } = await renderHook(
            ({ map }) => useStableMap(map),
            { initialProps: { map: new Map([['a', 'x'], ['b', 'y']]) } }
        )
        const first = result.current

        await rerender({ map: new Map([['a', 'x'], ['b', 'y']]) })

        expect(result.current).toBe(first)
    })

    test('returns the new map when a value changes', async () => {
        const { result, rerender } = await renderHook(
            ({ map }) => useStableMap(map),
            { initialProps: { map: new Map([['a', 'x']]) } }
        )
        const next = new Map([['a', 'z']])

        await rerender({ map: next })

        expect(result.current).toBe(next)
    })

    test('returns the new map when an entry is added', async () => {
        const { result, rerender } = await renderHook(
            ({ map }) => useStableMap(map),
            { initialProps: { map: new Map([['a', 'x']]) } }
        )
        const next = new Map([['a', 'x'], ['b', 'y']])

        await rerender({ map: next })

        expect(result.current).toBe(next)
    })
})
