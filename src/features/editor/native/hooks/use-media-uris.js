import { useCallback } from 'react'

import { useFileStorage } from '@/shared/hooks/use-file-storage'
import { useRepositories } from '@/shared/hooks/use-repositories'
import { buildMediaUris } from '@/shared/utils/attachments'
import { getAttachmentEntries } from '@/shared/utils/media-index'

export const useMediaUris = () => {
    const { activeRepository, getRootRepository } = useRepositories()
    const { scanAttachments } = useFileStorage()

    return useCallback(async () => {
        const entries = await getAttachmentEntries(getRootRepository(activeRepository).uri, scanAttachments)

        return buildMediaUris(entries)
    }, [activeRepository, getRootRepository, scanAttachments])
}
