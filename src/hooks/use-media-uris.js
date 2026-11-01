import { useCallback } from 'react'

import { useRepositories } from './use-repositories'
import { collectMediaUris } from '@/utils/attachments'
import { listDirectoryEntries } from '@/utils/list-directory-entries'

export const useMediaUris = () => {
    const { activeRepository, getRootRepository } = useRepositories()

    return useCallback(() => (
        collectMediaUris(getRootRepository(activeRepository).uri, listDirectoryEntries)
    ), [activeRepository, getRootRepository])
}
