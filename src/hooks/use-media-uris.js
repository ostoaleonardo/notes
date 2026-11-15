import { useCallback } from 'react'

import { useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import { buildMediaUris } from '@/utils/attachments'
import { getAttachmentEntries } from '@/utils/media-index'

export const useMediaUris = () => {
    const { activeRepository, getRootRepository } = useRepositories()
    const { scanAttachments } = useFileStorage()

    return useCallback(async () => {
        const entries = await getAttachmentEntries(getRootRepository(activeRepository).uri, scanAttachments)

        return buildMediaUris(entries)
    }, [activeRepository, getRootRepository, scanAttachments])
}
