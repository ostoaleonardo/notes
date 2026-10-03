import { createContext, useCallback, useEffect, useMemo, useState } from 'react'

import { useStorage } from '../hooks/use-storage'

import { STORAGE_KEYS } from '@/constants/storage-keys'

export const RecentNotesContext = createContext()

export function RecentNotesProvider({ children }) {
    const { getItem, setItem } = useStorage()
    const [recent, setRecent] = useState([])

    const refresh = useCallback(() => (
        getItem(STORAGE_KEYS.RECENT_NOTES).then((value) => {
            setRecent(value ? JSON.parse(value) : [])
        })
    ), [])

    useEffect(() => {
        refresh()
    }, [])

    const removeRecent = useCallback((id) => {
        setRecent((prev) => {
            const next = prev.filter((entry) => entry !== id)
            setItem(STORAGE_KEYS.RECENT_NOTES, JSON.stringify(next))
            return next
        })
    }, [])

    const clearRecent = useCallback(() => {
        setRecent([])
        setItem(STORAGE_KEYS.RECENT_NOTES, JSON.stringify([]))
    }, [])

    const value = useMemo(
        () => ({ recent, refresh, removeRecent, clearRecent }),
        [recent, refresh, removeRecent, clearRecent]
    )

    return (
        <RecentNotesContext.Provider value={value}>
            {children}
        </RecentNotesContext.Provider>
    )
}
