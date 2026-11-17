import { useNotes } from '@/shared/hooks/use-notes'
import { useStableCallback } from './use-stable-callback'
import { noteBodies } from '@/shared/utils/note-body'
import { getNoteBlocks, resolveBlockTarget } from '@/features/editor/shared/utils/note-entries'

export function useBlockLoader(selfId, entries) {
    const { getNote } = useNotes()

    return useStableCallback(async (target) => {
        const path = resolveBlockTarget(entries, target)
        const note = path && getNote(path)
        if (!note?.path) return null

        const { labeled, unlabeled } = getNoteBlocks(note, await noteBodies.load([note]))

        return { path, labeled, unlabeled: path === selfId ? [] : unlabeled }
    })
}
