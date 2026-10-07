import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { DialogModal } from '@/components/dialog'
import { LargeInput } from '@/components/input/large-input'

import { useCreateDialogInput } from '@/hooks/use-dialog-input'
import { useHaptics } from '@/hooks/use-haptics'

import { DIALOG_BUTTON_LABEL_STYLE } from '@/constants/components'
import { FEEDBACK_TYPES } from '@/constants/feedback-types'

export function NameDialog({ visible, onDismiss, title, onSubmit, extraActions = [] }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()

    const [name, setName, disabled] = useCreateDialogInput(visible)

    const onCreate = async () => {
        if (disabled) return

        const succeeded = await onSubmit(name.trim())
        onDismiss()

        if (succeeded !== false) vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    return (
        <DialogModal
            title={title}
            visible={visible}
            onDismiss={onDismiss}
            actions={[
                ...extraActions,
                <Button
                    key='create'
                    mode='contained'
                    onPress={onCreate}
                    disabled={disabled}
                    labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                >
                    {t('button.create')}
                </Button>
            ]}
        >
            <LargeInput
                autoFocus
                value={name}
                placeholder={title}
                onChangeText={setName}
            />
        </DialogModal>
    )
}
