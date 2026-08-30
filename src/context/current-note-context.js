import { createContext, useEffect, useState } from 'react'
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

    return (
        <CurrentNoteContext.Provider value={{ currentId, setCurrentId }}>
            {children}
        </CurrentNoteContext.Provider>
    )
}
