import { ToastAndroid } from 'react-native'
import { useTranslation } from 'react-i18next'
import { DialogButton, DialogModal } from '@/components/dialog'
import { Typography } from '@/components/typography'
import { useHaptics, useRepositories } from '@/hooks'
import { FEEDBACK_TYPES } from '@/constants'

export function DeleteRepository({ visible, onDismiss, repositoryId }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { repositories, removeRepository } = useRepositories()

    const isFolder = !!repositories.find((repository) => repository.id === repositoryId)?.parentId

    const onDelete = async () => {
        const result = await removeRepository(repositoryId)
        onDismiss()

        if (result === 'active') {
            ToastAndroid.show(t('repositories.cannot_delete_active'), ToastAndroid.SHORT)
            return
        }

        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    return (
        <DialogModal
            title={t(isFolder ? 'repositories.delete_folder' : 'repositories.delete')}
            visible={visible}
            onDismiss={onDismiss}
            actions={[
                <DialogButton
                    key='cancel'
                    onPress={onDismiss}
                >
                    {t('button.cancel')}
                </DialogButton>,
                <DialogButton
                    key='delete'
                    mode='contained'
                    onPress={onDelete}
                >
                    {t('button.delete')}
                </DialogButton>
            ]}
        >
            <Typography opacity={0.6}>
                {t(isFolder ? 'repositories.delete_folder_message' : 'repositories.delete_message')}
            </Typography>
        </DialogModal>
    )
}
