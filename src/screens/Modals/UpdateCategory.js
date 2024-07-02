import { forwardRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalSheet, Button, LargeInput } from '@/components'
import { useCategories } from '@/hooks'

export const UpdateCategory = forwardRef(({ selectedCategory, setIsUpdatedCategory, onClose }, ref) => {
    const { t } = useTranslation()
    const { getCategory, updateCategory } = useCategories()
    const [newCategory, setNewCategory] = useState('')
    const [placeholder, setPlaceholder] = useState('')
    const [isButtonDisabled, setIsButtonDisabled] = useState(true)

    useEffect(() => {
        const { name } = getCategory(selectedCategory)
        setPlaceholder(name)
        setNewCategory(name)
    }, [selectedCategory])

    useEffect(() => {
        const isDisabled = !newCategory || !newCategory.trim() || newCategory.trim() === placeholder
        setIsButtonDisabled(isDisabled)
    }, [newCategory])

    const handleUpdateCategory = () => {
        if (isButtonDisabled) return

        updateCategory({
            id,
            name: newCategory.trim()
        })

        onClose()
        setIsUpdatedCategory(true)
    }

    return (
        <ModalSheet
            ref={ref}
            onClose={onClose}
            snapPoints={['50%']}
            title={t('categories.update')}
            contentContainerStyle={{
                paddingHorizontal: 24,
                gap: 40
            }}
        >
            <LargeInput
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder={placeholder}
            />
            <Button
                disabled={isButtonDisabled}
                onPress={handleUpdateCategory}
                label={t('button.update')}
            />
        </ModalSheet>
    )
})
