import { useState } from 'react'
import * as Crypto from 'expo-crypto'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { CategoryCard, Message, SmallInput, SquareButton, TitleSection, UpdateCategoryModal } from '@/components'
import { useCategories } from '@/hooks'
import { colors } from '@/constants'

export default function Categories() {
    const { t } = useTranslation()
    const [newCategory, setNewCategory] = useState('')
    const [categorySelected, setCategorySelected] = useState('')
    const [isModalVisible, setIsModalVisible] = useState(false)
    const { categories, addCategory, removeCategory } = useCategories()

    const handleModal = (id) => {
        setIsModalVisible(!isModalVisible)
        setCategorySelected(id)
    }

    const handleAddCategory = (category) => {
        if (!category.trim()) return

        addCategory({
            id: Crypto.randomUUID(),
            name: category.trim()
        })
        setNewCategory('')
    }

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <SmallInput
                    value={newCategory}
                    onChangeText={setNewCategory}
                    placeholder={t('categories.newCategory')}
                />
                <SquareButton
                    label={t('categories.add')}
                    onPress={() => handleAddCategory(newCategory)}
                />
            </View>
            <View style={styles.sectionContainer}>
                <TitleSection title={t('categories.yourCategories')} />
            </View>
            <View style={styles.categoriesContainer}>
                {categories.length === 1 ? (
                    <Message label={t('messages.noCategories')} />
                ) : (
                    <ScrollView
                        overScrollMode='never'
                        style={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.categoryCardsContainer}>
                            {categories.slice(1).map(({ id, name }) => (
                                <CategoryCard
                                    key={id}
                                    category={name}
                                    onPress={() => handleModal(id)}
                                    onDelete={() => removeCategory(id)}
                                />
                            ))}
                        </View>
                    </ScrollView>
                )}
            </View>

            <UpdateCategoryModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(!isModalVisible)}
                categorySelected={categorySelected}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    sectionContainer: {
        padding: 24,
    },
    inputContainer: {
        gap: 16,
        padding: 24,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    categoriesContainer: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
    },
    categoryCardsContainer: {
        flex: 1,
        gap: 16,
        paddingBottom: 24,
    },
})
