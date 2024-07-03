import * as Crypto from 'expo-crypto'
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SmallInput, SquareButton, Toast } from '@/components'
import { CategoriesContainer, UpdateCategory } from '@/screens'
import { useBottomSheet, useCategories } from '@/hooks'

export default function Categories() {
    const { t } = useTranslation()
    const { ref, onOpen, onClose } = useBottomSheet()
    const { addCategory } = useCategories()
    const [newCategory, setNewCategory] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [isUpdatedCategory, setIsUpdatedCategory] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (isUpdatedCategory) {
            setSelectedCategory('')
            setIsUpdatedCategory(false)
            setMessage(t('message.categoryUpdated'))
        }
    }, [isUpdatedCategory])

    const handleModal = (id) => {
        setSelectedCategory(id)
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

            <UpdateCategory
                ref={ref}
                onClose={onClose}
                selectedCategory={selectedCategory}
                setIsUpdatedCategory={setIsUpdatedCategory}
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
        flexGrow: 1,
    },
    inputContainer: {
        gap: 16,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
})
