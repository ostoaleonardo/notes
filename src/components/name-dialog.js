import { cloneElement } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@/ui/dialog'
import { FilledButton } from '@/ui/button/filled-button'
import { TextButton } from '@/ui/button/text-button'
import { FilledTextField } from '@/ui/input/filled-text-field'

import { useCreateDialogInput } from '@/hooks/use-dialog-input'
import { useSingleFlight } from '@/hooks/use-single-flight'
import { useHaptics } from '@/hooks/use-haptics'

import { FEEDBACK_TYPES } from '@/constants/feedback-types'

export function NameDialog({ visible, onDismiss, title, onSubmit, busy = false, secondaryAction }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()

    const [name, setName, disabled] = useCreateDialogInput(visible)

    const [onCreate, creating] = useSingleFlight(async () => {
        if (disabled) return

        const succeeded = await onSubmit(name.trim())
        onDismiss()

        if (succeeded !== false) vibrate(FEEDBACK_TYPES.SUCCESS)
    })

    const locked = creating || busy

    return (
        <Dialog
            title={title}
            visible={visible}
            onDismiss={onDismiss}
            locked={locked}
            dismiss={secondaryAction ? cloneElement(secondaryAction, { disabled: locked }) : (
                <TextButton disabled={locked} onPress={onDismiss}>
                    {t('button.cancel')}
                </TextButton>
            )}
            confirm={(
                <FilledButton
                    loading={creating}
                    onPress={onCreate}
                    disabled={disabled || busy}
                >
                    {t('button.create')}
                </FilledButton>
            )}
        >
            <FilledTextField
                autoFocus
                multiline={false}
                disabled={locked}
                value={name}
                placeholder={title}
                onChangeText={setName}
            />
        </Dialog>
    )
}
