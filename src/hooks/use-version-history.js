import { useCallback, useEffect, useRef, useState } from 'react'

import { useNoteVersions } from './use-note-versions'

import { VERSION_SNAPSHOT_INTERVAL } from '@/constants/default-values'

export function useVersionHistory({ location, latestContent }) {
    const { commitVersion } = useNoteVersions()

    const folderUri = location?.folderUri
    const [visible, setVisible] = useState(false)

    const onOpen = useCallback(() => setVisible(true), [])
    const onClose = useCallback(() => setVisible(false), [])

    const commitLatest = useRef(null)
    commitLatest.current = () => {
        const { noteId, title, content } = latestContent.current
        if (!noteId) return

        commitVersion(location, noteId, title, content)
    }

    useEffect(() => {
        if (!folderUri) return

        return () => commitLatest.current()
    }, [folderUri])

    useEffect(() => {
        if (!folderUri) return

        const interval = setInterval(() => commitLatest.current(), VERSION_SNAPSHOT_INTERVAL)
        return () => clearInterval(interval)
    }, [folderUri])

    return { visible, onOpen, onClose }
}
