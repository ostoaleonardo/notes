import { useTranslation } from 'react-i18next'
import { DialogButton, DialogModal, Typography } from '@/components'
import { useHaptics, useRepositories } from '@/hooks'
import { FEEDBACK_TYPES } from '@/constants'

export function ForgetRepository({ visible, onDismiss, repositoryId }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { forgetRepository } = useRepositories()

    const onForget = () => {
        forgetRepository(repositoryId)
        onDismiss()
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    return (
        <DialogModal
            title={t('repositories.forget')}
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
                    key='forget'
                    mode='contained'
                    onPress={onForget}
                >
                    {t('button.forget')}
                </DialogButton>
            ]}
        >
            <Typography opacity={0.6}>
                {t('repositories.forget_message')}
            </Typography>
        </DialogModal>
    )
}
