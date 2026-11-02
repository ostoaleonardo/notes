import { useEffect, useMemo, useRef, useState } from 'react'

import { useAttachmentFiles } from './use-attachment-files'
import { useNotes } from './use-notes'
import { useRepositories } from './use-repositories'
import { getConnectionModel } from '@/utils/connection-model-cache'

export function useConnectionModel() {
    const { notes, notePaths } = useNotes()
    const { activeRepository, getRootRepository } = useRepositories()
    const listFiles = useAttachmentFiles()
    const [files, setFiles] = useState(listFiles)
    const mounted = useRef(false)

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true
            return undefined
        }

        const task = requestIdleCallback(() => setFiles(listFiles()))

        return () => cancelIdleCallback(task)
    }, [listFiles, notes])

    const rootName = activeRepository ? getRootRepository(activeRepository).alias : ''

    return useMemo(() => (
        getConnectionModel({ notes, notePaths, files, rootName })
    ), [notes, notePaths, files, rootName])
}
