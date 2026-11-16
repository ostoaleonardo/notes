import { renderHook } from '@testing-library/react-native'

import { useBottomSheet } from '../use-bottom-sheet'

const setup = async () => {
    const present = jest.fn()
    const close = jest.fn()
    const { result } = await renderHook(() => useBottomSheet())

    result.current.ref.current = { present, close }

    return { present, close, sheet: result.current }
}

describe('open bottom sheet', () => {
    test('presents the current sheet', async () => {
        const { present, sheet } = await setup()

        sheet.onOpen()

        expect(present).toHaveBeenCalledTimes(1)
    })

    test('does nothing when no sheet is mounted', async () => {
        const { sheet } = await setup()

        sheet.ref.current = null

        expect(() => sheet.onOpen()).not.toThrow()
    })
})

describe('close bottom sheet', () => {
    test('closes the current sheet', async () => {
        const { close, sheet } = await setup()

        sheet.onClose()

        expect(close).toHaveBeenCalledTimes(1)
    })
})
