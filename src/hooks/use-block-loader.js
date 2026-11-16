import { useNotes } from './use-notes'
import { useStableCallback } from './use-stable-callback'
import { getNoteBlocks, resolveBlockTarget } from '@/utils/note-entries'

export function useBlockLoader(selfId, entries) {
    const { getNote } = useNotes()

    return useStableCallback(async (target) => {
        const path = resolveBlockTarget(entries, target)
        const note = path && getNote(path)
        if (!note?.path) return null

        const { labeled, unlabeled } = getNoteBlocks(note)

        return { path, labeled, unlabeled: path === selfId ? [] : unlabeled }
    })
}
