import { renderHook } from '@testing-library/react-native'

import { useExclusiveQueue } from '../use-exclusive-queue'

describe('exclusive queue', () => {
    test('runs tasks one after another in order', async () => {
        const { result } = await renderHook(() => useExclusiveQueue())
        const order = []

        const first = result.current.runExclusive(async () => {
            await Promise.resolve()
            order.push('first')
        })
        const second = result.current.runExclusive(async () => {
            order.push('second')
        })

        await Promise.all([first, second])

        expect(order).toEqual(['first', 'second'])
    })

    test('returns the task result', async () => {
        const { result } = await renderHook(() => useExclusiveQueue())

        await expect(result.current.runExclusive(async () => 7)).resolves.toBe(7)
    })

    test('keeps running tasks after one fails', async () => {
        const { result } = await renderHook(() => useExclusiveQueue())

        const failing = result.current.runExclusive(async () => {
            throw new Error('fail')
        })
        const next = result.current.runExclusive(async () => 'ok')

        await expect(failing).rejects.toThrow('fail')
        await expect(next).resolves.toBe('ok')
    })

    test('keeps the same function between renders', async () => {
        const { result, rerender } = await renderHook(() => useExclusiveQueue())
        const initial = result.current.runExclusive

        await rerender({})

        expect(result.current.runExclusive).toBe(initial)
    })
})
