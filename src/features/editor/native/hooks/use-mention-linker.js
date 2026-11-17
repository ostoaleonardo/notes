import { useCallback, useRef } from 'react'

import { useNotes } from '@/shared/hooks/use-notes'
import { linkMentions } from '@/features/editor/native/utils/unlinked-mentions'
import { noteBodies } from '@/shared/utils/note-body'

export function useMentionLinker(targetPath) {
    const { getNote, updateNote } = useNotes()

    const link = async (path) => {
        const target = getNote(targetPath)
        const source = getNote(path)
        if (!target.path || !source.path) return

        const body = await noteBodies.get(source)
        const text = linkMentions(body, target)
        if (text !== body) await updateNote({ ...source, note: text })
    }

    const latest = useRef(link)
    latest.current = link

    return useCallback((path) => latest.current(path), [])
}
