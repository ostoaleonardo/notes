import { createContext, useEffect, useMemo, useRef, useState } from 'react'
import { useColorScheme } from 'react-native'
import { PaperProvider } from 'react-native-paper'
import { StatusBar } from 'expo-status-bar'
import { Host } from '@expo/ui'

import { usePro } from '@/hooks/use-pro'
import { useStorage } from '@/hooks/use-storage'
import { revertAccentOnProRevoke } from '@/utils/accent'

import { FREE_ACCENT, THEMES, ACCENT_COLORS } from '@/constants/themes'
import { STORAGE_KEYS } from '@/constants/storage-keys'

export const ThemeContext = createContext()

export function ThemeProvider({ initialTheme, children }) {
    const colorScheme = useColorScheme()
    const { setItem } = useStorage()
    const { pro } = usePro()

    const [mode, setMode] = useState('')
    const [name, setName] = useState('')
    const [theme, setTheme] = useState({})
    const [accent, setAccent] = useState('')
    const proRef = useRef(false)

    useEffect(() => {
        setMode(initialTheme.mode)
        setName(initialTheme.name)
        setTheme(initialTheme.theme)
        setAccent(initialTheme.accent || FREE_ACCENT)
    }, [initialTheme])

    useEffect(() => {
        const nextAccent = revertAccentOnProRevoke(proRef.current, pro, accent)

        if (nextAccent !== accent) {
            setAccent(nextAccent)
            setItem(STORAGE_KEYS.ACCENT, nextAccent)
        }

        proRef.current = pro
    }, [pro])

    useEffect(() => {
        const theme = mode !== 'system' ? mode : colorScheme
        setName(theme)

        if (accent && theme) {
            setTheme(updateTheme(theme, accent))
        } else {
            setTheme(THEMES[theme])
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

    const value = useMemo(() => ({
        mode,
        setMode,
        name,
        setName,
        theme,
        setTheme,
        accent,
        setAccent
    }), [mode, name, theme, accent])

    return (
        <ThemeContext.Provider value={value}>
            <PaperProvider theme={theme}>
                <Host style={{ flex: 1 }}>
                    {children}
                </Host>
            </PaperProvider>
            <StatusBar style={name === 'light' ? 'dark' : 'light'} />
        </ThemeContext.Provider>
    )
}
