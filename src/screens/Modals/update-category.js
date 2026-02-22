import { StyleSheet } from 'react-native'
import { useEffect, useState } from 'react'
import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { DialogModal, LargeInput } from '@/components'
import { useCategories, useHaptics } from '@/hooks'
import { FEEDBACK_TYPES, FONTS } from '@/constants'

export function UpdateCategory({ visible, onDismiss, selectedId, setIsUpdated }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { getCategory, updateCategory } = useCategories()

    const [category, setCategory] = useState('')
    const [placeholder, setPlaceholder] = useState('')
    const [isDisabled, setIsDisabled] = useState(true)

    useEffect(() => {
        const { name } = getCategory(selectedId)
        setCategory(name)
        setPlaceholder(name)
    }, [selectedId])

    useEffect(() => {
        const isDisabled = !category || !category.trim() || category.trim() === placeholder
        setIsDisabled(isDisabled)
    }, [category])

    const onUpdate = () => {
        if (isDisabled) return

        updateCategory({
            id: selectedId,
            name: category.trim()
        })

        onDismiss()
        setIsUpdated(true)
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    return (
        <DialogModal
            title={t('categories.update')}
            visible={visible}
            onDismiss={onDismiss}
            actions={
                <Button
                    mode='contained'
                    onPress={onUpdate}
                    disabled={isDisabled}
                    labelStyle={styles.label}
                >
                    {t('button.update')}
                </Button>
            }
        >
            <LargeInput
                autoFocus
                value={category}
                placeholder={placeholder}
                onChangeText={setCategory}
            />
        </DialogModal>
    )
}

const styles = StyleSheet.create({
    label: {
        fontSize: 12,
        paddingHorizontal: 8,
        textTransform: 'uppercase',
        fontFamily: FONTS.azeretLight
    }
})
