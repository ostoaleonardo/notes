import { createContext, useState } from 'react'
import { DEFAULT_CATEGORIES } from '@/constants'

export const NoteContext = createContext()

export function NoteProvider({ children }) {
    const [notes, setNotes] = useState([])
    const [notesToSync, setNotesToSync] = useState([])
    const [notesIdBackup, setNotesIdBackup] = useState({})
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES)

    return (
        <NoteContext.Provider
            value={{
                notes,
                setNotes,
                notesToSync,
                setNotesToSync,
                notesIdBackup,
                setNotesIdBackup,
                categories,
                setCategories
            }}
        >
            {children}
        </NoteContext.Provider>
    )
}
