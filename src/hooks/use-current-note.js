import { useCallback, useContext } from 'react'
import { useFocusEffect } from 'expo-router'

import { useStorage } from './use-storage'
import { CurrentNoteContext } from '@/context/current-note-context'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import { RECENT_NOTES_LIMIT } from '@/constants/default-values'

export function useCurrentNote() {
    const { currentId, setCurrentId } = useContext(CurrentNoteContext)
    const { getItem, setItem } = useStorage()

    const registerCurrent = async (id) => {
        setCurrentId(id)
        await setItem(STORAGE_KEYS.CURRENT_NOTE, id)

        if (!id) return

        const stored = await getItem(STORAGE_KEYS.RECENT_NOTES)
        const recent = stored ? JSON.parse(stored) : []
        const next = [id, ...recent.filter((entry) => entry !== id)].slice(0, RECENT_NOTES_LIMIT)
        await setItem(STORAGE_KEYS.RECENT_NOTES, JSON.stringify(next))
    }

    return { currentId, registerCurrent }
}

export function useRegisterCurrent(id) {
    const { registerCurrent } = useCurrentNote()

    useFocusEffect(
        useCallback(() => {
            if (id) registerCurrent(id)
        }, [id])
    )
}
