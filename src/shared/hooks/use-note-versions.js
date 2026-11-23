import { useMemo } from 'react'

import { useFileStorage } from './use-file-storage'
import { useStorage } from './use-storage'
import { readHistorySettings } from '@/shared/utils/history-settings'
import { commitNoteVersion, loadNoteVersions } from '@/shared/utils/note-versions'

export function useNoteVersions() {
    const fileStorage = useFileStorage()
    const { getItem } = useStorage()

    return useMemo(() => ({
        getVersions: (location, filename, limit) => (
            loadNoteVersions(fileStorage, location, filename, limit)
        ),
        commitVersion: async (location, filename, title, content) => (
            commitNoteVersion(
                fileStorage,
                location,
                filename,
                title,
                content,
                await readHistorySettings(getItem)
            )
        )
    }), [fileStorage, getItem])
}
