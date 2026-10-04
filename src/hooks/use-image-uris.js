import { useCallback } from 'react'
import { Directory } from 'expo-file-system'

import { useRepositories } from './use-repositories'
import { collectImageUris } from '@/utils/attachments'
import { logError } from '@/utils/log-error'

const listEntries = (uri) => {
    try {
        return new Directory(uri).list().map((entry) => ({
            name: entry.name,
            uri: entry.uri,
            isDirectory: entry instanceof Directory
        }))
    } catch (error) {
        logError('error listing directory', error)
        return []
    }
}

export const useImageUris = () => {
    const { activeRepository, getRootRepository } = useRepositories()

    return useCallback(() => (
        collectImageUris(getRootRepository(activeRepository).uri, listEntries)
    ), [activeRepository, getRootRepository])
}
