import { useDeferredValue, useMemo, useRef } from 'react'

import { useNotes } from './use-notes'
import { areNoteEntriesEqual, buildNoteEntries } from '@/utils/note-entries'

export function useNoteEntries() {
    const { notes, notePaths } = useNotes()
    const deferredNotes = useDeferredValue(notes)
    const deferredPaths = useDeferredValue(notePaths)
    const cacheRef = useRef([])

    return useMemo(() => {
        const entries = buildNoteEntries(deferredNotes, deferredPaths)

        if (!areNoteEntriesEqual(cacheRef.current, entries)) cacheRef.current = entries

        return cacheRef.current
    }, [deferredNotes, deferredPaths])
}
