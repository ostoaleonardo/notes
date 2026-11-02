import { renderHook } from '@testing-library/react-native'

import { ThemeContext, DEFAULT_THEME } from '@/ui/context/theme-context'
import { useTheme } from '../use-theme'

const theme = { dark: true, colors: { onBackground: '#ffffff' } }

describe('use theme', () => {
    test('returns the default theme without a provider', async () => {
        const { result } = await renderHook(() => useTheme())

        expect(result.current).toBe(DEFAULT_THEME)
    })

    test('returns the theme from the provider', async () => {
        const { result } = await renderHook(() => useTheme(), {
            wrapper: ({ children }) => (
                <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
            )
        })

        expect(result.current).toBe(theme)
    })
})
