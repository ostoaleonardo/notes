import { useEffect, useRef } from 'react'

import { useMenuAction } from './use-menu-action'
import { useNoteVersions } from './use-note-versions'

import { VERSION_SNAPSHOT_INTERVAL } from '@/constants/default-values'

export function useVersionHistory({ location, latestContent }) {
    const { commitVersion } = useNoteVersions()

    const folderUri = location?.folderUri
    const { visible, onOpen, onClose } = useMenuAction()

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
