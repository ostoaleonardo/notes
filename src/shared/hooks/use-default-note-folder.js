import { useMemo, useState } from 'react'

import { useFolders } from './use-folders'
import { useStorageEffect } from './use-storage-effect'
import { resolveDefaultNoteFolder } from '@/shared/utils/default-note-folder'
import { scopedStorageKey } from '@/shared/utils/scoped-storage-key'

import { STORAGE_KEYS } from '@/shared/constants/storage-keys'

export function useDefaultNoteFolder() {
    const { activeFolder, getDescendants } = useFolders()
    const [storedId, setStoredId] = useState('')

    const scopedKey = activeFolder
        ? scopedStorageKey(STORAGE_KEYS.DEFAULT_NOTE_FOLDER, activeFolder.id)
        : null

    useStorageEffect(scopedKey, (value) => setStoredId(value || ''))

    return useMemo(() => {
        if (!activeFolder) return ''

        return resolveDefaultNoteFolder({
            storedId,
            activeFolder,
            descendants: getDescendants(activeFolder.id)
        })
    }, [storedId, activeFolder, getDescendants])
}
