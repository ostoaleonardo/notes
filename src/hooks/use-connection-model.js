import { useEffect, useMemo, useState } from 'react'

import { useAttachmentFiles } from './use-attachment-files'
import { useNotes } from './use-notes'
import { useRepositories } from './use-repositories'
import { buildConnectionModel } from '@/utils/connection-model'

export function useConnectionModel() {
    const { notes, notePaths } = useNotes()
    const { activeRepository, getRootRepository } = useRepositories()
    const listFiles = useAttachmentFiles()
    const [files, setFiles] = useState([])

    useEffect(() => {
        setFiles(listFiles())
    }, [listFiles, notes])

    const rootName = activeRepository ? getRootRepository(activeRepository).alias : ''

    return useMemo(() => (
        buildConnectionModel({ notes, notePaths, files, rootName })
    ), [notes, notePaths, files, rootName])
}
