import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ModalSheet } from '../Modal'
import { LargeInput } from '../Input'
import { Button } from '../Button'
import { useCategories } from '@/hooks'

export function UpdateCategoryModal({ isVisible, onClose, categorySelected, setIsCategoryUpdated }) {
    const { t } = useTranslation()
    const { getCategory, updateCategory } = useCategories()
    const [newCategory, setNewCategory] = useState('')
    const [placeholder, setPlaceholder] = useState('')
    const [isButtonDisabled, setIsButtonDisabled] = useState(true)

    useEffect(() => {
        const category = getCategory(categorySelected)
        setPlaceholder(category.name)
        setNewCategory(category.name)
    }, [categorySelected])

    useEffect(() => {
        const isDisabled = !newCategory || !newCategory.trim() || newCategory.trim() === placeholder
        setIsButtonDisabled(isDisabled)
    }, [newCategory])

    const handleUpdateCategory = () => {
        if (isButtonDisabled) return

        updateCategory(categorySelected, newCategory.trim())
        setIsCategoryUpdated(true)
        onClose()
    }

    return (
        <ModalSheet
            isVisible={isVisible}
            onClose={onClose}
            title={t('categories.updateCategory')}
        >
            <View style={styles.container}>
                <LargeInput
                    value={newCategory}
                    onChangeText={setNewCategory}
                    placeholder={placeholder}
                />
                <Button
                    disabled={isButtonDisabled}
                    onPress={handleUpdateCategory}
                    label={t('buttons.update')}
                />
            </View>
        </ModalSheet>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 40,
        paddingVertical: 24,
    },
})
