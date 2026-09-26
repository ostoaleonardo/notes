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

    const saveWithLinkCheck = (note, previousTitle) => {
        const titleChanged = previousTitle && previousTitle !== note.title
        const notePaths = getNotePaths(notes, repositories)

        const savedNote = titleChanged
            ? { ...note, note: renameWikiLinksForNote(note.note, note.id, note.title, notes, notePaths) }
            : note

        updateNote(savedNote)

        if (!titleChanged) return savedNote

        const backlinks = findBacklinks(note.id, notes, notePaths)
        if (!backlinks.length) return savedNote

        if (alwaysUpdate) {
            propagateWikiLinkRename(note.id, note.title, notes, notePaths)
            return savedNote
        }

        setPending({
            targetId: note.id,
            newTitle: note.title,
            notesSnapshot: notes,
            notePaths,
            count: backlinks.length
        })
        return savedNote
    }

    const onDismiss = () => setPending(null)

    const onConfirmOnce = () => {
        if (pending) propagateWikiLinkRename(pending.targetId, pending.newTitle, pending.notesSnapshot, pending.notePaths)
        setPending(null)
    }

    const onConfirmAlways = async () => {
        if (pending) propagateWikiLinkRename(pending.targetId, pending.newTitle, pending.notesSnapshot, pending.notePaths)
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
