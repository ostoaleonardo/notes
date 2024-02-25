import { createContext, useState } from 'react'

export const NoteContext = createContext()

export function NoteProvider({ children }) {
    const [notes, setNotes] = useState([])
    const [categories, setCategories] = useState(['All'])

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
