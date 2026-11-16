import { useContext } from 'react'

import { useStorage } from '../../../shared/hooks/use-storage'
import { usePro } from '../../../shared/hooks/use-pro'
import { ThemeContext } from '@/shared/context/theme-context'
import { isAccentAllowed } from '@/shared/utils/accent'

import { STORAGE_KEYS } from '@/shared/constants/storage-keys'

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
