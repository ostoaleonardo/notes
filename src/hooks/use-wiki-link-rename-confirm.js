import { useEffect, useState } from 'react'

import { useNotes } from './use-notes'
import { useStorage } from './use-storage'
import { findBacklinks, renameWikiLinksForNote } from '@/utils/wiki-links'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { STORAGE_BOOLEAN } from '@/constants/storage-values'

export function useWikiLinkRenameConfirm() {
    const {
        notes,
        notePaths,
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

        const savedNote = titleChanged
            ? { ...note, note: renameWikiLinksForNote(note.note, note.path, note.title, notes, notePaths) }
            : note

        const { path, filename, createdAt, updatedAt } = await updateNote(savedNote)

        if (!titleChanged) return { savedNote, path, filename, createdAt, updatedAt }

        const backlinks = findBacklinks(note.path, notes, notePaths)
        if (!backlinks.length) return { savedNote, path, filename, createdAt, updatedAt }

        if (alwaysUpdate) {
            propagateWikiLinkRename(note.path, note.title, notes, notePaths)
            return { savedNote, path, filename, createdAt, updatedAt }
        }

        setPending({
            targetPath: note.path,
            newTitle: note.title,
            notesSnapshot: notes,
            notePaths,
            count: backlinks.length
        })
        return { savedNote, path, filename, createdAt, updatedAt }
    }

    const propagatePending = ({ targetPath, newTitle, notesSnapshot, notePaths }) => (
        propagateWikiLinkRename(targetPath, newTitle, notesSnapshot, notePaths)
    )

    const onDismiss = () => setPending(null)

    const onConfirmOnce = () => {
        if (pending) propagatePending(pending)
        setPending(null)
    }

    const onConfirmAlways = async () => {
        if (pending) propagatePending(pending)
        setAlwaysUpdate(true)
        await setItem(STORAGE_KEYS.ALWAYS_UPDATE_WIKI_LINKS, STORAGE_BOOLEAN.TRUE)
        setPending(null)
    }

    return {
        visible: !!pending,
        linksCount: pending?.count || 0,
        saveWithLinkCheck,
        onDismiss,
        onConfirmOnce,
        onConfirmAlways
    }
}
