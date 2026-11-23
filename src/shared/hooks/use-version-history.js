import { useCallback, useEffect, useRef } from 'react'

import { useNoteVersions } from './use-note-versions'
import { useStorage } from './use-storage'
import { readHistorySettings } from '@/shared/utils/history-settings'
import { openVersionHistory } from '@/shared/utils/version-history-session'

import { VERSION_UNMOUNT_COMMIT_DELAY } from '@/shared/constants/default-values'

export function useVersionHistory({ location, latestContent, onRestore }) {
    const { commitVersion } = useNoteVersions()
    const { getItem } = useStorage()

    const folderUri = location?.folderUri

    const commitSnapshot = useRef(null)
    commitSnapshot.current = ({ noteId, title, content }) => {
        if (!noteId) return

        commitVersion(location, noteId, title, content)
    }

    const readLatest = useRef(null)
    readLatest.current = () => latestContent.current

    const commitLatest = useRef(null)
    commitLatest.current = () => commitSnapshot.current(readLatest.current())

    useEffect(() => {
        if (!folderUri) return

        return () => {
            const snapshot = readLatest.current()

            setTimeout(() => commitSnapshot.current(snapshot), VERSION_UNMOUNT_COMMIT_DELAY)
        }
    }, [folderUri])

    useEffect(() => {
        if (!folderUri) return

        let interval = null
        let cancelled = false

        readHistorySettings(getItem).then(({ intervalMs }) => {
            if (!cancelled) interval = setInterval(() => commitLatest.current(), intervalMs)
        })

        return () => {
            cancelled = true
            clearInterval(interval)
        }
    }, [folderUri, getItem])

    const onRestoreRef = useRef(onRestore)
    onRestoreRef.current = onRestore

    const onOpen = useCallback(() => {
        openVersionHistory({
            location,
            noteId: latestContent.current.noteId,
            contentRef: latestContent,
            onRestore: (version) => onRestoreRef.current?.(version)
        })
    }, [location, latestContent])

    return { onOpen }
}
