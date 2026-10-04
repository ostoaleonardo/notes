import { useCallback } from 'react'

import { useRepositories } from './use-repositories'
import { buildFileRows, collectFiles } from '@/utils/attachments'
import { listDirectoryEntries } from '@/utils/list-directory-entries'

export const useAttachmentFiles = () => {
    const { activeRepository, getRootRepository } = useRepositories()

    return useCallback(() => (
        buildFileRows(collectFiles(getRootRepository(activeRepository).uri, listDirectoryEntries))
    ), [activeRepository, getRootRepository])
}
