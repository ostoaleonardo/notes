import { useCallback, useEffect, useRef } from 'react'

import { useNoteVersions } from './use-note-versions'
import { openVersionHistory } from '@/utils/version-history-session'

import { VERSION_SNAPSHOT_INTERVAL, VERSION_UNMOUNT_COMMIT_DELAY } from '@/constants/default-values'

export function useVersionHistory({ location, latestContent, onRestore }) {
    const { commitVersion } = useNoteVersions()

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

        const interval = setInterval(() => commitLatest.current(), VERSION_SNAPSHOT_INTERVAL)
        return () => clearInterval(interval)
    }, [folderUri])

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
