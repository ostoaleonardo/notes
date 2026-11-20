import { useCallback } from 'react'

import { useFileStorage } from './use-file-storage'
import { useFolders } from './use-folders'
import { buildFileRows, filterFileEntries } from '@/shared/utils/attachments'
import { getAttachmentEntries } from '@/shared/utils/media-index'

export const useAttachmentFiles = () => {
    const { activeFolder, getRootRepository } = useFolders()
    const { scanAttachments } = useFileStorage()

    return useCallback(async () => {
        const entries = await getAttachmentEntries(getRootRepository(activeFolder).uri, scanAttachments)

        return buildFileRows(filterFileEntries(entries))
    }, [activeFolder, getRootRepository, scanAttachments])
}
