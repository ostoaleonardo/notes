import { createContext, useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { PaperProvider } from 'react-native-paper'
import { THEMES } from '@/constants'

export const ThemeContext = createContext()

export function ThemeProvider({ initialTheme, children }) {
    const [mode, setMode] = useState('')
    const [name, setName] = useState('')
    const [theme, setTheme] = useState({})
    const colorScheme = useColorScheme()

    useEffect(() => {
        setMode(initialTheme.mode)
        setName(initialTheme.name)
        setTheme(initialTheme.theme)
    }, [initialTheme])

    useEffect(() => {
        const theme = mode !== 'system' ? mode : colorScheme
        setTheme(THEMES[theme])
        setName(theme)
    }, [mode, colorScheme])

    return (
        <ThemeContext.Provider
            value={{
                mode,
                setMode,
                name,
                setName,
                theme,
                setTheme
            }}
        >
            <PaperProvider theme={theme}>
                {children}
            </PaperProvider>
        </ThemeContext.Provider>
    )
}
