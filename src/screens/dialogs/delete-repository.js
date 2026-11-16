import { ToastAndroid } from 'react-native'
import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@/shared/components/confirm-dialog'

import { useHaptics } from '@/shared/hooks/use-haptics'
import { useRepositories } from '@/shared/hooks/use-repositories'

import { FEEDBACK_TYPES } from '@/shared/constants/feedback-types'
import { REPOSITORY_RESULTS } from '@/shared/constants/repository-results'

export const DeleteRepository = ({
    visible,
    onDismiss,
    repositoryId
}) => {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { repositories, removeRepository } = useRepositories()

    const isFolder = !!repositories.find((repository) => repository.id === repositoryId)?.parentId

    const onDelete = async () => {
        const result = await removeRepository(repositoryId)

        if (result === REPOSITORY_RESULTS.ACTIVE) {
            ToastAndroid.show(t('repositories.delete.active_error'), ToastAndroid.SHORT)
            return
        }

        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    return (
        <ConfirmDialog
            title={t(isFolder ? 'repositories.delete.folder_title' : 'repositories.delete.title')}
            message={t(isFolder ? 'repositories.delete.folder_message' : 'repositories.delete.message')}
            confirmLabel={t('button.delete')}
            visible={visible}
            onDismiss={onDismiss}
            onConfirm={onDelete}
        />
    )
}
