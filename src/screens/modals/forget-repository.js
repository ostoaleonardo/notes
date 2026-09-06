import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { DialogModal } from '@/components/dialog'
import { Typography } from '@/components/typography'

import { useHaptics } from '@/hooks/use-haptics'
import { useRepositories } from '@/hooks/use-repositories'

import { DIALOG_BUTTON_LABEL_STYLE } from '@/constants/dialog'
import { FEEDBACK_TYPES } from '@/constants/feedback-types'

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
                <Button
                    key='cancel'
                    onPress={onDismiss}
                    labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                >
                    {t('button.cancel')}
                </Button>,
                <Button
                    key='forget'
                    mode='contained'
                    onPress={onForget}
                    labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                >
                    {t('button.forget')}
                </Button>
            ]}
        >
            <Typography opacity={0.6}>
                {t('repositories.forget_message')}
            </Typography>
        </DialogModal>
    )
}
