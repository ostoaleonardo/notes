import { createContext, useState } from 'react'
import { DEFAULT_CATEGORIES } from '@/constants'

export const NoteContext = createContext()

export function NoteProvider({ children }) {
    const [notes, setNotes] = useState([])
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
    const [trash, setTrash] = useState(new Set())
    const [paramId, setParamId] = useState('')

    return (
        <NoteContext.Provider
            value={{
                notes,
                setNotes,
                categories,
                setCategories,
                trash,
                setTrash,
                paramId,
                setParamId
            }}
        >
            {children}
        </NoteContext.Provider>
    )
}
