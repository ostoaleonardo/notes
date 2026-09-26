import { ToastAndroid } from 'react-native'
import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@/components/confirm-dialog'

import { useHaptics } from '@/hooks/use-haptics'
import { useRepositories } from '@/hooks/use-repositories'

import { FEEDBACK_TYPES } from '@/constants/feedback-types'

export function DeleteRepository({ visible, onDismiss, repositoryId }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { repositories, removeRepository } = useRepositories()

    const isFolder = !!repositories.find((repository) => repository.id === repositoryId)?.parentId

    const onDelete = async () => {
        const result = await removeRepository(repositoryId)

        if (result === 'active') {
            ToastAndroid.show(t('repositories.cannot_delete_active'), ToastAndroid.SHORT)
            return
        }

        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    return (
        <ConfirmDialog
            title={t(isFolder ? 'repositories.delete_folder' : 'repositories.delete')}
            message={t(isFolder ? 'repositories.delete_folder_message' : 'repositories.delete_message')}
            confirmLabel={t('button.delete')}
            visible={visible}
            onDismiss={onDismiss}
            onConfirm={onDelete}
        />
    )
}
