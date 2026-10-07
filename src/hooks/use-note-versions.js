import { useMemo } from 'react'

import { useFileStorage } from './use-file-storage'
import { commitNoteVersion, loadNoteVersions } from '@/utils/note-versions'

export function useNoteVersions() {
    const fileStorage = useFileStorage()

    return useMemo(() => ({
        getVersions: (location, filename, limit) => (
            loadNoteVersions(fileStorage, location, filename, limit)
        ),
        commitVersion: (location, filename, title, content) => (
            commitNoteVersion(fileStorage, location, filename, title, content)
        )
    }), [fileStorage])
}
