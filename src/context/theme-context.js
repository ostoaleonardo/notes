import { createContext, useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { PaperProvider } from 'react-native-paper'
import { StatusBar } from 'expo-status-bar'
import { THEMES } from '@/constants'
import { ACCENT_COLORS } from '@/constants/themes'
import { Host } from '@expo/ui'

export const ThemeContext = createContext()

export function ThemeProvider({ initialTheme, children }) {
    const colorScheme = useColorScheme()
    const [mode, setMode] = useState('')
    const [name, setName] = useState('')
    const [theme, setTheme] = useState({})
    const [accent, setAccent] = useState('')

    useEffect(() => {
        setMode(initialTheme.mode)
        setName(initialTheme.name)
        setTheme(initialTheme.theme)
        setAccent(initialTheme.accent || 'red')
    }, [initialTheme])

    useEffect(() => {
        const theme = mode !== 'system' ? mode : colorScheme
        setName(theme)

        if (accent && theme) {
            setTheme(updateTheme(theme, accent))
        } else {
            THEMES[theme]
        }

    }, [mode, accent])

    const updateTheme = (mode, accent) => {
        const { background, onBackground } = ACCENT_COLORS[accent]

        return {
            ...THEMES[mode],
            colors: {
                ...THEMES[mode].colors,
                tertiary: background,
                onTertiary: onBackground
            }
        }
    }

    return (
        <ThemeContext.Provider
            value={{
                mode,
                setMode,
                name,
                setName,
                theme,
                setTheme,
                accent,
                setAccent
            }}
        >
            <PaperProvider theme={theme}>
                <Host style={{ flex: 1 }}>
                    {children}
                </Host>
            </PaperProvider>
            <StatusBar style={name === 'light' ? 'dark' : 'light'} />
        </ThemeContext.Provider>
    )
}
