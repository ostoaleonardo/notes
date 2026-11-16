import { renderHook } from '@testing-library/react-native'

import { useStableCallback } from '../use-stable-callback'

describe('stable callback', () => {
    test('keeps the same function between renders', async () => {
        const { result, rerender } = await renderHook(
            ({ callback }) => useStableCallback(callback),
            { initialProps: { callback: jest.fn() } }
        )
        const first = result.current

        await rerender({ callback: jest.fn() })

        expect(result.current).toBe(first)
    })

    test('calls the latest callback with its arguments', async () => {
        const latest = jest.fn()
        const { result, rerender } = await renderHook(
            ({ callback }) => useStableCallback(callback),
            { initialProps: { callback: jest.fn() } }
        )

        await rerender({ callback: latest })
        result.current('a', 1)

        expect(latest).toHaveBeenCalledWith('a', 1)
    })
})
