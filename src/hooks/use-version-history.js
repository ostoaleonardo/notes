import { useCallback, useEffect, useRef, useState } from 'react'

import { useNoteVersions } from './use-note-versions'

import { VERSION_SNAPSHOT_INTERVAL } from '@/constants/default-values'

export function useVersionHistory({ directoryUri, latestContent }) {
    const { commitVersion } = useNoteVersions()

    const [visible, setVisible] = useState(false)

    const onOpen = useCallback(() => setVisible(true), [])
    const onClose = useCallback(() => setVisible(false), [])

    const commitLatest = useRef(null)
    commitLatest.current = () => {
        const { noteId, title, content } = latestContent.current
        if (!noteId) return

        commitVersion(directoryUri, noteId, title, content)
    }

    useEffect(() => {
        if (!directoryUri) return

        return () => commitLatest.current()
    }, [directoryUri])

    useEffect(() => {
        if (!directoryUri) return

        const interval = setInterval(() => commitLatest.current(), VERSION_SNAPSHOT_INTERVAL)
        return () => clearInterval(interval)
    }, [directoryUri])

    return { visible, onOpen, onClose }
}
