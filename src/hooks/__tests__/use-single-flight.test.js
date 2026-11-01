import { act, renderHook } from '@testing-library/react-native'

import { useSingleFlight } from '../use-single-flight'

const deferred = () => {
    let resolve
    const promise = new Promise((done) => { resolve = done })
    return { promise, resolve }
}

describe('single flight action', () => {
    test('ignores calls while the first one is still running', async () => {
        const gate = deferred()
        const action = jest.fn(() => gate.promise)
        const { result } = await renderHook(() => useSingleFlight(action))

        let first
        await act(async () => {
            first = result.current[0]()
            result.current[0]()
        })
        gate.resolve()
        await act(async () => { await first })

        expect(action).toHaveBeenCalledTimes(1)
    })

    test('runs again after the previous call finished', async () => {
        const action = jest.fn(async () => 'done')
        const { result } = await renderHook(() => useSingleFlight(action))

        await act(async () => { await result.current[0]() })
        await act(async () => { await result.current[0]() })

        expect(action).toHaveBeenCalledTimes(2)
    })

    test('runs again after the previous call failed', async () => {
        const action = jest.fn(async () => { throw new Error('boom') })
        const { result } = await renderHook(() => useSingleFlight(action))

        await act(async () => { await result.current[0]().catch(() => {}) })
        await act(async () => { await result.current[0]().catch(() => {}) })

        expect(action).toHaveBeenCalledTimes(2)
    })

    test('passes the arguments and returns the result', async () => {
        const action = jest.fn(async (value) => value * 2)
        const { result } = await renderHook(() => useSingleFlight(action))

        let value
        await act(async () => { value = await result.current[0](21) })

        expect(value).toBe(42)
    })

    test('uses the latest action without changing the returned function', async () => {
        const first = jest.fn()
        const second = jest.fn()
        const { result, rerender } = await renderHook(
            ({ action }) => useSingleFlight(action),
            { initialProps: { action: first } }
        )
        const stable = result.current[0]

        await rerender({ action: second })
        await act(async () => { await result.current[0]() })

        expect(result.current[0]).toBe(stable)
        expect(second).toHaveBeenCalledTimes(1)
        expect(first).not.toHaveBeenCalled()
    })

    test('reports the pending state while the action runs', async () => {
        const gate = deferred()
        const { result } = await renderHook(() => useSingleFlight(() => gate.promise))

        let running
        await act(async () => { running = result.current[0]() })
        expect(result.current[1]).toBe(true)

        gate.resolve()
        await act(async () => { await running })

        expect(result.current[1]).toBe(false)
    })
})
