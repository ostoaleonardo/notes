import { useEffect, useEffectEvent, useRef } from 'react'

import { useFolders } from '@/shared/hooks/use-folders'
import { useNotes } from '@/shared/hooks/use-notes'
import { useNoteVersions } from '@/shared/hooks/use-note-versions'
import { planExternalSync, toSyncShape } from '@/shared/utils/external-note-sync'
import { getVersionLocation } from '@/shared/utils/note-version-location'
import { fromSavedSnapshot, toSavedSnapshot } from '@/shared/utils/note-draft'
import { logError } from '@/shared/utils/log-error'
import { noteBodies } from '@/shared/utils/note-body'

import { LOG_MESSAGES } from '@/shared/constants/log-messages'

export const useExternalNoteSync = ({
    enabled,
    pathRef,
    isSavingRef,
    savedRef,
    savedTitleRef,
    content,
    update,
    folderId,
    filename
}) => {
    const { notes } = useNotes()
    const { folders } = useFolders()
    const { commitVersion } = useNoteVersions()

    const contentRef = useRef(content)
    contentRef.current = content

    const syncExternalChanges = useEffectEvent(async () => {
        if (!enabled || isSavingRef.current) return

        const incoming = notes.find((note) => note.path === pathRef.current)
        const incomingShape = incoming && toSyncShape(incoming, await noteBodies.get(incoming))
        if (isSavingRef.current || pathRef.current !== incoming?.path) return

        const synced = planExternalSync({
            draft: contentRef.current,
            original: fromSavedSnapshot(savedRef.current),
            incoming: incomingShape
        })
        if (!synced) return

        update(synced.draft)
        savedRef.current = toSavedSnapshot(synced.original)
        noteBodies.pin(incoming, synced.original.note)

        if (synced.lostExternalText) {
            commitVersion(
                getVersionLocation(folders, folderId),
                filename,
                savedTitleRef.current,
                synced.original.note
            ).catch((error) => logError(LOG_MESSAGES.ERROR_KEEPING_EXTERNAL_TEXT, error))
        }
    })

    useEffect(() => {
        syncExternalChanges()
    }, [notes])
}
