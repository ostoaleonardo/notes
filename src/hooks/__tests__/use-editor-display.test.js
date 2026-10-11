import { waitFor, renderHook } from '@testing-library/react-native'

import { useEditorDisplay } from '../use-editor-display'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import {
    EDITOR_FONT_SIZES,
    EDITOR_LINE_WIDTHS,
    EDITOR_TAB_SIZES,
    DEFAULT_EDITOR_FONT_SIZE,
    DEFAULT_EDITOR_LINE_WIDTH,
    DEFAULT_EDITOR_TAB_SIZE
} from '@/constants/editor-display'

const mockStorage = {
    getItem: jest.fn()
}

jest.mock('../use-storage', () => ({
    useStorage: () => mockStorage
}))

const stubStorage = (values) => {
    mockStorage.getItem.mockImplementation(async (key) => values[key] ?? null)
}

describe('editor display options', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('resolves the defaults when nothing is stored', async () => {
        stubStorage({})

        const { result } = await renderHook(() => useEditorDisplay())

        expect(result.current.fontSize).toBe(EDITOR_FONT_SIZES[DEFAULT_EDITOR_FONT_SIZE])
        expect(result.current.maxWidth).toBe(EDITOR_LINE_WIDTHS[DEFAULT_EDITOR_LINE_WIDTH])
        expect(result.current.tabSize).toBe(EDITOR_TAB_SIZES[DEFAULT_EDITOR_TAB_SIZE])
        expect(result.current.lineNumbers).toBe(false)
        expect(result.current.spellcheck).toBe(true)
        expect(result.current.inlineTitle).toBe(true)
    })

    test('applies the stored values', async () => {
        stubStorage({
            [STORAGE_KEYS.EDITOR_FONT_SIZE]: 'large',
            [STORAGE_KEYS.EDITOR_TAB_SIZE]: '8',
            [STORAGE_KEYS.EDITOR_LINE_NUMBERS]: 'on',
            [STORAGE_KEYS.EDITOR_SPELLCHECK]: 'off'
        })

        const { result } = await renderHook(() => useEditorDisplay())

        await waitFor(() => expect(result.current.fontSize).toBe(EDITOR_FONT_SIZES.large))
        expect(result.current.tabSize).toBe(EDITOR_TAB_SIZES[8])
        expect(result.current.lineNumbers).toBe(true)
        expect(result.current.spellcheck).toBe(false)
    })

    test('ignores stored values that are not valid options', async () => {
        stubStorage({ [STORAGE_KEYS.EDITOR_FONT_SIZE]: 'gigantic' })

        const { result } = await renderHook(() => useEditorDisplay())

        expect(result.current.fontSize).toBe(EDITOR_FONT_SIZES[DEFAULT_EDITOR_FONT_SIZE])
    })
})
