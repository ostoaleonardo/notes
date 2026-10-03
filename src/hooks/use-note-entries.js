import { useMemo, useRef } from 'react'

import { useNotes } from './use-notes'
import { areNoteEntriesEqual, buildNoteEntries } from '@/utils/note-entries'

export function useNoteEntries() {
    const { notes, notePaths } = useNotes()
    const cacheRef = useRef([])

    return useMemo(() => {
        const entries = buildNoteEntries(notes, notePaths)

        if (!areNoteEntriesEqual(cacheRef.current, entries)) cacheRef.current = entries

        return cacheRef.current
    }, [notes, notePaths])
}
