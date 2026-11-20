import { useCallback } from 'react'

import { useFileStorage } from '@/shared/hooks/use-file-storage'
import { useFolders } from '@/shared/hooks/use-folders'
import { buildMediaUris } from '@/shared/utils/attachments'
import { getAttachmentEntries } from '@/shared/utils/media-index'

export const useMediaUris = () => {
    const { activeFolder, getRootRepository } = useFolders()
    const { scanAttachments } = useFileStorage()

    return useCallback(async () => {
        const entries = await getAttachmentEntries(getRootRepository(activeFolder).uri, scanAttachments)

        return buildMediaUris(entries)
    }, [activeFolder, getRootRepository, scanAttachments])
}
