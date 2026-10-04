import { useCallback, useRef } from 'react'

import { useNotes } from './use-notes'
import { addBlockId } from '@/utils/block-refs'

export function useBlockIdCreator() {
    const { getNote, updateNote } = useNotes()

    const create = async ({ path, index, preview, id }) => {
        const note = getNote(path)
        const text = addBlockId(note.note || '', { index, preview }, id)
        if (text !== null) await updateNote({ ...note, note: text })
    }

    const latest = useRef(create)
    latest.current = create

    return useCallback((target) => latest.current(target), [])
}
