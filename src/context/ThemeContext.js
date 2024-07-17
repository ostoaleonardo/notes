import { createContext, useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { THEMES } from '@/constants'

export const ThemeContext = createContext()

export function ThemeProvider({ initialTheme, setTheme, children }) {
    const [userTheme, setUserTheme] = useState('system')
    const colorScheme = useColorScheme()

    useEffect(() => {
        const theme = userTheme !== 'system' ? userTheme : colorScheme
        setTheme(THEMES[theme])
    }, [userTheme, colorScheme])

    useEffect(() => {
        setUserTheme(initialTheme.mode)
    }, [initialTheme])

    return (
        <ThemeContext.Provider
            value={{
                userTheme,
                setUserTheme
            }}
        >
            {children}
        </ThemeContext.Provider>
    )
}
