import { act, renderHook } from '@testing-library/react-native'

import { useEditorJump } from '../use-editor-jump'

describe('editor jump', () => {
    test('starts on the anchor of the route', async () => {
        const { result } = await renderHook(() => useEditorJump('intro'))

        expect(result.current.anchor).toBe('intro')
        expect(result.current.headingIndex).toBeUndefined()
        expect(result.current.jumpNonce).toBeUndefined()
    })

    test('jumps to a heading and bumps the nonce', async () => {
        const { result } = await renderHook(() => useEditorJump('intro'))

        await act(async () => result.current.onSelectHeading(3))

        expect(result.current.headingIndex).toBe(3)
        expect(result.current.jumpNonce).toBe(1)
    })

    test('jumps to an anchor over the route anchor', async () => {
        const { result } = await renderHook(() => useEditorJump('intro'))

        await act(async () => result.current.onJumpToAnchor('other'))

        expect(result.current.anchor).toBe('other')
        expect(result.current.jumpNonce).toBe(1)
    })

    test('increments the nonce on every jump to the same target', async () => {
        const { result } = await renderHook(() => useEditorJump())

        await act(async () => result.current.onSelectHeading(1))
        await act(async () => result.current.onSelectHeading(1))

        expect(result.current.jumpNonce).toBe(2)
    })

    test('keeps the handlers stable between renders', async () => {
        const { result, rerender } = await renderHook(() => useEditorJump())
        const { onSelectHeading, onJumpToAnchor } = result.current

        await rerender()

        expect(result.current.onSelectHeading).toBe(onSelectHeading)
        expect(result.current.onJumpToAnchor).toBe(onJumpToAnchor)
    })
})
