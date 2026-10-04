import { useCallback, useRef } from 'react'

import { useNotes } from './use-notes'
import { linkMentions } from '@/utils/unlinked-mentions'

export function useMentionLinker(targetPath) {
    const { getNote, updateNote } = useNotes()

    const link = async (path) => {
        const target = getNote(targetPath)
        const source = getNote(path)
        if (!target.path || !source.path) return

        const text = linkMentions(source.note || '', target)
        if (text !== source.note) await updateNote({ ...source, note: text })
    }

    const latest = useRef(link)
    latest.current = link

    return useCallback((path) => latest.current(path), [])
}
