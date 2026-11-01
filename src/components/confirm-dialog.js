import { useTranslation } from 'react-i18next'

import { Dialog } from '@/ui/dialog'
import { FilledButton } from '@/ui/button/filled-button'
import { TextButton } from '@/ui/button/text-button'
import { DialogText } from '@/ui/dialog-text'

import { useSingleFlight } from '@/hooks/use-single-flight'


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
            dismiss={(
                <TextButton onPress={onDismiss}>
                    {t('button.cancel')}
                </TextButton>
            )}
            confirm={(
                <FilledButton
                    loading={confirming}
                    onPress={onConfirmPress}
                >
                    {confirmLabel}
                </FilledButton>
            )}
        >
            <DialogText tone='secondary'>
                {message}
            </DialogText>
        </Dialog>
    )
}
