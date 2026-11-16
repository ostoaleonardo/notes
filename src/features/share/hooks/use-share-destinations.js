import { useCallback } from 'react'

import { useDailyNote } from '../../../shared/hooks/use-daily-note'
import { useNotes } from '../../../shared/hooks/use-notes'
import { getDailyNoteTitle } from '@/shared/utils/daily-note'
import { getEditorPath } from '@/shared/utils/editor-path'
import { logError } from '@/shared/utils/log-error'
import { pushOnce } from '@/shared/utils/navigation'
import { appendSharedContent } from '@/shared/utils/shared-note'

import { LOG_MESSAGES } from '@/shared/constants/log-messages'

const reportError = (error) => logError(LOG_MESSAGES.ERROR_SHARING_TEXT, error)

export function useShareDestinations(content) {
    const { saveNote, updateNote } = useNotes()
    const openDaily = useDailyNote()

    const open = useCallback((path) => {
        if (path) pushOnce(getEditorPath(path))
    }, [])

    const addToNew = useCallback(async () => {
        try {
            const { path } = await saveNote({
                title: getDailyNoteTitle(),
                note: content,
                tags: []
            })

            open(path)
        } catch (error) {
            reportError(error)
        }
    }, [content, open, saveNote])

    const addToDaily = useCallback(async () => {
        try {
            open(await openDaily({ append: content }))
        } catch (error) {
            reportError(error)
        }
    }, [content, open, openDaily])

    const addToNote = useCallback(async (note) => {
        try {
            await updateNote({ ...note, note: appendSharedContent(note.note, content) })
            open(note.path)
        } catch (error) {
            reportError(error)
        }
    }, [content, open, updateNote])

    return {
        addToNew,
        addToDaily,
        addToNote
    }
}
