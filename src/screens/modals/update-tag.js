import { useEffect, useState } from 'react'
import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { DialogModal, LargeInput } from '@/components'
import { useTags, useHaptics } from '@/hooks'
import { DIALOG_BUTTON_LABEL_STYLE, FEEDBACK_TYPES } from '@/constants'

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
