import { useContext } from 'react'

import { useStorage } from './use-storage'
import { usePro } from './use-pro'
import { ThemeContext } from '@/context/theme-context'
import { isAccentAllowed } from '@/utils/accent'

import { STORAGE_KEYS } from '@/constants/storage-keys'

export function useToggleMode() {
    const {
        mode, setMode,
        accent, setAccent
    } = useContext(ThemeContext)

    const { pro } = usePro()
    const { setItem } = useStorage()

    const toggleMode = async (mode) => {
        await setItem(STORAGE_KEYS.THEME, mode)
        setMode(mode)
    }

    const toggleAccent = async (accent) => {
        if (!isAccentAllowed(accent, pro)) return

        await setItem(STORAGE_KEYS.ACCENT, accent)
        setAccent(accent)
    }

    return {
        mode, toggleMode,
        accent, toggleAccent
    }
}
