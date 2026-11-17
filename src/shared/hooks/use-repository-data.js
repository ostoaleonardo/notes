import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useFileStorage } from './use-file-storage'
import { loadRepositoryData } from '@/shared/utils/load-repository-data'
import { storage } from '@/shared/utils/storage'
import { showSnackbar } from '@/ui/snackbar/snackbar-host'

export function useRepositoryData() {
    const { t } = useTranslation()
    const fileStorage = useFileStorage()

    return useCallback(async (tree, rootRepository, previousNotes, onProgress, indexed) => {
        const { migration, ...data } = await loadRepositoryData(
            tree,
            rootRepository,
            storage,
            fileStorage,
            previousNotes,
            onProgress,
            indexed
        )

        if (migration.renamedNotes || migration.failedImages) {
            showSnackbar(t('notes.migration_notice', {
                renamed: migration.renamedNotes,
                images: migration.failedImages
            }))
        }

        return data
    }, [t, fileStorage])
}
