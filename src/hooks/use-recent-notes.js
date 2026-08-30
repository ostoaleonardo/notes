import { useEffect, useState } from 'react'
import { useStorage } from './use-storage'
import { STORAGE_KEYS } from '@/constants'

export function useRecentNotes() {
    const { getItem, setItem } = useStorage()
    const [recent, setRecent] = useState([])

    const refresh = () => {
        getItem(STORAGE_KEYS.RECENT_NOTES).then((value) => {
            setRecent(value ? JSON.parse(value) : [])
        })
    }

    useEffect(() => {
        refresh()
    }, [])

    const removeRecent = (id) => {
        setRecent((prev) => {
            const next = prev.filter((entry) => entry !== id)
            setItem(STORAGE_KEYS.RECENT_NOTES, JSON.stringify(next))
            return next
        })
    }

    const clearRecent = () => {
        setRecent([])
        setItem(STORAGE_KEYS.RECENT_NOTES, JSON.stringify([]))
    }

    return { recent, refresh, removeRecent, clearRecent }
}
