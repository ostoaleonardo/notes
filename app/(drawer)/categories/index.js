import { useEffect, useState } from 'react'
import * as Crypto from 'expo-crypto'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SmallInput, SquareButton, Toast } from '@/components'
import { CategoriesContainer, UpdateCategoryModal } from '@/screens'
import { useBottomSheet, useCategories } from '@/hooks'

export default function Categories() {
    const { t } = useTranslation()
    const { addCategory } = useCategories()
    const { bottomSheetRef, onOpen, onClose } = useBottomSheet()
    const [newCategory, setNewCategory] = useState('')
    const [categorySelected, setCategorySelected] = useState('')
    const [isCategoryUpdated, setIsCategoryUpdated] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (isCategoryUpdated) {
            setCategorySelected('')
            setIsCategoryUpdated(false)
            setMessage(t('message.categoryUpdated'))
        }
    }, [isCategoryUpdated])

    const handleModal = (id) => {
        setCategorySelected(id)
        onOpen()
    }

    const handleAddCategory = (category) => {
        if (!category.trim()) {
            setMessage(t('message.emptyCategory'))
            return
        }

        addCategory({
            id: Crypto.randomUUID(),
            name: category.trim()
        })

        setNewCategory('')
        setMessage(t('message.categoryAdded'))
    }

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <SmallInput
                    variant='solid'
                    value={newCategory}
                    onChangeText={setNewCategory}
                    placeholder={t('placeholder.category')}
                />
                <SquareButton
                    label={t('categories.add')}
                    onPress={() => handleAddCategory(newCategory)}
                />
            </View>
            <CategoriesContainer
                onPress={handleModal}
            />

            <UpdateCategoryModal
                ref={bottomSheetRef}
                onClose={onClose}
                categorySelected={categorySelected}
                setIsCategoryUpdated={setIsCategoryUpdated}
            />
            <Toast
                message={message}
                setMessage={setMessage}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inputContainer: {
        gap: 16,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
})
