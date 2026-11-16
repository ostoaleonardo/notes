import { useContext, useMemo } from 'react'

import { NoteContext } from '@/context/note-context'

export function useNoteModifiedAt(path) {
    const { notesByPath } = useContext(NoteContext)

    return useMemo(() => {
        const note = path ? notesByPath.get(path) : null

        return note ? note.updatedAt || note.createdAt || '' : ''
    }, [notesByPath, path])
}
