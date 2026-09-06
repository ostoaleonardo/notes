import { createContext, useEffect, useMemo, useState } from 'react'
import { useStorage } from '../hooks/use-storage'
import { STORAGE_KEYS } from '@/constants'

export const CurrentNoteContext = createContext()

export function CurrentNoteProvider({ children }) {
    const [currentId, setCurrentId] = useState('')

    const { getItem } = useStorage()

    useEffect(() => {
        getItem(STORAGE_KEYS.CURRENT_NOTE).then((value) => {
            if (value) setCurrentId(value)
        })
    }, [])

    const value = useMemo(() => ({ currentId, setCurrentId }), [currentId])

    return (
        <CurrentNoteContext.Provider value={value}>
            {children}
        </CurrentNoteContext.Provider>
    )
}
