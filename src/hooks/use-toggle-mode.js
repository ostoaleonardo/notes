import { useContext } from 'react'
import { useStorage } from './use-storage'
import { ThemeContext } from '@/context'
import { STORAGE_KEYS } from '@/constants'

export function useToggleMode() {
    const {
        mode, setMode,
        accent, setAccent
    } = useContext(ThemeContext)

    const { setItem } = useStorage()

    const toggleMode = async (mode) => {
        await setItem(STORAGE_KEYS.THEME, mode)
        setMode(mode)
    }

    const toggleAccent = async (accent) => {
        await setItem(STORAGE_KEYS.ACCENT, accent)
        setAccent(accent)
    }

    return {
        mode, toggleMode,
        accent, toggleAccent
    }
}
