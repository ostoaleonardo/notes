import { forwardRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, LargeInput, ModalSheet } from '@/components'
import { useCategories } from '@/hooks'

export const UpdateCategoryModal = forwardRef(({ onClose, categorySelected, setIsCategoryUpdated }, ref) => {
    const { t } = useTranslation()
    const { getCategory, updateCategory } = useCategories()
    const [newCategory, setNewCategory] = useState('')
    const [placeholder, setPlaceholder] = useState('')
    const [isButtonDisabled, setIsButtonDisabled] = useState(true)

    useEffect(() => {
        const { name } = getCategory(categorySelected)
        setPlaceholder(name)
        setNewCategory(name)
    }, [categorySelected])

    useEffect(() => {
        const isDisabled = !newCategory || !newCategory.trim() || newCategory.trim() === placeholder
        setIsButtonDisabled(isDisabled)
    }, [newCategory])

    const handleUpdateCategory = () => {
        if (isButtonDisabled) return

        updateCategory({
            id: categorySelected,
            name: newCategory.trim()
        })

        onClose()
        setIsCategoryUpdated(true)
    }

    return (
        <ModalSheet
            ref={ref}
            onClose={onClose}
            title={t('categories.update')}
            contentContainerStyle={{
                paddingVertical: 24,
                gap: 40,
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
