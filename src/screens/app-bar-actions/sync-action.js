import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Appbar, Tooltip, useTheme } from 'react-native-paper'
import { SyncContext } from '@/context'
import { CloudDone, CloudDownload, CloudUpload } from '@/icons'

const titleMap = {
    download: 'syncing.download',
    upload: 'syncing.upload',
    done: 'syncing.done'
}

const iconMap = {
    download: CloudDownload,
    upload: CloudUpload,
    done: CloudDone
}

export function SyncAction() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { isSyncing, syncType } = useContext(SyncContext)

    if (!isSyncing && !syncType) return null

    const title = titleMap[syncType] || t('syncing.done')
    const Icon = iconMap[syncType] || CloudDone

    return (
        <Tooltip title={title}>
            <Appbar.Action
                animated={false}
                icon={() => <Icon color={colors.onBackground} />}
            />
        </Tooltip>
    )
}
