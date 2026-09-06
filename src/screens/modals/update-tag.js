import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DialogButton, DialogModal, LargeInput } from '@/components'
import { useTags, useHaptics } from '@/hooks'
import { FEEDBACK_TYPES } from '@/constants'

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
                <DialogButton
                    mode='contained'
                    onPress={onUpdate}
                    disabled={isDisabled}
                >
                    {t('button.update')}
                </DialogButton>
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
