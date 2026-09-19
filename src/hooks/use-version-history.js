import { useCallback, useEffect, useState } from 'react'

import { useNoteVersions } from './use-note-versions'

export function useVersionHistory({ directoryUri, latestContent }) {
    const { commitVersion } = useNoteVersions()

    const [visible, setVisible] = useState(false)

    const onOpen = useCallback(() => setVisible(true), [])
    const onClose = useCallback(() => setVisible(false), [])

    useEffect(() => {
        if (!directoryUri) return

        return () => {
            const { noteId, title, content } = latestContent.current
            if (!noteId) return

            commitVersion(directoryUri, noteId, title, content)
        }
    }, [directoryUri])

    return { visible, onOpen, onClose }
}
