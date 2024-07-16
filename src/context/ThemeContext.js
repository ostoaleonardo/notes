import { createContext, useEffect, useState } from 'react'
import { THEMES } from '@/constants'
import { useColorScheme } from 'react-native'

export const ThemeContext = createContext()

export function ThemeProvider({ setTheme, children }) {
    const [userTheme, setUserTheme] = useState('system')
    const colorScheme = useColorScheme()

    useEffect(() => {
        const theme = userTheme !== 'system' ? userTheme : colorScheme
        setTheme(THEMES[theme])
    }, [userTheme, colorScheme])

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
