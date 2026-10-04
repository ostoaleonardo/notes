import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useFileStorage } from './use-file-storage'
import { loadRepositoryData } from '../utils/load-repository-data'
import { storage } from '@/utils/storage'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

export function useRepositoryData() {
    const { t } = useTranslation()
    const fileStorage = useFileStorage()

    return useCallback(async (tree, rootRepository, previousNotes) => {
        const { migration, ...data } = await loadRepositoryData(
            tree,
            rootRepository,
            storage,
            fileStorage,
            previousNotes
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
