import { act, renderHook } from '@testing-library/react-native'

import { useAutosave } from '../use-autosave'

beforeEach(() => {
    jest.useFakeTimers()
})

afterEach(() => {
    jest.useRealTimers()
})

describe('debounced save', () => {
    test('does not save before the delay elapses', async () => {
        const onSave = jest.fn()

        await renderHook(() => useAutosave(onSave, ['a'], { delay: 500 }))

        await act(() => {
            jest.advanceTimersByTime(499)
        })

        expect(onSave).not.toHaveBeenCalled()
    })

    test('saves once the delay elapses', async () => {
        const onSave = jest.fn()

        await renderHook(() => useAutosave(onSave, ['a'], { delay: 500 }))

        await act(() => {
            jest.advanceTimersByTime(500)
        })

        expect(onSave).toHaveBeenCalledTimes(1)
    })

    test('restarts the timer when a dependency changes before it fires', async () => {
        const onSave = jest.fn()

        const { rerender } = await renderHook(
            ({ deps }) => useAutosave(onSave, deps, { delay: 500 }),
            { initialProps: { deps: ['a'] } }
        )

        await act(() => {
            jest.advanceTimersByTime(300)
        })

        await rerender({ deps: ['b'] })

        await act(() => {
            jest.advanceTimersByTime(300)
        })

        expect(onSave).not.toHaveBeenCalled()

        await act(() => {
            jest.advanceTimersByTime(200)
        })

        expect(onSave).toHaveBeenCalledTimes(1)
    })
})

describe('skip option', () => {
    test('never schedules a save while skip is true', async () => {
        const onSave = jest.fn()

        await renderHook(() => useAutosave(onSave, ['a'], { delay: 500, skip: true }))

        await act(() => {
            jest.advanceTimersByTime(5000)
        })

        expect(onSave).not.toHaveBeenCalled()
    })
})

describe('flush', () => {
    test('saves immediately and cancels the pending timer', async () => {
        const onSave = jest.fn()

        const { result } = await renderHook(() => useAutosave(onSave, ['a'], { delay: 500 }))

        await act(async () => {
            await result.current.flush()
        })

        expect(onSave).toHaveBeenCalledTimes(1)

        await act(() => {
            jest.advanceTimersByTime(500)
        })

        expect(onSave).toHaveBeenCalledTimes(1)
    })

    test('calls onSave even when nothing is pending', async () => {
        const onSave = jest.fn()

        const { result } = await renderHook(() => useAutosave(onSave, ['a'], { delay: 500 }))

        await act(() => {
            jest.advanceTimersByTime(500)
        })

        expect(onSave).toHaveBeenCalledTimes(1)

        await act(async () => {
            await result.current.flush()
        })

        expect(onSave).toHaveBeenCalledTimes(2)
    })
})
