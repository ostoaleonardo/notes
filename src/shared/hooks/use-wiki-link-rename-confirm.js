import { useEffect, useState } from 'react'

import { useNotes } from './use-notes'
import { useStorage } from './use-storage'
import { linkIndex } from '@/shared/utils/link-index'
import { renameLinksInBodies } from '@/shared/utils/link-rewrite'
import { STORAGE_KEYS } from '@/shared/constants/storage-keys'
import { STORAGE_BOOLEAN } from '@/shared/constants/storage-values'
import { useSingleFlight } from '@/shared/hooks/use-single-flight'

export function useWikiLinkRenameConfirm() {
    const {
        notes,
        folderPathByNote,
        updateNote,
        propagateWikiLinkRename
    } = useNotes()

    const { getItem, setItem } = useStorage()

    const [alwaysUpdate, setAlwaysUpdate] = useState(false)
    const [pending, setPending] = useState(null)

    useEffect(() => {
        getItem(STORAGE_KEYS.ALWAYS_UPDATE_WIKI_LINKS).then((value) => {
            if (value === STORAGE_BOOLEAN.TRUE) setAlwaysUpdate(true)
        })
    }, [getItem])

    const saveWithLinkCheck = async (note, previousTitle) => {
        const titleChanged = previousTitle && previousTitle !== note.title

        const [renamedBody] = titleChanged && note.note
            ? await renameLinksInBodies({
                notes,
                folderPathByNote,
                targetPath: note.path,
                newTitle: note.title,
                bodies: [note.note]
            })
            : [note.note]
        const savedNote = renamedBody === note.note ? note : { ...note, note: renamedBody }

        const { path, filename, createdAt, updatedAt } = await updateNote(savedNote)

        if (!titleChanged) return { savedNote, path, filename, createdAt, updatedAt }

        const previous = notes.find((entry) => entry.path === note.path)
        const backlinks = previous ? await linkIndex.findBacklinks(previous, notes, folderPathByNote) : []
        if (!backlinks.length) return { savedNote, path, filename, createdAt, updatedAt }

        if (alwaysUpdate) {
            propagateWikiLinkRename(note.path, note.title, notes, folderPathByNote)
            return { savedNote, path, filename, createdAt, updatedAt }
        }

        setPending({
            targetPath: note.path,
            newTitle: note.title,
            notesSnapshot: notes,
            folderPathByNote,
            count: backlinks.length
        })
        return { savedNote, path, filename, createdAt, updatedAt }
    }

    const propagatePending = ({ targetPath, newTitle, notesSnapshot, folderPathByNote }) => (
        propagateWikiLinkRename(targetPath, newTitle, notesSnapshot, folderPathByNote)
    )

    const onDismiss = () => setPending(null)

    const [onConfirmOnce, confirmingOnce] = useSingleFlight(async () => {
        if (pending) await propagatePending(pending)
        setPending(null)
    })

    const [onConfirmAlways, confirmingAlways] = useSingleFlight(async () => {
        if (pending) await propagatePending(pending)
        setAlwaysUpdate(true)
        await setItem(STORAGE_KEYS.ALWAYS_UPDATE_WIKI_LINKS, STORAGE_BOOLEAN.TRUE)
        setPending(null)
    })

    return {
        visible: !!pending,
        busy: confirmingOnce || confirmingAlways,
        linksCount: pending?.count || 0,
        saveWithLinkCheck,
        onDismiss,
        onConfirmOnce,
        onConfirmAlways
    }
}
