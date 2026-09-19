import { useTranslation } from 'react-i18next'
import { Button } from 'react-native-paper'

import { DialogModal } from './dialog'
import { Typography } from './typography'

import { DIALOG_BUTTON_LABEL_STYLE } from '@/constants/dialog'

export function ConfirmDialog({ title, message, confirmLabel, visible, onDismiss, onConfirm }) {
    const { t } = useTranslation()

    const onConfirmPress = () => {
        onConfirm()
        onDismiss()
    }

    return (
        <DialogModal
            title={title}
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
                    key='confirm'
                    mode='contained'
                    onPress={onConfirmPress}
                    labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                >
                    {confirmLabel}
                </Button>
            ]}
        >
            <Typography opacity={0.6}>
                {message}
            </Typography>
        </DialogModal>
    )
}
