import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useCategories } from '../hooks'
import { ModalSheet } from './Modal'
import { LargeInput } from './Input'
import { Button } from './Button'

export function UpdateCategoryModal({ isVisible, onClose, title, categorySelected }) {
    const { t } = useTranslation()
    const { updateCategory } = useCategories()
    const [newCategory, setNewCategory] = useState('')

    useEffect(() => {
        setNewCategory(categorySelected)
    }, [categorySelected])

    const handleUpdateCategory = () => {
        updateCategory(categorySelected, newCategory)
        onClose()
    }

    return (
        <ModalSheet
            isVisible={isVisible}
            onClose={onClose}
            title={title}
        >
            <View style={styles.container}>
                <LargeInput
                    value={newCategory}
                    onChangeText={setNewCategory}
                    placeholder={t('categories.newCategory')}
                />
                <Button
                    label={t('buttons.update')}
                    onPress={handleUpdateCategory}
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
