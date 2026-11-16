import { useContext } from 'react'

import { NotesApiContext } from '@/shared/context/notes-api-context'

export function useNotes() {
    return useContext(NotesApiContext)
}
