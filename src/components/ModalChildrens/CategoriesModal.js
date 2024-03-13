import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as Crypto from 'expo-crypto'
import { ModalSheet } from '../Modal'
import { SmallInput } from '../Input'
import { SquareButton } from '../Button'
import { Category } from '../Card/Category'
import { useCategories } from '@/hooks'
import { colors, fonts } from '@/constants'

export function CategoriesModal({ isVisible, onClose, noteCategories, handleAddCategory }) {
    const { t } = useTranslation()
    const { categories, addCategory } = useCategories()
    const [newCategory, setNewCategory] = useState('')

    const handleSaveCategory = (category) => {
        if (!category.trim()) return

        addCategory({
            id: Crypto.randomUUID(),
            name: category.trim()
        })
        setNewCategory('')
    }

    return (
        <ModalSheet
            isVisible={isVisible}
            onClose={onClose}
            title={t('categories.yourCategories')}
        >
            <View style={styles.inputContainer}>
                <SmallInput
                    value={newCategory}
                    onChangeText={setNewCategory}
                    placeholder={t('categories.newCategory')}
                />
                <SquareButton
                    label={t('categories.add')}
                    onPress={() => handleSaveCategory(newCategory)}
                />
            </View>
            <View style={styles.categoriesContainer}>
                {categories.length === 1 ? (
                    <Text style={styles.label}>
                        You don't have any category yet
                    </Text>
                ) : (
                    <ScrollView
                        overScrollMode='never'
                        style={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {categories.slice(1).map(({ id, name }) => (
                            <Category
                                key={id}
                                category={name}
                                onPress={() => handleAddCategory(id)}
                                isSelected={noteCategories.includes(id)}
                            />
                        ))}
                    </ScrollView>
                )}
            </View>
        </ModalSheet>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        gap: 16,
        paddingBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoriesContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 16,
        color: colors.text50,
        fontFamily: fonts.mono,
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
    },
})