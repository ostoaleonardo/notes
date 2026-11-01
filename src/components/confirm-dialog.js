import { useTranslation } from 'react-i18next'

import { Dialog } from '../ui/dialog'
import { Button } from '@/ui/button/button'
import { useSingleFlight } from '@/hooks/use-single-flight'
import { Typography } from '../ui/typography'

import { DIALOG_BUTTON_LABEL_STYLE } from '@/constants/components'
import { OPACITY } from '@/constants/theme'

export function ConfirmDialog({ title, message, confirmLabel, visible, onDismiss, onConfirm }) {
    const { t } = useTranslation()

    const [onConfirmPress, confirming] = useSingleFlight(async () => {
        await onConfirm()
        onDismiss()
    })

    return (
        <Dialog
            title={title}
            visible={visible}
            onDismiss={onDismiss}
            actions={[
                <Button
                    key='cancel'
                    mode='text'
                    onPress={onDismiss}
                    labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                >
                    {t('button.cancel')}
                </Button>,
                <Button
                    key='confirm'
                    mode='contained'
                    loading={confirming}
                    onPress={onConfirmPress}
                    labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                >
                    {confirmLabel}
                </Button>
            ]}
        >
            <Typography opacity={OPACITY.secondary}>
                {message}
            </Typography>
        </Dialog>
    )
}
