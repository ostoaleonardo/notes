import { createContext, useState } from 'react'
import { DEFAULT_CATEGORIES } from '@/constants'

export const NoteContext = createContext()

export function NoteProvider({ children }) {
    const [notes, setNotes] = useState([])
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES)

    return (
        <NoteContext.Provider
            value={{
                notes,
                setNotes,
                categories,
                setCategories
            }}
        >
            {children}
        </NoteContext.Provider>
    )
}
