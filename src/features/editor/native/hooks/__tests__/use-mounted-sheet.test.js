import { act, renderHook } from '@testing-library/react-native'

import { useMountedSheet } from '../use-mounted-sheet'

describe('mounted sheet', () => {
    test('starts unmounted', async () => {
        const { result } = await renderHook(() => useMountedSheet())

        expect(result.current.mounted).toBe(false)
    })

    test('mounts when opened', async () => {
        const { result } = await renderHook(() => useMountedSheet())

        await act(async () => result.current.onOpen())

        expect(result.current.mounted).toBe(true)
    })

    test('unmounts when closed', async () => {
        const { result } = await renderHook(() => useMountedSheet())

        await act(async () => result.current.onOpen())
        await act(async () => result.current.onClose())

        expect(result.current.mounted).toBe(false)
    })
})
