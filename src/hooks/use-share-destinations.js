import { useCallback } from 'react'

import { useDailyNote } from './use-daily-note'
import { useNotes } from './use-notes'
import { getDailyNoteTitle } from '@/utils/daily-note'
import { getEditorPath } from '@/utils/editor-path'
import { pushOnce } from '@/utils/navigation'
import { appendSharedContent } from '@/utils/shared-note'

export function useShareDestinations(content) {
    const { saveNote, updateNote } = useNotes()
    const openDaily = useDailyNote()

    const open = useCallback((path) => {
        if (path) pushOnce(getEditorPath(path))
    }, [])

    const addToNew = useCallback(async () => {
        const { path } = await saveNote({
            title: getDailyNoteTitle(),
            note: content,
            tags: []
        })

        open(path)
    }, [content, open, saveNote])

    const addToDaily = useCallback(
        async () => open(await openDaily({ append: content })),
        [content, open, openDaily]
    )

    const addToNote = useCallback(async (note) => {
        await updateNote({ ...note, note: appendSharedContent(note.note, content) })
        open(note.path)
    }, [content, open, updateNote])

    return {
        addToNew,
        addToDaily,
        addToNote
    }
}
