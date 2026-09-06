import { useEffect, useState } from 'react'
import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { DialogModal } from '@/components/dialog'
import { LargeInput } from '@/components/input/large-input'

import { useTags } from '@/hooks/use-tags'
import { useHaptics } from '@/hooks/use-haptics'

import { DIALOG_BUTTON_LABEL_STYLE } from '@/constants/dialog'
import { FEEDBACK_TYPES } from '@/constants/feedback-types'

export function UpdateTag({ visible, onDismiss, selectedId }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { getTag, updateTag } = useTags()

    const [tag, setTag] = useState('')
    const [placeholder, setPlaceholder] = useState('')
    const [isDisabled, setIsDisabled] = useState(true)

    useEffect(() => {
        const { name } = getTag(selectedId)
        setTag(name)
        setPlaceholder(name)
    }, [selectedId])

    useEffect(() => {
        const isDisabled = !tag || !tag.trim() || tag.trim() === placeholder
        setIsDisabled(isDisabled)
    }, [tag])

    const onUpdate = () => {
        if (isDisabled) return

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
                    disabled={isDisabled}
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
