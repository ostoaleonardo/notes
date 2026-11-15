import { act, renderHook } from '@testing-library/react-native'

import { useDebouncedValue } from '../use-debounced-value'

const DELAY = 250
const isBlank = (value) => value.trim() === ''

const advance = (ms) => act(async () => {
    await jest.advanceTimersByTimeAsync(ms)
})

describe('debounced value', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    test('starts with the initial value without waiting', async () => {
        const { result } = await renderHook(() => useDebouncedValue('abc', DELAY))

        expect(result.current).toBe('abc')
    })

    test('keeps the previous value until the delay passes', async () => {
        const { result, rerender } = await renderHook((value) => useDebouncedValue(value, DELAY), {
            initialProps: 'a'
        })

        await rerender('ab')
        await advance(DELAY - 1)

        expect(result.current).toBe('a')

        await advance(1)

        expect(result.current).toBe('ab')
    })

    test('restarts the wait on every change while typing', async () => {
        const { result, rerender } = await renderHook((value) => useDebouncedValue(value, DELAY), {
            initialProps: 'a'
        })

        await rerender('ab')
        await advance(200)
        await rerender('abc')
        await advance(200)

        expect(result.current).toBe('a')

        await advance(50)

        expect(result.current).toBe('abc')
    })

    test('waits too when the text is being deleted', async () => {
        const { result, rerender } = await renderHook((value) => useDebouncedValue(value, DELAY), {
            initialProps: 'abcd'
        })

        await rerender('abc')
        await advance(100)
        await rerender('ab')
        await advance(100)

        expect(result.current).toBe('abcd')

        await advance(150)

        expect(result.current).toBe('ab')
    })

    test('follows an immediate value without waiting', async () => {
        const { result, rerender } = await renderHook((value) => useDebouncedValue(value, DELAY, isBlank), {
            initialProps: 'abc'
        })

        await rerender('')

        expect(result.current).toBe('')
    })

    test('drops a pending value when an immediate one arrives', async () => {
        const { result, rerender } = await renderHook((value) => useDebouncedValue(value, DELAY, isBlank), {
            initialProps: 'a'
        })

        await rerender('ab')
        await advance(100)
        await rerender('')
        await advance(DELAY * 2)

        expect(result.current).toBe('')
    })

    test('waits again after an immediate value', async () => {
        const { result, rerender } = await renderHook((value) => useDebouncedValue(value, DELAY, isBlank), {
            initialProps: 'abc'
        })

        await rerender('')
        await rerender('x')

        expect(result.current).toBe('')

        await advance(DELAY)

        expect(result.current).toBe('x')
    })
})
