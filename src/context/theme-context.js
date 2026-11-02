import { createContext, useEffect, useMemo, useRef, useState } from 'react'
import { useColorScheme, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'

import { usePro } from '@/hooks/use-pro'
import { useStorage } from '@/hooks/use-storage'
import { ThemeContext as UiThemeContext } from '@/ui/context/theme-context'

import { revertAccentOnProRevoke } from '@/utils/accent'
import { getReadableAccent } from '@/utils/accent-contrast'

import { THEMES, ACCENT_COLORS } from '@/constants/themes'
import { FREE_ACCENT, THEME_MODES } from '@/constants/theme-options'
import { STORAGE_KEYS } from '@/constants/storage-keys'

export const ThemeContext = createContext()

export function ThemeProvider({ initialTheme, children }) {
    const colorScheme = useColorScheme()
    const { setItem } = useStorage()
    const { pro } = usePro()

    const [mode, setMode] = useState(initialTheme.mode)
    const [name, setName] = useState(initialTheme.name)
    const [theme, setTheme] = useState(initialTheme.theme)
    const [accent, setAccent] = useState(initialTheme.accent || FREE_ACCENT)
    const proRef = useRef(false)
    const accentRef = useRef(accent)
    accentRef.current = accent

    useEffect(() => {
        setMode(initialTheme.mode)
        setName(initialTheme.name)
        setTheme(initialTheme.theme)
        setAccent(initialTheme.accent || FREE_ACCENT)
    }, [initialTheme])

    useEffect(() => {
        const currentAccent = accentRef.current
        const nextAccent = revertAccentOnProRevoke(proRef.current, pro, currentAccent)

        if (nextAccent !== currentAccent) {
            setAccent(nextAccent)
            setItem(STORAGE_KEYS.ACCENT, nextAccent)
        }

        proRef.current = pro
    }, [pro, setItem])

    useEffect(() => {
        const theme = mode !== THEME_MODES.SYSTEM ? mode : colorScheme
        setName(theme)

        if (accent && theme) {
            setTheme(updateTheme(theme, accent))
        } else {
            setTheme(THEMES[theme])
        }

    }, [mode, accent, colorScheme])

    const updateTheme = (mode, accent) => {
        const { colors } = THEMES[mode]
        const { background, onBackground } = accent === FREE_ACCENT
            ? { background: colors.onBackground, onBackground: colors.background }
            : ACCENT_COLORS[accent]

        return {
            ...THEMES[mode],
            colors: {
                ...colors,
                tertiary: background,
                onTertiary: onBackground,
                accentText: getReadableAccent({
                    accent: background,
                    surfaces: [colors.background, colors.surface, colors.surfaceVariant],
                    toward: colors.onBackground
                })
            }
        }
    }

    const backgroundColor = theme?.colors?.background

    useEffect(() => {
        if (backgroundColor) SystemUI.setBackgroundColorAsync(backgroundColor)
    }, [backgroundColor])

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
            <UiThemeContext.Provider value={theme}>
                <View style={{ flex: 1 }}>
                    {children}
                </View>
            </UiThemeContext.Provider>
            <StatusBar style={name === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT} />
        </ThemeContext.Provider>
    )
}
