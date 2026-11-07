import { useContext } from 'react'

import { NotesApiContext } from '@/context/notes-api-context'

export function useNotes() {
    return useContext(NotesApiContext)
}
