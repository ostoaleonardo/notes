import { useContext } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react-native'

import { ThemeContext, ThemeProvider } from '../theme-context'
import { THEMES, ACCENT_COLORS } from '@/constants/themes'
import { FREE_ACCENT, THEME_MODES } from '@/constants/theme-options'
import { STORAGE_KEYS } from '@/constants/storage-keys'

const mockSetItem = jest.fn()
let mockPro = true
let mockColorScheme = 'light'

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
    __esModule: true,
    default: () => mockColorScheme
}))
jest.mock('react-native-paper', () => ({
    PaperProvider: ({ children }) => children
}))
jest.mock('expo-status-bar', () => ({
    StatusBar: () => null
}))
jest.mock('@expo/ui', () => ({
    Host: ({ children }) => children
}))
jest.mock('@/hooks/use-storage', () => ({
    useStorage: () => ({ setItem: mockSetItem })
}))
jest.mock('@/hooks/use-pro', () => ({
    usePro: () => ({ pro: mockPro })
}))

const setup = (initialTheme) => renderHook(() => useContext(ThemeContext), {
    wrapper: ({ children }) => (
        <ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>
    )
})

const initial = (overrides = {}) => ({
    mode: THEME_MODES.DARK,
    name: THEME_MODES.DARK,
    theme: THEMES.dark,
    accent: FREE_ACCENT,
    ...overrides
})

describe('theme context', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockPro = true
        mockColorScheme = 'light'
    })

    test('applies the initial mode, name and accent', async () => {
        const { result } = await setup(initial())

        await waitFor(() => expect(result.current.mode).toBe(THEME_MODES.DARK))
        expect(result.current.name).toBe(THEME_MODES.DARK)
        expect(result.current.accent).toBe(FREE_ACCENT)
    })

    test('falls back to the free accent when none is stored', async () => {
        const { result } = await setup(initial({ accent: undefined }))

        await waitFor(() => expect(result.current.accent).toBe(FREE_ACCENT))
    })

    test('follows the system color scheme in system mode', async () => {
        mockColorScheme = 'dark'

        const { result } = await setup(initial({ mode: THEME_MODES.SYSTEM }))

        await waitFor(() => expect(result.current.name).toBe(THEME_MODES.DARK))
    })

    test('switches the theme when the mode changes', async () => {
        const { result } = await setup(initial())
        await waitFor(() => expect(result.current.mode).toBe(THEME_MODES.DARK))

        await act(async () => result.current.setMode(THEME_MODES.LIGHT))

        expect(result.current.name).toBe(THEME_MODES.LIGHT)
    })

    test('tints the tertiary colors with the selected accent', async () => {
        const { result } = await setup(initial({ accent: 'red' }))

        await waitFor(() => {
            expect(result.current.theme.colors.tertiary).toBe(ACCENT_COLORS.red.background)
        })
        expect(result.current.theme.colors.onTertiary).toBe(ACCENT_COLORS.red.onBackground)
    })

    test('reverts a paid accent and persists it when pro is revoked', async () => {
        const { result, rerender } = await setup(initial({ accent: 'red' }))
        await waitFor(() => expect(result.current.accent).toBe('red'))

        mockPro = false
        await rerender({})

        await waitFor(() => expect(result.current.accent).toBe(FREE_ACCENT))
        expect(mockSetItem).toHaveBeenCalledWith(STORAGE_KEYS.ACCENT, FREE_ACCENT)
    })

    test('keeps the accent when pro was never active', async () => {
        mockPro = false
        const { result } = await setup(initial())
        await waitFor(() => expect(result.current.mode).toBe(THEME_MODES.DARK))

        expect(mockSetItem).not.toHaveBeenCalled()
    })
})
