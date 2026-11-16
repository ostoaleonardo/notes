import { act, renderHook } from '@testing-library/react-native'

import { useIndicatorFlag } from '../use-indicator-flag'

const DELAY = 100
const MIN_VISIBLE = 500

const advance = (ms) => act(async () => {
    await jest.advanceTimersByTimeAsync(ms)
})

const render = (active) => renderHook((current) => useIndicatorFlag(current, DELAY, MIN_VISIBLE), {
    initialProps: active
})

describe('indicator flag', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    test('stays hidden while nothing is active', async () => {
        const { result } = await render(false)

        await advance(DELAY * 10)

        expect(result.current).toBe(false)
    })

    test('appears only after the delay', async () => {
        const { result } = await render(true)

        await advance(DELAY - 1)
        expect(result.current).toBe(false)

        await advance(1)
        expect(result.current).toBe(true)
    })

    test('never appears for an activity shorter than the delay', async () => {
        const { result, rerender } = await render(true)

        await advance(DELAY - 10)
        await rerender(false)
        await advance(MIN_VISIBLE * 2)

        expect(result.current).toBe(false)
    })

    test('stays visible for the minimum time after the activity ends', async () => {
        const { result, rerender } = await render(true)

        await advance(DELAY)
        await advance(50)
        await rerender(false)
        await advance(MIN_VISIBLE - 51)

        expect(result.current).toBe(true)

        await advance(1)

        expect(result.current).toBe(false)
    })

    test('hides at once when the minimum time already passed', async () => {
        const { result, rerender } = await render(true)

        await advance(DELAY + MIN_VISIBLE + 200)
        await rerender(false)
        await advance(0)

        expect(result.current).toBe(false)
    })

    test('stays visible when the activity resumes before it hides', async () => {
        const { result, rerender } = await render(true)

        await advance(DELAY)
        await rerender(false)
        await advance(100)
        await rerender(true)
        await advance(MIN_VISIBLE * 2)

        expect(result.current).toBe(true)
    })

    test('stays visible without blinking across consecutive activities', async () => {
        const { result, rerender } = await render(true)

        await advance(DELAY)
        const samples = []

        for (let index = 0; index < 6; index += 1) {
            await rerender(index % 2 === 0)
            await advance(30)
            samples.push(result.current)
        }

        expect(samples.every(Boolean)).toBe(true)
    })
})
