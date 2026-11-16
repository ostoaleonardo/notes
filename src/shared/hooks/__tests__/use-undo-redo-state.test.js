import { act, renderHook } from '@testing-library/react-native'

import { useUndoRedoState } from '../use-undo-redo-state'

describe('undo redo state', () => {
    test('starts with nothing to undo or redo', async () => {
        const { result } = await renderHook(() => useUndoRedoState())

        expect(result.current.canUndo).toBe(false)
        expect(result.current.canRedo).toBe(false)
    })

    test('reflects history changes', async () => {
        const { result } = await renderHook(() => useUndoRedoState())

        await act(async () => result.current.onHistoryChange({ canUndo: true, canRedo: false }))

        expect(result.current.canUndo).toBe(true)
        expect(result.current.canRedo).toBe(false)
    })

    test('keeps the same handler between renders', async () => {
        const { result } = await renderHook(() => useUndoRedoState())
        const initial = result.current.onHistoryChange

        await act(async () => result.current.onHistoryChange({ canUndo: true, canRedo: true }))

        expect(result.current.onHistoryChange).toBe(initial)
    })
})
