import { useContext } from 'react'

import { NoteContext } from '@/context/note-context'

export function useTags() {
    const { tags } = useContext(NoteContext)

    return { tags }
}
