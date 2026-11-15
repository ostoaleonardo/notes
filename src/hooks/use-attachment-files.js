import { useCallback } from 'react'

import { useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import { buildFileRows, filterFileEntries } from '@/utils/attachments'
import { getAttachmentEntries } from '@/utils/media-index'

export const useAttachmentFiles = () => {
    const { activeRepository, getRootRepository } = useRepositories()
    const { scanAttachments } = useFileStorage()

    return useCallback(async () => {
        const entries = await getAttachmentEntries(getRootRepository(activeRepository).uri, scanAttachments)

        return buildFileRows(filterFileEntries(entries))
    }, [activeRepository, getRootRepository, scanAttachments])
}
