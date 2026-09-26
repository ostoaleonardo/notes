import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { DialogModal } from '@/components/dialog'
import { LargeInput } from '@/components/input/large-input'

import { useEditDialogInput } from '@/hooks/use-dialog-input'
import { useTags } from '@/hooks/use-tags'
import { useHaptics } from '@/hooks/use-haptics'

import { DIALOG_BUTTON_LABEL_STYLE } from '@/constants/dialog'
import { FEEDBACK_TYPES } from '@/constants/feedback-types'

export function UpdateTag({ visible, onDismiss, selectedId }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { getTag, updateTag } = useTags()

    const getInitialName = (id) => getTag(id).name
    const [tag, setTag, placeholder, disabled] = useEditDialogInput(selectedId, getInitialName)

    const onUpdate = () => {
        if (disabled) return

        updateTag({
            id: selectedId,
            name: tag.trim()
        })

        onDismiss()
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    return (
        <DialogModal
            title={t('tags.update')}
            visible={visible}
            onDismiss={onDismiss}
            actions={
                <Button
                    mode='contained'
                    onPress={onUpdate}
                    disabled={disabled}
                    labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                >
                    {t('button.update')}
                </Button>
            }
        >
            <LargeInput
                autoFocus
                value={tag}
                placeholder={placeholder}
                onChangeText={setTag}
            />
        </DialogModal>
    )
}
