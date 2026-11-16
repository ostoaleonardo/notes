import { act, renderHook } from '@testing-library/react-native'

import { useDelayedValue } from '../use-delayed-value'

const DELAY = 150

describe('delayed value', () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    test('starts with the initial value', async () => {
        const { result } = await renderHook(({ value }) => useDelayedValue(value, DELAY), {
            initialProps: { value: 'a' }
        })

        expect(result.current).toBe('a')
    })

    test('keeps the old value until the delay passes', async () => {
        const { result, rerender } = await renderHook(
            ({ value }) => useDelayedValue(value, DELAY),
            { initialProps: { value: 'a' } }
        )

        await rerender({ value: 'b' })
        await act(async () => jest.advanceTimersByTime(DELAY - 1))

        expect(result.current).toBe('a')
    })

    test('switches to the new value after the delay', async () => {
        const { result, rerender } = await renderHook(
            ({ value }) => useDelayedValue(value, DELAY),
            { initialProps: { value: 'a' } }
        )

        await rerender({ value: 'b' })
        await act(async () => jest.advanceTimersByTime(DELAY))

        expect(result.current).toBe('b')
    })

    test('only applies the latest value when it changes quickly', async () => {
        const { result, rerender } = await renderHook(
            ({ value }) => useDelayedValue(value, DELAY),
            { initialProps: { value: 'a' } }
        )

        await rerender({ value: 'b' })
        await act(async () => jest.advanceTimersByTime(DELAY - 50))
        await rerender({ value: 'c' })
        await act(async () => jest.advanceTimersByTime(DELAY))

        expect(result.current).toBe('c')
    })
})
