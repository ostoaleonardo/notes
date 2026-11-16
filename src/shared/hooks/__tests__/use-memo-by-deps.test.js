import { renderHook } from '@testing-library/react-native'

import { useMemoByDeps } from '../use-memo-by-deps'

describe('memo by deps', () => {
    test('keeps the value while the deps are unchanged', async () => {
        const factory = jest.fn(() => ({}))

        const { result, rerender } = await renderHook(
            ({ deps }) => useMemoByDeps(factory, deps),
            { initialProps: { deps: ['a'] } }
        )
        const first = result.current

        await rerender({ deps: ['a'] })

        expect(result.current).toBe(first)
        expect(factory).toHaveBeenCalledTimes(1)
    })

    test('recomputes the value when a dep changes', async () => {
        const factory = jest.fn(() => ({}))

        const { result, rerender } = await renderHook(
            ({ deps }) => useMemoByDeps(factory, deps),
            { initialProps: { deps: ['a'] } }
        )
        const first = result.current

        await rerender({ deps: ['b'] })

        expect(result.current).not.toBe(first)
        expect(factory).toHaveBeenCalledTimes(2)
    })

    test('recomputes when the number of deps changes', async () => {
        const factory = jest.fn(() => ({}))

        const { rerender } = await renderHook(
            ({ deps }) => useMemoByDeps(factory, deps),
            { initialProps: { deps: ['a'] } }
        )

        await rerender({ deps: ['a', 'b'] })

        expect(factory).toHaveBeenCalledTimes(2)
    })
})
