import { useContext, useMemo, useRef } from 'react'

import { useFileStorage } from './use-file-storage'
import { useFolders } from './use-folders'
import { useStorage } from './use-storage'
import { NoteContext } from '@/shared/context/note-context'
import { createNoteActions } from '@/shared/utils/note-actions'
import { createLinkPropagation } from '@/shared/utils/note-link-propagation'
import { createNoteSaveQueue } from '@/shared/utils/note-save-queue'

export function useNotesController() {
    const fileStorage = useFileStorage()
    const { getItem } = useStorage()
    const { activeFolder, folders } = useFolders()

    const {
        notes,
        notesByPath,
        folderPathByNote,
        setNotes,
        loading
    } = useContext(NoteContext)

    const saveQueue = useRef(null)
    saveQueue.current ??= createNoteSaveQueue()

    const latestRef = useRef(null)
    latestRef.current = { notes, notesByPath, folderPathByNote, folders, activeFolder }

    const actions = useMemo(() => {
        const latest = () => latestRef.current
        const links = createLinkPropagation({ latest, setNotes, fileStorage })
        const noteActions = createNoteActions({
            latest,
            setNotes,
            fileStorage,
            getItem,
            saveQueue: saveQueue.current,
            links
        })

        return {
            ...noteActions,
            propagateWikiLinkRename: links.propagateWikiLinkRename,
            propagateHeadingRename: links.propagateHeadingRename
        }
    }, [fileStorage, getItem, setNotes])

    return useMemo(() => ({
        notes,
        folderPathByNote,
        loading,
        ...actions
    }), [notes, folderPathByNote, loading, actions])
}
