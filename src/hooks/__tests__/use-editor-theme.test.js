import { renderHook } from '@testing-library/react-native'

import { useEditorTheme } from '../use-editor-theme'

import { BUTTON } from '@/constants/components'
import { SPACING } from '@/constants/theme'

const mockColors = { background: '#000' }
const mockTheme = { colors: mockColors }
const mockInsets = { bottom: 20 }
const mockHeading = { fontFamily: 'Font' }
const mockDisplay = {
    fontSize: 16,
    maxWidth: 700,
    lineNumbers: true,
    spellcheck: false,
    autocorrect: false,
    tabSize: 2,
    inlineTitle: true
}

jest.mock('@/ui/hooks/use-theme', () => ({
    useTheme: () => mockTheme
}))
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => mockInsets
}))
jest.mock('../use-heading-font', () => ({
    useHeadingFont: () => mockHeading
}))
jest.mock('../use-editor-display', () => ({
    useEditorDisplay: () => mockDisplay
}))

describe('editor theme', () => {
    test('builds the dom theme from the colors, the layout and the typography', async () => {
        const { result } = await renderHook(() => useEditorTheme())

        expect(result.current.theme.colors).toBe(mockColors)
        expect(result.current.theme.layout.maxWidth).toBe(700)
        expect(result.current.theme.typography.fontSize).toBe(16)
    })

    test('reserves the toolbar height and the bottom inset', async () => {
        const { result } = await renderHook(() => useEditorTheme())

        expect(result.current.theme.layout.bottomInset).toBe(BUTTON.size + SPACING.lg * 2 + 20)
    })

    test('returns the display options that are not part of the theme', async () => {
        const { result } = await renderHook(() => useEditorTheme())

        expect(result.current.display).toEqual({
            lineNumbers: true,
            spellcheck: false,
            autocorrect: false,
            tabSize: 2,
            inlineTitle: true
        })
    })

    test('keeps the same theme between renders', async () => {
        const { result, rerender } = await renderHook(() => useEditorTheme())
        const first = result.current.theme

        await rerender()

        expect(result.current.theme).toBe(first)
    })
})
