import { StyleSheet, ToastAndroid } from 'react-native'
import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { DialogModal } from '@/components/dialog'
import { Typography } from '@/components/typography'
import { useHaptics, useRepositories } from '@/hooks'
import { FEEDBACK_TYPES, FONTS } from '@/constants'

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
                <Button
                    key='cancel'
                    onPress={onDismiss}
                    labelStyle={styles.label}
                >
                    {t('button.cancel')}
                </Button>,
                <Button
                    key='delete'
                    mode='contained'
                    onPress={onDelete}
                    labelStyle={styles.label}
                >
                    {t('button.delete')}
                </Button>
            ]}
        >
            <Typography opacity={0.6}>
                {t(isFolder ? 'repositories.delete_folder_message' : 'repositories.delete_message')}
            </Typography>
        </DialogModal>
    )
}

const styles = StyleSheet.create({
    label: {
        fontSize: 12,
        paddingHorizontal: 8,
        textTransform: 'uppercase',
        fontFamily: FONTS.azeretLight
    }
})
