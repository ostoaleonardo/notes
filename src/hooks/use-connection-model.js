import { useEffect, useMemo, useState } from 'react'

import { useAttachmentFiles } from './use-attachment-files'
import { useNotes } from './use-notes'
import { useRepositories } from './use-repositories'
import { getConnectionModel } from '@/utils/connection-model-cache'

const NO_FILES = []

export function useConnectionModel() {
    const { notes, notePaths } = useNotes()
    const { activeRepository, getRootRepository } = useRepositories()
    const listFiles = useAttachmentFiles()
    const [files, setFiles] = useState(NO_FILES)

    useEffect(() => {
        let cancelled = false

        listFiles().then((rows) => {
            if (!cancelled) setFiles(rows)
        })

        return () => { cancelled = true }
    }, [listFiles, notes])

    const rootName = activeRepository ? getRootRepository(activeRepository).alias : ''

    return useMemo(() => (
        getConnectionModel({ notes, notePaths, files, rootName })
    ), [notes, notePaths, files, rootName])
}
