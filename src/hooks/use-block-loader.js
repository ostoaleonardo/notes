import { useNotes } from './use-notes'
import { useStableCallback } from './use-stable-callback'
import { getNoteBlocks } from '@/utils/note-entries'

const NO_BLOCKS = { labeled: [], unlabeled: [] }

export function useBlockLoader(selfId) {
    const { getNote } = useNotes()

    return useStableCallback(async (path) => {
        const note = getNote(path)
        if (!note.path) return NO_BLOCKS

        const { labeled, unlabeled } = getNoteBlocks(note)

        return { labeled, unlabeled: path === selfId ? [] : unlabeled }
    })
}
