import { useContext } from 'react'
import { useStorage } from './useStorage'
import { ThemeContext } from '@/context'
import { STORAGE_KEYS } from '@/constants'

export function useToggleMode() {
    const { mode, setMode } = useContext(ThemeContext)
    const { setItem } = useStorage()

    const toggleMode = async (mode) => {
        await setItem(STORAGE_KEYS.THEME, mode)
        setMode(mode)
    }

    return { mode, toggleMode }
}
