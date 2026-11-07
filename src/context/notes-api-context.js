import { createContext } from 'react'

import { useNotesController } from '@/hooks/use-notes-controller'

export const NotesApiContext = createContext()

export const NotesApiProvider = ({ children }) => {
    const notes = useNotesController()

    return (
        <NotesApiContext.Provider value={notes}>
            {children}
        </NotesApiContext.Provider>
    )
}
