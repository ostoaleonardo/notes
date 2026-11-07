import { useCallback } from 'react'

import { useRepositories } from './use-repositories'
import { getMediaIndex } from '@/utils/media-index'
import { listDirectoryEntries } from '@/utils/list-directory-entries'

export const useMediaUris = () => {
    const { activeRepository, getRootRepository } = useRepositories()

    return useCallback(() => (
        getMediaIndex(getRootRepository(activeRepository).uri, listDirectoryEntries)
    ), [activeRepository, getRootRepository])
}
