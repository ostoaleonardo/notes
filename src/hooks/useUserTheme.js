import { useContext } from 'react'
import { useStorage } from './useStorage'
import { ThemeContext } from '@/context'
import { STORAGE_KEYS } from '@/constants'

export function useUserTheme() {
    const { userTheme, setUserTheme } = useContext(ThemeContext)
    const { setItem } = useStorage()

    const toggleTheme = async (theme) => {
        await setItem(STORAGE_KEYS.THEME, theme)
        setUserTheme(theme)
    }

    return { userTheme, toggleTheme }
}
