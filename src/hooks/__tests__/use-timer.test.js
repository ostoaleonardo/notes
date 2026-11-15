import { act, renderHook } from '@testing-library/react-native'

import { useTimer } from '../use-timer'

const advance = (ms) => act(async () => {
    await jest.advanceTimersByTimeAsync(ms)
})

describe('timer', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    test('runs the callback once after the delay', async () => {
        const callback = jest.fn()
        const { result } = await renderHook(() => useTimer())

        result.current.schedule(callback, 100)
        await advance(99)
        expect(callback).not.toHaveBeenCalled()

        await advance(1)
        expect(callback).toHaveBeenCalledTimes(1)
    })

    test('replaces the pending callback when scheduled again', async () => {
        const first = jest.fn()
        const second = jest.fn()
        const { result } = await renderHook(() => useTimer())

        result.current.schedule(first, 100)
        await advance(50)
        result.current.schedule(second, 100)
        await advance(100)

        expect(first).not.toHaveBeenCalled()
        expect(second).toHaveBeenCalledTimes(1)
    })

    test('does not run a cancelled callback', async () => {
        const callback = jest.fn()
        const { result } = await renderHook(() => useTimer())

        result.current.schedule(callback, 100)
        result.current.cancel()
        await advance(200)

        expect(callback).not.toHaveBeenCalled()
    })

    test('reports whether a callback is waiting', async () => {
        const { result } = await renderHook(() => useTimer())

        expect(result.current.isPending()).toBe(false)

        result.current.schedule(() => {}, 100)
        expect(result.current.isPending()).toBe(true)

        await advance(100)
        expect(result.current.isPending()).toBe(false)
    })

    test('cancels the pending callback when the component unmounts', async () => {
        const callback = jest.fn()
        const { result, unmount } = await renderHook(() => useTimer())

        result.current.schedule(callback, 100)
        await unmount()
        await advance(200)

        expect(callback).not.toHaveBeenCalled()
    })

    test('keeps the pending callback after unmount when cancelling is turned off', async () => {
        const callback = jest.fn()
        const { result, unmount } = await renderHook(() => useTimer({ cancelOnUnmount: false }))

        result.current.schedule(callback, 100)
        await unmount()
        await advance(200)

        expect(callback).toHaveBeenCalledTimes(1)
    })
})
