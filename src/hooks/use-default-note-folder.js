import { useMemo, useState } from 'react'

import { useRepositories } from './use-repositories'
import { useStorageEffect } from './use-storage-effect'
import { resolveDefaultNoteFolder } from '@/utils/default-note-folder'
import { scopedStorageKey } from '@/utils/scoped-storage-key'

import { STORAGE_KEYS } from '@/constants/storage-keys'

export function useDefaultNoteFolder() {
    const { activeRepository, getDescendants } = useRepositories()
    const [storedId, setStoredId] = useState('')

    const scopedKey = activeRepository
        ? scopedStorageKey(STORAGE_KEYS.DEFAULT_NOTE_FOLDER, activeRepository.id)
        : null

    useStorageEffect(scopedKey, (value) => setStoredId(value || ''))

    return useMemo(() => {
        if (!activeRepository) return ''

        return resolveDefaultNoteFolder({
            storedId,
            activeRepository,
            descendants: getDescendants(activeRepository.id)
        })
    }, [storedId, activeRepository, getDescendants])
}
