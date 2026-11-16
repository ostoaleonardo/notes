import { renderHook } from '@testing-library/react-native'

import { useStableValue } from '../use-stable-value'

describe('stable value', () => {
    test('keeps the same reference when the content is equal', async () => {
        const { result, rerender } = await renderHook(
            ({ value }) => useStableValue(value),
            { initialProps: { value: { items: [1, 2] } } }
        )
        const first = result.current

        await rerender({ value: { items: [1, 2] } })

        expect(result.current).toBe(first)
    })

    test('returns the new reference when the content changes', async () => {
        const { result, rerender } = await renderHook(
            ({ value }) => useStableValue(value),
            { initialProps: { value: { items: [1, 2] } } }
        )
        const next = { items: [1, 2, 3] }

        await rerender({ value: next })

        expect(result.current).toBe(next)
    })
})
