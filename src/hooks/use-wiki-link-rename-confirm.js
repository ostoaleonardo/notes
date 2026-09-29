import { useEffect, useState } from 'react'

import { useNotes } from './use-notes'
import { useStorage } from './use-storage'
import { useRepositories } from './use-repositories'
import { findBacklinks, renameWikiLinksForNote } from '@/utils/wiki-links'
import { getNotePaths } from '@/utils/note-path'
import { STORAGE_KEYS } from '@/constants/storage-keys'

export function useWikiLinkRenameConfirm() {
    const {
        notes,
        updateNote,
        propagateWikiLinkRename
    } = useNotes()

    const { repositories } = useRepositories()
    const { getItem, setItem } = useStorage()

    const [alwaysUpdate, setAlwaysUpdate] = useState(false)
    const [pending, setPending] = useState(null)

    useEffect(() => {
        getItem(STORAGE_KEYS.ALWAYS_UPDATE_WIKI_LINKS).then((value) => {
            if (value === 'true') setAlwaysUpdate(true)
        })
    }, [])

    const saveWithLinkCheck = async (note, previousTitle) => {
        const titleChanged = previousTitle && previousTitle !== note.title
        const notePaths = getNotePaths(notes, repositories)

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

    const onDismiss = () => setPending(null)

    const onConfirmOnce = () => {
        if (pending) propagateWikiLinkRename(pending.targetPath, pending.newTitle, pending.notesSnapshot, pending.notePaths)
        setPending(null)
    }

    const onConfirmAlways = async () => {
        if (pending) propagateWikiLinkRename(pending.targetPath, pending.newTitle, pending.notesSnapshot, pending.notePaths)
        setAlwaysUpdate(true)
        await setItem(STORAGE_KEYS.ALWAYS_UPDATE_WIKI_LINKS, 'true')
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
