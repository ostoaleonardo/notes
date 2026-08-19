import { StyleSheet } from 'react-native'
import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { DialogModal, Typography } from '@/components'
import { useHaptics, useRepositories } from '@/hooks'
import { FEEDBACK_TYPES, FONTS } from '@/constants'

export function DeleteRepository({ visible, onDismiss, repositoryId }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { removeRepository } = useRepositories()

    const onDelete = () => {
        removeRepository(repositoryId)
        onDismiss()
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    return (
        <DialogModal
            title={t('repositories.delete')}
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
                {t('repositories.delete_message')}
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
