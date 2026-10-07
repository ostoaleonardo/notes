import { act, renderHook } from '@testing-library/react-native'

import { useToggleMode } from '../use-toggle-mode'
import { ThemeContext } from '@/context/theme-context'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { FREE_ACCENT } from '@/constants/theme-options'

const mockSetItem = jest.fn()
let mockPro = false

jest.mock('../use-storage', () => ({
    useStorage: () => ({ setItem: mockSetItem })
}))
jest.mock('../use-pro', () => ({
    usePro: () => ({ pro: mockPro })
}))

const setup = async () => {
    const themeValue = {
        mode: 'dark',
        accent: FREE_ACCENT,
        setMode: jest.fn(),
        setAccent: jest.fn()
    }
    const { result } = await renderHook(() => useToggleMode(), {
        wrapper: ({ children }) => (
            <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>
        )
    })

    return { themeValue, result }
}

describe('toggle mode', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockPro = false
        mockSetItem.mockResolvedValue()
    })

    test('exposes the current mode and accent', async () => {
        const { result } = await setup()

        expect(result.current.mode).toBe('dark')
        expect(result.current.accent).toBe(FREE_ACCENT)
    })

    test('persists and applies a new mode', async () => {
        const { themeValue, result } = await setup()

        await act(async () => result.current.toggleMode('light'))

        expect(mockSetItem).toHaveBeenCalledWith(STORAGE_KEYS.THEME, 'light')
        expect(themeValue.setMode).toHaveBeenCalledWith('light')
    })

    test('ignores paid accents without pro', async () => {
        const { themeValue, result } = await setup()

        await act(async () => result.current.toggleAccent('red'))

        expect(mockSetItem).not.toHaveBeenCalled()
        expect(themeValue.setAccent).not.toHaveBeenCalled()
    })

    test('applies and persists a paid accent with pro', async () => {
        mockPro = true
        const { themeValue, result } = await setup()

        await act(async () => result.current.toggleAccent('red'))

        expect(mockSetItem).toHaveBeenCalledWith(STORAGE_KEYS.ACCENT, 'red')
        expect(themeValue.setAccent).toHaveBeenCalledWith('red')
    })

    test('always allows the free accent', async () => {
        const { themeValue, result } = await setup()

        await act(async () => result.current.toggleAccent(FREE_ACCENT))

        expect(themeValue.setAccent).toHaveBeenCalledWith(FREE_ACCENT)
    })
})
