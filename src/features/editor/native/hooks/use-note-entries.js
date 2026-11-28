import { useDeferredValue, useMemo, useRef } from 'react'

import { useNotes } from '@/shared/hooks/use-notes'
import { areNoteEntriesEqual, buildNoteEntries } from '@/features/editor/shared/utils/note-entries'

export function useNoteEntries() {
    const { notes, folderPathByNote } = useNotes()
    const deferredNotes = useDeferredValue(notes)
    const deferredPaths = useDeferredValue(folderPathByNote)
    const cacheRef = useRef([])

    return useMemo(() => {
        const entries = buildNoteEntries(deferredNotes, deferredPaths)

        if (!areNoteEntriesEqual(cacheRef.current, entries)) cacheRef.current = entries

        return cacheRef.current
    }, [deferredNotes, deferredPaths])
}
