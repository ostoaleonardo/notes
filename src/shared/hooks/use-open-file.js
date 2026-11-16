import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { showSnackbar } from '@/ui/snackbar/snackbar-host'

import { logError } from '@/shared/utils/log-error'
import { pushOnce } from '@/shared/utils/navigation'

import { FILE_KINDS } from '@/shared/constants/file-types'
import { ROUTES } from '@/shared/constants/routes'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'

export const useOpenFile = () => {
    const { t } = useTranslation()

    return useCallback(async (file) => {
        if (!file) {
            showSnackbar(t('message.files.open_failed'))
            return
        }

        if (file.kind === FILE_KINDS.IMAGE) {
            pushOnce({
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
