import { createContext, useEffect, useMemo, useState } from 'react'

import { useStorage } from '@/shared/hooks/use-storage'
import { setCurrentNoteId } from '@/shared/utils/current-note-store'

import { STORAGE_KEYS } from '@/shared/constants/storage-keys'

export const CurrentNoteContext = createContext()

export const CurrentNoteProvider = ({ children }) => {
    const [currentId, setCurrentId] = useState('')

    const { getItem } = useStorage()

    useEffect(() => {
        getItem(STORAGE_KEYS.CURRENT_NOTE).then((value) => {
            if (value) setCurrentId(value)
        })
    }, [getItem])

    useEffect(() => {
        setCurrentNoteId(currentId)
    }, [currentId])

    const value = useMemo(() => ({ currentId, setCurrentId }), [currentId])

    return (
        <CurrentNoteContext.Provider value={value}>
            {children}
        </CurrentNoteContext.Provider>
    )
}
