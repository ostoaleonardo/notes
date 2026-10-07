import { router } from 'expo-router'
import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { logError } from '@/utils/log-error'

import { FILE_KINDS } from '@/constants/file-types'
import { ROUTES } from '@/constants/routes'
import { LOG_MESSAGES } from '@/constants/log-messages'

export const useOpenFile = () => {
    const { t } = useTranslation()

    return useCallback(async (file) => {
        if (!file) {
            showSnackbar(t('message.files.open_failed'))
            return
        }

        if (file.kind === FILE_KINDS.IMAGE) {
            router.push({
                pathname: ROUTES.IMAGE_VIEWER,
                params: { url: encodeURIComponent(file.uri) }
            })
            return
        }

        try {
            const copy = new File(Paths.cache, file.filename)
            if (copy.exists) copy.delete()
            new File(file.uri).copy(copy)
            await Sharing.shareAsync(copy.uri, { mimeType: file.mimeType })
        } catch (error) {
            logError(LOG_MESSAGES.ERROR_OPENING_FILE, error)
            showSnackbar(t('message.files.open_failed'))
        }
    }, [t])
}
