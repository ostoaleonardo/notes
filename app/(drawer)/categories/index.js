import { useEffect, useState } from 'react'
import * as Crypto from 'expo-crypto'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SmallInput, SquareButton, Toast } from '@/components'
import { CategoriesContainer, UpdateCategoryModal } from '@/screens'
import { useCategories } from '@/hooks'

export default function Categories() {
    const { t } = useTranslation()
    const { addCategory } = useCategories()
    const [newCategory, setNewCategory] = useState('')
    const [categorySelected, setCategorySelected] = useState('')
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [message, setMessage] = useState('')
    const [isCategoryUpdated, setIsCategoryUpdated] = useState(false)

    useEffect(() => {
        if (isCategoryUpdated) {
            setIsCategoryUpdated(false)
            handleToast(t('message.categoryUpdated'))
        }
    }, [isCategoryUpdated])

    const handleModal = (id) => {
        setIsModalVisible(!isModalVisible)
        setCategorySelected(id)
    }

    const handleAddCategory = (category) => {
        if (!category.trim()) {
            handleToast(t('message.emptyCategory'))
            return
        }

        addCategory({
            id: Crypto.randomUUID(),
            name: category.trim()
        })

        setNewCategory('')
        handleToast(t('message.categoryAdded'))
    }

    const handleToast = (message) => {
        setMessage(message)
        setTimeout(() => setMessage(''), 3000)
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
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(!isModalVisible)}
                categorySelected={categorySelected}
                setIsCategoryUpdated={setIsCategoryUpdated}
            />
            <Toast message={message} />
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
